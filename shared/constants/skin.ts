import { CharacterStatus } from '~~/generated/prisma/enums';

/** Имя поля с файлом скина в multipart-запросе — общее для клиента и ручек. */
export const SKIN_FORM_FIELD = 'skin';

/** Статусы персонажа, в которых пользователь может добавлять и удалять скины. */
export const SKIN_MANAGEABLE_STATUSES: CharacterStatus[] = [
    CharacterStatus.UNVERIFIED,
    CharacterStatus.RETURNED,
    CharacterStatus.ACTIVE,
];

/** Максимум скинов на одного персонажа. */
export const SKIN_MAX_COUNT = 10;

/** Максимальный размер файла скина, байт (512 КБ). */
export const SKIN_MAX_SIZE = 512 * 1024;
