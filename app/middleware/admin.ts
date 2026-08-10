import { UserRole } from '~~/generated/prisma/enums';
import { AUTH_ROUTES } from '~/assets/ts/constants/routes';

/**
 * Middleware страниц для администраторов в личном кабинете.
 */
export default defineNuxtRouteMiddleware(async () => {
    const userStore = useUserStore();

    if (userStore.user?.role !== UserRole.ADMIN) {
        return navigateTo(AUTH_ROUTES.root);
    }
});
