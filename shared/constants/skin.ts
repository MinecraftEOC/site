import { CharacterStatus } from '~~/generated/prisma/enums';

/** Имя поля с файлом скина в multipart-запросе — общее для клиента и ручек. */
export const SKIN_FORM_FIELD = 'skin';

/** Имя поля multipart-запроса с индексом загружаемого файла, который станет активным скином. */
export const SKIN_ACTIVE_FORM_FIELD = 'activeSkin';

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

/** Шаг ширины скина, px: лаунчер принимает только кратную ему ширину. */
export const SKIN_WIDTH_STEP = 64;

/** Максимальная ширина скина, px: больше лаунчер молча игнорирует. */
export const SKIN_MAX_WIDTH = 1024;
