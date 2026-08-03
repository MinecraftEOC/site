import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';

/**
 * Middleware страницы персонажа.
 *
 * Смотреть нечего, пока у пользователя нет персонажа в статусе `ACTIVE`.
 */
export default defineNuxtRouteMiddleware(() => {
    const userStore = useUserStore();

    if (!userStore.activeCharacter) {
        return navigateTo(ACCOUNT_ROUTES.root);
    }
});
