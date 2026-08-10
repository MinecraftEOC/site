import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';

/**
 * Middleware страниц «только для гостей» (например, `/auth`).
 */
export default defineNuxtRouteMiddleware(async () => {
    const userStore = useUserStore();

    await userStore.fetchMe();

    if (userStore.isAuthenticated) {
        return navigateTo(ACCOUNT_ROUTES.root);
    }
});
