import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';

/**
 * Middleware детальной страницы персонажа.
 *
 * Открыть можно только своего персонажа: чужой или несуществующий id уводит
 * в корень кабинета.
 */
export default defineNuxtRouteMiddleware((to) => {
    const userStore = useUserStore();

    if (!userStore.getCharacterById(String(to.params.id))) {
        return navigateTo(ACCOUNT_ROUTES.root);
    }
});
