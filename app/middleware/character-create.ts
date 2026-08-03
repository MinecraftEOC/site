import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';

/**
 * Middleware страницы создания персонажа.
 *
 * Создать нового персонажа можно только с привязанным Discord и пока нет
 * «живого» персонажа. Запускается после глобального `auth.global`, так что
 * пользователь уже загружен в стор.
 */
export default defineNuxtRouteMiddleware(() => {
    const userStore = useUserStore();

    if (!userStore.isDiscordLinked || userStore.hasLiveCharacter) {
        return navigateTo(ACCOUNT_ROUTES.root);
    }
});
