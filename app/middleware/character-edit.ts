import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';

/**
 * Middleware страницы редактирования персонажа.
 *
 * Редактировать можно только персонажа в статусе `UNVERIFIED` или `RETURNED`
 * (`CHARACTER_EDITABLE_STATUSES`).
 */
export default defineNuxtRouteMiddleware(() => {
    const userStore = useUserStore();

    if (!userStore.editableCharacter) {
        return navigateTo(ACCOUNT_ROUTES.root);
    }
});
