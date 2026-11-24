import type { IGameSession } from '~~/shared/@types/session-control';

import { SESSION_TOTAL_TICKS } from '~~/shared/constants/session-control';

const GAME_TICKS_PER_HOUR = 1000;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const GAME_HOURS_PER_DAY = 24;
const SESSION_TICK_INTERVAL_SECONDS = 10;
const EPOCH_YEAR = 1000;
const DAYS_PER_GAME_YEAR = 365;
const GAME_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Форматирует дату, игровое время и остаток сессии по календарю Mappet.
 *
 * @param session Данные сессии из `global.json`.
 * @returns Данные сессии с отформатированными значениями для админки.
 */
export function formatGameSession(session: IGameSession) {
    const hoursInMinutes = session.start_hour * MINUTES_PER_HOUR;
    const elapsedMinutes = Math.floor(session.ticks * MINUTES_PER_HOUR / GAME_TICKS_PER_HOUR);
    const minutesPerDay = GAME_HOURS_PER_DAY * MINUTES_PER_HOUR;
    const gameMinutes = (hoursInMinutes + elapsedMinutes) % minutesPerDay;

    const pad = (value: number) => String(value).padStart(2, '0');
    const formattedTime = `${pad(Math.floor(gameMinutes / MINUTES_PER_HOUR))}:${pad(gameMinutes % MINUTES_PER_HOUR)}`;

    const year = EPOCH_YEAR + Math.floor(session.index / DAYS_PER_GAME_YEAR);
    let days = session.index % DAYS_PER_GAME_YEAR;
    let month = 1;
    for (const monthDays of GAME_MONTH_DAYS) {
        if (days < monthDays) {
            break;
        }

        days -= monthDays;
        month++;
    }

    const calls = session.duration * SECONDS_PER_HOUR / SESSION_TICK_INTERVAL_SECONDS;
    const ticksPerCall = Math.floor(SESSION_TOTAL_TICKS / calls);
    const remainingTicks = SESSION_TOTAL_TICKS - session.ticks;
    const remainingSeconds = remainingTicks / ticksPerCall * SESSION_TICK_INTERVAL_SECONDS;
    const minutesLeft = session.active ? Math.floor(remainingSeconds / SECONDS_PER_MINUTE) : 0;

    const hoursLeft = Math.floor(minutesLeft / MINUTES_PER_HOUR);
    const remainingMinutes = minutesLeft % MINUTES_PER_HOUR;

    return {
        ...session,
        formattedDate: `${pad(days + 1)}.${pad(month)}.${year}`,
        formattedTime,
        remainingTime: hoursLeft ? `${hoursLeft}ч ${remainingMinutes}м` : `${remainingMinutes}м`,
    };
}
