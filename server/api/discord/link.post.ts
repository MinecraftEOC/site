import type { IDiscordLinkResponse } from '~~/shared/@types/response';

import { DiscordLinkStatus } from '~~/generated/prisma/enums';
import { DISCORD_ERRORS, VERIFY_CODE_TTL } from '~~/server/common/constants/discord';

/**
 * `POST /api/discord/link` — выдача одноразового кода привязки к Discord.
 * Код вводится боту командой `/verify`.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 409 если Discord-аккаунт уже привязан.
 */
export default defineEventHandler(async (event): Promise<IDiscordLinkResponse> => {
    const user = requireUser(event);

    const discordAccount = await prisma.discordAccount.findUnique({
        where: { userId: user.id },
    });

    if (discordAccount?.status === DiscordLinkStatus.LINKED) {
        throw createError({ statusCode: 409, message: DISCORD_ERRORS.ALREADY_LINKED });
    }

    const verifyCode = generateVerifyCode();
    const verifyExpiry = new Date(Date.now() + VERIFY_CODE_TTL * 1000);

    await prisma.discordAccount.upsert({
        where: { userId: user.id },
        create: { userId: user.id, verifyCode, verifyExpiry },
        update: { verifyCode, verifyExpiry },
    });

    return { code: verifyCode, expiresAt: verifyExpiry.toISOString() };
});
