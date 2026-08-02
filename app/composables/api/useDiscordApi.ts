import type { IDiscordLinkResponse, IDiscordStatusResponse } from '~~/shared/@types/response';

export function useDiscordApi() {
    const { $api } = useNuxtApp();

    return {
        link: () => $api<IDiscordLinkResponse>('/api/discord/link', { method: 'POST' }),

        status: () => $api<IDiscordStatusResponse>('/api/discord/status'),
    };
}
