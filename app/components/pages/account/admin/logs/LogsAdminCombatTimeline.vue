<script setup lang="ts">
import type { ILogEntryItem, TLogFieldValue } from '~~/shared/@types/logging';

import { ELogCategory } from '~~/shared/enums/logging';
import { LOGS_ADMIN } from '~/assets/ts/constants/content/account';
import { EColor, ESize } from '~/assets/ts/enums/common';
import LogsAdminEntryCard from '~/components/pages/account/admin/logs/LogsAdminEntryCard.vue';

interface IProps {
    /** All entries loaded for the current combat log. */
    entries: ILogEntryItem[];
    /** Entries remaining after the timeline display filters. */
    visibleEntries: ILogEntryItem[];
    /** Related action entries indexed by their source byte offset. */
    relatedActions: ReadonlyMap<number, ILogEntryItem[]>;
    /** Source filename displayed in entry details. */
    fileName: string;
    /** Whether filters restrict the displayed timeline. */
    filtered: boolean;
    /** Whether another batch can be loaded from the source. */
    hasMore: boolean;
    /** Whether reading stopped at the scan budget. */
    scanLimited: boolean;
    /** Whether repeated cursors prevented further loading. */
    stalled: boolean;
    /** Whether a batch request is in progress. */
    loading: boolean;
    /** User-facing error from the most recent batch request. */
    error: string;
}

interface ITurn {
    offset: number;
    id: string | null;
    entries: ILogEntryItem[];
}

interface IRound {
    offset: number;
    id: string | null;
    turns: ITurn[];
}

const props = defineProps<IProps>();

const emits = defineEmits<{
    loadMore: [];
    retry: [];
}>();

const timelineId = useId();

const collapsedRounds = ref(new Set<string>());

const participantNames = computed(() => {
    const names = new Map<string, string>();

    for (const { fields } of props.entries) {
        for (const value of [fields.members, fields.order]) {
            if (typeof value !== 'string') {
                continue;
            }

            try {
                const participants: unknown = JSON.parse(value);
                if (Array.isArray(participants)) {
                    for (const participant of participants as unknown[]) {
                        if (
                            participant
                            && typeof participant === 'object'
                            && 'uuid' in participant
                            && 'name' in participant
                        ) {
                            addParticipantName(names, participant.uuid, participant.name);
                        }
                    }
                }
            } catch {
                // Partial log records can contain malformed participant data.
            }
        }

        addParticipantName(names, fields.actor_uuid, fields.actor);
        addParticipantName(names, fields.target_uuid, fields.target);
    }

    return names;
});

const turnNames = computed(() => {
    const names = new Map<string, string>();

    for (const { event, fields } of props.entries) {
        if (event !== 'combat.turn.started' && event !== 'combat.turn.finished' && event !== 'combat.turn.resumed') {
            continue;
        }

        const roundId = getId(fields.round);
        const turnId = getId(fields.turn_id);
        const actorUuid = getText(fields.actor_uuid);
        const name = getText(fields.actor) ?? (actorUuid ? participantNames.value.get(actorUuid) : undefined);
        if (roundId !== null && turnId !== null && name) {
            const key = getTurnKey(roundId, turnId);
            if (event === 'combat.turn.started' || !names.has(key)) {
                names.set(key, name);
            }
        }
    }

    return names;
});

const rounds = computed(() => {
    const result: IRound[] = [];
    let round: IRound | undefined;
    let turn: ITurn | undefined;

    for (const entry of [...props.visibleEntries].sort((a, b) => a.byteOffset - b.byteOffset)) {
        const roundId = getId(entry.fields.round);
        const turnId = roundId === null || entry.event === 'combat.round.started' ? null : getId(entry.fields.turn_id);
        if (!round || round.id !== roundId) {
            round = { id: roundId, offset: entry.byteOffset, turns: [] };
            result.push(round);
            turn = undefined;
        }

        if (!turn || turn.id !== turnId) {
            turn = { id: turnId, offset: entry.byteOffset, entries: [] };
            round.turns.push(turn);
        }

        turn.entries.push(entry);
    }

    return result;
});

function getId(value: TLogFieldValue | undefined): string | null {
    if (typeof value === 'number') {
        return String(value);
    }

    return getText(value);
}

function getText(value: unknown): string | null {
    return typeof value === 'string' ? value.trim() || null : null;
}

function addParticipantName(names: Map<string, string>, rawUuid: unknown, rawName: unknown) {
    const uuid = getText(rawUuid);
    const name = getText(rawName);
    if (uuid && name) {
        names.set(uuid, name);
    }
}

function getTurnKey(roundId: string, turnId: string): string {
    return JSON.stringify([roundId, turnId]);
}

function getTurnTitle(roundId: string, turnId: string): string {
    const name = turnNames.value.get(getTurnKey(roundId, turnId));
    const turnTitle = name ? `${LOGS_ADMIN.timelineTurn} ${name}` : LOGS_ADMIN.timelineUnknownTurn;
    return `${LOGS_ADMIN.timelineRound} ${roundId} · ${turnTitle}`;
}

function toggleRound(roundId: string) {
    if (collapsedRounds.value.has(roundId)) {
        collapsedRounds.value.delete(roundId);
    } else {
        collapsedRounds.value.add(roundId);
    }
}
</script>

<template>
    <div :class="$style.timeline">
        <div :class="$style.status" aria-live="polite">
            <span>{{ LOGS_ADMIN.timelineLoaded }}: {{ entries.length }}</span>

            <span v-if="filtered">{{ LOGS_ADMIN.timelineFiltered }}</span>

            <span v-if="hasMore && !scanLimited">{{ LOGS_ADMIN.timelineIncomplete }}</span>

            <span v-if="scanLimited">{{ LOGS_ADMIN.scanLimitedNotice }}</span>

            <span v-if="stalled">{{ LOGS_ADMIN.timelineStalled }}</span>
        </div>

        <div
            v-for="round in rounds"
            :key="round.offset"
            :class="$style.group"
        >
            <h3 v-if="round.id !== null" :class="$style.roundTitle">
                <button
                    type="button"
                    :class="$style.roundToggle"
                    :aria-expanded="!collapsedRounds.has(round.id)"
                    :aria-controls="`${timelineId}-round-${round.offset}`"
                    @click="toggleRound(round.id)"
                >
                    {{ LOGS_ADMIN.timelineRound }} {{ round.id }}
                    <VIcon
                        :name="collapsedRounds.has(round.id) ? 'chevron-down' : 'chevron-up'"
                        :size="16"
                        aria-hidden="true"
                    />
                </button>
            </h3>

            <div
                v-show="round.id === null || !collapsedRounds.has(round.id)"
                :id="`${timelineId}-round-${round.offset}`"
                :class="$style.group"
            >
                <div
                    v-for="turn in round.turns"
                    :key="turn.offset"
                    :class="$style.group"
                >
                    <h4 v-if="round.id !== null && turn.id !== null" :class="$style.turnTitle">
                        {{ getTurnTitle(round.id, turn.id) }}
                    </h4>

                    <LogsAdminEntryCard
                        v-for="entry in turn.entries"
                        :key="entry.byteOffset"
                        :entry="entry"
                        :related-entries="relatedActions.get(entry.byteOffset)"
                        :category="ELogCategory.Combat"
                        :file-name="fileName"
                        compact
                    />
                </div>
            </div>
        </div>

        <span v-if="loading" role="status">{{ LOGS_ADMIN.loadingEntries }}</span>

        <span v-else-if="!visibleEntries.length && entries.length && !error">
            {{ LOGS_ADMIN.turnPausesHidden }}
        </span>

        <span v-else-if="!entries.length && !hasMore && !stalled && !error">
            {{ LOGS_ADMIN.emptyEntries.title }}
        </span>

        <div v-if="error" :class="$style.status">
            <span role="alert">{{ error }}</span>

            <VButton
                :size="ESize.Small"
                :color="EColor.Secondary"
                :disabled="loading"
                data-test="timeline-retry"
                @click="emits('retry')"
            >
                {{ LOGS_ADMIN.timelineRetry }}
            </VButton>
        </div>

        <VPagination
            v-else-if="hasMore"
            :class="$style.loadMore"
            :can-go-next="!loading"
            :show-prev="false"
            :label="LOGS_ADMIN.timelinePaginationLabel"
            :next-label="scanLimited ? LOGS_ADMIN.continueScanButton : LOGS_ADMIN.timelineLoadMore"
            data-test="timeline-load-more"
            @next="emits('loadMore')"
        >
            {{ scanLimited ? LOGS_ADMIN.continueScanButton : LOGS_ADMIN.timelineLoadMore }}
        </VPagination>
    </div>
</template>

<style module lang="scss">
.timeline,
.group {
    display: flex;
    flex-direction: column;
    gap: $space-8;
    min-width: 0;
}

.timeline {
    gap: $space-16;
}

.status {
    @include t3;

    display: flex;
    flex-wrap: wrap;
    gap: $space-8 $space-12;
    align-items: center;
    color: $text-secondary;
}

.roundTitle {
    @include h5;
}

.roundToggle {
    display: flex;
    gap: $space-8;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    min-height: $space-32;
    padding: 0 $space-8 0 0;
    color: $text-primary;
    text-align: left;

    @include hover {
        color: $text-link;
    }
}

.turnTitle {
    @include mono2;

    overflow-wrap: anywhere;
}

.loadMore {
    align-self: flex-start;
}
</style>
