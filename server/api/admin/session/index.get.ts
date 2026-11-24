/**
 * `GET /api/admin/session` — текущее состояние игры и фоновой операции.
 *
 * @throws 401 если запрос не авторизован.
 * @throws 403 если пользователь не администратор.
 * @throws 503 если подключение к Pterodactyl не настроено.
 */
export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Cache-Control', 'private, no-store');
    requireAdmin(event);

    return getSessionControlStatus(event);
});
