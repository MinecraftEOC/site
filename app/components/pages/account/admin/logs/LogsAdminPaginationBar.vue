<script setup lang="ts">
import { LOGS_ADMIN } from '~/assets/ts/constants/content/account';
import { EColor } from '~/assets/ts/enums/common';

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

const style = useCssModule();

const classList = computed(() => (props.showStats ? style.statusBar : style.bottomPagination));

const nextButtonColor = computed(() => (props.scanLimited ? EColor.Accent : EColor.Secondary));

const nextButtonLabel = computed(() => (props.scanLimited ? LOGS_ADMIN.continueScanButton : LOGS_ADMIN.nextPageButton));
</script>

<template>
    <div :class="classList">
        <div v-if="showStats" :class="$style.statusCounts">
            <span>
                {{ LOGS_ADMIN.entriesCountPrefix }}
                <strong :class="$style.monoValue">{{ entriesCount }}</strong>
            </span>

            <span>·</span>

            <span>
                {{ LOGS_ADMIN.scannedBytesPrefix }}
                <strong :class="$style.monoValue">{{ formatLogBytes(scannedBytes) }}</strong>
            </span>
        </div>

        <VPagination
            :can-go-prev="canGoPrev"
            :can-go-next="canGoNext"
            :label="LOGS_ADMIN.paginationLabel"
            :prev-label="LOGS_ADMIN.prevPageButton"
            :next-label="nextButtonLabel"
            :next-color="nextButtonColor"
            @prev="emits('prev')"
            @next="emits('next')"
        >
            {{ LOGS_ADMIN.pagePrefix }} {{ pageIndex + 1 }}
        </VPagination>
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

.bottomPagination {
    padding-top: $space-8;
}
</style>
