<script setup lang="ts">
import type { ContentType } from '~~/generated/prisma/enums';
import type { IContentItemResponse } from '~~/shared/@types/response';
import type { ISwitcherItem } from '~/@types/switcher';

import { CONTENT_TYPES } from '~~/shared/constants/content';
import { CONTENT_COLUMNS, CONTENT_TYPE_TABS } from '~/assets/ts/constants/content-entry';
import { CONTENT_ADMIN, CONTENT_ADMIN_COLUMN_LABEL } from '~/assets/ts/constants/content/account';
import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';
import { EColor, ENotificationType, ESize, ETag } from '~/assets/ts/enums/common';

import AccountEmptyState from '~/components/pages/account/AccountEmptyState.vue';
import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import ContentAdminRow from '~/components/pages/account/admin/content/ContentAdminRow.vue';

import { useContentApi } from '~/composables/api/useContentApi';

interface IProps {
    /** Материалы обоих разделов: таблица фильтрует их табами и поиском */
    entries: IContentItemResponse[];
}

const props = defineProps<IProps>();

const emits = defineEmits<{
    refresh: [];
}>();

const notificationStore = useNotificationStore();

const { remove } = useContentApi();

const [firstType] = CONTENT_TYPES;

const activeType = ref<ContentType>(firstType!);
const search = ref('');
const removingEntry = ref<IContentItemResponse | null>(null);
const isRemoveOpen = ref(false);
const isRemoving = ref(false);

const query = computed(() => search.value.trim().toLowerCase());

const foundEntries = computed(() => props.entries.filter(entry => matchesQuery(entry)));

const rows = computed(() => foundEntries.value.filter(entry => entry.type === activeType.value));

const tabs = computed<ISwitcherItem<ContentType>[]>(() => CONTENT_TYPE_TABS.map(tab => ({
    ...tab,
    counter: foundEntries.value.filter(entry => entry.type === tab.value).length,
})));

function matchesQuery(entry: IContentItemResponse): boolean {
    if (!query.value) {
        return true;
    }

    return `${entry.title} ${entry.slug}`.toLowerCase().includes(query.value);
}

function onRemoveClick(entry: IContentItemResponse) {
    removingEntry.value = entry;
    isRemoveOpen.value = true;
}

async function onRemoveConfirm() {
    if (!removingEntry.value) {
        return;
    }

    isRemoving.value = true;

    try {
        await remove(removingEntry.value.id);

        isRemoveOpen.value = false;
        emits('refresh');

        notificationStore.add(CONTENT_ADMIN.remove.success);
    } catch (error) {
        notificationStore.add(CONTENT_ADMIN.remove.error, getApiErrorMessage(error), ENotificationType.Error);
    } finally {
        isRemoving.value = false;
    }
}
</script>

<template>
    <AccountPageTemplate
        :title="CONTENT_ADMIN.title"
        :description="CONTENT_ADMIN.description"
    >
        <template #header-right>
            <VButton
                :tag="ETag.NuxtLink"
                :to="ACCOUNT_ROUTES.adminContentCreate"
                icon="plus"
                :class="$style.createButton"
            >
                {{ CONTENT_ADMIN.createButton }}
            </VButton>
        </template>

        <div :class="$style.controls">
            <div :class="$style.controlsLeft">
                <VInput
                    v-model="search"
                    :icon="CONTENT_ADMIN.searchIcon"
                    :placeholder="CONTENT_ADMIN.searchPlaceholder"
                    :class="$style.search"
                />

                <VSwitcher
                    v-model="activeType"
                    :items="tabs"
                    :size="ESize.Small"
                />
            </div>

            <div :class="$style.count">
                {{ CONTENT_ADMIN.countLabel }}

                <span :class="$style.countValue">{{ rows.length }}</span>
            </div>
        </div>

        <div v-if="rows.length" :class="$style.wrapper">
            <table :class="$style.table">
                <colgroup>
                    <col
                        v-for="column in CONTENT_COLUMNS"
                        :key="column.value"
                        :style="{ width: column.width }"
                    >
                </colgroup>

                <thead>
                    <tr>
                        <th
                            v-for="column in CONTENT_COLUMNS"
                            :key="column.value"
                            :class="$style.headerCell"
                        >
                            {{ CONTENT_ADMIN_COLUMN_LABEL[column.value] }}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <ContentAdminRow
                        v-for="entry in rows"
                        :key="entry.id"
                        :entry="entry"
                        @remove="onRemoveClick"
                    />
                </tbody>
            </table>
        </div>

        <AccountEmptyState
            v-else
            :icon="CONTENT_ADMIN.empty.icon"
            :title="CONTENT_ADMIN.empty.title"
            :description="CONTENT_ADMIN.empty.description"
        />

        <VModal
            v-model="isRemoveOpen"
            :title="CONTENT_ADMIN.remove.title"
            :description="CONTENT_ADMIN.remove.description"
        >
            <div :class="$style.removeTitle">
                {{ removingEntry?.title }}
            </div>

            <div :class="$style.removeButtons">
                <VButton
                    :color="EColor.Secondary"
                    :class="$style.removeButton"
                    @click="isRemoveOpen = false"
                >
                    {{ CONTENT_ADMIN.remove.cancel }}
                </VButton>

                <VButton
                    :color="EColor.Danger"
                    :loading="isRemoving"
                    :class="$style.removeButton"
                    @click="onRemoveConfirm"
                >
                    {{ CONTENT_ADMIN.remove.confirm }}
                </VButton>
            </div>
        </VModal>
    </AccountPageTemplate>
</template>

<style module lang="scss">
.createButton {
    @include respond-to(mobile) {
        width: 100%;
    }
}

.controls {
    display: flex;
    flex-wrap: wrap;
    gap: $space-16;
    justify-content: space-between;
    align-items: center;
}

.controlsLeft {
    display: flex;
    flex-wrap: wrap;
    gap: $space-16;
    align-items: center;
}

.search {
    width: 100%;
    max-width: rem(360);

    @include respond-to(mobile) {
        max-width: none;
    }
}

.count {
    @include t3;

    color: $text-secondary;
    white-space: nowrap;
}

.countValue {
    @include mono;

    color: $text-primary;
}

.wrapper {
    overflow-x: auto;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-raised;
}

.table {
    width: 100%;
    min-width: rem(900);
    border-collapse: collapse;
    table-layout: fixed;
}

.headerCell {
    @include l2;

    padding: $space-12 $space-16;
    background-color: $surface-sunken;
    color: $text-secondary;
    text-align: left;
    white-space: nowrap;
}

.removeTitle {
    @include h5;

    padding: $space-12 $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface-sunken;
}

.removeButtons {
    display: flex;
    gap: $space-12;
    margin-top: $space-24;

    @include respond-to(mobile) {
        flex-direction: column;
    }
}

.removeButton {
    flex: 1;
}
</style>
