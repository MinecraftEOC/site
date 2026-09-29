import type { ISuccessResponse } from '~~/shared/@types/response';

import { UserRole } from '~~/generated/prisma/enums';
import { SKIN_ERRORS } from '~~/server/common/constants/skin';
import { SKIN_MANAGEABLE_STATUSES } from '~~/shared/constants/skin';

/**
 * `DELETE /api/character/skin/:id` — удаление скина из БД и с диска. Админу
 * доступен любой скин в любом статусе, пользователю — только свой. Если
 * удаляют активный скин, активным становится любой из оставшихся.
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
            character: { select: { id: true, uuid: true, userId: true, status: true, activeSkinId: true } },
        },
    });

    if (!skin || (!isAdmin && skin.character.userId !== userId)) {
        throw createError({ statusCode: 404, message: SKIN_ERRORS.SKIN_NOT_FOUND });
    }

    if (!isAdmin && !SKIN_MANAGEABLE_STATUSES.includes(skin.character.status)) {
        throw createError({ statusCode: 409, message: SKIN_ERRORS.NOT_MANAGEABLE });
    }

    const { character } = skin;

    if (character.activeSkinId !== skinId) {
        await prisma.skin.delete({ where: { id: skinId } });
        await deleteSkinFile(skin.hash);

        return { success: true };
    }

    // Активность снимает `onDelete: SetNull`, замену назначаем в той же транзакции.
    const nextActive = await prisma.$transaction(async (tx) => {
        await tx.skin.delete({ where: { id: skinId } });

        const rest = await tx.skin.findFirst({
            where: { characterId: character.id },
            orderBy: { id: 'asc' },
            select: { id: true, hash: true },
        });

        if (rest) {
            await tx.character.update({ where: { id: character.id }, data: { activeSkinId: rest.id } });
        }

        return rest;
    });

    // Симлинк переключается до удаления файла, чтобы лаунчер не застал его битым.
    if (nextActive) {
        await linkActiveSkin(character.uuid, nextActive.hash);
    } else {
        await unlinkActiveSkin(character.uuid);
    }

    await deleteSkinFile(skin.hash);

    return { success: true };
});
