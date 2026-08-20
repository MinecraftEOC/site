import type { IContentPage } from '~/@types/content';

import { ContentType } from '~~/generated/prisma/enums';

export const CONTENT_PAGE: Record<ContentType, IContentPage> = {
    [ContentType.NEWS]: {
        title: 'Новости',
        description: 'Обновления сервера, события мира и объявления администрации.',
        backButton: 'Все новости',
        metaDescription: 'Новости сервера «Эпоха Колонизации»: обновления, события мира и объявления администрации.',
        empty: {
            icon: 'newspaper',
            title: 'Новостей пока нет',
            description: 'Первые записи появятся здесь сразу после публикации.',
        },
    },
    [ContentType.LORE]: {
        title: 'История мира',
        description: 'Земли, эпохи и события, из которых складывается мир Рейнстолла.',
        backButton: 'К истории мира',
        metaDescription: 'История мира «Эпохи Колонизации»: земли, эпохи и события Рейнстолла.',
        empty: {
            icon: 'scroll-text',
            title: 'Материалов пока нет',
            description: 'Летописи мира ещё пишутся — загляните сюда позже.',
        },
    },
};

export const CONTENT_ENTRY_PAGE = {
    listLoadError: 'Не удалось загрузить материалы',
    entryLoadError: 'Материал не найден',
    dateLabel: 'Опубликовано',
};
