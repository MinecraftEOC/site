export const DISCORD_LINK = 'https://discord.com/invite/cwACTVDgbm';
export const DISCORD_VERIFY_CHANNEL = 'https://discord.com/channels/739826388143570975/1524635028498157598';
export const VK_LINK = 'https://vk.ru/colonial_era';

/**
 * Ссылка на профиль игрока в Discord по его id.
 *
 * @param discordId Id аккаунта Discord.
 * @returns Адрес профиля, который открывается и в приложении, и в браузере.
 */
export const DISCORD_USER_URL = (discordId: string) => `https://discord.com/users/${discordId}`;

/** Как часто на клиенте перезапрашивается онлайн сервера, мс. */
export const SERVER_STATUS_REFRESH_INTERVAL = 60_000;

/** Байт в килобайте — для перевода лимитов загрузки в человекочитаемый вид. */
export const BYTES_IN_KB = 1024;

/**
 * Базовый размер корневого шрифта: 1rem = 10px на ширине макета 1440px.
 * Тот же коэффициент использует SCSS-функция `rem()` (`assets/scss/_functions.scss`).
 */
export const ROOT_FONT_SIZE = 10;
