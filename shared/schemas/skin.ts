import { z } from 'zod';

/** Тексты ошибок тела запроса выбора активного скина. */
export const ACTIVE_SKIN_BODY_ERRORS = {
    ID_INVALID: 'ID скина не задан',
};

/** Схема тела `PATCH /api/character/:id/skin/active` — выбор активного скина. */
export const sharedActiveSkinSchema = z.object({
    skinId: z
        .number({
            required_error: ACTIVE_SKIN_BODY_ERRORS.ID_INVALID,
            invalid_type_error: ACTIVE_SKIN_BODY_ERRORS.ID_INVALID,
        })
        .int(ACTIVE_SKIN_BODY_ERRORS.ID_INVALID),
});

/** Тип валидного тела выбора активного скина. */
export type TActiveSkinBody = z.infer<typeof sharedActiveSkinSchema>;
