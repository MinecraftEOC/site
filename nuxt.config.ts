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

    app: {
        head: {
            title: 'Эпоха Колонизации - Minecraft RP сервер',

            meta: [
                {
                    name: 'description',
                    content: 'Погрузись в ролевой мир средневекового фэнтези на сервере Minecraft. Каждый выбор пишет историю: политика, ремесло, интриги и жизнь города. Начни игру.',
                },
            ],

            link: [
                { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
            ],
        },
    },

    icon: {
        serverBundle: 'local',
    },

    fonts: {
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
                    additionalData: '@use "~/assets/scss/functions" as *;\n@use "~/assets/scss/variables" as *;\n@use "~/assets/scss/mixins" as *;\n',
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
