/** Допустимое значение варианта выпадающего списка — им же вариант идентифицируется в `v-model` */
export type TSelectValue = string | number;

/** Вариант выпадающего списка `VSelect` */
export interface ISelectItem<T extends TSelectValue = TSelectValue> {
    /** Значение варианта, попадающее в `v-model` */
    value: T;
    /** Человекочитаемая подпись варианта */
    label: string;
    /** Иконка слева от подписи */
    icon?: string;
    /** Отключение конкретного варианта */
    disabled?: boolean;
}
