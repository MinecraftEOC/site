import type { SendableChannels } from 'discord.js';

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    ComponentType,
    Events,
    GatewayIntentBits,
    MessageFlags,
    ModalBuilder,
    REST,
    Routes,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { DISCORD_ERRORS, VERIFY_CODE_LENGTH, VERIFY_CUSTOM_ID, VERIFY_PANEL } from '~~/server/common/constants/discord';

const globalForDiscord = globalThis as unknown as { discordClient?: Client };

/** Кнопка «Привязать аккаунт» для закреплённого сообщения-панели. */
const verifyButton = new ButtonBuilder()
    .setCustomId(VERIFY_CUSTOM_ID.BUTTON)
    .setLabel(VERIFY_PANEL.BUTTON_LABEL)
    .setStyle(ButtonStyle.Success);

/** Ряд с кнопкой панели (Discord требует оборачивать компоненты в ActionRow). */
const panelRow = new ActionRowBuilder<ButtonBuilder>().addComponents(verifyButton);

/**
 * Текст сообщения-панели над кнопкой. Обычный текст (не embed) выбран намеренно:
 * для отправки embed нужно право «Встраивать ссылки», а простому сообщению с
 * кнопкой хватает «Отправлять сообщения».
 */
const panelContent = `**${VERIFY_PANEL.TITLE}**\n${VERIFY_PANEL.DESCRIPTION}`;

/** Модальное окно ввода кода, открываемое по нажатию кнопки. */
const verifyModal = new ModalBuilder()
    .setCustomId(VERIFY_CUSTOM_ID.MODAL)
    .setTitle(VERIFY_PANEL.MODAL_TITLE)
    .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
                .setCustomId(VERIFY_CUSTOM_ID.CODE_INPUT)
                .setLabel(VERIFY_PANEL.INPUT_LABEL)
                .setPlaceholder(VERIFY_PANEL.INPUT_PLACEHOLDER)
                .setStyle(TextInputStyle.Short)
                .setMinLength(VERIFY_CODE_LENGTH)
                .setMaxLength(VERIFY_CODE_LENGTH)
                .setRequired(true),
        ),
    );

/**
 * Гарантирует, что в канале верификации есть закреплённое сообщение-панель с
 * кнопкой. Ищет среди последних сообщений своё сообщение с нужной кнопкой и,
 * только если его нет, постит новое — так рестарт сервера не плодит дубли.
 *
 * @param channel Канал верификации, куда можно писать.
 * @param botId Snowflake-id самого бота (чтобы отличать свои сообщения).
 */
async function ensureVerifyPanel(channel: SendableChannels, botId: string): Promise<void> {
    const recent = await channel.messages.fetch({ limit: 50 });

    const panelExists = recent.some(message =>
        message.author.id === botId
        && message.components.some(row =>
            row.type === ComponentType.ActionRow
            && row.components.some(component =>
                component.type === ComponentType.Button && component.customId === VERIFY_CUSTOM_ID.BUTTON)));

    if (panelExists) {
        return;
    }

    await channel.send({ content: panelContent, components: [panelRow] });
}

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

    const rest = new REST().setToken(discordBotToken);

    client.once(Events.ClientReady, async (ready) => {
        // Убираем устаревшую slash-команду /verify: привязка теперь через кнопку.
        try {
            await rest.put(Routes.applicationGuildCommands(discordClientId, discordGuildId), { body: [] });
        } catch (error) {
            console.error('[discord-bot] Не удалось очистить slash-команды:', error);
        }

        // Публикуем (при необходимости) панель с кнопкой в канале верификации.
        try {
            const channel = await ready.channels.fetch(discordChannelId);

            if (!channel || !channel.isSendable()) {
                console.error('[discord-bot] Канал верификации недоступен или в него нельзя писать');
                return;
            }

            await ensureVerifyPanel(channel, ready.user.id);
        } catch (error) {
            console.error('[discord-bot] Не удалось опубликовать панель верификации:', error);
        }
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        // Нажатие кнопки панели → открываем модальное окно ввода кода.
        if (interaction.isButton() && interaction.customId === VERIFY_CUSTOM_ID.BUTTON) {
            await interaction.showModal(verifyModal);
            return;
        }

        // Отправка модалки → привязываем аккаунт по введённому коду.
        if (!interaction.isModalSubmit() || interaction.customId !== VERIFY_CUSTOM_ID.MODAL) {
            return;
        }

        const code = interaction.fields.getTextInputValue(VERIFY_CUSTOM_ID.CODE_INPUT);
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
