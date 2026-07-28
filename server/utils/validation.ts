import type { EventHandlerRequest, H3Event } from 'h3';
import type { ZodSchema } from 'zod';

/**
 * Читает тело запроса и валидирует его Zod-схемой.
 *
 * Использует `safeParse` чтобы вернуть управляемую `400`-ошибку
 * с человекочитаемым текстом из схемы, а не необработанный `500`. Трансформы
 * схемы (`trim`, `toLowerCase` и т.п.) применяются к результату.
 *
 * @param event Текущее событие H3.
 * @param schema Zod-схема тела запроса.
 * @returns Провалидированное и типизированное тело запроса.
 * @throws `400` с текстом первой ошибки, если тело не прошло валидацию.
 */
export async function readValidatedBodyOr400<T>(event: H3Event<EventHandlerRequest>, schema: ZodSchema<T>): Promise<T> {
    const result = await readValidatedBody(event, schema.safeParse);

    if (!result.success) {
        throw createError({ statusCode: 400, message: result.error.issues[0]?.message });
    }

    return result.data;
}
