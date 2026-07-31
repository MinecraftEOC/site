import type { ISuccessResponse } from '~~/shared/@types/response';

import { UserRole } from '~~/generated/prisma/enums';
import { SKIN_ERRORS, SKIN_MANAGEABLE_STATUSES } from '~~/server/common/constants/skin';

/**
 * `DELETE /api/character/skin/:id` — удаление скина из БД и с диска. Админу
 * доступен любой скин в любом статусе, пользователю — только свой.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 404 если скин не найден или принадлежит чужому персонажу (для не-админа).
 * @throws 409 если персонаж в неподходящем статусе (для не-админа).
 */
export default defineEventHandler(async (event): Promise<ISuccessResponse> => {
    const { id: userId, role } = requireUser(event);
    const isAdmin = role === UserRole.ADMIN;
    const skinId = Number(getRouterParam(event, 'id'));

    if (!Number.isInteger(skinId)) {
        throw createError({ statusCode: 404, message: SKIN_ERRORS.SKIN_NOT_FOUND });
    }

    const skin = await prisma.skin.findUnique({
        where: { id: skinId },
        select: {
            hash: true,
            character: { select: { id: true, userId: true, status: true } },
        },
    });

    if (!skin || (!isAdmin && skin.character.userId !== userId)) {
        throw createError({ statusCode: 404, message: SKIN_ERRORS.SKIN_NOT_FOUND });
    }

    if (!isAdmin && !SKIN_MANAGEABLE_STATUSES.includes(skin.character.status)) {
        throw createError({ statusCode: 409, message: SKIN_ERRORS.NOT_MANAGEABLE });
    }

    await prisma.skin.delete({ where: { id: skinId } });
    await deleteSkinFile(skin.hash);

    return { success: true };
});
