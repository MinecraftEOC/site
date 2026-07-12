import type { ICharacterResponse } from '~~/shared/@types/response';

import { CharacterStatus } from '~~/generated/prisma/enums';
import { CHARACTER_PUBLIC_SELECT } from '~~/server/common/constants/character';
import {
    SKIN_ERRORS,
    SKIN_MANAGEABLE_STATUSES,
    SKIN_MAX_COUNT,
} from '~~/server/common/constants/skin';

/**
 * `POST /api/character/skin` — добавление PNG-скинов к уже существующему персонажу.
 *
 * Принимает `multipart/form-data` с одним или несколькими файлами в поле `skin`.
 * Используется, когда персонаж уже создан (в т.ч. одобрен, `ACTIVE`) — статус
 * при этом не меняется. При создании/доработке персонажа скины грузятся вместе
 * с ним через `POST`/`PATCH /api/character`.
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
        throw createError({ statusCode: 400, statusMessage: SKIN_ERRORS.NO_FILE });
    }

    const character = await prisma.character.findFirst({
        where: { userId, status: { not: CharacterStatus.DEAD } },
        select: {
            id: true,
            status: true,
            _count: { select: { skins: true } },
        },
    });

    if (!character) {
        throw createError({ statusCode: 404, statusMessage: SKIN_ERRORS.NO_CHARACTER });
    }

    if (!SKIN_MANAGEABLE_STATUSES.includes(character.status)) {
        throw createError({ statusCode: 409, statusMessage: SKIN_ERRORS.NOT_MANAGEABLE });
    }

    if (character._count.skins + skinBuffers.length > SKIN_MAX_COUNT) {
        throw createError({ statusCode: 409, statusMessage: SKIN_ERRORS.LIMIT_REACHED });
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

    return prisma.character.findUniqueOrThrow({
        where: { id: character.id },
        select: CHARACTER_PUBLIC_SELECT,
    });
});
