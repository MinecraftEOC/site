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
} as const;

/**
 * Доля видимой площади канваса, с которой просмотрщик считается видимым.
 * Ноль — достаточно любого пикселя в зоне видимости.
 */
export const SKIN_VISIBILITY_THRESHOLD = 0;

/** Минимальный размер канваса, px: от нулевого WebGL-рендерер ругается в консоль. */
export const SKIN_MIN_CANVAS_SIZE = 1;

/** Значение `accept` для инпута загрузки скинов: сервер принимает только PNG. */
export const SKIN_ACCEPT = 'image/png';

/** Пометка на превью скина, который ещё не отправлен на сервер. */
export const SKIN_NEW_LABEL = 'NEW';

/** Отступ между превью в слайдере скинов, px. */
export const SKINS_SLIDER_SPACE_BETWEEN = 16;

/** Сколько превью помещается в слайдере скинов; ключи — `min-width` в px, как того требует Swiper. */
export const SKINS_SLIDER_BREAKPOINTS = {
    0: { slidesPerView: 2 },
    768: { slidesPerView: 3 },
};
