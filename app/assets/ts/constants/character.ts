import type { ICharacterStates } from '~~/shared/@types/character';
import type { ICharacterParameterItem } from '~/@types/character';
import type { ITagItem } from '~/@types/tags';

import { CharacterStatus } from '~~/generated/prisma/enums';
import { CHARACTER_FORM_FIELDS } from '~~/shared/constants/character';
import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';
import { ECharacterParameter, ECharacterPreset, ECharacterSkill } from '~/assets/ts/enums/character';
import { EBadgeColor } from '~/assets/ts/enums/common';

/** Цвет бейджа статуса персонажа. */
export const CHARACTER_STATUS_COLOR: Record<CharacterStatus, EBadgeColor> = {
    [CharacterStatus.ACTIVE]: EBadgeColor.Success,
    [CharacterStatus.UNVERIFIED]: EBadgeColor.Info,
    [CharacterStatus.RETURNED]: EBadgeColor.Warning,
    [CharacterStatus.BANNED]: EBadgeColor.Danger,
    [CharacterStatus.DEAD]: EBadgeColor.Danger,
    [CharacterStatus.UNAVAILABLE]: EBadgeColor.Warning,
};

/** Куда ведёт карточка персонажа: у статусов без ссылки карточка некликабельна. */
export const CHARACTER_STATUS_LINK: Partial<Record<CharacterStatus, string>> = {
    [CharacterStatus.ACTIVE]: ACCOUNT_ROUTES.character,
    [CharacterStatus.UNVERIFIED]: ACCOUNT_ROUTES.characterEdit,
    [CharacterStatus.RETURNED]: ACCOUNT_ROUTES.characterEdit,
};

/** Имя клиентского поля формы со скинами: файлы есть только на фронте, в общей схеме их нет. */
export const CHARACTER_SKINS_FIELD = 'skins';

/** Порядок полей в уведомлении об ошибках — сверху вниз, как блоки идут в форме. */
export const CHARACTER_FORM_ORDER = [
    CHARACTER_FORM_FIELDS.username,
    CHARACTER_FORM_FIELDS.biography,
    CHARACTER_FORM_FIELDS.states,
    CHARACTER_FORM_FIELDS.startingItems,
    CHARACTER_SKINS_FIELD,
] as const;

/** Пресеты распределения характеристик — теги над параметрами. */
export const CHARACTER_PRESETS: ITagItem[] = [
    { label: 'Воин', value: ECharacterPreset.Warrior, icon: 'sword' },
    { label: 'Торговец', value: ECharacterPreset.Trader, icon: 'coins' },
    { label: 'Следопыт', value: ECharacterPreset.Sledopit, icon: 'compass' },
    { label: 'Ремесленник', value: ECharacterPreset.Crafter, icon: 'hammer' },
];

/** Параметры персонажа с навыками — из них собирается блок распределения очков. */
export const CHARACTER_PARAMETERS: ICharacterParameterItem[] = [
    {
        label: 'Интеллект',
        value: ECharacterParameter.Int,
        hint: '123',
        icon: 'brain',
        skills: [
            { label: 'Торговля', value: ECharacterSkill.Trade, hint: '123' },
            { label: 'Управление', value: ECharacterSkill.Management, hint: '123' },
            { label: 'Образование', value: ECharacterSkill.Education, hint: '123' },
        ],
    },
    {
        label: 'Ловкость',
        value: ECharacterParameter.Agility,
        hint: '',
        icon: 'rabbit',
        skills: [
            { label: 'Ловкость рук', value: ECharacterSkill.Dexterity, hint: '' },
            { label: 'Стрельба', value: ECharacterSkill.Shooting, hint: '' },
            { label: 'Атлетика', value: ECharacterSkill.Athletics, hint: '' },
        ],
    },
    {
        label: 'Телосложение',
        value: ECharacterParameter.Const,
        hint: '',
        icon: 'person-standing',
        skills: [
            { label: 'Стойкость', value: ECharacterSkill.Resistance, hint: '' },
            { label: 'Сила', value: ECharacterSkill.Strength, hint: '' },
        ],
    },
    {
        label: 'Реакция',
        value: ECharacterParameter.Reaction,
        hint: '',
        icon: 'zap',
        skills: [
            { label: 'Ближний бой', value: ECharacterSkill.Melee, hint: '' },
            { label: 'Владение мечом', value: ECharacterSkill.Sword, hint: '' },
            { label: 'Владение древком оружием', value: ECharacterSkill.ShaftWeapon, hint: '' },
            { label: 'Владение клинками', value: ECharacterSkill.Blades, hint: '' },
            { label: 'Уклонение', value: ECharacterSkill.Evasion, hint: '' },
        ],
    },
    {
        label: 'Ремесло',
        value: ECharacterParameter.Craft,
        hint: '',
        icon: 'axe',
        skills: [
            { label: 'Фермерство', value: ECharacterSkill.Farming, hint: '' },
            { label: 'Охотничье ремесло', value: ECharacterSkill.Hunting, hint: '' },
            { label: 'Плотничество', value: ECharacterSkill.Carpentry, hint: '' },
            { label: 'Кузнечное дело', value: ECharacterSkill.Blacksmithing, hint: '' },
            { label: 'Шахтёрство', value: ECharacterSkill.Mining, hint: '' },
        ],
    },
];

/** Сколько параметров уходит в первую колонку блока распределения очков, остальные — во вторую. */
export const CHARACTER_PARAMETERS_COLUMN_SIZE = 3;

/** Готовые наборы характеристик пресетов: подставляются в форму при выборе тега. */
export const CHARACTER_PRESET_VALUES: Record<ECharacterPreset, ICharacterStates> = {
    [ECharacterPreset.Warrior]: {
        parameters: {
            int: 4,
            agility: 3,
            const: 8,
            reaction: 9,
            craft: 3,
        },
        skills: {
            trade: 1,
            management: 1,
            education: 1,
            dexterity: 2,
            shooting: 2,
            athletics: 4,
            resistance: 5,
            strength: 5,
            melee: 7,
            sword: 8,
            shaft_weapon: 4,
            blades: 4,
            evasion: 5,
            farming: 0,
            hunting: 0,
            carpentry: 0,
            blacksmithing: 1,
            mining: 0,
        },
    },
    [ECharacterPreset.Trader]: {
        parameters: {
            int: 9,
            agility: 5,
            const: 4,
            reaction: 3,
            craft: 7,
        },
        skills: {
            trade: 10,
            management: 7,
            education: 6,
            dexterity: 5,
            shooting: 2,
            athletics: 2,
            resistance: 3,
            strength: 2,
            melee: 1,
            sword: 1,
            shaft_weapon: 1,
            blades: 1,
            evasion: 3,
            farming: 2,
            hunting: 1,
            carpentry: 1,
            blacksmithing: 1,
            mining: 1,
        },
    },
    [ECharacterPreset.Sledopit]: {
        parameters: {
            int: 4,
            agility: 9,
            const: 3,
            reaction: 8,
            craft: 3,
        },
        skills: {
            trade: 2,
            management: 1,
            education: 2,
            dexterity: 6,
            shooting: 8,
            athletics: 6,
            resistance: 5,
            strength: 3,
            melee: 2,
            sword: 2,
            shaft_weapon: 1,
            blades: 3,
            evasion: 5,
            farming: 0,
            hunting: 4,
            carpentry: 0,
            blacksmithing: 0,
            mining: 0,
        },
    },
    [ECharacterPreset.Crafter]: {
        parameters: {
            int: 6,
            agility: 2,
            const: 6,
            reaction: 3,
            craft: 10,
        },
        skills: {
            trade: 4,
            management: 3,
            education: 3,
            dexterity: 5,
            shooting: 1,
            athletics: 2,
            resistance: 4,
            strength: 5,
            melee: 1,
            sword: 1,
            shaft_weapon: 1,
            blades: 1,
            evasion: 1,
            farming: 3,
            hunting: 2,
            carpentry: 5,
            blacksmithing: 5,
            mining: 3,
        },
    },
};
