import type { ICharacterAdminResponse, IUserAdminResponse } from '~~/shared/@types/response';
import type { EUsersColumn } from '~/assets/ts/enums/user';

/** Колонка таблицы игроков в админке */
export interface IUsersColumn {
    /** Ключ колонки: по нему берётся заголовок и идёт сортировка */
    value: EUsersColumn;
    /** Доля ширины таблицы, отданная колонке — таблица с фиксированной раскладкой */
    width: string;
    /** Колонка открывает группу персонажа — слева от неё рисуется разделитель */
    divider?: boolean;
}

/** Строка таблицы игроков: пользователь и его персонажи, прошедшие фильтр */
export interface IUsersRow {
    /** Пользователь */
    user: IUserAdminResponse;
    /** Персонаж, показанный в самой строке — самый значимый из подходящих */
    character: ICharacterAdminResponse | null;
    /** Остальные подходящие персонажи — раскрываются под строкой */
    rest: ICharacterAdminResponse[];
}
