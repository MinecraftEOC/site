/**
 * Middleware страниц «только для гостей» (например, `/auth`).
 */
export default defineNuxtRouteMiddleware(async () => {
    const userStore = useUserStore();

    await userStore.fetchMe();

    if (userStore.isAuthenticated) {
        return navigateTo('/account');
    }
});
