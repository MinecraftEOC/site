import type { IDiscordLinkResponse } from '~~/shared/types/response';

import { DiscordLinkStatus } from '~~/generated/prisma/enums';
import { DISCORD_STATUSES, VERIFY_CODE_TTL } from '~~/server/constants/discord';

export default defineEventHandler(async (event): Promise<IDiscordLinkResponse> => {
    const user = requireUser(event);

    const discordAccount = await prisma.discordAccount.findUnique({
        where: { userId: user.id },
    });

    if (discordAccount?.status === DiscordLinkStatus.LINKED) {
        throw createError({ statusCode: 409, statusMessage: DISCORD_STATUSES.ALREADY_LINKED });
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
