<script setup lang="ts">
import type { IContentItemResponse } from '~~/shared/@types/response';

import { CONTENT_ADMIN } from '~/assets/ts/constants/content/account';
import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';

interface IProps {
    /** Материал, выводимый строкой таблицы */
    entry: IContentItemResponse;
}

const props = defineProps<IProps>();

const emits = defineEmits<{
    remove: [entry: IContentItemResponse];
}>();

const ACTION_ICON_SIZE = 14;

function onRowClick() {
    navigateTo(ACCOUNT_ROUTES.adminContentEdit(props.entry.id));
}
</script>

<template>
    <tr :class="$style.ContentAdminRow" @click="onRowClick">
        <td :class="$style.cell">
            <img
                :src="getContentImageUrl(props.entry.image)"
                :alt="props.entry.title"
                loading="lazy"
                :class="$style.image"
            >
        </td>

        <td :class="$style.cell">
            <div :class="$style.title">
                {{ props.entry.title }}
            </div>

            <div :class="$style.description">
                {{ props.entry.description || CONTENT_ADMIN.noDescription }}
            </div>
        </td>

        <td :class="$style.cell">
            <span :class="$style.slug">{{ props.entry.slug }}</span>
        </td>

        <td :class="[$style.cell, $style.date]">
            {{ formatDate(props.entry.createdAt) }}
        </td>

        <td :class="[$style.cell, $style.date]">
            {{ formatDate(props.entry.updatedAt) }}
        </td>

        <td :class="$style.cell">
            <div :class="$style.actions">
                <button
                    type="button"
                    :title="CONTENT_ADMIN.editButton"
                    :aria-label="CONTENT_ADMIN.editButton"
                    :class="$style.action"
                    @click.stop="onRowClick"
                >
                    <VIcon name="pencil" :size="ACTION_ICON_SIZE" />
                </button>

                <button
                    type="button"
                    :title="CONTENT_ADMIN.deleteButton"
                    :aria-label="CONTENT_ADMIN.deleteButton"
                    :class="[$style.action, $style._danger]"
                    @click.stop="emits('remove', props.entry)"
                >
                    <VIcon name="trash-2" :size="ACTION_ICON_SIZE" />
                </button>
            </div>
        </td>
    </tr>
</template>

<style module lang="scss">
.ContentAdminRow {
    border-top: 1px solid $border-subtle;
    cursor: pointer;
    transition: background-color $default-transition;

    @include hover {
        background-color: $surface-sunken;
    }
}

.cell {
    vertical-align: middle;
    padding: $space-12 $space-16;
}

.image {
    display: block;
    object-fit: cover;
    width: rem(80);
    height: rem(48);
    border-radius: $radius-8;
}

.title {
    @include h5;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.description {
    @include t4;

    overflow: hidden;
    margin-top: $space-4;
    color: $text-secondary;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.slug {
    @include mono2;

    display: inline-block;
    overflow: hidden;
    max-width: 100%;
    padding: rem(2) rem(6);
    border-radius: $radius-4;
    background-color: $surface-sunken;
    color: $text-secondary;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.date {
    @include t3;

    color: $text-secondary;
    white-space: nowrap;
}

.actions {
    display: flex;
    gap: $space-8;
    justify-content: flex-end;
}

.action {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    width: rem(28);
    height: rem(28);
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface-raised;
    color: $text-secondary;
    transition: all $default-transition;

    @include hover {
        border-color: $border-focus;
        color: $text-primary;
    }

    &._danger {
        @include hover {
            border-color: $danger;
            color: $danger;
        }
    }
}
</style>
