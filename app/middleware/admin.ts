import { UserRole } from '~~/generated/prisma/enums';

/**
 * Middleware страниц для администраторов в личном кабинете.
 */
export default defineNuxtRouteMiddleware(async () => {
    const userStore = useUserStore();

    if (userStore.user?.role !== UserRole.ADMIN) {
        return navigateTo('/auth');
    }
});
