import type { EventHandlerRequest, H3Event } from 'h3';
import type { SafeParseReturnType, ZodSchema } from 'zod';

/**
 * Разворачивает результат `safeParse`: успешные данные или ошибка запроса.
 *
 * @param result Результат разбора Zod-схемой.
 * @returns Провалидированные и типизированные данные.
 * @throws `400` с текстом первой ошибки схемы.
 */
export function unwrapSafeParseOr400<T>(result: SafeParseReturnType<T, T>): T {
    if (!result.success) {
        throw createError({ statusCode: 400, message: result.error.issues[0]?.message });
    }

    return result.data;
}

/**
 * Читает тело запроса и валидирует Zod-схемой; трансформы схемы (`trim`,
 * `toLowerCase`) применяются к результату.
 *
 * @param event Текущее событие H3.
 * @param schema Zod-схема тела запроса.
 * @returns Провалидированное и типизированное тело запроса.
 * @throws `400` с текстом первой ошибки схемы.
 */
export async function readValidatedBodyOr400<T>(event: H3Event<EventHandlerRequest>, schema: ZodSchema<T>): Promise<T> {
    return unwrapSafeParseOr400(await readValidatedBody(event, schema.safeParse));
}
