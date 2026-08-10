/** Маршруты авторизации — единственное место, где живут эти пути. */
export const AUTH_ROUTES = {
    root: '/auth',
};

/** Маршруты личного кабинета — единственное место, где живут эти пути. */
export const ACCOUNT_ROUTES = {
    root: '/account',
    character: '/account/character',
    characterCreate: '/account/character/create',
    characterEdit: '/account/character/edit',
    lore: '/account/lore',
    rules: '/account/rules',
    download: '/account/download',
    news: '/account/news',
    adminUsers: '/account/admin/users',
    adminNews: '/account/admin/news',
};
