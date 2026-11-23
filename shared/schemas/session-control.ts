import { z } from 'zod';

import {
    SESSION_DEFAULT_DURATION,
    SESSION_DEFAULT_START_HOUR,
    SESSION_MAX_HOURS,
    SESSION_MIN_HOURS,
    SESSION_TOTAL_TICKS,
} from '../constants/session-control';

const sessionHoursSchema = z
    .number()
    .int()
    .min(SESSION_MIN_HOURS)
    .max(SESSION_MAX_HOURS);

export const sessionStartSchema = z
    .object({
        startHour: sessionHoursSchema.default(SESSION_DEFAULT_START_HOUR),
        duration: sessionHoursSchema.default(SESSION_DEFAULT_DURATION),
    })
    .strict();

export const globalSessionSchema = z.object({
    session: z.object({
        index: z.number().int().nonnegative().safe(),
        active: z.boolean(),
        duration: sessionHoursSchema,
        start_hour: sessionHoursSchema,
        ticks: z.number().int().nonnegative().max(SESSION_TOTAL_TICKS),
    }),
});
