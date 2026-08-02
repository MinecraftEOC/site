export enum ESize {
    Small = 'small',
    Medium = 'medium',
}

export enum EColor {
    Primary = 'primary',
    Secondary = 'secondary',
    SecondaryDark = 'secondary-dark',
    Accent = 'accent',
    Danger = 'danger',
}

export enum EStatusColor {
    Success = 'success',
    Warning = 'warning',
    Danger = 'danger',
}

export enum ETag {
    Button = 'button',
    Link = 'a',
    NuxtLink = 'NuxtLink',
    Div = 'div',
}

/** Расположение модального окна на экране */
export enum EModalVariant {
    /** По центру на десктопе, bottom sheet на мобилке */
    Adaptive = 'adaptive',
    /** По центру на любой ширине */
    Center = 'center',
    /** Bottom sheet на любой ширине */
    BottomSheet = 'bottom-sheet',
}

export enum ENotificationType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
    Info = 'info',
}
