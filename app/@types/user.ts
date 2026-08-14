import type { ICharacter, IUser } from '~~/shared/@types/user';
import type { EUsersColumn } from '~/assets/ts/enums/user';

/** Колонка таблицы игроков в админке */
export interface IUsersColumn {
    /** Ключ колонки: по нему берётся заголовок и идёт сортировка */
    value: EUsersColumn;
    /** Колонка открывает группу персонажа — слева от неё рисуется разделитель */
    divider?: boolean;
}

/** Строка таблицы игроков: пользователь и его персонажи, прошедшие фильтр */
export interface IUsersRow {
    /** Пользователь */
    user: IUser;
    /** Персонаж, показанный в самой строке — самый значимый из подходящих */
    character: ICharacter | null;
    /** Остальные подходящие персонажи — раскрываются под строкой */
    rest: ICharacter[];
}
