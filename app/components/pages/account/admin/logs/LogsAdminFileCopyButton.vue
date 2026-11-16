<script setup lang="ts">
import type { ILogFileItem } from '~~/shared/@types/logging';

import { LOGS_ADMIN } from '~/assets/ts/constants/content/account';
import { COPY_NOTIFICATION } from '~/assets/ts/constants/content/common';
import { ENotificationType } from '~/assets/ts/enums/common';

interface IProps {
    /** Файл, для которого копируется UUID боя или имя файла. */
    file: ILogFileItem;
}

const props = defineProps<IProps>();

const notificationStore = useNotificationStore();
const copyLabel = computed(() => props.file.combatUuid ? LOGS_ADMIN.copyCombatUuid : LOGS_ADMIN.copyFileName);

async function onCopy() {
    const { combatUuid, name } = props.file;
    try {
        await navigator.clipboard.writeText(combatUuid || name);
        notificationStore.add(combatUuid ? LOGS_ADMIN.combatUuidCopied : LOGS_ADMIN.fileNameCopied);
    } catch {
        notificationStore.add(COPY_NOTIFICATION.error, '', ENotificationType.Error);
    }
}
</script>

<template>
    <button
        type="button"
        :class="$style.LogsAdminFileCopyButton"
        :aria-label="copyLabel"
        :title="copyLabel"
        @click="onCopy"
    >
        <VIcon name="copy" :size="14" />
    </button>
</template>

<style module lang="scss">
.LogsAdminFileCopyButton {
    display: flex;
    flex: none;
    justify-content: center;
    align-items: center;
    width: $space-28;
    height: $space-28;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface-raised;
    color: $text-link;
    cursor: pointer;
    transition: all $default-transition;

    @include hover {
        border-color: $border-focus;
        color: $text-link-hover;
    }
}
</style>
