import type { ICharacterResponse } from '~~/shared/@types/response';

import { CHARACTER_ERRORS, CHARACTER_PUBLIC_SELECT } from '~~/server/common/constants/character';
import { SKIN_ERRORS } from '~~/server/common/constants/skin';
import { CHARACTER_RETIRED_STATUSES } from '~~/shared/constants/character';
import { SKIN_MANAGEABLE_STATUSES, SKIN_MAX_COUNT } from '~~/shared/constants/skin';

/**
 * `POST /api/character/:id/skin` — добавление PNG-скинов своему персонажу
 * без смены его статуса. При создании и доработке скины грузятся вместе с
 * персонажем через `POST /api/character` и `PATCH /api/character/:id`.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 400 если id некорректен, файлы не переданы или невалидны.
 * @throws 404 если персонаж не найден или чужой.
 * @throws 409 если персонаж в неподходящем статусе или превышен лимит скинов.
 */
export default defineEventHandler(async (event): Promise<ICharacterResponse> => {
    const { id: userId } = requireUser(event);
    const characterId = Number(getRouterParam(event, 'id'));

    if (!Number.isInteger(characterId)) {
        throw createError({ statusCode: 400, message: CHARACTER_ERRORS.EMPTY_ID });
    }

    const parts = await readMultipartFormData(event);
    const skinBuffers = collectSkinFiles(parts);
    if (skinBuffers.length === 0) {
        throw createError({ statusCode: 400, message: SKIN_ERRORS.NO_SKINS });
    }

    const character = await prisma.character.findFirst({
        where: { id: characterId, userId, status: { notIn: CHARACTER_RETIRED_STATUSES } },
        select: {
            id: true,
            status: true,
            _count: { select: { skins: true } },
        },
    });

    if (!character) {
        throw createError({ statusCode: 404, message: SKIN_ERRORS.NO_CHARACTER });
    }

    if (!SKIN_MANAGEABLE_STATUSES.includes(character.status)) {
        throw createError({ statusCode: 409, message: SKIN_ERRORS.NOT_MANAGEABLE });
    }

    if (character._count.skins + skinBuffers.length > SKIN_MAX_COUNT) {
        throw createError({ statusCode: 409, message: SKIN_ERRORS.LIMIT_REACHED });
    }

    const hashes = await saveSkinFiles(skinBuffers);

    try {
        await prisma.skin.createMany({
            data: hashes.map(hash => ({ hash, characterId: character.id })),
        });
    } catch (error) {
        await deleteSkinFiles(hashes);
        throw error;
    }

    const updated = await prisma.character.findUniqueOrThrow({
        where: { id: character.id },
        select: CHARACTER_PUBLIC_SELECT,
    });

    return toCharacterResponse(updated);
});
