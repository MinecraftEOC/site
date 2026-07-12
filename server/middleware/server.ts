import { SERVER_API_PREFIX } from '~~/server/common/constants/auth';

/**
 * Защита ручек `/api/server/*`: пропускает запрос только с валидным
 * server-to-server токеном (`Authorization: Bearer <token>`). Любая новая
 * ручка внутри этой папки автоматически закрыта — отдельная проверка в
 * хендлере не нужна.
 */
export default defineEventHandler((event) => {
    if (!event.path.startsWith(SERVER_API_PREFIX)) {
        return;
    }

    requireServerToken(event);
});
