<script setup lang="ts">
import type {
    ISessionControlResponse,
    ISessionJobState,
    ISessionStartParams,
    TPterodactylServerState,
    TSessionOperationKind,
} from '~~/shared/@types/session-control';

import {
    SESSION_DEFAULT_DURATION,
    SESSION_DEFAULT_START_HOUR,
    SESSION_MAX_HOURS,
    SESSION_MIN_HOURS,
    SESSION_TOTAL_TICKS,
} from '~~/shared/constants/session-control';
import { sessionStartSchema } from '~~/shared/schemas/session-control';
import { EColor, ESize } from '~/assets/ts/enums/common';
import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';

const props = defineProps<{
    state: ISessionControlResponse | null;
    job: ISessionJobState | null;
    pending: boolean;
    submitting: boolean;
    statusError: string;
    actionError: string;
}>();

const emit = defineEmits<{
    refresh: [];
    start: [params: ISessionStartParams];
    stop: [];
}>();

const SERVER_STATES: Record<
    TPterodactylServerState,
    { icon: string; label: string }
> = {
    running: {
        icon: 'server',
        label: 'Minecraft не отвечает или не сообщил онлайн',
    },
    offline: { icon: 'server-off', label: 'Сервер выключен' },
    starting: { icon: 'server', label: 'Сервер запускается' },
    stopping: { icon: 'server', label: 'Сервер останавливается' },
};

const startHour = ref(String(SESSION_DEFAULT_START_HOUR));
const duration = ref(String(SESSION_DEFAULT_DURATION));
const confirmation = ref<TSessionOperationKind>('start');
const modalOpen = ref(false);

const session = computed(() => props.state?.session);
const server = computed(() => props.state?.server);
const playerCount = computed(() =>
    server.value?.online ? server.value.players : null,
);
const serverIndicator = computed(() => {
    const serverState = server.value?.state;
    if (serverState && serverState !== 'running') {
        return SERVER_STATES[serverState];
    }

    if (playerCount.value !== null) {
        return {
            icon: 'users-round',
            label: `Игроки онлайн: ${playerCount.value}`,
        };
    }

    return serverState
        ? SERVER_STATES[serverState]
        : { icon: 'server', label: 'Состояние сервера неизвестно' };
});
const whitelist = computed(() => {
    const enabled = props.state?.whitelistEnabled;
    if (enabled === true) {
        return { icon: 'shield-check', label: 'Вайтлист включён' };
    }

    return enabled === false
        ? { icon: 'shield-off', label: 'Вайтлист выключен' }
        : {
                icon: 'shield-question-mark',
                label: 'Состояние вайтлиста неизвестно',
            };
});
const running = computed(() => props.job?.status === 'running');
const action = computed(() => {
    if (props.job?.status === 'running' && props.job.kind) {
        return props.job.kind;
    }

    return session.value?.active ? 'stop' : 'start';
});
const ready = computed(
    () =>
        !running.value
        && !props.pending
        && !props.submitting
        && !props.statusError
        && server.value?.state === 'running',
);
const canStart = computed(
    () =>
        ready.value
        && session.value?.active === false
        && props.state?.whitelistEnabled === true,
);
const canStop = computed(() => ready.value && session.value?.active === true);
const params = computed(() =>
    sessionStartSchema.safeParse({
        startHour: Number(startHour.value),
        duration: Number(duration.value),
    }),
);
const isStartConfirmation = computed(() => confirmation.value === 'start');
const canOpenConfirmation = computed(() =>
    action.value === 'stop'
        ? canStop.value
        : canStart.value && params.value.success,
);

function openConfirmation() {
    if (!canOpenConfirmation.value) {
        return;
    }

    confirmation.value = action.value;
    modalOpen.value = true;
}

function confirmAction() {
    if (isStartConfirmation.value && canStart.value && params.value.success) {
        emit('start', params.value.data);
    }

    if (!isStartConfirmation.value && canStop.value) {
        emit('stop');
    }

    modalOpen.value = false;
}
</script>

<template>
    <AccountPageTemplate title="Управление сессией">
        <template #header-right>
            <VButton
                type="button"
                icon="refresh-cw"
                :color="EColor.Secondary"
                :disabled="pending || submitting || running"
                @click="emit('refresh')"
            >
                Обновить
            </VButton>
        </template>

        <div :class="$style.cards">
            <section :class="$style.card" aria-labelledby="session-details">
                <div :class="$style.cardHeader">
                    <h2 id="session-details" :class="$style.heading">
                        Сессия
                    </h2>
                    <div :class="$style.indicators">
                        <VTooltip :text="serverIndicator.label">
                            <span
                                role="img"
                                tabindex="0"
                                :aria-label="serverIndicator.label"
                                :class="[
                                    $style.indicator,
                                    {
                                        [$style.offline]:
                                            server?.state === 'offline',
                                    },
                                ]"
                            >
                                <VIcon
                                    :name="serverIndicator.icon"
                                    :size="18"
                                    aria-hidden="true"
                                />
                                <span
                                    v-if="
                                        serverIndicator.icon === 'users-round'
                                    "
                                    aria-hidden="true"
                                >{{ playerCount }}</span>
                            </span>
                        </VTooltip>
                        <VTooltip :text="whitelist.label">
                            <span
                                role="img"
                                tabindex="0"
                                :aria-label="whitelist.label"
                                :class="[
                                    $style.indicator,
                                    {
                                        [$style.protected]:
                                            state?.whitelistEnabled === true,
                                    },
                                ]"
                            >
                                <VIcon
                                    :name="whitelist.icon"
                                    :size="18"
                                    aria-hidden="true"
                                />
                            </span>
                        </VTooltip>
                    </div>
                </div>
                <p v-if="pending && !state">
                    Загрузка состояния…
                </p>
                <dl v-else-if="session" :class="$style.details">
                    <dt>Номер</dt>
                    <dd>#{{ session.index }}</dd>
                    <dt>Статус</dt>
                    <dd>{{ session.active ? "Активна" : "Завершена" }}</dd>
                    <dt>Игровые дата и время</dt>
                    <dd>
                        {{ session.formattedDate }}, {{ session.formattedTime }}
                    </dd>
                    <dt>Прогресс</dt>
                    <dd>
                        {{ session.ticks }} / {{ SESSION_TOTAL_TICKS }} тиков
                    </dd>
                    <dt v-if="session.active">
                        Осталось
                    </dt>
                    <dd v-if="session.active">
                        {{ session.remainingTime }}
                    </dd>
                </dl>
                <p v-else>
                    Данные сессии недоступны.
                </p>
            </section>

            <section :class="$style.card" aria-labelledby="session-actions">
                <h2 id="session-actions" :class="$style.heading">
                    Управление
                </h2>

                <form :class="$style.form" @submit.prevent="openConfirmation">
                    <div :class="$style.fields">
                        <VInput
                            v-model="startHour"
                            type="number"
                            aria-label="Час начала"
                            label="Час начала (1–24)"
                            :size="ESize.Small"
                            :min="SESSION_MIN_HOURS"
                            :max="SESSION_MAX_HOURS"
                            :disabled="!canStart"
                            required
                        />
                        <VInput
                            v-model="duration"
                            type="number"
                            aria-label="Длительность в часах"
                            label="Длительность в часах (1–24)"
                            :size="ESize.Small"
                            :min="SESSION_MIN_HOURS"
                            :max="SESSION_MAX_HOURS"
                            :disabled="!canStart"
                            required
                        />
                    </div>
                    <p
                        v-if="
                            session?.active === false
                                && state?.whitelistEnabled === false
                        "
                    >
                        Включите вайтлист в Pterodactyl перед запуском.
                    </p>
                    <VButton
                        type="submit"
                        :color="
                            action === 'stop' ? EColor.Danger : EColor.Primary
                        "
                        :disabled="!canOpenConfirmation"
                    >
                        {{
                            action === "stop"
                                ? "Остановить сессию"
                                : "Запустить сессию"
                        }}
                    </VButton>
                </form>
            </section>

            <div :class="$style.feedback" aria-live="polite">
                <div
                    v-if="job?.step"
                    :class="[$style.notice, $style[job.status]]"
                >
                    <VIcon
                        :name="
                            job.error
                                ? 'circle-x'
                                : running
                                    ? 'loader-circle'
                                    : 'circle-check'
                        "
                        :size="18"
                        :class="{ [$style.spinner]: running }"
                        aria-hidden="true"
                    />
                    <div>
                        <strong>{{ job.step }}</strong>
                        <p v-if="job.error">
                            {{ job.error }}
                        </p>
                    </div>
                </div>
                <p
                    v-if="statusError || actionError"
                    :class="[$style.notice, $style.error]"
                >
                    <VIcon
                        name="circle-x"
                        :size="18"
                        aria-hidden="true"
                    />
                    <span>{{ statusError || actionError }}</span>
                </p>
            </div>
        </div>

        <VModal
            v-model="modalOpen"
            :title="
                isStartConfirmation ? 'Запустить сессию?' : 'Остановить сессию?'
            "
            :description="
                isStartConfirmation
                    ? 'Сервер перезапустится, выполнит расчёты новой сессии и откроет доступ игрокам.'
                    : 'Сессия завершится, вайтлист включится, а сервер перезапустится и отключит игроков.'
            "
        >
            <div :class="$style.actions">
                <VButton
                    type="button"
                    :color="EColor.Secondary"
                    @click="modalOpen = false"
                >
                    Отмена
                </VButton>
                <VButton
                    type="button"
                    :color="
                        isStartConfirmation ? EColor.Primary : EColor.Danger
                    "
                    :disabled="
                        isStartConfirmation
                            ? !canStart || !params.success
                            : !canStop
                    "
                    @click="confirmAction"
                >
                    {{
                        isStartConfirmation
                            ? "Подтвердить запуск"
                            : "Подтвердить остановку"
                    }}
                </VButton>
            </div>
        </VModal>
    </AccountPageTemplate>
</template>

<style module lang="scss">
.cards,
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
    display: flex;
    flex-wrap: wrap;
    gap: $space-8 $space-16;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.indicators {
    display: flex;
    gap: $space-8;
    align-items: center;
    margin-left: auto;
}

.indicator {
    @include l2;

    display: inline-flex;
    gap: $space-4;
    align-items: center;
    min-height: $space-32;
    padding: 0 $space-8;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    color: $text-secondary;

    &.offline {
        background-color: $danger-bg;
        color: $danger-fg;
    }

    &.protected {
        background-color: $success-bg;
        color: $success-fg;
    }
}

.details {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: $space-8 $space-16;
    width: 100%;
    margin: 0;

    dt {
        color: $text-secondary;
    }

    dd {
        margin: 0;
        text-align: right;
    }
}

.form,
.feedback {
    display: grid;
    gap: $space-12;
    width: 100%;
}

.fields :global(.v-input__native) {
    width: 100%;
}

.feedback {
    grid-column: 1 / -1;
}

.feedback:empty {
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

.spinner {
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

.actions {
    display: flex;
    flex-wrap: wrap;
    gap: $space-8;
    justify-content: flex-end;
}
</style>
