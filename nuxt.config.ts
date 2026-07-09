export default defineNuxtConfig({
    devtools: {
        enabled: true,
    },
    modules: [
        '@nuxt/eslint',
        '@pinia/nuxt',
    ],
    runtimeConfig: {
        discordBotToken: '',
        discordClientId: '',
        discordGuildId: '',
        discordChannelId: '',
    },
});
