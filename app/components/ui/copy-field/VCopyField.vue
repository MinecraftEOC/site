<script setup lang="ts">
import { COPY_NOTIFICATION } from '~/assets/ts/constants/content/common';
import { ENotificationType } from '~/assets/ts/enums/common';

interface IProps {
    /** Содержимое поля: показывается и попадает в буфер обмена */
    value: string;
    /** Заголовок уведомления об успешном копировании */
    notification?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    notification: COPY_NOTIFICATION.success,
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
        :class="$style.VCopyField"
        class="v-copy-field"
        @click="onCopy"
    >
        <span :class="$style.value" class="v-copy-field__value">
            {{ value }}
        </span>

        <button
            type="button"
            aria-label="Скопировать"
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
    height: $space-48;
    padding: 0 $space-12;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface-sunken;
    cursor: pointer;
}

.value {
    @include mono-lg;

    overflow: hidden;
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
