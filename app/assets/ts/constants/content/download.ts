import { LAUNCHER_LINKS } from '~/assets/ts/constants/download';
import { EPlatform } from '~/assets/ts/enums/download';

interface IDownloadCard {
    /** Платформа сборки */
    platform: EPlatform;
    /** Название платформы */
    title: string;
    /** Имя иконки платформы */
    icon: string;
    /** Ссылка на файл сборки */
    link: string;
    /** Подпись кнопки скачивания */
    button: string;
}

/** Шапка страницы загрузки — общая для `/download` и `/account/download`. */
export const DOWNLOAD_PAGE = {
    pretitle: 'Установка',
    title: 'Загрузка лаунчера',
    description: 'Лаунчер сам скачает сборку с модами, обновит её и запустит игру. Выберите версию для своей операционной системы.',
    note: 'Для входа в лаунчер используйте имя персонажа и пароль от аккаунта на сайте.',
};

/** Метатеги публичной страницы загрузки. */
export const DOWNLOAD_META = {
    title: 'Загрузка лаунчера — Эпоха Колонизации',
    description: 'Скачайте лаунчер Эпохи Колонизации для Windows, Linux или macOS: он сам поставит сборку с модами и обновит её перед входом на сервер.',
};

/** Карточки сборок лаунчера по платформам. */
export const DOWNLOAD_CARDS: IDownloadCard[] = [
    {
        platform: EPlatform.Windows,
        title: 'Windows',
        icon: 'simple-icons:windows',
        link: LAUNCHER_LINKS[EPlatform.Windows],
        button: 'Скачать',
    },
    {
        platform: EPlatform.Linux,
        title: 'Linux',
        icon: 'simple-icons:linux',
        link: LAUNCHER_LINKS[EPlatform.Linux],
        button: 'Скачать',
    },
    {
        platform: EPlatform.Macos,
        title: 'macOS',
        icon: 'simple-icons:apple',
        link: LAUNCHER_LINKS[EPlatform.Macos],
        button: 'Скачать',
    },
];

/** Блок помощи под карточками сборок. */
export const DOWNLOAD_SUPPORT = {
    title: 'Остались вопросы?',
    description: 'Если лаунчер не скачивается, не запускается или не пускает на сервер — напишите нам в Discord, поможем разобраться.',
    button: 'Написать в Discord',
};
