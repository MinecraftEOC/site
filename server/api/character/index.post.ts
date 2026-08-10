import type { ICharacterResponse } from '~~/shared/@types/response';

import { randomUUID } from 'node:crypto';

import { Prisma } from '~~/generated/prisma/client';
import { DiscordLinkStatus, UserRole } from '~~/generated/prisma/enums';
import { CHARACTER_ERRORS, CHARACTER_PUBLIC_SELECT } from '~~/server/common/constants/character';
import { SKIN_ERRORS } from '~~/server/common/constants/skin';
import { USER_ERRORS } from '~~/server/common/constants/user';
import { CHARACTER_RETIRED_STATUSES } from '~~/shared/constants/character';
import { SKIN_MAX_COUNT } from '~~/shared/constants/skin';
import { sharedCharacterSchema } from '~~/shared/schemas/character';

/**
 * `POST /api/character` — создание персонажа (`multipart/form-data` с полями
 * и файлами скинов). Живой персонаж у пользователя может быть только один,
 * а сам аккаунт должен быть привязан к Discord.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 400 при некорректных полях или невалидных файлах скинов.
 * @throws 403 если Discord не привязан.
 * @throws 404 если аккаунт пользователя не найден.
 * @throws 409 если уже есть активный персонаж, имя занято или превышен лимит скинов.
 */
export default defineEventHandler(async (event): Promise<ICharacterResponse> => {
    const { id: userId, role } = requireUser(event);
    const parts = await readMultipartFormData(event);

    const { username, biography: rawBiography, states, startingItems } = parseCharacterFormOr400(parts, sharedCharacterSchema);
    const biography = prepareBiography(rawBiography);

    const skinBuffers = collectSkinFiles(parts);
    if (skinBuffers.length > SKIN_MAX_COUNT) {
        throw createError({ statusCode: 409, message: SKIN_ERRORS.LIMIT_REACHED });
    } else if (skinBuffers.length === 0) {
        throw createError({ statusCode: 400, message: SKIN_ERRORS.NO_SKINS });
    }

    const alive = await prisma.character.findFirst({
        where: { userId, status: { notIn: CHARACTER_RETIRED_STATUSES } },
        select: { id: true },
    });

    if (alive && role !== UserRole.ADMIN) {
        throw createError({ statusCode: 409, message: CHARACTER_ERRORS.ALREADY_EXISTS });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            password: true,
            discordAccount: { select: { status: true } },
        },
    });

    if (!user) {
        throw createError({ statusCode: 404, message: USER_ERRORS.USER_NOT_FOUND });
    }

    if (user.discordAccount?.status !== DiscordLinkStatus.LINKED) {
        throw createError({ statusCode: 403, message: CHARACTER_ERRORS.DISCORD_NOT_LINKED });
    }

    const hashes = await saveSkinFiles(skinBuffers);

    try {
        const created = await prisma.character.create({
            data: {
                uuid: randomUUID(),
                username,
                password: user.password,
                biography,
                states,
                startingItems,
                userId,
                skins: { create: hashes.map(hash => ({ hash })) },
            },
            select: CHARACTER_PUBLIC_SELECT,
        });

        return toCharacterResponse(created);
    } catch (error) {
        await deleteSkinFiles(hashes);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw createError({ statusCode: 409, message: CHARACTER_ERRORS.USERNAME_TAKEN });
        }
        throw error;
    }
});
