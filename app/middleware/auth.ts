/**
 * Middleware защищённых страниц (личный кабинет).
 */
export default defineNuxtRouteMiddleware(async () => {
    const userStore = useUserStore();

    await userStore.fetchMe();

    if (!userStore.isAuthenticated) {
        return navigateTo('/auth');
    }
});
