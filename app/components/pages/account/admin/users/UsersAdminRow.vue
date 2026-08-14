<script setup lang="ts">
import type { ICharacter } from '~~/shared/@types/user';
import type { IUsersRow } from '~/@types/user';

import { CHARACTER_STATUS_COLOR } from '~/assets/ts/constants/character';
import { DISCORD_USER_URL } from '~/assets/ts/constants/common';
import { CHARACTER_STATUS_LABEL, USERS_ADMIN } from '~/assets/ts/constants/content/account';
import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';
import { ESize, ETag } from '~/assets/ts/enums/common';

interface IProps {
    /** Строка таблицы: пользователь и его персонажи, прошедшие фильтр */
    row: IUsersRow;
}

const props = defineProps<IProps>();

const style = useCssModule();

const open = ref(false);

const discord = computed(() => props.row.user.discordAccount);

const discordName = computed(() => discord.value?.username ?? USERS_ADMIN.noDiscord);

const discordUrl = computed(() => discord.value?.discordId ? DISCORD_USER_URL(discord.value.discordId) : '');

const discordTag = computed(() => discordUrl.value ? ETag.Link : ETag.Div);

const discordAttrs = computed(() => {
    if (!discordUrl.value) {
        return {};
    }

    return { href: discordUrl.value, target: '_blank', rel: 'noreferrer noopener' };
});

const discordClassList = computed(() => [
    discordUrl.value ? style._link : '',
    discord.value?.username ? '' : style._muted,
]);

const mainRowClassList = computed(() => [props.row.character ? style._clickable : '']);

const toggleClassList = computed(() => [open.value ? style._open : '']);

const rest = computed(() => open.value ? props.row.rest : []);

function onRowClick(character: ICharacter | null) {
    if (!character) {
        return;
    }

    navigateTo(ACCOUNT_ROUTES.adminCharacter(character.id));
}
</script>

<template>
    <tbody :class="$style.UsersAdminRow">
        <tr :class="[$style.row, mainRowClassList]" @click="onRowClick(row.character)">
            <td :class="[$style.cell, $style.id]">
                #{{ row.user.id }}
            </td>

            <td :class="$style.cell">
                <component
                    :is="discordTag"
                    v-bind="discordAttrs"
                    :class="[$style.discord, discordClassList]"
                    @click.stop
                >
                    <img
                        v-if="discord?.avatar"
                        :src="discord.avatar"
                        :alt="discordName"
                        loading="lazy"
                        :class="$style.avatar"
                    >

                    <span v-else :class="$style.avatar">
                        <VIcon name="user-round" :size="12" />
                    </span>

                    <span :class="$style.discordName">{{ discordName }}</span>

                    <VIcon
                        v-if="discordUrl"
                        name="external-link"
                        :size="12"
                        :class="$style.discordIcon"
                    />
                </component>
            </td>

            <td :class="[$style.cell, $style.date]">
                {{ formatDate(row.user.createdAt) }}
            </td>

            <template v-if="row.character">
                <td :class="[$style.cell, $style._divider]">
                    <div :class="$style.character">
                        <span :class="$style.characterName">{{ row.character.username }}</span>

                        <button
                            v-if="row.rest.length"
                            type="button"
                            :class="[$style.toggle, toggleClassList]"
                            @click.stop="open = !open"
                        >
                            <span :class="$style.toggleCount">+{{ row.rest.length }}</span>

                            <VIcon
                                name="chevron-down"
                                :size="12"
                                :class="$style.toggleIcon"
                            />
                        </button>
                    </div>
                </td>

                <td :class="[$style.cell, $style.date]">
                    {{ formatDate(row.character.createdAt) }}
                </td>

                <td :class="$style.cell">
                    <VBadge :color="CHARACTER_STATUS_COLOR[row.character.status]" :size="ESize.Small">
                        {{ CHARACTER_STATUS_LABEL[row.character.status] }}
                    </VBadge>
                </td>
            </template>

            <td
                v-else
                colspan="3"
                :class="[$style.cell, $style._divider, $style.empty]"
            >
                {{ USERS_ADMIN.noCharacter }}
            </td>
        </tr>

        <tr
            v-for="character in rest"
            :key="character.id"
            :class="[$style.row, $style._sub, $style._clickable]"
            @click="onRowClick(character)"
        >
            <td colspan="3" :class="$style.cell" />

            <td :class="[$style.cell, $style._divider]">
                <div :class="$style.character">
                    <VIcon
                        name="corner-down-right"
                        :size="12"
                        :class="$style.subIcon"
                    />

                    <span :class="$style.characterName">{{ character.username }}</span>
                </div>
            </td>

            <td :class="[$style.cell, $style.date]">
                {{ formatDate(character.createdAt) }}
            </td>

            <td :class="$style.cell">
                <VBadge :color="CHARACTER_STATUS_COLOR[character.status]" :size="ESize.Small">
                    {{ CHARACTER_STATUS_LABEL[character.status] }}
                </VBadge>
            </td>
        </tr>
    </tbody>
</template>

<style module lang="scss">
.UsersAdminRow {
    border-top: 1px solid $border-subtle;
}

.row {
    transition: background-color $default-transition;

    &._clickable {
        cursor: pointer;

        @include hover {
            background-color: $hover-surface;
        }
    }

    &._sub {
        background-color: $surface;
    }
}

.cell {
    @include t3;

    vertical-align: middle;
    padding: $space-12 $space-16;
    white-space: nowrap;

    &._divider {
        border-left: 1px solid $border-subtle;
    }
}

.id {
    @include mono2;

    color: $text-secondary;
}

.date {
    @include mono2;

    color: $text-secondary;
}

.empty {
    color: $text-muted;
}

.discord {
    display: inline-flex;
    gap: $space-8;
    align-items: center;
    transition: color $default-transition;

    &._link {
        @include hover {
            color: $text-link-hover;
        }
    }

    &._muted {
        color: $text-muted;
    }
}

.avatar {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    object-fit: cover;
    width: rem(24);
    height: rem(24);
    border-radius: 50%;
    background-color: $surface-sunken;
    color: $text-muted;
}

.discordName {
    @include t3;
}

.discordIcon {
    color: $text-muted;
}

.character {
    display: flex;
    gap: $space-8;
    align-items: center;
}

.characterName {
    @include l2;
}

.subIcon {
    color: $text-muted;
}

.toggle {
    display: inline-flex;
    gap: $space-4;
    align-items: center;
    height: $space-20;
    padding: 0 $space-8;
    border: 1px solid $tag-border;
    border-radius: $radius-full;
    background-color: $tag-bg;
    color: $text-secondary;
    transition: all $default-transition;

    @include hover {
        background-color: $tag-bg-hover;
    }

    &._open {
        border-color: $tag-selected-border;
        background-color: $tag-selected-bg;
        color: $tag-selected-counter-text;

        .toggleIcon {
            transform: rotate(180deg);
        }
    }
}

.toggleCount {
    @include l4;
}

.toggleIcon {
    transition: transform $default-transition;
}
</style>
