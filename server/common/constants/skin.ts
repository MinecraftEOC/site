import { CharacterStatus } from '~~/generated/prisma/enums';

/** Тексты ошибок ручек скинов, возвращаемые через `createError`. */
export const SKIN_ERRORS = {
    NO_CHARACTER: 'Сначала создайте персонажа',
    NOT_MANAGEABLE: 'Для текущего персонажа нельзя менять скины',
    NO_FILE: 'Файл скина не передан',
    NOT_PNG: 'Скин должен быть PNG-файлом',
    TOO_LARGE: 'Файл скина слишком большой',
    LIMIT_REACHED: 'Достигнут лимит скинов',
    SKIN_NOT_FOUND: 'Скин не найден',
    NO_SKINS: 'Необходимо добавить хотя бы один скин',
};

/** Папка хранения файлов скинов относительно корня репозитория. */
export const SKIN_STORAGE_DIR = 'storage/skins';

/** Имя поля с файлом в multipart-запросе загрузки скина. */
export const SKIN_FORM_FIELD = 'skin';

/** Длина случайного хэша скина в байтах (итоговое hex-имя — вдвое длиннее). */
export const SKIN_HASH_BYTES = 16;

/** Регулярка валидного хэша скина (hex фиксированной длины) — защита от path traversal. */
export const SKIN_HASH_REGEX = /^[a-f0-9]{32}$/;

/** Максимальный размер файла скина, байт (512 КБ). */
export const SKIN_MAX_SIZE = 512 * 1024;

/** Максимум скинов на одного персонажа. */
export const SKIN_MAX_COUNT = 10;

/** Сигнатура (magic bytes) PNG-файла. */
export const PNG_SIGNATURE = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

/** Статусы персонажа, в которых пользователь может добавлять/удалять скины. */
export const SKIN_MANAGEABLE_STATUSES: CharacterStatus[] = [
    CharacterStatus.UNVERIFIED,
    CharacterStatus.RETURNED,
    CharacterStatus.ACTIVE,
];
