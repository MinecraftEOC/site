<script setup lang="ts">
interface IProps {
    /** Отображаемое число */
    value: number;
    /** Длительность пересчёта, мс */
    duration?: number;
}

const props = withDefaults(defineProps<IProps>(), {
    duration: 200,
});

const displayed = ref(props.value);

let frame: number | undefined;

function stopAnimation() {
    if (frame !== undefined) {
        cancelAnimationFrame(frame);
        frame = undefined;
    }
}

function animate(from: number, to: number) {
    stopAnimation();

    if (!import.meta.client || props.duration <= 0) {
        displayed.value = to;

        return;
    }

    const start = performance.now();

    const step = (now: number) => {
        const progress = Math.min(1, (now - start) / props.duration);

        displayed.value = Math.round(from + (to - from) * progress);

        if (progress < 1) {
            frame = requestAnimationFrame(step);
        }
    };

    frame = requestAnimationFrame(step);
}

watch(() => props.value, (to, from) => {
    animate(from, to);
});

onBeforeUnmount(stopAnimation);
</script>

<template>
    <span :class="$style.VNumber" class="v-number">{{ displayed }}</span>
</template>

<style module lang="scss">
.VNumber {
    font-variant-numeric: tabular-nums;
}
</style>
