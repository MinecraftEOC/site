/**
 * `POST /api/admin/session/stop` — принимает остановку активной сессии в фоне.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 409 если остановка недоступна в текущем состоянии.
 */
export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Cache-Control', 'private, no-store');
    requireAdmin(event);

    const job = await startSessionOperation(event, { kind: 'stop' });
    setResponseStatus(event, 202);

    return { job };
});
