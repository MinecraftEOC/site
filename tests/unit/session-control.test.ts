import { describe, expect, it } from 'vitest';

import {
    globalSessionSchema,
    sessionStartSchema,
} from '../../shared/schemas/session-control';

describe('session start parameters', () => {
    it('defaults to a seven-hour session starting at six', () => {
        expect(sessionStartSchema.parse({})).toEqual({
            startHour: 6,
            duration: 7,
        });
    });

    it.each([
        { startHour: 1, duration: 24 },
        { startHour: 24, duration: 1 },
    ])('accepts boundary values: %o', (params) => {
        expect(sessionStartSchema.parse(params)).toEqual(params);
    });

    it.each([
        { startHour: 0, duration: 7 },
        { startHour: 6, duration: 25 },
        { startHour: '6', duration: 7 },
        { startHour: 6, duration: 1.5 },
    ])('rejects invalid parameters: %o', (params) => {
        expect(sessionStartSchema.safeParse(params).success).toBe(false);
    });
});

describe('global session data', () => {
    const session = {
        index: 48,
        active: false,
        start_hour: 6,
        duration: 7,
        ticks: 18000,
    };

    it('reads a completed session alongside unrelated world state', () => {
        expect(
            globalSessionSchema.parse({ session, active_combats: [] }),
        ).toEqual({ session });
    });

    it.each([{ active: 'false' }, { index: -1 }, { ticks: 18001 }])(
        'rejects malformed session state: %o',
        (override) => {
            expect(
                globalSessionSchema.safeParse({
                    session: { ...session, ...override },
                }).success,
            ).toBe(false);
        },
    );
});
