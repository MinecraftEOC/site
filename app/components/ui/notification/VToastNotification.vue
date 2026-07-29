<script setup lang="ts">
import type { TNotification } from '~/@types/notifications';
import { ENotificationType } from '~/assets/ts/enums/common';

interface IProps {
    /** Тип уведомления */
    type?: TNotification;
    /** Заголовок уведомления */
    title?: string;
    /** Текст уведомления */
    text?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    type: ENotificationType.Success,
});

const emits = defineEmits<{
    close: [];
}>();

const style = useCssModule();

const classList = computed(() => [
    style[`--type-${props.type}`],
]);

const iconName = computed(() => {
    const icons = {
        [ENotificationType.Success]: 'circle-check',
        [ENotificationType.Error]: 'circle-x',
    };

    return icons[props.type];
});
</script>

<template>
    <div :class="[$style.VToastNotification, classList]" class="v-toast-notification">
        <VIcon
            :name="iconName"
            :class="$style.icon"
            class="v-toast-notification__icon"
        />

        <div :class="$style.wrapper">
            <div
                v-if="props.title"
                :class="$style.title"
                class="v-toast-notification__title"
                v-html="props.title"
            />

            <div
                v-if="props.text"
                :class="$style.text"
                class="v-toast-notification__text"
                v-html="props.text"
            />
        </div>

        <div
            :class="$style.close"
            class="v-toast-notification__close"
            @click="emits('close')"
        >
            <VIcon name="x" />
        </div>
    </div>
</template>

<style module lang="scss">
.VToastNotification {
    display: flex;
    gap: $space-12;
    width: 100%;
    padding: $space-12;
    border: 1px solid $border;
    border-radius: $space-8;

    &.--type-success {
        border-color: $success-fg;
        background-color: $success-bg;
        color: $success-fg;

        .close {
            color: $success-fg;
        }
    }

    &.--type-error {
        border-color: $danger-fg;
        background-color: $danger-bg;
        color: $danger-fg;

        .close {
            color: $danger-fg;
        }
    }
}

.icon,
.close {
    align-self: center;
}

.wrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: $space-2;
}

.title {
    @include l2;
}

.text {
    @include t4;
}

.close {
    cursor: pointer;
}
</style>
