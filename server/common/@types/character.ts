import type { Prisma } from '~~/generated/prisma/client';
import type { CharacterStatus } from '~~/generated/prisma/enums';
import type { CHARACTER_PUBLIC_SELECT } from '~~/server/common/constants/character';

/** Тело `PATCH /api/character/status` — установка статуса персонажа админом. */
export interface IUpdateCharacterStatusBody {
    /** Id персонажа, которому меняют статус. */
    characterId: number;
    /** Новый статус персонажа (любой из `CharacterStatus`). */
    status: CharacterStatus;
    /**
     * Комментарий к статусу — пояснение, почему персонаж переведён в него
     * (например, причина статуса «Недоступен»). Если поле не передано —
     * комментарий не меняется; пустая строка — очищает.
     */
    statusComment?: string;
    /**
     * Комментарий модерации к квенте (например, что поправить при возврате на
     * доработку). Если поле не передано — комментарий не меняется; пустая
     * строка — очищает.
     */
    reviewComment?: string;
}

/**
 * Персонаж в форме {@link CHARACTER_PUBLIC_SELECT} — то, что отдаёт Prisma:
 * даты здесь ещё объекты `Date`, наружу они уходят строками (см.
 * `toCharacterResponse`).
 */
export type TCharacterRow = Prisma.CharacterGetPayload<{ select: typeof CHARACTER_PUBLIC_SELECT }>;
