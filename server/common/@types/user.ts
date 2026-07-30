import type { Prisma } from '~~/generated/prisma/client';
import type { USER_PUBLIC_SELECT } from '~~/server/common/constants/user';

/**
 * Пользователь в форме {@link USER_PUBLIC_SELECT} — то, что отдаёт Prisma:
 * персонажи внутри ещё с датами-объектами (см. `toUserResponse`).
 */
export type TUserRow = Prisma.UserGetPayload<{ select: typeof USER_PUBLIC_SELECT }>;
