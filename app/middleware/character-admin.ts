import type { FetchError } from 'ofetch';

import { CHARACTER_ADMIN } from '~/assets/ts/constants/content/account';

/**
 * Middleware админской страницы персонажа.
 *
 * Персонаж грузится до рендера страницы, а не в её `setup`: имя нужно сайдбару,
 * который рисуется раньше страницы, поэтому данные должны лежать в сторе уже к
 * началу рендера. Запускается после `admin`, так что права уже проверены.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    const adminCharacterStore = useAdminCharacterStore();

    try {
        await adminCharacterStore.fetchById(Number(to.params.id));
    } catch (error) {
        adminCharacterStore.reset();

        return abortNavigation(createError({
            statusCode: (error as FetchError)?.statusCode ?? 404,
            statusMessage: getApiErrorMessage(error, CHARACTER_ADMIN.loadError),
        }));
    }
});
