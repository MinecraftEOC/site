/** Маршруты публичной части сайта — единственное место, где живут эти пути. */
export const MAIN_ROUTES = {
    root: '/',
    download: '/download',
    rules: '/rules',
};

/** Маршруты авторизации — единственное место, где живут эти пути. */
export const AUTH_ROUTES = {
    root: '/auth',
};

/** Маршруты личного кабинета — единственное место, где живут эти пути. */
export const ACCOUNT_ROUTES = {
    root: '/account',
    character: (id: number | string) => `/account/character/${id}`,
    characterCreate: '/account/character/create',
    lore: '/account/lore',
    rules: '/account/rules',
    download: '/account/download',
    news: '/account/news',
    adminUsers: '/account/admin/users',
    adminCharacter: (id: number | string) => `/account/admin/character/${id}`,
    adminContent: '/account/admin/content',
    adminContentCreate: '/account/admin/content/create',
    adminContentEdit: (id: number | string) => `/account/admin/content/${id}`,
};
