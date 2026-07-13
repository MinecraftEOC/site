export default defineNuxtConfig({
    devtools: {
        enabled: true,
    },
    modules: [
        '@nuxt/eslint',
        '@pinia/nuxt',
    ],
    vite: {
        server: {
            allowedHosts: ['eoc-rp.ru', 'www.eoc-rp.ru'],
        },
    },
    runtimeConfig: {
        discordBotToken: '',
        discordClientId: '',
        discordGuildId: '',
        discordChannelId: '',
        serverApiToken: '',
    },
});
