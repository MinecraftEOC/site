import type { ICharacterResponse } from '~~/shared/@types/response';

import { CHARACTER_PUBLIC_SELECT, CHARACTER_RETIRED_STATUSES } from '~~/server/common/constants/character';
import {
    SKIN_ERRORS,
    SKIN_MANAGEABLE_STATUSES,
    SKIN_MAX_COUNT,
} from '~~/server/common/constants/skin';

/**
 * `POST /api/character/skin` — добавление PNG-скинов существующему персонажу
 * без смены его статуса. При создании и доработке скины грузятся вместе с
 * персонажем через `POST`/`PATCH /api/character`.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 400 если файлы не переданы или невалидны.
 * @throws 404 если у пользователя нет персонажа.
 * @throws 409 если персонаж в неподходящем статусе или превышен лимит скинов.
 */
export default defineEventHandler(async (event): Promise<ICharacterResponse> => {
    const { id: userId } = requireUser(event);

    const parts = await readMultipartFormData(event);
    const skinBuffers = collectSkinFiles(parts);
    if (skinBuffers.length === 0) {
        throw createError({ statusCode: 400, message: SKIN_ERRORS.NO_FILE });
    }

    const character = await prisma.character.findFirst({
        where: { userId, status: { notIn: CHARACTER_RETIRED_STATUSES } },
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
