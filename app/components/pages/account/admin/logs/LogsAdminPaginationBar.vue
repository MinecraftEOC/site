<script setup lang="ts">
import { LOGS_ADMIN } from '~/assets/ts/constants/content/account';
import { EColor, ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Номер текущей порции (начиная с 0) */
    pageIndex: number;
    /** Можно ли перейти на предыдущую порцию */
    canGoPrev: boolean;
    /** Можно ли перейти на следующую порцию */
    canGoNext: boolean;
    /** Остановилось ли чтение по бюджету сканирования (2 МиБ) */
    scanLimited?: boolean;
    /** Показывать ли статистику записей и прочитанных байт (верхняя панель) */
    showStats?: boolean;
    /** Количество записей на экране */
    entriesCount?: number;
    /** Количество просмотренных байт за запрос */
    scannedBytes?: number;
}

const props = withDefaults(defineProps<IProps>(), {
    scanLimited: false,
    showStats: false,
    entriesCount: 0,
    scannedBytes: 0,
});

const emits = defineEmits<{
    prev: [];
    next: [];
}>();

const nextButtonColor = computed(() => props.scanLimited ? EColor.Accent : EColor.Secondary);
const nextButtonLabel = computed(() => props.scanLimited ? LOGS_ADMIN.continueScanButton : LOGS_ADMIN.nextPageButton);
</script>

<template>
    <div v-if="showStats" :class="$style.statusBar">
        <div :class="$style.statusCounts">
            <span>
                {{ LOGS_ADMIN.entriesCountPrefix }}
                <strong :class="$style.monoValue">{{ entriesCount }}</strong>
            </span>

            <span>·</span>

            <span>
                {{ LOGS_ADMIN.scannedBytesPrefix }}
                <strong :class="$style.monoValue">{{ formatLogBytes(scannedBytes) }}</strong>
            </span>

            <span>·</span>

            <span>
                {{ LOGS_ADMIN.pagePrefix }}
                <strong :class="$style.monoValue">{{ pageIndex + 1 }}</strong>
            </span>
        </div>

        <div :class="$style.controls">
            <VButton
                :size="ESize.Small"
                :color="EColor.Secondary"
                icon="chevron-left"
                :disabled="!canGoPrev"
                @click="emits('prev')"
            >
                {{ LOGS_ADMIN.prevPageButton }}
            </VButton>

            <VButton
                :size="ESize.Small"
                :color="nextButtonColor"
                icon="chevron-right"
                :disabled="!canGoNext"
                @click="emits('next')"
            >
                {{ nextButtonLabel }}
            </VButton>
        </div>
    </div>

    <div v-else :class="$style.bottomPagination">
        <VButton
            :size="ESize.Small"
            :color="EColor.Secondary"
            icon="chevron-left"
            :disabled="!canGoPrev"
            @click="emits('prev')"
        >
            {{ LOGS_ADMIN.prevPageButton }}
        </VButton>

        <span :class="$style.pageLabel">
            {{ LOGS_ADMIN.pagePrefix }} {{ pageIndex + 1 }}
        </span>

        <VButton
            :size="ESize.Small"
            :color="nextButtonColor"
            icon="chevron-right"
            :disabled="!canGoNext"
            @click="emits('next')"
        >
            {{ nextButtonLabel }}
        </VButton>
    </div>
</template>

<style module lang="scss">
.statusBar {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    justify-content: space-between;
    align-items: center;
    padding: $space-12 $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface;
}

.statusCounts {
    @include t3;

    display: flex;
    flex-wrap: wrap;
    gap: $space-8;
    align-items: center;
    color: $text-secondary;
}

.monoValue {
    @include mono2;

    color: $text-primary;
}

.controls {
    display: flex;
    gap: $space-8;
    align-items: center;
}

.bottomPagination {
    display: flex;
    gap: $space-16;
    justify-content: center;
    align-items: center;
    padding-top: $space-8;
}

.pageLabel {
    @include l2;

    color: $text-secondary;
}
</style>
