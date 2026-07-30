<script setup lang="ts">
import type { PlayerAnimation, SkinViewer } from 'skinview3d';

import {
    SKIN_API_PATH,
    SKIN_MIN_CANVAS_SIZE,
    SKIN_VIEWER_DEFAULTS,
    SKIN_VISIBILITY_THRESHOLD,
} from '~/assets/ts/constants/skin';
import { ESkinAnimation, ESkinModel } from '~/assets/ts/enums/skin';

/** Модуль skinview3d грузится динамически, поэтому его классы нужны как тип. */
type TSkinview3d = typeof import('skinview3d');

interface IProps {
    /**
     * Файл из `input[type=file]` для превью до отправки на сервер: компонент сам
     * заводит и отзывает blob-URL. Самый приоритетный из источников текстуры
     */
    file?: File | null;
    /** Готовый URL текстуры — приоритетнее `hash` (статика, свой blob-URL) */
    src?: string;
    /** Хэш скина: URL текстуры собирается как `/api/skin/<hash>` */
    hash?: string;
    /** Модель персонажа; по умолчанию определяется по самой текстуре */
    model?: ESkinModel;
    /** Проигрываемая анимация */
    animation?: ESkinAnimation;
    /** Скорость анимации, где 1 — обычная */
    animationSpeed?: number;
    /** Автоповорот персонажа вокруг вертикальной оси */
    autoRotate?: boolean;
    /** Скорость автоповорота, рад/с */
    autoRotateSpeed?: number;
    /** Вращение мышью и пальцем; на мобильных перехватывает свайп по канвасу */
    rotatable?: boolean;
    /** Зум колесом мыши: по умолчанию выключен, иначе ломается скролл страницы */
    zoomable?: boolean;
    /** Масштаб персонажа: при 1 макушка упирается в верхний край канваса */
    zoom?: number;
    /** Вертикальный угол обзора камеры, градусы */
    fov?: number;
    /** Пауза: рендер и анимация замирают на текущем кадре */
    paused?: boolean;
    /** Автопауза, когда канвас вне зоны видимости — экономит GPU в слайдере */
    pauseWhenHidden?: boolean;
    /** Текстовое описание для скринридеров */
    label?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    file: null,
    src: '',
    hash: '',
    model: ESkinModel.AutoDetect,
    animation: ESkinAnimation.Idle,
    animationSpeed: SKIN_VIEWER_DEFAULTS.animationSpeed,
    autoRotate: false,
    autoRotateSpeed: SKIN_VIEWER_DEFAULTS.autoRotateSpeed,
    rotatable: true,
    zoomable: false,
    zoom: SKIN_VIEWER_DEFAULTS.zoom,
    fov: SKIN_VIEWER_DEFAULTS.fov,
    paused: false,
    pauseWhenHidden: true,
    label: SKIN_VIEWER_DEFAULTS.label,
});

const emits = defineEmits<{
    load: [];
    error: [error: unknown];
}>();

const root = useTemplateRef<HTMLElement>('root');
const canvas = useTemplateRef<HTMLCanvasElement>('canvas');

// Просмотрщик, модуль и наблюдатели — вне реактивности: это тяжёлые объекты
// с внутренними циклами рендера, оборачивать их в ref смысла нет.
let skinview3d: TSkinview3d | undefined;
let viewer: SkinViewer | undefined;
let resizeObserver: ResizeObserver | undefined;
let visibilityObserver: IntersectionObserver | undefined;

/** Номер последней загрузки текстуры — по нему отсекаются устаревшие ответы. */
let loadId = 0;

const isVisible = ref(true);

/** blob-URL для пропа `file`: компонент сам его создаёт и сам отзывает. */
const fileUrl = ref('');

const url = computed(() => fileUrl.value || props.src || (props.hash ? `${SKIN_API_PATH}/${props.hash}` : ''));
const isPaused = computed(() => props.paused || (props.pauseWhenHidden && !isVisible.value));

/** Пропсы, которые применяются к уже созданному просмотрщику «на ходу». */
const viewerOptions = computed(() => ({
    animationSpeed: props.animationSpeed,
    autoRotate: props.autoRotate,
    autoRotateSpeed: props.autoRotateSpeed,
    rotatable: props.rotatable,
    zoomable: props.zoomable,
    zoom: props.zoom,
    fov: props.fov,
    paused: isPaused.value,
}));

/**
 * Отрисовывает один кадр, если просмотрщик на паузе: в паузе его собственный
 * цикл рендера остановлен, и без этого канвас останется с прошлым кадром.
 */
function redraw() {
    if (viewer?.renderPaused) {
        viewer.render();
    }
}

/** Создаёт объект анимации по значению пропа `animation`. */
function createAnimation(): PlayerAnimation | null {
    if (!skinview3d) {
        return null;
    }

    switch (props.animation) {
        case ESkinAnimation.Idle:
            return new skinview3d.IdleAnimation();
        case ESkinAnimation.Walking:
            return new skinview3d.WalkingAnimation();
        case ESkinAnimation.Running:
            return new skinview3d.RunningAnimation();
        case ESkinAnimation.Flying:
            return new skinview3d.FlyingAnimation();
        case ESkinAnimation.Wave:
            return new skinview3d.WaveAnimation();
        case ESkinAnimation.Crouch:
            return new skinview3d.CrouchAnimation();
        case ESkinAnimation.Swim:
            return new skinview3d.SwimAnimation();
        default:
            return null;
    }
}

function applyAnimation() {
    if (!viewer) {
        return;
    }

    viewer.animation = createAnimation();

    if (viewer.animation) {
        viewer.animation.speed = props.animationSpeed;
    }

    redraw();
}

function applyOptions() {
    if (!viewer) {
        return;
    }

    const options = viewerOptions.value;

    viewer.autoRotate = options.autoRotate;
    viewer.autoRotateSpeed = options.autoRotateSpeed;
    viewer.controls.enableRotate = options.rotatable;
    viewer.controls.enableZoom = options.zoomable;
    viewer.zoom = options.zoom;
    viewer.fov = options.fov;
    viewer.renderPaused = options.paused;

    if (viewer.animation) {
        viewer.animation.speed = options.animationSpeed;
    }

    // OrbitControls жёстко ставит канвасу `touch-action: none`. Если вращение
    // выключено, это лишает мобильных возможности скроллить и свайпать по
    // канвасу — возвращаем поведение браузера.
    viewer.canvas.style.touchAction = options.rotatable ? 'none' : '';

    redraw();
}

/** Подгоняет размер канваса под текущий размер родителя. */
function applySize() {
    if (!viewer || !root.value) {
        return;
    }

    const { width, height } = root.value.getBoundingClientRect();

    viewer.setSize(
        Math.max(width, SKIN_MIN_CANVAS_SIZE),
        Math.max(height, SKIN_MIN_CANVAS_SIZE),
    );

    redraw();
}

/** Отзывает blob-URL пропа `file`: без этого выбранный файл висит в памяти. */
function revokeFileUrl() {
    if (fileUrl.value) {
        URL.revokeObjectURL(fileUrl.value);
        fileUrl.value = '';
    }
}

/** Пересоздаёт blob-URL под текущее значение пропа `file`. */
function applyFile() {
    revokeFileUrl();

    // На сервере File-объекта в пропсах быть не может, а createObjectURL там нет
    if (import.meta.client && props.file) {
        fileUrl.value = URL.createObjectURL(props.file);
    }
}

async function loadSkin() {
    if (!viewer) {
        return;
    }

    if (!url.value) {
        loadId++;
        viewer.loadSkin(null);
        redraw();

        return;
    }

    // Пока текстура грузится, источник могли сменить (например, выбрать другой
    // файл) — результат устаревшей загрузки нужно проигнорировать
    const currentId = ++loadId;

    try {
        await viewer.loadSkin(url.value, { model: props.model });

        // За это время компонент могли размонтировать
        if (!viewer || currentId !== loadId) {
            return;
        }

        redraw();
        emits('load');
    } catch (error) {
        if (currentId !== loadId) {
            return;
        }

        emits('error', error);
    }
}

onMounted(async () => {
    skinview3d = await import('skinview3d');

    // За время динамического импорта компонент мог размонтироваться
    if (!canvas.value || !root.value) {
        return;
    }

    viewer = new skinview3d.SkinViewer({ canvas: canvas.value });

    applySize();
    applyAnimation();
    applyOptions();

    resizeObserver = new ResizeObserver(applySize);
    resizeObserver.observe(root.value);

    visibilityObserver = new IntersectionObserver(
        ([entry]) => {
            isVisible.value = entry?.isIntersecting ?? true;
        },
        { threshold: SKIN_VISIBILITY_THRESHOLD },
    );
    visibilityObserver.observe(root.value);

    await loadSkin();
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();
    viewer?.dispose();
    revokeFileUrl();

    resizeObserver = undefined;
    visibilityObserver = undefined;
    viewer = undefined;
});

watch(() => props.file, applyFile, { immediate: true });
watch([url, () => props.model], loadSkin);
watch(() => props.animation, applyAnimation);
watch(viewerOptions, applyOptions);
</script>

<template>
    <div
        ref="root"
        :class="$style.VSkin"
    >
        <canvas
            ref="canvas"
            :class="$style.canvas"
            role="img"
            :aria-label="props.label"
        />
    </div>
</template>

<style module lang="scss">
.VSkin {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

// Канвас позиционирован абсолютно, чтобы его размер не влиял на размер
// родителя: иначе ResizeObserver зациклится на собственных изменениях.
.canvas {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
}
</style>
