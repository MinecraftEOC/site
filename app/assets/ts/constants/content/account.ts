import { CharacterStatus, ContentType } from '~~/generated/prisma/enums';
import { PARAMETER_CHEAP_VALUE, PARAMETER_EXPENSIVE_COST } from '~~/shared/constants/character';
import { SKIN_MAX_COUNT, SKIN_MAX_SIZE } from '~~/shared/constants/skin';
import { BYTES_IN_KB } from '~/assets/ts/constants/common';
import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';
import { EContentColumn } from '~/assets/ts/enums/content';
import { EUsersColumn } from '~/assets/ts/enums/user';

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

export const CHARACTER_STATUS_DATE_LABEL: Record<CharacterStatus, string> = {
    [CharacterStatus.ACTIVE]: 'Создан',
    [CharacterStatus.UNVERIFIED]: 'Создан',
    [CharacterStatus.RETURNED]: 'Создан',
    [CharacterStatus.BANNED]: 'Заблокирован',
    [CharacterStatus.DEAD]: 'Погиб',
    [CharacterStatus.UNAVAILABLE]: 'Выведен из игры',
};

export const CHARACTER_STATUS_DESCRIPTION: Partial<Record<CharacterStatus, string>> = {
    [CharacterStatus.ACTIVE]: 'Персонаж доступен для игры.',
    [CharacterStatus.UNVERIFIED]: 'Заявка отправлена и ожидает проверки администрации.',
    [CharacterStatus.RETURNED]: 'Квента возвращена: внесите правки и отправьте заявку повторно.',
};

export const CHARACTER_CREATE = {
    title: 'Создание персонажа',
    description: 'Перед созданием персонажа обязательно прочитайте историю мира и правила проекта.',
    links: [
        {
            title: 'История мира',
            description: 'События, земли и устройство Рейнстолла',
            icon: 'scroll-text',
            to: ACCOUNT_ROUTES.lore,
        },
        {
            title: 'Правила проекта',
            description: 'Основа ролевой игры и общения',
            icon: 'shield-check',
            to: ACCOUNT_ROUTES.rules,
        },
    ],
    button: {
        title: 'Отправить квенту на проверку',
    },
    success: 'Квента отправлена на проверку',
    error: 'Не удалось отправить квенту',
    invalid: 'Заполните форму до конца',
};

export const CHARACTER_REVIEW = {
    title: 'Комментарий администрации',
};

export const CHARACTER_REVIEW_LABEL: Partial<Record<CharacterStatus, string>> = {
    [CharacterStatus.ACTIVE]: 'Заявка одобрена',
    [CharacterStatus.RETURNED]: 'Требуются правки',
    [CharacterStatus.BANNED]: 'Персонаж заблокирован',
    [CharacterStatus.DEAD]: 'Персонаж погиб',
    [CharacterStatus.UNAVAILABLE]: 'Персонаж выведен из игры',
};

export const CHARACTER_DETAILS = {
    biographyTitle: 'Квента персонажа',
    skinsButton: 'Сохранить скины',
    skinsSuccess: 'Скины сохранены',
    skinsError: 'Не удалось сохранить скины',
    skinDeleteError: 'Не удалось удалить скин',
};

export const CHARACTER_ADMIN = {
    commentTitle: 'Комментарий администрации',
    commentPlaceholder: 'Опишите решение по заявке или перечислите необходимые правки...',
    success: 'Статус персонажа обновлён',
    error: 'Не удалось обновить статус',
    loadError: 'Не удалось загрузить персонажа',
};

export const CHARACTER_EDIT = {
    title: 'Редактирование персонажа —',
    button: {
        title: 'Отправить на повторную проверку',
    },
    success: 'Квента отправлена на проверку',
    error: 'Не удалось сохранить изменения',
    invalid: 'Заполните форму до конца',
    skinError: 'Не удалось удалить скин',
};

export const CHARACTER_FORM_GENERAL = {
    title: 'Основное',
    name: {
        label: 'Имя персонажа',
        placeholder: 'Например, Адриан Вальд',
        hint: 'Только кириллица. Имя пишется с заглавной буквы, фамилия — через пробел и может быть с приставкой. Каждое слово от двух букв, всё имя — от 5 до 16 символов.',
        icon: 'user-round',
    },
    biography: {
        label: 'Квента персонажа',
        placeholder: 'Расскажите о происхождении, целях и характере персонажа.',
    },
};

export const CHARACTER_FORM_STATES = {
    title: 'Параметры и навыки',
    description: 'Очки берутся из отдельных пулов параметров и навыков: при повышении значения соответствующий пул уменьшается. Наведите на параметр или навык, чтобы узнать подробнее.',
    presetsTitle: 'Пресеты распределения',
    parameters: 'Нераспределенные параметры',
    parametersHint: `Значения параметра до ${PARAMETER_CHEAP_VALUE} стоят по одному очку. Каждое значение выше ${PARAMETER_CHEAP_VALUE} стоит ${PARAMETER_EXPENSIVE_COST} очка.`,
    skills: 'Нераспределенные навыки',
};

export const CHARACTER_FORM_SKINS = {
    title: 'Скины персонажа',
    description: `Можно загрузить до ${SKIN_MAX_COUNT} скинов.`,
    uploadDescription: `Можно загрузить несколько файлов: PNG до ${SKIN_MAX_SIZE / BYTES_IN_KB} КБ каждый`,
    sliderTitle: 'Загруженные скины',
};

export const CHARACTER_FORM_ITEMS = {
    title: 'Стартовые предметы',
    description: 'Выберите предметы для начала пути персонажа.',
    itemsTitle: 'Выберите предметы',
    remain: 'Осталось',
    coinsLabel: 'монет',
};

export const USERS_ADMIN = {
    title: 'Список игроков',
    searchPlaceholder: 'Email, Discord или имя персонажа',
    searchIcon: 'search',
    countLabel: 'Найдено игроков:',
    noCharacter: 'Нет персонажа',
    noDiscord: 'Не привязан',
    discordFilter: 'С Discord',
    noCharacterFilter: 'Без персонажа',
    loadError: 'Не удалось загрузить список игроков',
    empty: {
        icon: 'users-round',
        title: 'Никого не нашлось',
        description: 'Измените фильтр по статусу или поисковый запрос.',
    },
};

export const USERS_ADMIN_COLUMN_LABEL: Record<EUsersColumn, string> = {
    [EUsersColumn.Id]: 'ID',
    [EUsersColumn.Email]: 'Email',
    [EUsersColumn.Discord]: 'Discord',
    [EUsersColumn.CreatedAt]: 'Регистрация',
    [EUsersColumn.CharacterName]: 'Персонаж',
    [EUsersColumn.CharacterCreatedAt]: 'Создан',
    [EUsersColumn.CharacterStatus]: 'Статус',
};

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
    [ContentType.NEWS]: 'Новости',
    [ContentType.LORE]: 'История мира',
};

export const CONTENT_TYPE_ICON: Record<ContentType, string> = {
    [ContentType.NEWS]: 'newspaper',
    [ContentType.LORE]: 'scroll-text',
};

export const CONTENT_ADMIN = {
    title: 'Настройка контента',
    description: 'Новости и история мира: карточка в списке и текст материала из .md-файла.',
    searchPlaceholder: 'Заголовок или слаг материала',
    searchIcon: 'search',
    countLabel: 'Материалов в разделе:',
    createButton: 'Добавить материал',
    editButton: 'Редактировать',
    deleteButton: 'Удалить',
    noDescription: 'Без описания',
    loadError: 'Не удалось загрузить список материалов',
    empty: {
        icon: 'file-pen-line',
        title: 'В разделе пока пусто',
        description: 'Добавьте первый материал или измените поисковый запрос.',
    },
    remove: {
        title: 'Удаление материала',
        description: 'Материал и его картинка будут удалены безвозвратно.',
        confirm: 'Удалить материал',
        cancel: 'Отмена',
        success: 'Материал удалён',
        error: 'Не удалось удалить материал',
    },
};

export const CONTENT_ADMIN_COLUMN_LABEL: Record<EContentColumn, string> = {
    [EContentColumn.Image]: 'Картинка',
    [EContentColumn.Title]: 'Заголовок',
    [EContentColumn.Slug]: 'Слаг',
    [EContentColumn.CreatedAt]: 'Создан',
    [EContentColumn.UpdatedAt]: 'Изменён',
    [EContentColumn.Actions]: '',
};

export const CONTENT_FORM = {
    createTitle: 'Новый материал',
    editTitle: 'Редактирование материала',
    backButton: 'К списку материалов',
    submitCreate: 'Создать материал',
    submitEdit: 'Сохранить изменения',
    loadError: 'Не удалось загрузить материал',
    createSuccess: 'Материал создан',
    createError: 'Не удалось создать материал',
    editSuccess: 'Изменения сохранены',
    editError: 'Не удалось сохранить материал',
    invalid: 'Проверьте поля формы',
    type: {
        label: 'Раздел',
    },
    slug: {
        label: 'Слаг',
        placeholder: 'velikaya-voyna',
        hint: 'Часть адреса материала: латиница в нижнем регистре, цифры и дефис.',
        icon: 'link',
    },
    title: {
        label: 'Заголовок',
        placeholder: 'Великая война',
        icon: 'heading',
    },
    description: {
        label: 'Краткое описание',
        placeholder: 'Пара предложений для карточки в списке',
        hint: 'Необязательное: выводится на карточке под заголовком.',
        icon: 'text',
    },
    image: {
        label: 'Картинка',
        title: 'Перетащите картинку сюда или выберите на компьютере',
        button: 'Выбрать картинку',
        icon: 'image',
        remove: 'Убрать выбранную картинку',
        currentTitle: 'Текущая картинка',
        replacedTitle: 'Новая картинка',
    },
    gallery: {
        label: 'Картинки в тексте',
        title: 'Перетащите картинки сюда или выберите на компьютере',
        button: 'Выбрать картинки',
        icon: 'images',
        remove: 'Убрать картинку',
        copy: 'Скопировать разметку',
        copied: 'Разметка скопирована',
        savedTitle: 'Загружены',
        selectedTitle: 'Будут загружены при сохранении',
        hint: {
            title: 'Как вставить картинку в текст',
            steps: [
                'В .md-файле сошлитесь на картинку по имени файла: ![Описание](battle.png).',
                'Загрузите эти же файлы сюда — сервер подставит их адреса при сохранении.',
                'Имя файла должно совпадать с тем, что указано в тексте; путь и регистр не важны.',
            ],
        },
    },
    markdown: {
        label: 'Текст материала',
        title: 'Перетащите .md-файл сюда или выберите на компьютере',
        button: 'Выбрать файл',
        icon: 'file-text',
        remove: 'Убрать выбранный файл',
        selected: 'Выбран файл:',
        previewTitle: 'Текущий текст',
        previewHint: 'Так материал выглядит сейчас — новый файл заменит его целиком.',
    },
};
