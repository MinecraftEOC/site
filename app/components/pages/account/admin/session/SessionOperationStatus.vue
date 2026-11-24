<script setup lang="ts">
import type { ISessionJobState } from '~~/shared/@types/session-control';

interface IProps {
    /** Текущий этап, результат и ошибка фоновой операции. */
    job: ISessionJobState | null;
    /** Ошибка чтения состояния или отправки команды. */
    error: string;
    /** Причина, по которой запуск сейчас недоступен. */
    warning: string;
}

const props = defineProps<IProps>();

const STATUS_ICON_SIZE = 16;

const status = computed(() => {
    const { error, job, warning } = props;

    if (error) {
        return { icon: 'circle-x', tone: 'error', title: error };
    }

    if (job?.status === 'error') {
        return { icon: 'circle-x', tone: 'error', title: job.step, detail: job.error };
    }

    if (job?.status === 'running') {
        return { icon: 'loader-circle', tone: 'running', title: job.step };
    }

    // Блокировка нового запуска важнее результата предыдущей операции.
    if (warning) {
        return { icon: 'shield-off', tone: 'warning', title: warning };
    }

    return job?.status === 'success'
        ? { icon: 'circle-check', tone: 'success', title: job.step }
        : null;
});
</script>

<template>
    <div :class="$style.SessionOperationStatus" aria-live="polite">
        <div v-if="status?.title" :class="[$style.notice, $style[status.tone]]">
            <VIcon
                :name="status.icon"
                :size="STATUS_ICON_SIZE"
                :class="$style.icon"
                aria-hidden="true"
            />

            <div>
                <strong>{{ status.title }}</strong>

                <p v-if="status.detail">
                    {{ status.detail }}
                </p>
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.SessionOperationStatus {
    justify-self: end;
    min-width: 0;
    max-width: 100%;
}

.SessionOperationStatus:empty {
    display: none;
}

.notice {
    @include t3;

    display: flex;
    gap: $space-8;
    align-items: center;
    min-height: $space-32;
    padding: $space-4 $space-8;
    border-radius: $radius-8;
    background-color: $info-bg;
    color: $info-fg;
    overflow-wrap: anywhere;

    p {
        margin: $space-4 0 0;
    }

    &.success {
        background-color: $success-bg;
        color: $success-fg;
    }

    &.error {
        background-color: $danger-bg;
        color: $danger-fg;
    }

    &.warning {
        background-color: $warning-bg;
        color: $warning-fg;
    }
}

.icon {
    flex: none;
}

.running .icon {
    animation: session-status-spin 1s linear infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
}

@keyframes session-status-spin {
    to {
        transform: rotate(1turn);
    }
}
</style>
