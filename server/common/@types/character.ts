import type { Prisma } from '~~/generated/prisma/client';
import type { CHARACTER_PUBLIC_SELECT } from '~~/server/common/constants/character';

/**
 * Персонаж в форме {@link CHARACTER_PUBLIC_SELECT} — то, что отдаёт Prisma:
 * даты здесь ещё объекты `Date`, наружу они уходят строками (см.
 * `toCharacterResponse`).
 */
export type TCharacterRow = Prisma.CharacterGetPayload<{ select: typeof CHARACTER_PUBLIC_SELECT }>;
