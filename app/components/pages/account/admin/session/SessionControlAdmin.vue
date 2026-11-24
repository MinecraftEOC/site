<script setup lang="ts">
import type { ISessionControlResponse, ISessionJobState, ISessionStartParams, TSessionOperationKind } from '~~/shared/@types/session-control';

import {
    SESSION_DEFAULT_DURATION,
    SESSION_DEFAULT_START_HOUR,
    SESSION_MAX_HOURS,
    SESSION_MIN_HOURS,
} from '~~/shared/constants/session-control';
import { sessionStartSchema } from '~~/shared/schemas/session-control';

import { SESSION_ADMIN } from '~/assets/ts/constants/content/account';
import { EColor, ESize } from '~/assets/ts/enums/common';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import SessionOperationStatus from '~/components/pages/account/admin/session/SessionOperationStatus.vue';
import SessionSummary from '~/components/pages/account/admin/session/SessionSummary.vue';

interface IProps {
    /** Последний ответ со сводкой сессии и состоянием сервера. */
    state: ISessionControlResponse | null;
    /** Операция, полученная при опросе или сразу после принятия команды. */
    job: ISessionJobState | null;
    /** Выполняется запрос состояния. */
    pending: boolean;
    /** Отправляется команда запуска или остановки. */
    submitting: boolean;
    /** Сообщение об ошибке чтения состояния. */
    statusError: string;
    /** Сообщение об ошибке отправки команды. */
    actionError: string;
}

const props = defineProps<IProps>();

const emits = defineEmits<{
    refresh: [];
    start: [params: ISessionStartParams];
    stop: [];
}>();

const startHourLabel = SESSION_ADMIN.withHoursRange(SESSION_ADMIN.startHour, SESSION_MIN_HOURS, SESSION_MAX_HOURS);
const durationLabel = SESSION_ADMIN.withHoursRange(SESSION_ADMIN.duration, SESSION_MIN_HOURS, SESSION_MAX_HOURS);

const startHour = ref(String(SESSION_DEFAULT_START_HOUR));
const duration = ref(String(SESSION_DEFAULT_DURATION));
const confirmation = ref<TSessionOperationKind>('start');
const isConfirmationOpen = ref(false);

const busy = computed(() => props.pending || props.submitting || props.job?.status === 'running');

const isActive = computed(() => props.state?.session?.active);
const whitelistEnabled = computed(() => props.state?.whitelistEnabled);

const action = computed<TSessionOperationKind>(() => {
    const { job } = props;
    if (job?.status === 'running' && job.kind) {
        return job.kind;
    }

    return isActive.value ? 'stop' : 'start';
});

const canOperate = computed(() => !busy.value && !props.statusError && props.state?.server.state === 'running');

const canStart = computed(() => canOperate.value && isActive.value === false && whitelistEnabled.value === true);

const canStop = computed(() => canOperate.value && isActive.value === true);

const params = computed(() => sessionStartSchema.safeParse({
    startHour: Number(startHour.value),
    duration: Number(duration.value),
}));

const actionText = computed(() => SESSION_ADMIN.actions[action.value]);
const actionColor = computed(() => action.value === 'stop' ? EColor.Danger : EColor.Primary);
const canOpenConfirmation = computed(() => canConfirm(action.value));

const confirmationText = computed(() => SESSION_ADMIN.actions[confirmation.value]);
const confirmationColor = computed(() => confirmation.value === 'stop' ? EColor.Danger : EColor.Primary);
const canConfirmAction = computed(() => canConfirm(confirmation.value));

const needsWhitelist = computed(() => isActive.value === false && whitelistEnabled.value === false);

const operationWarning = computed(() => needsWhitelist.value ? SESSION_ADMIN.whitelistRequired : '');

/**
 * Проверяет доступность действия перед открытием диалога и подтверждением.
 *
 * @param kind Запуск или остановка сессии.
 * @returns Можно ли выполнить действие с текущим состоянием и параметрами формы.
 */
function canConfirm(kind: TSessionOperationKind): boolean {
    return kind === 'stop' ? canStop.value : canStart.value && params.value.success;
}

/** Сохраняет выбранное действие на время открытого диалога. */
function onActionClick() {
    if (!canOpenConfirmation.value) {
        return;
    }

    confirmation.value = action.value;
    isConfirmationOpen.value = true;
}

/** Отправляет подтверждённое действие, если оно всё ещё доступно. */
function onConfirm() {
    if (confirmation.value === 'stop' && canStop.value) {
        emits('stop');
    }

    if (confirmation.value === 'start' && canStart.value && params.value.success) {
        emits('start', params.value.data);
    }

    isConfirmationOpen.value = false;
}
</script>

<template>
    <AccountPageTemplate :title="SESSION_ADMIN.title" :class="$style.SessionControlAdmin">
        <template #header-right>
            <VButton
                type="button"
                icon="refresh-cw"
                :color="EColor.Secondary"
                :disabled="busy"
                @click="emits('refresh')"
            >
                {{ SESSION_ADMIN.refresh }}
            </VButton>
        </template>

        <div :class="$style.cards">
            <SessionSummary
                :state="state"
                :pending="pending"
                :class="$style.card"
            />

            <section :class="$style.card" aria-labelledby="session-actions">
                <div :class="$style.cardHeader">
                    <h2 id="session-actions" :class="$style.heading">
                        {{ SESSION_ADMIN.controlsTitle }}
                    </h2>

                    <SessionOperationStatus
                        :job="job"
                        :error="statusError || actionError"
                        :warning="operationWarning"
                    />
                </div>

                <form :class="$style.form" @submit.prevent="onActionClick">
                    <div :class="$style.fields">
                        <VInput
                            v-model="startHour"
                            type="number"
                            :aria-label="SESSION_ADMIN.startHour"
                            :label="startHourLabel"
                            :size="ESize.Small"
                            :min="SESSION_MIN_HOURS"
                            :max="SESSION_MAX_HOURS"
                            :disabled="!canStart"
                            required
                        />

                        <VInput
                            v-model="duration"
                            type="number"
                            :aria-label="SESSION_ADMIN.duration"
                            :label="durationLabel"
                            :size="ESize.Small"
                            :min="SESSION_MIN_HOURS"
                            :max="SESSION_MAX_HOURS"
                            :disabled="!canStart"
                            required
                        />
                    </div>

                    <VButton
                        type="submit"
                        :color="actionColor"
                        :disabled="!canOpenConfirmation"
                        :class="$style.submitButton"
                    >
                        {{ actionText.button }}
                    </VButton>
                </form>
            </section>
        </div>

        <VModal
            v-model="isConfirmationOpen"
            :title="confirmationText.title"
            :description="confirmationText.description"
        >
            <div :class="$style.actions">
                <VButton
                    type="button"
                    :color="EColor.Secondary"
                    @click="isConfirmationOpen = false"
                >
                    {{ SESSION_ADMIN.cancel }}
                </VButton>

                <VButton
                    type="button"
                    :color="confirmationColor"
                    :disabled="!canConfirmAction"
                    @click="onConfirm"
                >
                    {{ confirmationText.confirm }}
                </VButton>
            </div>
        </VModal>
    </AccountPageTemplate>
</template>

<style module lang="scss">
.SessionControlAdmin .cards,
.fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $space-16;

    @include respond-to(mobile) {
        grid-template-columns: minmax(0, 1fr);
    }
}

.card {
    display: flex;
    flex-direction: column;
    gap: $space-16;
    align-items: flex-start;
    min-width: 0;
    padding: $space-20;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-raised;
}

.heading {
    @include h3;
}

.cardHeader {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: $space-8;
    align-items: center;
    width: 100%;
}

.form {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: $space-12;
    width: 100%;
}

.fields :global(.v-input__native) {
    width: 100%;
}

.submitButton {
    margin-top: auto;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: $space-8;
    justify-content: flex-end;
}
</style>
