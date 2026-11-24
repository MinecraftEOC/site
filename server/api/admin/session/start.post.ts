import { sessionStartSchema } from '~~/shared/schemas/session-control';

/**
 * `POST /api/admin/session/start` — проверяет параметры и принимает запуск сессии в фоне.
 *
 * @throws 400 если час начала или длительность некорректны.
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 409 если запуск недоступен в текущем состоянии.
 */
export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Cache-Control', 'private, no-store');
    requireAdmin(event);

    const result = sessionStartSchema.safeParse((await readBody(event)) ?? {});
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: 'Час начала и длительность должны быть целыми числами от 1 до 24',
        });
    }

    const job = await startSessionOperation(event, { kind: 'start', params: result.data });
    setResponseStatus(event, 202);

    return { job };
});
