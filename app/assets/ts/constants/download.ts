import { EPlatform } from '~/assets/ts/enums/download';

/** Ссылки на сборки лаунчера по платформам. Заглушки — заменить на реальные файлы. */
export const LAUNCHER_LINKS: Record<EPlatform, string> = {
    [EPlatform.Windows]: 'https://eoc-rp.ru/files/EOCLauncher.exe',
    [EPlatform.Linux]: 'https://eoc-rp.ru/files/EOCLauncherLinux',
    [EPlatform.Macos]: 'https://eoc-rp.ru/files/EOCLauncherMacos',
};

/** Канал поддержки в Discord, куда игрок пишет по проблемам с лаунчером. Заглушка. */
export const DISCORD_SUPPORT_CHANNEL = 'https://discord.com/channels/739826388143570975/0000000000000000000';
