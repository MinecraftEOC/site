<script setup lang="ts">
import { SERVER_STATUS_REFRESH_INTERVAL } from '~/assets/ts/constants/common';
import { SERVER_STATUS } from '~/assets/ts/constants/content/common';
import { ESize, EStatusColor } from '~/assets/ts/enums/common';
import { useStatusApi } from '~/composables/api/useStatusApi';

interface IProps {
    /** Размер бейджа */
    size?: ESize;
    /** Укороченные подписи — для узких мест вроде сайдбара */
    short?: boolean;
    /** Иконка вместо точки-индикатора */
    icon?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    size: ESize.Medium,
    short: false,
    icon: '',
});

const { status } = useStatusApi();

const { data, refresh } = await useAsyncData('server-status', () => status());

const texts = computed(() => props.short ? SERVER_STATUS.short : SERVER_STATUS.full);

const color = computed(() => {
    if (!data.value) {
        return EStatusColor.Warning;
    }

    return data.value.online ? EStatusColor.Success : EStatusColor.Danger;
});

const label = computed(() => {
    if (!data.value) {
        return texts.value.loading;
    }

    return data.value.online ? texts.value.online : texts.value.offline;
});

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
    timer = setInterval(refresh, SERVER_STATUS_REFRESH_INTERVAL);
});

onBeforeUnmount(() => {
    if (timer) {
        clearInterval(timer);
    }
});
</script>

<template>
    <VStatusBadge
        :color="color"
        :size="size"
        :icon="icon"
    >
        {{ label }}

        <span v-if="data?.online" :class="$style.counter">
            {{ data.players }}
        </span>
    </VStatusBadge>
</template>

<style module lang="scss">
.counter {
    @include mono2;

    color: $text-inverse;
}
</style>
