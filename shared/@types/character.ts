/** Параметры персонажа: пять основных характеристик. */
export interface ICharacterParameters {
    /** Интеллект. */
    int: number;
    /** Ловкость. */
    agility: number;
    /** Телосложение. */
    const: number;
    /** Реакция. */
    reaction: number;
    /** Ремесло. */
    craft: number;
}

/** Навыки персонажа — производные от параметров умения. */
export interface ICharacterSkills {
    /** Торговля — навык интеллекта. */
    trade: number;
    /** Управление — навык интеллекта. */
    management: number;
    /** Образование — навык интеллекта. */
    education: number;
    /** Ловкость рук — навык ловкости. */
    dexterity: number;
    /** Стрельба — навык ловкости. */
    shooting: number;
    /** Атлетика — навык ловкости. */
    athletics: number;
    /** Стойкость — навык телосложения. */
    resistance: number;
    /** Сила — навык телосложения. */
    strength: number;
    /** Ближний бой — навык реакции. */
    melee: number;
    /** Владение мечом — навык реакции. */
    sword: number;
    /** Владение древковым оружием — навык реакции. */
    shaft_weapon: number;
    /** Владение клинками — навык реакции. */
    blades: number;
    /** Уклонение — навык реакции. */
    evasion: number;
    /** Фермерство — навык ремесла. */
    farming: number;
    /** Охотничье ремесло — навык ремесла. */
    hunting: number;
    /** Плотничество — навык ремесла. */
    carpentry: number;
    /** Кузнечное дело — навык ремесла. */
    blacksmithing: number;
    /** Шахтёрство — навык ремесла. */
    mining: number;
}

/** Распределённые характеристики персонажа: параметры вместе с навыками. */
export interface ICharacterStates {
    /** Основные параметры. */
    parameters: ICharacterParameters;
    /** Навыки. */
    skills: ICharacterSkills;
}

/** Выбранный стартовый предмет: то, что уходит в БД. */
export interface ICharacterItem {
    /** Идентификатор предмета из каталога. */
    id: string;
    /** Количество штук в наборе. */
    quantity: number;
}

/** Предмет каталога: то же плюс данные для вывода и цена. */
export interface ICharacterStartingItem extends ICharacterItem {
    /** Название предмета. */
    label: string;
    /** Стоимость в монетах. */
    cost: number;
    /** Иконка предмета. */
    icon: string;
}
