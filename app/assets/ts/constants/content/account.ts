import { CharacterStatus } from '~~/generated/prisma/enums';

export const DEFAULT_TITLE = 'Мои персонажи';
export const DEFAULT_PAGE_DESCRIPTION = 'Создавайте и управляйте историями своих персонажей.';
export const DISCORD_PAGE_DESCRIPTION = 'Привяжите Discord, чтобы получить доступ к созданию персонажа.';

export const DISCORD_LINK = {
    title: 'Привяжите Discord',
    description: 'Создание персонажа станет доступно после привязки аккаунта Discord.',
    button: 'Привязать Discord',
    modal: {
        title: 'Привязка Discord',
        description: 'Скопируйте код ниже и отправьте его специальному боту в канале Discord. После подтверждения обновите страницу.',
        codeText: 'Код действует 10 минут и предназначен только для вашей учётной записи.',
        codeButton: 'Перегенерировать код',
        mainButton: 'Открыть канал с ботом',
    },
};

export const EMPTY_CHARACTERS = {
    title: 'У вас пока нет персонажа',
    description: 'Создайте первого персонажа — с него начнётся ваша история на проекте.',
    button: 'Создать персонажа',
};

export const CHARACTERS_LIST = {
    description: 'Создавайте и управляйте историями своих персонажей. Одновременно может быть только один активный персонаж.',
    button: 'Создать персонажа',
    cardButton: 'Подробнее',
};

export const CHARACTER_STATUS_LABEL: Record<CharacterStatus, string> = {
    [CharacterStatus.ACTIVE]: 'Активен',
    [CharacterStatus.UNVERIFIED]: 'На рассмотрении',
    [CharacterStatus.RETURNED]: 'Доработка',
    [CharacterStatus.BANNED]: 'Заблокирован',
    [CharacterStatus.DEAD]: 'Погиб',
    [CharacterStatus.UNAVAILABLE]: 'Недоступен',
};

export const CHARACTER_STATUS_DESCRIPTION: Partial<Record<CharacterStatus, string>> = {
    [CharacterStatus.ACTIVE]: 'Персонаж доступен для игры.',
    [CharacterStatus.UNVERIFIED]: 'Заявка отправлена и ожидает проверки администрации.',
    [CharacterStatus.RETURNED]: 'Квента возвращена: внесите правки и отправьте заявку повторно.',
};

export const CHARACTER_CREATE = {
    title: 'Создание персонажа',
    description: 'Перед созданием персонажа обязательно прочитайте историю мира и правила проекта.',
};

export const CHARACTER_DETAILS = {
    title: 'Мой персонаж',
};

export const CHARACTER_EDIT = {
    title: 'Редактирование персонажа',
    description: 'Исправьте замечания администрации и отправьте заявку на повторную проверку.',
};
