import type { ContentType } from '~~/generated/prisma/enums';
import type { IContentAdminResponse, IContentItemResponse, IContentResponse, ISuccessResponse } from '~~/shared/@types/response';
import type { TContentForm } from '~/@types/content';

const CONTENT_PATH = '/api/content';

export function useContentApi() {
    const { $api } = useNuxtApp();

    return {
        get: (type: ContentType, slug: string) => $api<IContentResponse>(CONTENT_PATH, { query: { type, slug } }),

        list: (type?: ContentType) => $api<IContentItemResponse[]>(`${CONTENT_PATH}/list`, { query: { type } }),

        getById: (id: number) => $api<IContentAdminResponse>(`${CONTENT_PATH}/${id}`),

        create: (form: TContentForm) => $api<IContentAdminResponse>(CONTENT_PATH, { method: 'POST', body: toContentFormData(form) }),

        update: (id: number, form: TContentForm) => $api<IContentAdminResponse>(`${CONTENT_PATH}/${id}`, { method: 'PATCH', body: toContentFormData(form) }),

        remove: (id: number) => $api<ISuccessResponse>(`${CONTENT_PATH}/${id}`, { method: 'DELETE' }),
    };
}
