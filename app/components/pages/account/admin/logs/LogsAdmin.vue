<script setup lang="ts">
import type { ILogCategoryItem, ILogEntryFileMeta, ILogEntryGroup, ILogEntryItem, ILogFileItem } from '~~/shared/@types/logging';
import type { ISwitcherItem } from '~/@types/switcher';

import {
    LOG_CATEGORY_ICON,
    LOG_CATEGORY_LABEL,
    LOG_CATEGORY_ORDER,
    LOGS_DEFAULT_LIMIT,
} from '~~/shared/constants/logging';
import {
    ELogCategory,
    ELogCheckOutcome,
    ELogCheckType,
    ELogCombatAction,
    ELogLevel,
    ELogOrder,
} from '~~/shared/enums/logging';
import { LOGS_ADMIN } from '~/assets/ts/constants/content/account';
import { LOGS_SEARCH_DEBOUNCE_MS } from '~/assets/ts/constants/logs';
import { EColor, ENotificationType, ESize } from '~/assets/ts/enums/common';

import AccountEmptyState from '~/components/pages/account/AccountEmptyState.vue';
import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import LogsAdminEntryCard from '~/components/pages/account/admin/logs/LogsAdminEntryCard.vue';
import LogsAdminErrorGroupCard from '~/components/pages/account/admin/logs/LogsAdminErrorGroupCard.vue';
import LogsAdminFileHeader from '~/components/pages/account/admin/logs/LogsAdminFileHeader.vue';
import LogsAdminFilesSidebar from '~/components/pages/account/admin/logs/LogsAdminFilesSidebar.vue';
import LogsAdminFilters from '~/components/pages/account/admin/logs/LogsAdminFilters.vue';
import LogsAdminPaginationBar from '~/components/pages/account/admin/logs/LogsAdminPaginationBar.vue';

import { useLogsApi } from '~/composables/api/useLogsApi';

const VALID_CATEGORIES = new Set<string>(Object.values(ELogCategory));
const VALID_LEVELS = new Set<string>(Object.values(ELogLevel));
const VALID_ORDERS = new Set<string>(Object.values(ELogOrder));
const VALID_CHECK_TYPES = new Set<string>(Object.values(ELogCheckType));
const VALID_OUTCOMES = new Set<string>(Object.values(ELogCheckOutcome));
const VALID_COMBAT_ACTIONS = new Set<string>(Object.values(ELogCombatAction));

const { getCategories, getFiles, getEntries } = useLogsApi();
const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();
const userStore = useUserStore();

const categories = ref<ILogCategoryItem[]>([]);
const activeCategory = ref<ELogCategory>(ELogCategory.Errors);
const files = ref<ILogFileItem[]>([]);
const totalFiles = ref(0);
const selectedFile = ref<ILogFileItem | null>(null);
const currentFileMeta = ref<ILogEntryFileMeta | null>(null);
const entries = ref<ILogEntryItem[]>([]);

const fileSearch = ref('');
const debouncedFileSearch = ref('');
const searchQuery = ref('');
const debouncedSearchQuery = ref('');
const eventFilter = ref('');
const debouncedEventFilter = ref('');
const levelFilter = ref<'' | ELogLevel>('');
const orderFilter = ref<ELogOrder>(ELogOrder.Desc);
const checkTypeFilter = ref<'' | ELogCheckType>('');
const outcomeFilter = ref<'' | ELogCheckOutcome>('');
const actionFilter = ref<'' | ELogCombatAction>('');

let hasInitialQueryCategory = false;
let initialTargetFileName = '';
let isReadyForQuerySync = false;

const cursorStack = ref<Array<string | null>>([null]);
const currentPageIndex = ref(0);
const nextCursor = ref<string | null>(null);
const hasMore = ref(false);
const scanLimited = ref(false);
const scannedBytes = ref(0);

const isCategoriesLoading = ref(false);
const isFilesLoading = ref(false);
const isEntriesLoading = ref(false);
const categoriesError = ref('');
const filesError = ref('');
const entriesError = ref('');

let categoriesAbort: AbortController | null = null;
let filesAbort: AbortController | null = null;
let entriesAbort: AbortController | null = null;
let fileSearchTimer: ReturnType<typeof setTimeout> | null = null;
let entriesSearchTimer: ReturnType<typeof setTimeout> | null = null;

const categorySwitcherItems = computed<ISwitcherItem<ELogCategory>[]>(() => {
    const mapById = new Map(categories.value.map(item => [item.id, item]));
    return LOG_CATEGORY_ORDER.map((id) => {
        const meta = mapById.get(id);
        return {
            label: meta?.label ?? LOG_CATEGORY_LABEL[id],
            value: id,
            icon: LOG_CATEGORY_ICON[id],
        };
    });
});

const activeCategoryMeta = computed<ILogCategoryItem | null>(() => {
    return categories.value.find(item => item.id === activeCategory.value) ?? null;
});

const isChecksCategory = computed(() => activeCategory.value === ELogCategory.Checks);
const isCombatCategory = computed(() => activeCategory.value === ELogCategory.Combat);
const isErrorsCategory = computed(() => activeCategory.value === ELogCategory.Errors);

const errorGroups = computed<ILogEntryGroup[]>(() => {
    if (!isErrorsCategory.value) {
        return [];
    }

    return groupErrorLogEntries(entries.value);
});

const hasActiveFilters = computed(() => {
    return Boolean(
        levelFilter.value
        || orderFilter.value !== ELogOrder.Desc
        || searchQuery.value.trim()
        || eventFilter.value.trim()
        || checkTypeFilter.value
        || outcomeFilter.value
        || actionFilter.value,
    );
});

const canGoPrev = computed(() => !isEntriesLoading.value && currentPageIndex.value > 0);
const canGoNext = computed(() => !isEntriesLoading.value && hasMore.value && Boolean(nextCursor.value));
const isBusy = computed(() => isCategoriesLoading.value || isFilesLoading.value || isEntriesLoading.value);

function getSingleQueryParam(val: string | Array<string | null> | null | undefined): string {
    if (Array.isArray(val)) {
        return typeof val[0] === 'string' ? val[0].trim() : '';
    }

    return typeof val === 'string' ? val.trim() : '';
}

function initFromRouteQuery(): void {
    const qCat = getSingleQueryParam(route.query.category);
    if (qCat && VALID_CATEGORIES.has(qCat)) {
        activeCategory.value = qCat as ELogCategory;
        hasInitialQueryCategory = true;
    }

    const qFile = getSingleQueryParam(route.query.file);
    if (qFile) {
        initialTargetFileName = qFile;
    }

    const qFileSearch = getSingleQueryParam(route.query.fileSearch);
    if (qFileSearch) {
        fileSearch.value = qFileSearch;
        debouncedFileSearch.value = qFileSearch;
    }

    const qSearch = getSingleQueryParam(route.query.q);
    if (qSearch) {
        searchQuery.value = qSearch;
        debouncedSearchQuery.value = qSearch;
    }

    const qEvent = getSingleQueryParam(route.query.event);
    if (qEvent) {
        eventFilter.value = qEvent;
        debouncedEventFilter.value = qEvent;
    }

    const qLevel = getSingleQueryParam(route.query.level);
    if (qLevel && VALID_LEVELS.has(qLevel)) {
        levelFilter.value = qLevel as ELogLevel;
    }

    const qOrder = getSingleQueryParam(route.query.order);
    if (qOrder && VALID_ORDERS.has(qOrder)) {
        orderFilter.value = qOrder as ELogOrder;
    }

    const qCheckType = getSingleQueryParam(route.query.checkType);
    if (qCheckType && VALID_CHECK_TYPES.has(qCheckType)) {
        checkTypeFilter.value = qCheckType as ELogCheckType;
    }

    const qOutcome = getSingleQueryParam(route.query.outcome);
    if (qOutcome && VALID_OUTCOMES.has(qOutcome)) {
        outcomeFilter.value = qOutcome as ELogCheckOutcome;
    }

    const qAction = getSingleQueryParam(route.query.action);
    if (qAction && VALID_COMBAT_ACTIONS.has(qAction)) {
        actionFilter.value = qAction as ELogCombatAction;
    }
}

function syncRouteQuery(): void {
    if (!isReadyForQuerySync) {
        return;
    }

    const nextQuery: Record<string, string> = {
        category: activeCategory.value,
    };

    if (selectedFile.value?.name) {
        nextQuery.file = selectedFile.value.name;
    }

    if (debouncedFileSearch.value) {
        nextQuery.fileSearch = debouncedFileSearch.value;
    }

    if (debouncedSearchQuery.value) {
        nextQuery.q = debouncedSearchQuery.value;
    }

    if (debouncedEventFilter.value) {
        nextQuery.event = debouncedEventFilter.value;
    }

    if (levelFilter.value) {
        nextQuery.level = levelFilter.value;
    }

    if (orderFilter.value !== ELogOrder.Desc) {
        nextQuery.order = orderFilter.value;
    }

    if (isChecksCategory.value && checkTypeFilter.value) {
        nextQuery.checkType = checkTypeFilter.value;
    }

    if (isChecksCategory.value && outcomeFilter.value) {
        nextQuery.outcome = outcomeFilter.value;
    }

    if (isCombatCategory.value && actionFilter.value) {
        nextQuery.action = actionFilter.value;
    }

    const currentKeys = Object.keys(route.query);
    const nextKeys = Object.keys(nextQuery);
    const isSame = currentKeys.length === nextKeys.length
        && nextKeys.every(key => getSingleQueryParam(route.query[key]) === nextQuery[key]);

    if (!isSame) {
        router.replace({ query: nextQuery });
    }
}

function clearTimers(): void {
    if (fileSearchTimer) {
        clearTimeout(fileSearchTimer);
        fileSearchTimer = null;
    }

    if (entriesSearchTimer) {
        clearTimeout(entriesSearchTimer);
        entriesSearchTimer = null;
    }
}

function abortAllRequests(): void {
    categoriesAbort?.abort();
    categoriesAbort = null;
    filesAbort?.abort();
    filesAbort = null;
    entriesAbort?.abort();
    entriesAbort = null;
}

function clearLogsState(): void {
    clearTimers();
    abortAllRequests();
    categories.value = [];
    files.value = [];
    totalFiles.value = 0;
    selectedFile.value = null;
    currentFileMeta.value = null;
    entries.value = [];
    cursorStack.value = [null];
    currentPageIndex.value = 0;
    nextCursor.value = null;
    hasMore.value = false;
    scanLimited.value = false;
    scannedBytes.value = 0;
    categoriesError.value = '';
    filesError.value = '';
    entriesError.value = '';
}

function isAbortError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const candidate = error as { name?: string; cause?: { name?: string } };
    return candidate.name === 'AbortError' || candidate.cause?.name === 'AbortError';
}

function resetPagination(): void {
    cursorStack.value = [null];
    currentPageIndex.value = 0;
    nextCursor.value = null;
    hasMore.value = false;
    scanLimited.value = false;
}

async function loadEntries(cursor: string | null = null): Promise<void> {
    if (!selectedFile.value) {
        entries.value = [];
        currentFileMeta.value = null;
        return;
    }

    entriesAbort?.abort();
    const controller = new AbortController();
    entriesAbort = controller;

    isEntriesLoading.value = true;
    entriesError.value = '';

    try {
        const response = await getEntries(
            {
                category: activeCategory.value,
                file: selectedFile.value.name,
                limit: LOGS_DEFAULT_LIMIT,
                order: orderFilter.value,
                cursor: cursor ?? undefined,
                level: levelFilter.value || undefined,
                q: debouncedSearchQuery.value || undefined,
                event: debouncedEventFilter.value || undefined,
                checkType: isChecksCategory.value && checkTypeFilter.value ? checkTypeFilter.value : undefined,
                outcome: isChecksCategory.value && outcomeFilter.value ? outcomeFilter.value : undefined,
                action: isCombatCategory.value && actionFilter.value ? actionFilter.value : undefined,
            },
            controller.signal,
        );

        if (entriesAbort !== controller) {
            return;
        }

        currentFileMeta.value = response.file;
        entries.value = response.items;
        nextCursor.value = response.nextCursor;
        hasMore.value = response.hasMore;
        scanLimited.value = response.scanLimited;
        scannedBytes.value = response.scannedBytes;
    } catch (error) {
        if (isAbortError(error) || entriesAbort !== controller) {
            return;
        }

        entriesError.value = getApiErrorMessage(error, LOGS_ADMIN.loadErrorTitle);
        entries.value = [];
    } finally {
        if (entriesAbort === controller) {
            isEntriesLoading.value = false;
        }
    }
}

async function loadFiles(options: { refresh?: boolean; targetFileName?: string } = {}): Promise<void> {
    filesAbort?.abort();
    entriesAbort?.abort();
    const controller = new AbortController();
    filesAbort = controller;

    isFilesLoading.value = true;
    filesError.value = '';
    entriesError.value = '';

    if (activeCategoryMeta.value && !activeCategoryMeta.value.available) {
        files.value = [];
        totalFiles.value = 0;
        selectedFile.value = null;
        entries.value = [];
        currentFileMeta.value = null;
        isFilesLoading.value = false;
        return;
    }

    try {
        const response = await getFiles(
            {
                category: activeCategory.value,
                search: debouncedFileSearch.value || undefined,
                offset: 0,
                limit: LOGS_DEFAULT_LIMIT,
                refresh: options.refresh,
            },
            controller.signal,
        );

        if (filesAbort !== controller) {
            return;
        }

        files.value = response.items;
        totalFiles.value = response.total;

        if (!response.items.length) {
            selectedFile.value = null;
            entries.value = [];
            currentFileMeta.value = null;
            resetPagination();
            return;
        }

        const desiredName = options.targetFileName ?? (initialTargetFileName || selectedFile.value?.name);
        initialTargetFileName = '';
        const matched = desiredName
            ? response.items.find(item => item.name.toLowerCase() === desiredName.toLowerCase())
            : undefined;

        selectedFile.value = matched ?? response.items[0] ?? null;
        isReadyForQuerySync = true;
        syncRouteQuery();
        resetPagination();
        await loadEntries(null);
    } catch (error) {
        if (isAbortError(error) || filesAbort !== controller) {
            return;
        }

        filesError.value = getApiErrorMessage(error, LOGS_ADMIN.loadErrorTitle);
        files.value = [];
        totalFiles.value = 0;
        selectedFile.value = null;
        entries.value = [];
    } finally {
        if (filesAbort === controller) {
            isFilesLoading.value = false;
        }
    }
}

async function loadCategories(refresh = false): Promise<void> {
    categoriesAbort?.abort();
    const controller = new AbortController();
    categoriesAbort = controller;

    isCategoriesLoading.value = true;
    categoriesError.value = '';

    try {
        const response = await getCategories({ refresh }, controller.signal);
        if (categoriesAbort !== controller) {
            return;
        }

        categories.value = response.items;

        if (!refresh && !hasInitialQueryCategory) {
            const preferred = response.items.find(item => item.id === activeCategory.value && item.hasFiles)
                ?? response.items.find(item => item.hasFiles)
                ?? response.items[0];
            if (preferred) {
                activeCategory.value = preferred.id;
            }
        }

        await loadFiles({ refresh });
        isReadyForQuerySync = true;
        syncRouteQuery();
    } catch (error) {
        if (isAbortError(error) || categoriesAbort !== controller) {
            return;
        }

        categoriesError.value = getApiErrorMessage(error, LOGS_ADMIN.loadErrorTitle);
    } finally {
        if (categoriesAbort === controller) {
            isCategoriesLoading.value = false;
        }
    }
}

function onSelectCategory(nextCategory: ELogCategory): void {
    activeCategory.value = nextCategory;
    fileSearch.value = '';
    debouncedFileSearch.value = '';
    if (nextCategory !== ELogCategory.Checks) {
        checkTypeFilter.value = '';
        outcomeFilter.value = '';
    }

    if (nextCategory !== ELogCategory.Combat) {
        actionFilter.value = '';
    }

    selectedFile.value = null;
    syncRouteQuery();
    resetPagination();
    loadFiles();
}

function onSelectFile(file: ILogFileItem): void {
    if (selectedFile.value?.name === file.name && !entriesError.value) {
        return;
    }

    selectedFile.value = file;
    syncRouteQuery();
    resetPagination();
    loadEntries(null);
}

function onImmediateFilterChange(): void {
    syncRouteQuery();
    resetPagination();
    loadEntries(null);
}

function onResetFilters(): void {
    clearTimers();
    levelFilter.value = '';
    orderFilter.value = ELogOrder.Desc;
    searchQuery.value = '';
    debouncedSearchQuery.value = '';
    eventFilter.value = '';
    debouncedEventFilter.value = '';
    checkTypeFilter.value = '';
    outcomeFilter.value = '';
    actionFilter.value = '';
    syncRouteQuery();
    resetPagination();
    loadEntries(null);
}

function onRefresh(): void {
    resetPagination();
    loadCategories(true);
}

function onNextPage(): void {
    if (!canGoNext.value || !nextCursor.value) {
        return;
    }

    const cursorToUse = nextCursor.value;
    const nextIdx = currentPageIndex.value + 1;
    cursorStack.value = [...cursorStack.value.slice(0, nextIdx), cursorToUse];
    currentPageIndex.value = nextIdx;
    loadEntries(cursorToUse);
}

function onPrevPage(): void {
    if (!canGoPrev.value) {
        return;
    }

    const prevIdx = currentPageIndex.value - 1;
    currentPageIndex.value = prevIdx;
    const cursorToUse = cursorStack.value[prevIdx] ?? null;
    loadEntries(cursorToUse);
}

async function onOpenCombatLog(combatUuid: string): Promise<void> {
    const cleanUuid = combatUuid.trim().toLowerCase();
    const targetFileName = `${cleanUuid}.log`;

    clearTimers();
    activeCategory.value = ELogCategory.Combat;
    fileSearch.value = cleanUuid;
    debouncedFileSearch.value = cleanUuid;
    checkTypeFilter.value = '';
    outcomeFilter.value = '';
    actionFilter.value = '';
    resetPagination();

    await loadFiles({ targetFileName });
    syncRouteQuery();

    if (!files.value.some(item => item.name.toLowerCase() === targetFileName)) {
        notificationStore.add(LOGS_ADMIN.combatFileNotFound, cleanUuid, ENotificationType.Warning);
    }
}

watch(fileSearch, (val) => {
    if (fileSearchTimer) {
        clearTimeout(fileSearchTimer);
    }

    fileSearchTimer = setTimeout(() => {
        const trimmed = val.trim();
        if (trimmed === debouncedFileSearch.value) {
            return;
        }

        debouncedFileSearch.value = trimmed;
        syncRouteQuery();
        resetPagination();
        loadFiles();
    }, LOGS_SEARCH_DEBOUNCE_MS);
});

watch([searchQuery, eventFilter], ([nextSearch, nextEvent]) => {
    if (entriesSearchTimer) {
        clearTimeout(entriesSearchTimer);
    }

    entriesSearchTimer = setTimeout(() => {
        const cleanSearch = nextSearch.trim();
        const cleanEvent = nextEvent.trim();
        if (cleanSearch === debouncedSearchQuery.value && cleanEvent === debouncedEventFilter.value) {
            return;
        }

        debouncedSearchQuery.value = cleanSearch;
        debouncedEventFilter.value = cleanEvent;
        syncRouteQuery();
        resetPagination();
        loadEntries(null);
    }, LOGS_SEARCH_DEBOUNCE_MS);
});

watch(
    () => userStore.isAuthenticated,
    (isAuthenticated) => {
        if (!isAuthenticated) {
            clearLogsState();
        }
    },
);

onMounted(() => {
    initFromRouteQuery();
    loadCategories(false);
});

onBeforeUnmount(() => {
    clearLogsState();
});
</script>

<template>
    <AccountPageTemplate
        :title="LOGS_ADMIN.title"
        :description="LOGS_ADMIN.description"
    >
        <template #header-right>
            <div :class="$style.headerActions">
                <VButton
                    :color="EColor.Secondary"
                    icon="rotate-ccw"
                    :disabled="!hasActiveFilters || isBusy"
                    @click="onResetFilters"
                >
                    {{ LOGS_ADMIN.resetFiltersButton }}
                </VButton>

                <VButton
                    icon="refresh-cw"
                    :loading="isBusy"
                    @click="onRefresh"
                >
                    {{ LOGS_ADMIN.refreshButton }}
                </VButton>
            </div>
        </template>

        <div :class="$style.categoriesBar">
            <VSwitcher
                :model-value="activeCategory"
                :items="categorySwitcherItems"
                :size="ESize.Small"
                :class="$style.categorySwitcher"
                @change="onSelectCategory"
            />
        </div>

        <div v-if="categoriesError" :class="$style.errorBanner">
            <VIcon name="circle-x" :size="18" />
            <span>{{ categoriesError }}</span>
        </div>

        <AccountEmptyState
            v-else-if="activeCategoryMeta && !activeCategoryMeta.available"
            :icon="LOGS_ADMIN.unavailableCategory.icon"
            :title="LOGS_ADMIN.unavailableCategory.title"
            :description="LOGS_ADMIN.unavailableCategory.description"
        />

        <div v-else :class="$style.workspace">
            <LogsAdminFilesSidebar
                v-model:search="fileSearch"
                :files="files"
                :total-files="totalFiles"
                :selected-file="selectedFile"
                :loading="isFilesLoading"
                :error="filesError"
                @select="onSelectFile"
            />

            <section :class="$style.mainPanel">
                <LogsAdminFileHeader
                    v-if="selectedFile"
                    :category="activeCategory"
                    :file="selectedFile"
                    :file-meta="currentFileMeta"
                />

                <LogsAdminFilters
                    v-model:search="searchQuery"
                    v-model:event="eventFilter"
                    v-model:level="levelFilter"
                    v-model:order="orderFilter"
                    v-model:check-type="checkTypeFilter"
                    v-model:outcome="outcomeFilter"
                    v-model:action="actionFilter"
                    :is-checks-category="isChecksCategory"
                    :is-combat-category="isCombatCategory"
                    @change="onImmediateFilterChange"
                />

                <LogsAdminPaginationBar
                    v-if="selectedFile"
                    show-stats
                    :page-index="currentPageIndex"
                    :can-go-prev="canGoPrev"
                    :can-go-next="canGoNext"
                    :scan-limited="scanLimited"
                    :entries-count="entries.length"
                    :scanned-bytes="scannedBytes"
                    @prev="onPrevPage"
                    @next="onNextPage"
                />

                <div v-if="scanLimited" :class="$style.scanNotice">
                    <VIcon name="info" :size="16" />
                    <span>{{ LOGS_ADMIN.scanLimitedNotice }}</span>

                    <VButton
                        v-if="canGoNext"
                        :size="ESize.Small"
                        :color="EColor.Accent"
                        @click="onNextPage"
                    >
                        {{ LOGS_ADMIN.continueScanButton }}
                    </VButton>
                </div>

                <div v-if="entriesError" :class="$style.errorBanner">
                    <VIcon name="circle-x" :size="18" />
                    <span>{{ entriesError }}</span>
                </div>

                <div v-else-if="isEntriesLoading" :class="$style.loadingBox">
                    {{ LOGS_ADMIN.loadingEntries }}
                </div>

                <AccountEmptyState
                    v-else-if="!selectedFile"
                    :icon="LOGS_ADMIN.noFileSelected.icon"
                    :title="LOGS_ADMIN.noFileSelected.title"
                    :description="LOGS_ADMIN.noFileSelected.description"
                />

                <AccountEmptyState
                    v-else-if="!entries.length"
                    :icon="LOGS_ADMIN.emptyEntries.icon"
                    :title="LOGS_ADMIN.emptyEntries.title"
                    :description="LOGS_ADMIN.emptyEntries.description"
                />

                <div v-else-if="isErrorsCategory" :class="$style.entriesList">
                    <template v-for="group in errorGroups" :key="`${selectedFile.name}-${group.key}`">
                        <LogsAdminErrorGroupCard
                            v-if="group.entries.length > 1"
                            :group="group"
                            :category="activeCategory"
                            :file-name="selectedFile.name"
                            @open-combat="onOpenCombatLog"
                        />

                        <LogsAdminEntryCard
                            v-else
                            :entry="group.primaryEntry"
                            :category="activeCategory"
                            :file-name="selectedFile.name"
                            @open-combat="onOpenCombatLog"
                        />
                    </template>
                </div>

                <div v-else :class="$style.entriesList">
                    <LogsAdminEntryCard
                        v-for="entry in entries"
                        :key="`${selectedFile.name}-${entry.byteOffset}`"
                        :entry="entry"
                        :category="activeCategory"
                        :file-name="selectedFile.name"
                        @open-combat="onOpenCombatLog"
                    />
                </div>

                <LogsAdminPaginationBar
                    v-if="selectedFile && entries.length"
                    :page-index="currentPageIndex"
                    :can-go-prev="canGoPrev"
                    :can-go-next="canGoNext"
                    :scan-limited="scanLimited"
                    @prev="onPrevPage"
                    @next="onNextPage"
                />
            </section>
        </div>
    </AccountPageTemplate>
</template>

<style module lang="scss">
.headerActions {
    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    align-items: center;

    @include respond-to(mobile) {
        width: 100%;

        > * {
            flex: 1;
        }
    }
}

.categoriesBar {
    overflow-x: auto;
    max-width: 100%;
}

.categorySwitcher {
    flex-wrap: wrap;
}

.workspace {
    display: grid;
    grid-template-columns: rem(280) minmax(0, 1fr);
    gap: $space-24;
    align-items: start;

    @include respond-to(tablet) {
        grid-template-columns: 1fr;
    }
}

.mainPanel {
    display: flex;
    flex-direction: column;
    gap: $space-16;
    min-width: 0;
}

.scanNotice {
    @include t3;

    display: flex;
    flex-wrap: wrap;
    gap: $space-12;
    align-items: center;
    padding: $space-12 $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $info-bg;
    color: $info-fg;
}

.errorBanner {
    @include t3;

    display: flex;
    gap: $space-10;
    align-items: center;
    padding: $space-12 $space-16;
    border-radius: $radius-8;
    background-color: $danger-bg;
    color: $danger-fg;
}

.loadingBox {
    @include t2;

    padding: $space-48 $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-raised;
    color: $text-secondary;
    text-align: center;
}

.entriesList {
    display: flex;
    flex-direction: column;
    gap: $space-12;
}
</style>
