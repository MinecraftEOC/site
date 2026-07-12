import type { IDiscordStatusResponse } from '~~/shared/@types/response';

import { DiscordLinkStatus } from '~~/generated/prisma/enums';

/**
 * `GET /api/discord/status` — статус привязки Discord у текущего пользователя.
 *
 * Если аккаунт ещё не создан, возвращает статус `PENDING` по умолчанию.
 *
 * @throws 401 если запрос не авторизован.
 */
export default defineEventHandler(async (event): Promise<IDiscordStatusResponse> => {
    const user = requireUser(event);

    const discordAccount = await prisma.discordAccount.findUnique({
        where: { userId: user.id },
        select: { status: true },
    });

    return { status: discordAccount?.status ?? DiscordLinkStatus.PENDING };
});
