<script setup lang="ts">
import type { ISessionJobState } from '~~/shared/@types/session-control';

interface IProps {
    /** Текущий этап, результат и ошибка фоновой операции. */
    job: ISessionJobState | null;
    /** Ошибка чтения состояния или отправки команды. */
    error: string;
}

const props = defineProps<IProps>();

const STATUS_ICON_SIZE = 18;

const icon = computed(() => {
    if (props.job?.status === 'running') {
        return 'loader-circle';
    }

    return props.job?.status === 'error' ? 'circle-x' : 'circle-check';
});
</script>

<template>
    <div :class="$style.SessionOperationStatus" aria-live="polite">
        <div v-if="job?.step" :class="[$style.notice, $style[job.status]]">
            <VIcon
                :name="icon"
                :size="STATUS_ICON_SIZE"
                :class="$style.icon"
                aria-hidden="true"
            />

            <div>
                <strong>{{ job.step }}</strong>

                <p v-if="job.error">
                    {{ job.error }}
                </p>
            </div>
        </div>

        <p v-if="error" :class="[$style.notice, $style.error]">
            <VIcon
                name="circle-x"
                :size="STATUS_ICON_SIZE"
                aria-hidden="true"
            />
            <span>{{ error }}</span>
        </p>
    </div>
</template>

<style module lang="scss">
.SessionOperationStatus {
    display: grid;
    gap: $space-12;
    width: 100%;
}

.SessionOperationStatus:empty {
    display: none;
}

.notice {
    @include t3;

    display: flex;
    gap: $space-8;
    align-items: flex-start;
    margin: 0;
    padding: $space-12;
    border-radius: $radius-8;
    background-color: $info-bg;
    color: $info-fg;

    svg {
        flex: none;
    }

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
