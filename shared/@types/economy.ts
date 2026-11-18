import type { z } from 'zod';
import type { sharedEconomyAnalyticsSchema } from '~~/shared/schemas/economy';

export type IEconomyAnalytics = z.infer<typeof sharedEconomyAnalyticsSchema>;
export type IEconomySession = IEconomyAnalytics['sessions'][string];
