/** Модель персонажа: от неё зависит толщина рук у 3D-модели. */
export enum ESkinModel {
    /** Определить по текстуре: skinview3d смотрит прозрачность пикселей рукава. */
    AutoDetect = 'auto-detect',
    /** Классическая модель (Steve), руки 4px. */
    Default = 'default',
    /** Тонкая модель (Alex), руки 3px. */
    Slim = 'slim',
}

/** Анимация, которую проигрывает 3D-просмотрщик скина. */
export enum ESkinAnimation {
    /** Без анимации: статичная поза. */
    None = 'none',
    /** Стойка на месте: покачивание руками и головой. */
    Idle = 'idle',
    /** Ходьба. */
    Walking = 'walking',
    /** Бег. */
    Running = 'running',
    /** Полёт на элитрах. */
    Flying = 'flying',
    /** Приветственный взмах рукой. */
    Wave = 'wave',
    /** Приседание (Shift). */
    Crouch = 'crouch',
    /** Плавание. */
    Swim = 'swim',
}
