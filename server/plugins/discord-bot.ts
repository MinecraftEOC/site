import { Client, Events, GatewayIntentBits, MessageFlags, REST, Routes, SlashCommandBuilder } from 'discord.js';

import { DISCORD_ERRORS, VERIFY_COMMAND_NAME } from '~~/server/common/constants/discord';

const globalForDiscord = globalThis as unknown as { discordClient?: Client };

export default defineNitroPlugin(async () => {
    const config = useRuntimeConfig();
    const { discordBotToken, discordClientId, discordGuildId, discordChannelId } = config;

    if (!discordBotToken || !discordClientId || !discordGuildId || !discordChannelId) {
        console.warn('[discord-bot] Пропущены env-переменные Discord — бот не запущен');
        return;
    }

    if (globalForDiscord.discordClient) {
        return;
    }

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    globalForDiscord.discordClient = client;

    const command = new SlashCommandBuilder()
        .setName(VERIFY_COMMAND_NAME)
        .setDescription('Привязать аккаунт сайта к Discord')
        .addStringOption(option =>
            option
                .setName('code')
                .setDescription('Код, полученный на сайте')
                .setRequired(true));

    const rest = new REST().setToken(discordBotToken);

    client.once(Events.ClientReady, async () => {
        try {
            await rest.put(Routes.applicationGuildCommands(discordClientId, discordGuildId), { body: [command.toJSON()] });
        } catch (error) {
            console.error('[discord-bot] Не удалось зарегистрировать команду:', error);
        }
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand() || interaction.commandName !== VERIFY_COMMAND_NAME) {
            return;
        }

        if (interaction.channelId !== discordChannelId) {
            await interaction.reply({ content: DISCORD_ERRORS.WRONG_CHANNEL, flags: MessageFlags.Ephemeral });
            return;
        }

        const code = interaction.options.getString('code', true);
        const { user } = interaction;

        try {
            const result = await linkDiscordByCode(code, {
                id: user.id,
                username: user.username,
                avatar: user.displayAvatarURL(),
            });

            const message = result.ok
                ? DISCORD_ERRORS.LINK_SUCCESS
                : DISCORD_ERRORS[result.reason];

            await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('[discord-bot] Ошибка привязки:', error);
            await interaction.reply({ content: DISCORD_ERRORS.INTERNAL_ERROR, flags: MessageFlags.Ephemeral });
        }
    });

    client.on(Events.Error, error => console.error('[discord-bot] Ошибка клиента:', error));

    try {
        await client.login(discordBotToken);
    } catch (error) {
        console.error('[discord-bot] Не удалось залогиниться в Discord:', error);
        globalForDiscord.discordClient = undefined;
    }
});
