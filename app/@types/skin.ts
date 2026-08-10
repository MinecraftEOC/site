import type { ICharacter } from '~~/shared/@types/user';

/** Свежий скин из `input[type=file]`: на сервер ещё не отправлен */
export interface ISkinFileItem {
    /** Выбранный файл — превью строится по нему, удаление убирает его из инпута */
    file: File;
}

/** Уже сохранённый скин: файл лежит на сервере, в БД есть запись */
export interface ISkinHashItem extends Pick<ICharacter['skins'][number], 'id' | 'hash'> {
    /** Подпись под превью; по умолчанию — порядковый номер */
    label?: string;
}

/** Элемент слайдера скинов: либо ещё не отправленный файл, либо сохранённый скин */
export type TSkinItem = ISkinFileItem | ISkinHashItem;
