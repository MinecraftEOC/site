<script setup lang="ts">
import { COPY_NOTIFICATION } from '~/assets/ts/constants/content/common';
import { ENotificationType, ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Содержимое поля: показывается и попадает в буфер обмена */
    value: string;
    /** Заголовок уведомления об успешном копировании */
    notification?: string;
    /** Accessible name of the copy button. */
    label?: string;
    /** Small fields fit within table cells. */
    size?: ESize;
}

const props = withDefaults(defineProps<IProps>(), {
    notification: COPY_NOTIFICATION.success,
    label: COPY_NOTIFICATION.label,
    size: ESize.Medium,
});

const notificationStore = useNotificationStore();

async function onCopy() {
    if (!props.value) {
        return;
    }

    try {
        await navigator.clipboard.writeText(props.value);

        notificationStore.add(props.notification);
    } catch {
        notificationStore.add(COPY_NOTIFICATION.error, '', ENotificationType.Error);
    }
}
</script>

<template>
    <div
        :class="[$style.VCopyField, { [$style._small]: size === ESize.Small }]"
        class="v-copy-field"
        :title="value"
        @click.stop="onCopy"
    >
        <span :class="$style.value" class="v-copy-field__value">
            {{ value }}
        </span>

        <button
            type="button"
            :aria-label="label"
            :title="label"
            data-test="copy-field-button"
            :class="$style.button"
            class="v-copy-field__button"
        >
            <VIcon name="copy" :size="14" />
        </button>
    </div>
</template>

<style module lang="scss">
.VCopyField {
    display: flex;
    gap: $space-12;
    justify-content: space-between;
    align-items: center;
    min-width: 0;
    height: $space-48;
    padding: 0 $space-12;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface-sunken;
    cursor: pointer;

    &._small {
        gap: $space-4;
        height: $space-28;
        padding: 0;
        border: 0;
        border-radius: 0;
        background-color: transparent;

        .value {
            @include mono2;

            color: $text-secondary;
        }
    }
}

.value {
    @include mono-lg;

    overflow: hidden;
    min-width: 0;
    color: $text-primary;
    text-overflow: ellipsis;
    white-space: nowrap;
    user-select: text;
}

.button {
    display: flex;
    flex: none;
    justify-content: center;
    align-items: center;
    width: rem(28);
    height: rem(28);
    border: 1px solid $border-subtle;
    border-radius: $radius-full;
    background-color: $surface-raised;
    color: $text-link;
    transition: all $default-transition;

    @include hover {
        background-color: $surface;
        color: $text-link-hover;
    }
}
</style>
