<script setup lang="ts">
import { ENotificationType } from '~/assets/ts/enums/common';

interface IProps {
    /** Тип уведомления */
    type?: ENotificationType;
    /** Заголовок уведомления */
    title?: string;
    /** Текст уведомления */
    text?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    type: ENotificationType.Info,
});

const style = useCssModule();

const classList = computed(() => [
    style[`--type-${props.type}`],
]);

const iconName = computed(() => {
    const icons = {
        [ENotificationType.Success]: 'circle-check',
        [ENotificationType.Warning]: 'triangle-alert',
        [ENotificationType.Error]: 'circle-x',
        [ENotificationType.Info]: 'info',
    };

    return icons[props.type];
});
</script>

<template>
    <div :class="[$style.VNotification, classList]" class="v-notification">
        <VIcon :name="iconName" />

        <div :class="$style.wrapper">
            <div
                v-if="props.title"
                :class="$style.title"
                class="v-notification__title"
                v-html="props.title"
            />

            <div
                :class="$style.text"
                class="v-notification__text"
                v-html="props.text"
            />
        </div>
    </div>
</template>

<style module lang="scss">
.VNotification {
    display: flex;
    gap: $space-12;
    padding: $space-12;
    border-radius: $space-8;

    &.--type-success {
        background-color: $success-bg;
        color: $success-fg;
    }

    &.--type-warning {
        background-color: $warning-bg;
        color: $warning-fg;
    }

    &.--type-error {
        background-color: $danger-bg;
        color: $danger-fg;
    }

    &.--type-info {
        background-color: $info-bg;
        color: $info-fg;
    }
}

.title {
    @include l2;

    margin-bottom: $space-2;
}

.text {
    @include t3;
}
</style>
