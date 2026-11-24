<script setup lang="ts">
import type { ISessionControlResponse } from '~~/shared/@types/session-control';

import { SESSION_TOTAL_TICKS } from '~~/shared/constants/session-control';
import { SESSION_ADMIN } from '~/assets/ts/constants/content/account';

interface IProps {
    /** Последний снимок сессии, онлайна и вайтлиста. */
    state: ISessionControlResponse | null;
    /** Выполняется запрос состояния. */
    pending: boolean;
}

const props = defineProps<IProps>();

const INDICATOR_ICON_SIZE = 18;

const session = computed(() => props.state?.session);

const sessionStatus = computed(() => session.value?.active ? SESSION_ADMIN.active : SESSION_ADMIN.finished);

const emptyText = computed(() => props.pending && !props.state ? SESSION_ADMIN.loading : SESSION_ADMIN.unavailable);

const serverIndicator = computed(() => {
    const server = props.state?.server;
    const state = server?.state;

    if (state && state !== 'running') {
        return SESSION_ADMIN.server[state];
    }

    if (server?.online && server.players !== null) {
        return {
            icon: 'users-round',
            label: SESSION_ADMIN.online(server.players),
            value: server.players,
            tone: 'neutral',
        };
    }

    return state ? SESSION_ADMIN.server[state] : SESSION_ADMIN.server.unknown;
});

const whitelistIndicator = computed(() => {
    const enabled = props.state?.whitelistEnabled;

    if (enabled === true) {
        return SESSION_ADMIN.whitelist.on;
    }

    return enabled === false ? SESSION_ADMIN.whitelist.off : SESSION_ADMIN.whitelist.unknown;
});

const indicators = computed(() => [
    { key: 'server', ...serverIndicator.value },
    { key: 'whitelist', ...whitelistIndicator.value },
]);
</script>

<template>
    <section :class="$style.SessionSummary" aria-labelledby="session-details">
        <div :class="$style.cardHeader">
            <h2 id="session-details" :class="$style.heading">
                {{ SESSION_ADMIN.summaryTitle }}
            </h2>

            <div :class="$style.indicators">
                <VTooltip
                    v-for="indicator in indicators"
                    :key="indicator.key"
                    :text="indicator.label"
                >
                    <span
                        role="img"
                        tabindex="0"
                        :aria-label="indicator.label"
                        :class="[$style.indicator, $style[indicator.tone]]"
                    >
                        <VIcon
                            :name="indicator.icon"
                            :size="INDICATOR_ICON_SIZE"
                            aria-hidden="true"
                        />

                        <span v-if="indicator.value != null" aria-hidden="true">{{ indicator.value }}</span>
                    </span>
                </VTooltip>
            </div>
        </div>

        <dl v-if="session" :class="$style.details">
            <dt>{{ SESSION_ADMIN.numberLabel }}</dt>
            <dd>#{{ session.index }}</dd>

            <dt>{{ SESSION_ADMIN.statusLabel }}</dt>
            <dd>{{ sessionStatus }}</dd>

            <dt>{{ SESSION_ADMIN.dateTimeLabel }}</dt>
            <dd>{{ session.formattedDate }}, {{ session.formattedTime }}</dd>

            <dt>{{ SESSION_ADMIN.progressLabel }}</dt>
            <dd>{{ SESSION_ADMIN.tickProgress(session.ticks, SESSION_TOTAL_TICKS) }}</dd>

            <template v-if="session.active">
                <dt>{{ SESSION_ADMIN.remainingLabel }}</dt>
                <dd>{{ session.remainingTime }}</dd>
            </template>
        </dl>

        <p v-else>
            {{ emptyText }}
        </p>
    </section>
</template>

<style module lang="scss">
.heading {
    @include h3;
}

.SessionSummary .cardHeader {
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
</style>
