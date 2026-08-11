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
    adminNews: '/account/admin/news',
};
