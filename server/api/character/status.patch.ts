import type { Prisma } from '~~/generated/prisma/client';
import type { ICharacterResponse } from '~~/shared/@types/response';

import { CHARACTER_ERRORS, CHARACTER_PUBLIC_SELECT } from '~~/server/common/constants/character';
import { sharedCharacterStatusSchema } from '~~/shared/schemas/character';

/**
 * `PATCH /api/character/status` — установка статуса персонажа админом вместе
 * с комментарием к статусу; замечания модерации не переданы — без изменений,
 * пустая строка — очистка.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 400 если тело не прошло схему.
 * @throws 404 если персонаж не найден.
 */
export default defineEventHandler(async (event): Promise<ICharacterResponse> => {
    requireAdmin(event);

    const body = await readValidatedBodyOr400(event, sharedCharacterStatusSchema);

    const character = await prisma.character.findUnique({
        where: { id: body.characterId },
        select: { id: true, status: true },
    });

    if (!character) {
        throw createError({ statusCode: 404, message: CHARACTER_ERRORS.NOT_FOUND });
    }

    const data: Prisma.CharacterUpdateInput = {
        status: body.status,
        statusComment: prepareComment(body.statusComment),
    };

    if (character.status !== body.status) {
        data.statusChangedAt = new Date();
    }

    if (body.reviewComment !== undefined) {
        data.reviewComment = prepareComment(body.reviewComment);
    }

    const updated = await prisma.character.update({
        where: { id: character.id },
        data,
        select: CHARACTER_PUBLIC_SELECT,
    });

    return toCharacterResponse(updated);
});
