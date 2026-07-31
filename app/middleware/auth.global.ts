/** Префикс маршрутов личного кабинета, которые закрыты авторизацией */
const ACCOUNT_PREFIX = '/account';

/**
 * Глобальный гард личного кабинета.
 *
 * Nuxt не умеет подключать middleware на уровне layout — `definePageMeta`
 * работает только в компонентах из `app/pages/`. Поэтому единая точка входа
 * для всех страниц под `/account` — глобальный middleware с проверкой префикса,
 * а не `middleware: 'auth'` в каждой странице.
 *
 * Глобальные middleware выполняются раньше именованных, так что к моменту
 * запуска `admin` пользователь уже загружен в стор.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    if (!to.path.startsWith(ACCOUNT_PREFIX)) {
        return;
    }

    const userStore = useUserStore();

    await userStore.fetchMe();

    if (!userStore.isAuthenticated) {
        return navigateTo('/auth');
    }
});
