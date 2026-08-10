/** Значение тега — им же тег идентифицируется в v-model */
export type TTagValue = string | number;

/** Значение v-model у `VTags`: массив в режиме multiple, иначе одно значение или `null` */
export type TTagsModelValue = TTagValue | TTagValue[] | null;

/** Элемент списка тегов для `VTags` */
export interface ITagItem {
    /** Значение, попадающее в v-model */
    value: TTagValue;
    /** Подпись тега */
    label: string;
    /** Иконка слева от подписи */
    icon?: string;
    /** Счётчик справа от подписи */
    counter?: number | null;
    /** Отключение конкретного тега */
    disabled?: boolean;
}
