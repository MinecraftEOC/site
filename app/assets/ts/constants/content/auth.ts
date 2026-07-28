import { DISCORD_LINK } from '~/assets/ts/constants/common';
import { EAuthPageType } from '~/assets/ts/enums/auth';

const SIDEBAR_PASSWORD_DATA = {
    pretitle: 'Личный кабинет',
    title: 'Каждая история заслуживает продолжения.',
    description: 'Восстанови доступ к аккаунту и вернись к приключениям.',
};

export const SIDEBAR = {
    [EAuthPageType.Register]: {
        pretitle: 'Личный кабинет',
        title: 'Начни новую главу своей истории.',
        description: 'Создай учётную запись, чтобы отправиться в приключение на остров Рейнстолл.',
    },
    [EAuthPageType.Login]: {
        pretitle: 'Личный кабинет',
        title: 'Продолжи путь своего персонажа.',
        description: 'Войди в личный кабинет, чтобы вернуться к приключениям.',
    },
    [EAuthPageType.ChangePassword]: SIDEBAR_PASSWORD_DATA,
    [EAuthPageType.ResetPassword]: SIDEBAR_PASSWORD_DATA,
};

export const FORM_HEADER = {
    [EAuthPageType.Register]: {
        pretitle: 'Создание учетной записи',
        title: 'Добро пожаловать',
        description: 'Заполните данные — это займёт всего минуту.',
    },
    [EAuthPageType.Login]: {
        pretitle: 'Личный кабинет',
        title: 'С возвращением!',
        description: 'Введите данные учётной записи, чтобы продолжить.',
    },
    [EAuthPageType.ChangePassword]: {
        pretitle: 'Восстановление доступа',
        title: 'Забыли пароль?',
        description: 'Укажите email — мы отправим ссылку для сброса пароля.',
    },
    [EAuthPageType.ResetPassword]: {
        pretitle: 'Новый пароль',
        title: 'Задайте пароль',
        description: 'Придумайте надёжный пароль для входа в личный кабинет.',
    },
};

export const HELP_TEXT = `Нужна помощь? Напишите администрации в <a href="${DISCORD_LINK}" target="_blank">discord</a>`;
