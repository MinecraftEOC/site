/** Значение варианта переключателя — им же вариант идентифицируется в v-model */
export type TSwitcherValue = string | number;

/** Вариант переключателя `VSwitcher` */
export interface ISwitcherItem<T extends TSwitcherValue = TSwitcherValue> {
    /** Значение, попадающее в v-model */
    value: T;
    /** Подпись варианта */
    label: string;
    /** Иконка слева от подписи */
    icon?: string;
    /** Счётчик справа от подписи */
    counter?: number | null;
    /** Отключение конкретного варианта */
    disabled?: boolean;
}
