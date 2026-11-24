import { CharacterStatus, ContentType } from '~~/generated/prisma/enums';
import { PARAMETER_CHEAP_VALUE, PARAMETER_EXPENSIVE_COST } from '~~/shared/constants/character';
import { SKIN_MAX_COUNT, SKIN_MAX_SIZE, SKIN_MAX_WIDTH, SKIN_WIDTH_STEP } from '~~/shared/constants/skin';
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
        description:
            'Скопируйте код ниже и отправьте его специальному боту в канале Discord. После подтверждения обновите страницу.',
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
    description:
        'Создавайте и управляйте историями своих персонажей. Одновременно может быть только один активный персонаж.',
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
    skinActivateSuccess: 'Активный скин изменён — он появится в игре при следующем заходе',
    skinActivateError: 'Не удалось сделать скин активным',
};

export const CHARACTER_ADMIN = {
    uuidLabel: 'UUID',
    copyUuid: 'Скопировать UUID игрока',
    uuidCopied: 'UUID игрока скопирован',
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
    skinActivateSuccess: 'Активный скин изменён — он появится в игре при следующем заходе',
    skinActivateError: 'Не удалось сделать скин активным',
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
    description:
        'Очки берутся из отдельных пулов параметров и навыков: при повышении значения соответствующий пул уменьшается. Наведите на параметр или навык, чтобы узнать подробнее.',
    presetsTitle: 'Пресеты распределения',
    parameters: 'Нераспределенные параметры',
    parametersHint: `Значения параметра до ${PARAMETER_CHEAP_VALUE} стоят по одному очку. Каждое значение выше ${PARAMETER_CHEAP_VALUE} стоит ${PARAMETER_EXPENSIVE_COST} очка.`,
    skills: 'Нераспределенные навыки',
};

export const CHARACTER_FORM_SKINS = {
    title: 'Скины персонажа',
    description: `Можно загрузить до ${SKIN_MAX_COUNT} скинов. В игре будет активный — его можно сменить в любой момент.`,
    uploadDescription: `Можно загрузить несколько файлов: PNG до ${SKIN_MAX_SIZE / BYTES_IN_KB} КБ каждый, ширина кратна ${SKIN_WIDTH_STEP} и не больше ${SKIN_MAX_WIDTH} px, высота равна ширине или вдвое меньше`,
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
    searchPlaceholder: 'Email, Discord, имя персонажа или UUID',
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

export const LOGS_ADMIN = {
    paginationLabel: 'Порции журнала',
    timelinePaginationLabel: 'Подгрузка хронологии боя',
    lineLabel: 'СТРОКА',
    playerLabel: 'Игрок',
    actorLabel: 'Инициатор',
    targetLabel: 'Цель',
    sourceLabel: 'Источник',
    readyLabel: 'готов',
    notReadyLabel: 'не готов',
    rollLabel: 'Кубик',
    paramLabel: 'Параметр',
    skillLabel: 'Навык',
    modifierLabel: 'Модификатор',
    bonusLabel: 'Бонус',
    resultLabel: 'Итог',
    difficultyLabel: 'Сложность',
    modeLabel: 'Режим',
    advantageLabel: 'Преимущество',
    disadvantageLabel: 'Помеха',
    damageLabel: 'Урон',
    appliedLabel: 'Применено',
    hpBeforeLabel: 'HP до',
    hpAfterLabel: 'HP после',
    equipmentCategoryLabel: 'Категория снаряжения (category)',
    equipmentBeforeLabel: 'Было',
    equipmentAfterLabel: 'Стало',
    equipmentEmptyLabel: 'пусто',
    equipmentReadinessLabel: 'Готовность',
    hitLabel: 'Попадание',
    missLabel: 'Промах',
    bodyPartLabel: 'Часть тела:',
    weaponLabel: 'Оружие:',
    listView: 'Список',
    timelineView: 'Хронология',
    timelineLoaded: 'Загружено событий',
    timelineFiltered: 'Применены фильтры',
    timelineIncomplete: 'Журнал прочитан частично.',
    timelineStalled: 'Чтение остановилось. Обновите журнал, чтобы начать заново.',
    timelineRound: 'Раунд',
    timelineTurn: 'Ход',
    timelineUnknownTurn: 'Ход неизвестного участника',
    timelineLoadMore: 'Загрузить ещё',
    timelineRetry: 'Повторить',
    title: 'Логи сервера',
    description: 'Просмотр серверных журналов по категориям, файлам и событиям в режиме только для чтения.',
    refreshButton: 'Обновить',
    resetFiltersButton: 'Сбросить фильтры',
    filesTitle: 'Файлы категории',
    fileSearchPlaceholder: 'Имя файла или UUID боя',
    searchPlaceholder: 'Ник, UUID, событие или текст строки',
    eventPlaceholder: 'Например, skill.check.resolved',
    allLevels: 'Все уровни',
    allCheckTypes: 'Все проверки',
    allOutcomes: 'Все исходы',
    allCombatActions: 'Все действия',
    levelLabel: 'Уровень',
    orderLabel: 'Порядок',
    searchLabel: 'Поиск по строке',
    eventLabel: 'Событие (event)',
    checkTypeLabel: 'Тип проверки',
    outcomeLabel: 'Исход проверки',
    combatActionLabel: 'Действие в бою',
    hideTurnPauses: 'Скрывать паузы хода',
    turnPausesHidden: 'События приостановки и возобновления хода скрыты.',
    combatUuidLabel: 'UUID боя',
    copyCombatUuid: 'Скопировать UUID боя',
    combatUuidCopied: 'UUID боя скопирован',
    copyFileName: 'Скопировать имя файла',
    fileNameCopied: 'Имя файла скопировано',
    openCombatButton: 'Открыть лог боя',
    detailsToggleOpen: 'Показать все поля и исходную строку',
    detailsToggleClose: 'Скрыть подробности',
    techParamsToggleOpen: 'Показать технические параметры',
    techParamsToggleClose: 'Скрыть технические параметры',
    errorGroupEntriesPrefix: 'Схлопнуто записей:',
    errorGroupTotalPrefix: 'Всего срабатываний:',
    errorGroupToggleOpen: 'Показать отдельные записи',
    errorGroupToggleClose: 'Скрыть отдельные записи',
    rawLineTitle: 'Исходная строка',
    relatedActionRawTitle: 'Исходная строка выполненного действия',
    copyRawButton: 'Скопировать строку',
    rawLineCopied: 'Строка журнала скопирована',
    originalTimestampLabel: 'Исходная метка времени',
    fileFieldLabel: 'Файл журнала',
    byteOffsetLabel: 'Смещение (байт)',
    unparsedTitle: 'Нераспознанная строка',
    parseErrorPrefix: 'Строка разобрана не полностью:',
    truncatedNotice: 'Строка превысила 64 КиБ и была усечена.',
    scanLimitedNotice:
        'Просмотрено 2 МиБ без полного заполнения страницы. Нажмите «Продолжить поиск», чтобы проверить следующие блоки файла.',
    prevPageButton: 'Назад',
    nextPageButton: 'Дальше',
    continueScanButton: 'Продолжить поиск',
    pagePrefix: 'Порция',
    entriesCountPrefix: 'Записей на экране:',
    scannedBytesPrefix: 'Прочитано за запрос:',
    loadingCategories: 'Загрузка категорий журналов…',
    loadingFiles: 'Загрузка списка файлов…',
    loadingEntries: 'Чтение записей файла…',
    loadErrorTitle: 'Не удалось загрузить данные журналов',
    combatFileNotFound: 'Файл выбранного боя не найден в категории «Бои»',
    emptyCategories: {
        icon: 'folder-x',
        title: 'Категории журналов недоступны',
        description: 'Проверьте подключение к источнику журналов и повторите попытку.',
    },
    unavailableCategory: {
        icon: 'folder-lock',
        title: 'Категория недоступна на сервере',
        description: 'Папка выбранной категории ещё не создана на игровом сервере или недоступна для чтения.',
    },
    emptyFiles: {
        icon: 'file-x',
        title: 'В этой категории пока нет файлов',
        description: 'Выберите другую категорию или измените фильтр по имени файла.',
    },
    noFileSelected: {
        icon: 'file-search',
        title: 'Выберите файл журнала',
        description: 'Выберите файл из списка слева, чтобы просмотреть его записи.',
    },
    emptyEntries: {
        icon: 'search-x',
        title: 'Записей по выбранным фильтрам не найдено',
        description: 'Измените параметры поиска, выберите другой уровень или сбросьте фильтры.',
    },
};

export const LOGS_ECONOMY = {
    currencyRatio: '1 серебряная крона = 32 медных.',
    overview: {
        title: 'Состояние экономики',
        description: 'Глобальный снимок сервера. Выбор файла и фильтры операций не меняют эту сводку.',
        retry: 'Повторить загрузку сводки',
        loading: 'Загрузка снимка экономики…',
        loadError: 'Не удалось загрузить снимок экономики',
        errorNotice: 'Журнал операций доступен независимо от снимка.',
        totalMoney: 'Всего денег в экономике',
        bankTotal: 'На банковских счетах',
        cashTotal: 'Наличные в обороте',
        updatedAt: 'Обновление',
        bankSyncedAt: 'Синхронизация счетов',
        currentSession: 'Текущая сессия',
        cashNotice: 'Наличные включают деньги на руках и в сундуках.',
        movementTitle: 'Движение денег и игровые сессии',
        periodLabel: 'Период статистики',
        allTime: 'За всё время',
        sessionPrefix: 'Игровая сессия',
        moneyMass: 'Денежная масса',
        bank: 'Банк',
        cash: 'Наличные',
        turnoverNotice:
            'Обороты переводов и наличных не увеличивают денежную массу. Ручные правки учитываются отдельно от поступлений и выбытий.',
        sessionFlowsTitle: 'Движения за сессию',
        flowColumn: 'Движение',
        operationsColumn: 'Операций',
        turnoverColumn: 'Оборот',
        operationsTitle: 'Операции за выбранный период',
        operationColumn: 'Операция',
        countColumn: 'Количество',
        paginationLabel: 'Страницы операций за выбранный период',
        pageLabel: (page: number, pages: number) => `${page} из ${pages}`,
        bankAccountsTitle: 'Банковские счета',
        accountSearchLabel: 'Поиск среди счетов снимка',
        accountSearchPlaceholder: 'Номер, владелец, UUID или тип владельца',
        accountsEmpty: 'Счета не найдены.',
        accountsCaption: 'Баланс счетов на момент снимка',
        accountColumn: 'Счёт',
        ownerColumn: 'Владелец',
        balanceColumn: 'Баланс',
    },
    filters: {
        scope: 'Операции выбранного файла. Для другой даты выберите файл слева. Сводка экономики от этих фильтров не зависит.',
        flowLabel: 'Движение денег',
        allFlows: 'Все движения денег',
        operationLabel: 'Тип операции',
        allOperations: 'Все операции',
        actorLabel: 'Игрок или UUID',
        actorPlaceholder: 'Инициатор или владелец счёта',
        accountLabel: 'Банковский счёт',
        accountPlaceholder: 'Например, 0002',
        searchLabel: 'Поиск по исходной строке',
        searchPlaceholder: 'Предмет, организация, заказ, адрес…',
        orderLabel: 'Порядок записей',
        advancedLabel: 'Сессия и диапазон суммы',
        sessionLabel: 'Игровая сессия',
        sessionPlaceholder: 'Номер сессии',
        minAmountLabel: 'Сумма от',
        maxAmountLabel: 'Сумма до',
        amountHint: 'В медных кронах',
        minAmountPlaceholder: 'Без нижней границы',
        maxAmountPlaceholder: 'Без верхней границы',
        rangeNotice: 'Диапазон включает обе границы.',
        apply: 'Применить фильтры',
    },
    entry: {
        sessionPrefix: 'Сессия',
        missingSession: 'не указана',
        unknownOperation: 'Нераспознанная операция',
        missingFlow: 'Движение не указано',
        actorLabel: 'Инициатор',
        councilMemberLabel: 'Член совета',
        ownerLabel: 'Владелец счёта',
        accountPrefix: 'Счёт №',
        missingParty: 'Не указан',
        amountLabel: 'Сумма операции',
        moneyMassLabel: 'Денежная масса',
        unchanged: 'Без изменения',
        details: 'Подробности ↓',
        invalidNotice:
            'Запись разобрана не полностью или содержит некорректные денежные поля. Проверьте исходную строку.',
        adjustmentNotice: 'Обнаружена ручная корректировка счёта:',
        afterOperation: 'После операции: всего',
        bankTotal: 'в банке',
        cashTotal: 'наличные',
    },
    money: {
        missingValue: 'Не указано',
        missingAmount: 'Сумма не указана',
        minus: 'Минус',
        plus: 'Плюс',
        silverTitle: 'Серебряные кроны',
        copperTitle: 'Медные кроны',
        currencyNames: {
            silver: {
                one: 'серебряная крона',
                few: 'серебряные кроны',
                many: 'серебряных крон',
                other: 'серебряных крон',
            },
            copper: {
                one: 'медная крона',
                few: 'медные кроны',
                many: 'медных крон',
                other: 'медных крон',
            },
        },
    },
};

export const SESSION_ADMIN = {
    title: 'Управление сессией',
    summaryTitle: 'Сессия',
    controlsTitle: 'Управление',
    refresh: 'Обновить',
    loading: 'Загрузка состояния…',
    unavailable: 'Данные сессии недоступны.',
    loadError: 'Не удалось загрузить состояние сессии',
    actionError: 'Не удалось отправить запрос на изменение сессии',
    numberLabel: 'Номер',
    statusLabel: 'Статус',
    dateTimeLabel: 'Игровые дата и время',
    progressLabel: 'Прогресс',
    remainingLabel: 'Осталось',
    active: 'Активна',
    finished: 'Завершена',
    startHour: 'Час начала',
    duration: 'Длительность в часах',
    withHoursRange: (label: string, min: number, max: number) => `${label} (${min}–${max})`,
    tickProgress: (ticks: number, total: number) => `${ticks} / ${total} тиков`,
    online: (players: number) => `Игроки онлайн: ${players}`,
    server: {
        running: { icon: 'server', label: 'Minecraft не отвечает или не сообщил онлайн', tone: 'neutral', value: null },
        offline: { icon: 'server-off', label: 'Сервер выключен', tone: 'offline', value: null },
        starting: { icon: 'server', label: 'Сервер запускается', tone: 'neutral', value: null },
        stopping: { icon: 'server', label: 'Сервер останавливается', tone: 'neutral', value: null },
        unknown: { icon: 'server', label: 'Состояние сервера неизвестно', tone: 'neutral', value: null },
    },
    whitelist: {
        on: { icon: 'shield-check', label: 'Вайтлист включён', tone: 'protected', value: null },
        off: { icon: 'shield-off', label: 'Вайтлист выключен', tone: 'neutral', value: null },
        unknown: { icon: 'shield-question-mark', label: 'Состояние вайтлиста неизвестно', tone: 'neutral', value: null },
    },
    whitelistRequired: 'Включите вайтлист в Pterodactyl перед запуском.',
    cancel: 'Отмена',
    actions: {
        start: {
            button: 'Запустить сессию',
            title: 'Запустить сессию?',
            description: 'Сервер перезапустится, выполнит расчёты новой сессии и откроет доступ игрокам.',
            confirm: 'Подтвердить запуск',
        },
        stop: {
            button: 'Остановить сессию',
            title: 'Остановить сессию?',
            description: 'Сессия завершится, вайтлист включится, а сервер перезапустится и отключит игроков.',
            confirm: 'Подтвердить остановку',
        },
    },
};
