import type { ICharacterResponse } from '~~/shared/@types/response';

import { Prisma } from '~~/generated/prisma/client';
import { CharacterStatus } from '~~/generated/prisma/enums';
import { CHARACTER_ERRORS, CHARACTER_PUBLIC_SELECT } from '~~/server/common/constants/character';
import { SKIN_ERRORS } from '~~/server/common/constants/skin';
import { CHARACTER_EDITABLE_STATUSES } from '~~/shared/constants/character';
import { SKIN_MAX_COUNT } from '~~/shared/constants/skin';
import { sharedCharacterUpdateSchema } from '~~/shared/schemas/character';

/**
 * `PATCH /api/character` — доработка своего персонажа (`multipart/form-data`,
 * любое подмножество полей). После сохранения персонаж уходит на повторную
 * модерацию: статус сбрасывается в `UNVERIFIED`, комментарии админа чистятся.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 400 если не передано ни одного изменения или поля некорректны.
 * @throws 404 если нет персонажа, доступного для редактирования.
 * @throws 409 если имя занято или превышен лимит скинов.
 */
export default defineEventHandler(async (event): Promise<ICharacterResponse> => {
    const { id: userId } = requireUser(event);
    const parts = await readMultipartFormData(event);

    const fields = parseCharacterFormOr400(parts, sharedCharacterUpdateSchema);
    const data: Prisma.CharacterUpdateInput = {};

    if (fields.username !== undefined) {
        data.username = fields.username;
    }

    if (fields.biography !== undefined) {
        data.biography = prepareBiography(fields.biography);
    }

    if (fields.states !== undefined) {
        data.states = fields.states;
    }

    if (fields.startingItems !== undefined) {
        data.startingItems = fields.startingItems;
    }

    const skinBuffers = collectSkinFiles(parts);
    if (Object.keys(data).length === 0 && skinBuffers.length === 0) {
        throw createError({ statusCode: 400, message: CHARACTER_ERRORS.NOTHING_TO_UPDATE });
    }

    const character = await prisma.character.findFirst({
        where: { userId, status: { in: CHARACTER_EDITABLE_STATUSES } },
        select: { id: true, _count: { select: { skins: true } } },
    });

    if (!character) {
        throw createError({ statusCode: 404, message: CHARACTER_ERRORS.NOT_EDITABLE });
    }

    if (character._count.skins + skinBuffers.length > SKIN_MAX_COUNT) {
        throw createError({ statusCode: 409, message: SKIN_ERRORS.LIMIT_REACHED });
    }

    data.status = CharacterStatus.UNVERIFIED;
    data.statusChangedAt = new Date();
    data.statusComment = null;
    data.reviewComment = null;

    const hashes = await saveSkinFiles(skinBuffers);

    try {
        const updated = await prisma.character.update({
            where: { id: character.id },
            data: {
                ...data,
                skins: { create: hashes.map(hash => ({ hash })) },
            },
            select: CHARACTER_PUBLIC_SELECT,
        });

        return toCharacterResponse(updated);
    } catch (error) {
        await deleteSkinFiles(hashes);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw createError({ statusCode: 409, message: CHARACTER_ERRORS.USERNAME_TAKEN });
        }

        throw error;
    }
});
