/** Базовый путь ручки, которая отдаёт PNG-файл скина по хэшу. */
export const SKIN_API_PATH = '/api/skin';

/**
 * Значения пропсов `VSkin` по умолчанию: сдержанная подача без автоповорота,
 * с вращением мышью и выключенным зумом, чтобы колесо не ломало скролл страницы.
 */
export const SKIN_VIEWER_DEFAULTS = {
    animationSpeed: 1,
    autoRotateSpeed: 1,
    zoom: 0.85,
    fov: 50,
    label: 'Скин персонажа',
} as const;

/**
 * Доля видимой площади канваса, с которой просмотрщик считается видимым.
 * Ноль — достаточно любого пикселя в зоне видимости.
 */
export const SKIN_VISIBILITY_THRESHOLD = 0;

/** Минимальный размер канваса, px: от нулевого WebGL-рендерер ругается в консоль. */
export const SKIN_MIN_CANVAS_SIZE = 1;
