export default defineNuxtConfig({
    devtools: {
        enabled: true,
    },
    modules: [
        '@nuxt/eslint',
        '@nuxt/fonts',
        '@nuxt/icon',
        '@pinia/nuxt',
    ],
    icon: {
        serverBundle: 'local',
    },
    fonts: {
        // Шрифты самохостятся; тянем только реально используемые веса
        // и кириллицу с латиницей (см. дизайн-систему, раздел 2).
        defaults: {
            subsets: ['cyrillic', 'latin'],
        },
        families: [
            { name: 'Alegreya', weights: [700, 800] },
            { name: 'Alegreya Sans', weights: [400, 500] },
            { name: 'JetBrains Mono', weights: [400] },
        ],
    },
    components: [
        { path: '~/components/ui', pathPrefix: false },
        '~/components',
    ],
    css: ['~/assets/scss/default.scss'],
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@use "~/assets/scss/variables" as *;\n@use "~/assets/scss/mixins" as *;\n',
                },
            },
        },
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
