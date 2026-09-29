/** Тексты ошибок ручек скинов, возвращаемые через `createError`. */
export const SKIN_ERRORS = {
    NO_CHARACTER: 'Сначала создайте персонажа',
    NOT_MANAGEABLE: 'Для текущего персонажа нельзя менять скины',
    NOT_PNG: 'Скин должен быть PNG-файлом',
    EMPTY_FILE: 'Файл скина пустой',
    TOO_LARGE: 'Файл скина слишком большой',
    LIMIT_REACHED: 'Достигнут лимит скинов',
    SKIN_NOT_FOUND: 'Скин не найден',
    NO_SKINS: 'Необходимо добавить хотя бы один скин',
    BAD_DIMENSIONS: 'Скин не подойдёт игре: ширина должна быть кратна 64 и не больше 1024, а высота — равна ширине или вдвое меньше (64×32, 64×64, 128×128…)',
    ACTIVE_INVALID: 'Некорректный выбор активного скина',
};

/** Папка хранения файлов скинов относительно корня репозитория. */
export const SKIN_STORAGE_DIR = 'storage/skins';

/**
 * Папка активных скинов относительно корня репозитория: `<uuid>.png` — симлинк
 * на файл из {@link SKIN_STORAGE_DIR}. Её читает LaunchServer и раздаёт nginx.
 */
export const ACTIVE_SKIN_DIR = 'storage/active';

/** Длина случайного хэша скина в байтах (итоговое hex-имя — вдвое длиннее). */
export const SKIN_HASH_BYTES = 16;

/** Регулярка валидного хэша скина (hex фиксированной длины) — защита от path traversal. */
export const SKIN_HASH_REGEX = /^[a-f0-9]{32}$/;

/** Сигнатура (magic bytes) PNG-файла. */
export const PNG_SIGNATURE = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

/** Смещение ширины и высоты в PNG: сигнатура (8 байт) + длина и тип чанка IHDR (по 4 байта). */
export const PNG_IHDR_SIZE_OFFSET = 16;

/** Тип первого чанка PNG, в котором лежат размеры картинки. */
export const PNG_IHDR_TYPE = 'IHDR';
