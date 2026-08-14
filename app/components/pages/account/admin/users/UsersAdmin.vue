<script setup lang="ts">
import type { ICharacter, IUser } from '~~/shared/@types/user';
import type { ITagItem, TTagValue } from '~/@types/tags';
import type { IUsersColumn, IUsersRow } from '~/@types/user';

import { USERS_ADMIN, USERS_ADMIN_COLUMN_LABEL } from '~/assets/ts/constants/content/account';
import { USERS_ACCOUNT_FILTERS, USERS_COLUMNS, USERS_DEFAULT_FILTERS, USERS_FILTERS, USERS_SORT_ICON, USERS_SORT_IDLE_ICON } from '~/assets/ts/constants/user';
import { ESize } from '~/assets/ts/enums/common';
import { ESortDirection, EUsersColumn, EUsersFilter } from '~/assets/ts/enums/user';

import AccountEmptyState from '~/components/pages/account/AccountEmptyState.vue';
import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import UsersAdminRow from '~/components/pages/account/admin/users/UsersAdminRow.vue';

interface IProps {
    /** Все пользователи с персонажами и привязкой Discord */
    users: IUser[];
}

const props = defineProps<IProps>();

const style = useCssModule();

const search = ref('');
const filters = ref<TTagValue[]>([...USERS_DEFAULT_FILTERS]);
const sortColumn = ref<EUsersColumn>(EUsersColumn.Id);
const sortDirection = ref<ESortDirection>(ESortDirection.Asc);

const query = computed(() => search.value.trim().toLowerCase());

const statusFilters = computed(() => filters.value.filter(value => !USERS_ACCOUNT_FILTERS.includes(value)));

const foundUsers = computed(() => props.users.filter(user => matchesUserSearch(user, query.value)));

const filteredUsers = computed(() => {
    if (!filters.value.includes(EUsersFilter.DiscordLinked)) {
        return foundUsers.value;
    }

    return foundUsers.value.filter(isDiscordLinked);
});

const filterItems = computed<ITagItem[]>(() => USERS_FILTERS.map(item => ({
    ...item,
    counter: getFilterCounter(item.value),
})));

const rows = computed(() => filteredUsers.value
    .map(toRow)
    .filter(isRowVisible)
    .sort((first, second) => compareUsersRows(first, second, sortColumn.value, sortDirection.value)));

function isCharacterVisible(character: ICharacter): boolean {
    return !statusFilters.value.length || statusFilters.value.includes(character.status);
}

function toRow(user: IUser): IUsersRow {
    const [character = null, ...rest] = sortCharacters(user.characters).filter(isCharacterVisible);

    return { user, character, rest };
}

function isRowVisible(row: IUsersRow): boolean {
    if (row.character) {
        return true;
    }

    return !row.user.characters.length && (!statusFilters.value.length || filters.value.includes(EUsersFilter.NoCharacter));
}

function getFilterCounter(value: TTagValue): number {
    if (value === EUsersFilter.DiscordLinked) {
        return foundUsers.value.filter(isDiscordLinked).length;
    }

    if (value === EUsersFilter.NoCharacter) {
        return filteredUsers.value.filter(user => !user.characters.length).length;
    }

    return filteredUsers.value.reduce((count, user) => {
        return count + user.characters.filter(character => character.status === value).length;
    }, 0);
}

function getHeaderCellClassList(column: IUsersColumn) {
    return [
        column.divider ? style._divider : '',
        sortColumn.value === column.value ? style._active : '',
    ];
}

function getSortIcon(column: IUsersColumn): string {
    if (sortColumn.value !== column.value) {
        return USERS_SORT_IDLE_ICON;
    }

    return USERS_SORT_ICON[sortDirection.value];
}

function onSort(column: IUsersColumn) {
    if (sortColumn.value !== column.value) {
        sortColumn.value = column.value;
        sortDirection.value = ESortDirection.Asc;

        return;
    }

    sortDirection.value = sortDirection.value === ESortDirection.Asc
        ? ESortDirection.Desc
        : ESortDirection.Asc;
}
</script>

<template>
    <AccountPageTemplate :title="USERS_ADMIN.title">
        <div :class="$style.controls">
            <div :class="$style.controlsTop">
                <VInput
                    v-model="search"
                    :icon="USERS_ADMIN.searchIcon"
                    :placeholder="USERS_ADMIN.searchPlaceholder"
                    :class="$style.search"
                />

                <div :class="$style.count">
                    {{ USERS_ADMIN.countLabel }}

                    <span :class="$style.countValue">{{ rows.length }}</span>
                </div>
            </div>

            <VTags
                v-model="filters"
                :items="filterItems"
                :size="ESize.Small"
                multiple
            />
        </div>

        <div v-if="rows.length" :class="$style.wrapper">
            <table :class="$style.table">
                <colgroup>
                    <col
                        v-for="column in USERS_COLUMNS"
                        :key="column.value"
                        :style="{ width: column.width }"
                    >
                </colgroup>

                <thead>
                    <tr>
                        <th
                            v-for="column in USERS_COLUMNS"
                            :key="column.value"
                            :class="[$style.headerCell, getHeaderCellClassList(column)]"
                            @click="onSort(column)"
                        >
                            <span :class="$style.headerContent">
                                {{ USERS_ADMIN_COLUMN_LABEL[column.value] }}

                                <VIcon
                                    :name="getSortIcon(column)"
                                    :size="12"
                                    :class="$style.sortIcon"
                                />
                            </span>
                        </th>
                    </tr>
                </thead>

                <UsersAdminRow
                    v-for="row in rows"
                    :key="row.user.id"
                    :row="row"
                />
            </table>
        </div>

        <AccountEmptyState
            v-else
            :icon="USERS_ADMIN.empty.icon"
            :title="USERS_ADMIN.empty.title"
            :description="USERS_ADMIN.empty.description"
        />
    </AccountPageTemplate>
</template>

<style module lang="scss">
.controls {
    display: flex;
    flex-direction: column;
    gap: $space-16;
}

.controlsTop {
    display: flex;
    flex-wrap: wrap;
    gap: $space-16;
    justify-content: space-between;
    align-items: center;
}

.search {
    width: 100%;
    max-width: rem(360);
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
    min-width: rem(1100);
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
    cursor: pointer;
    user-select: none;
    transition: color $default-transition;

    @include hover {
        color: $text-primary;
    }

    &._active {
        color: $text-primary;

        .sortIcon {
            color: $text-link;
        }
    }

    &._divider {
        border-left: 1px solid $border-subtle;
    }
}

.headerContent {
    display: inline-flex;
    gap: $space-4;
    align-items: center;
}

.sortIcon {
    color: $text-muted;
    transition: color $default-transition;
}
</style>
