/** Готовое распределение характеристик, которое можно выбрать одним тегом. */
export enum ECharacterPreset {
    /** Воин. */
    Warrior = 'warrior',
    /** Ремесленник. */
    Crafter = 'crafter',
    /** Торговец. */
    Trader = 'trader',
    /** Следопыт. */
    Sledopit = 'sledopit',
}

/** Ключи основных параметров персонажа — совпадают с полями `ICharacterParameters`. */
export enum ECharacterParameter {
    /** Интеллект. */
    Int = 'int',
    /** Реакция. */
    Reaction = 'reaction',
    /** Ловкость. */
    Agility = 'agility',
    /** Телосложение. */
    Const = 'const',
    /** Ремесло. */
    Craft = 'craft',
}

/** Ключи навыков персонажа — совпадают с полями `ICharacterSkills`. */
export enum ECharacterSkill {
    /** Торговля — навык интеллекта. */
    Trade = 'trade',
    /** Управление — навык интеллекта. */
    Management = 'management',
    /** Образование — навык интеллекта. */
    Education = 'education',
    /** Фермерство — навык ремесла. */
    Farming = 'farming',
    /** Охотничье ремесло — навык ремесла. */
    Hunting = 'hunting',
    /** Плотничество — навык ремесла. */
    Carpentry = 'carpentry',
    /** Кузнечное дело — навык ремесла. */
    Blacksmithing = 'blacksmithing',
    /** Шахтёрство — навык ремесла. */
    Mining = 'mining',
    /** Ближний бой — навык реакции. */
    Melee = 'melee',
    /** Владение древковым оружием — навык реакции. */
    ShaftWeapon = 'shaft_weapon',
    /** Владение клинками — навык реакции. */
    Blades = 'blades',
    /** Владение мечом — навык реакции. */
    Sword = 'sword',
    /** Уклонение — навык реакции. */
    Evasion = 'evasion',
    /** Ловкость рук — навык ловкости. */
    Dexterity = 'dexterity',
    /** Стрельба — навык ловкости. */
    Shooting = 'shooting',
    /** Атлетика — навык ловкости. */
    Athletics = 'athletics',
    /** Стойкость — навык телосложения. */
    Resistance = 'resistance',
    /** Сила — навык телосложения. */
    Strength = 'strength',
}
