import { AUTH_ROUTES } from '~/assets/ts/constants/routes';
import { ENotificationType } from '~/assets/ts/enums/common';

export default defineNuxtPlugin(() => {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined;

    const api = $fetch.create({
        onRequest({ options }) {
            if (headers?.cookie) {
                options.headers = new Headers(options.headers);
                options.headers.set('cookie', headers.cookie);
            }
        },

        async onResponseError({ request, response }) {
            const url = typeof request === 'string' ? request : request.url;

            if (response.status === 401 && !url.endsWith('/api/me')) {
                const userStore = useUserStore();
                userStore.reset();

                await navigateTo(AUTH_ROUTES.root);

                return;
            }

            if (response.status >= 500) {
                useNotificationStore().add('Ошибка сервера, попробуйте позже', '', ENotificationType.Error);
            }
        },
    });

    return {
        provide: { api },
    };
});
