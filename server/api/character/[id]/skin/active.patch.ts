import type { ICharacterResponse } from '~~/shared/@types/response';

import { CHARACTER_ERRORS, CHARACTER_PUBLIC_SELECT } from '~~/server/common/constants/character';
import { SKIN_ERRORS } from '~~/server/common/constants/skin';
import { CHARACTER_RETIRED_STATUSES } from '~~/shared/constants/character';
import { SKIN_MANAGEABLE_STATUSES } from '~~/shared/constants/skin';
import { sharedActiveSkinSchema } from '~~/shared/schemas/skin';

/**
 * `PATCH /api/character/:id/skin/active` — выбор скина своего персонажа,
 * который уходит в игру. Применяется при следующем заходе на сервер.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 400 если id персонажа или тело запроса некорректны.
 * @throws 404 если персонаж не найден или чужой, либо скин не принадлежит персонажу.
 * @throws 409 если персонаж в неподходящем статусе.
 */
export default defineEventHandler(async (event): Promise<ICharacterResponse> => {
    const { id: userId } = requireUser(event);
    const characterId = Number(getRouterParam(event, 'id'));

    if (!Number.isInteger(characterId)) {
        throw createError({ statusCode: 400, message: CHARACTER_ERRORS.EMPTY_ID });
    }

    const { skinId } = await readValidatedBodyOr400(event, sharedActiveSkinSchema);

    const character = await prisma.character.findFirst({
        where: { id: characterId, userId, status: { notIn: CHARACTER_RETIRED_STATUSES } },
        select: { id: true, uuid: true, status: true },
    });

    if (!character) {
        throw createError({ statusCode: 404, message: SKIN_ERRORS.NO_CHARACTER });
    }

    if (!SKIN_MANAGEABLE_STATUSES.includes(character.status)) {
        throw createError({ statusCode: 409, message: SKIN_ERRORS.NOT_MANAGEABLE });
    }

    const skin = await prisma.skin.findFirst({
        where: { id: skinId, characterId: character.id },
        select: { id: true, hash: true },
    });

    if (!skin) {
        throw createError({ statusCode: 404, message: SKIN_ERRORS.SKIN_NOT_FOUND });
    }

    const updated = await prisma.character.update({
        where: { id: character.id },
        data: { activeSkinId: skin.id },
        select: CHARACTER_PUBLIC_SELECT,
    });

    await linkActiveSkin(character.uuid, skin.hash);

    return toCharacterResponse(updated);
});
