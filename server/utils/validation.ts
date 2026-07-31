import type { EventHandlerRequest, H3Event } from 'h3';
import type { ZodSchema } from 'zod';

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
    const result = await readValidatedBody(event, schema.safeParse);

    if (!result.success) {
        throw createError({ statusCode: 400, message: result.error.issues[0]?.message });
    }

    return result.data;
}
