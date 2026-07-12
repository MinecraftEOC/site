import type { CharacterStatus } from '~~/generated/prisma/enums';

/** Тело `PATCH /api/character/status` — установка статуса персонажа админом. */
export interface IUpdateCharacterStatusBody {
    /** Id персонажа, которому меняют статус. */
    characterId: number;
    /** Новый статус персонажа (любой из `CharacterStatus`). */
    status: CharacterStatus;
    /**
     * Комментарий администратора (например, причины при возврате на доработку).
     * Если поле не передано — комментарий не меняется; пустая строка — очищает.
     */
    comment?: string;
}
