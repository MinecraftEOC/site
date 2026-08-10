<script setup lang="ts">
import type { ICharacterItem } from '~~/shared/@types/character';
import type { ITagItem, TTagsModelValue, TTagValue } from '~/@types/tags';
import { ITEMS, MAX_COINS } from '~~/shared/constants/character';
import { CHARACTER_FORM_ITEMS } from '~/assets/ts/constants/content/account';
import { ETagsLayout } from '~/assets/ts/enums/common';

import CharacterFormTemplate from '~/components/pages/account/character/form/CharacterFormTemplate.vue';

const items = defineModel<ICharacterItem[]>('items', { default: () => [] });

const selectedIds = computed<TTagsModelValue>({
    get: () => items.value.map(item => item.id),
    set: (value) => {
        const ids = Array.isArray(value) ? value : [];

        items.value = ids.map(id => ({
            id: String(id),
            quantity: ITEMS.find(item => item.id === id)?.quantity ?? 1,
        }));
    },
});

const spent = computed(() => getItemsSpent(items.value));

const coins = computed(() => MAX_COINS - spent.value);

const itemsTags = computed<ITagItem[]>(() => ITEMS.map(item => ({
    value: item.id,
    label: item.quantity > 1 ? `${item.label} ×${item.quantity}` : item.label,
    icon: item.icon,
    counter: item.cost,
    disabled: !isSelected(item.id) && item.cost > coins.value,
})));

function isSelected(id: TTagValue): boolean {
    return items.value.some(item => item.id === id);
}
</script>

<template>
    <CharacterFormTemplate
        :title="CHARACTER_FORM_ITEMS.title"
        :description="CHARACTER_FORM_ITEMS.description"
        :class="$style.CharacterFormItems"
    >
        <div :class="$style.coins">
            <VIcon
                name="coins"
                :size="20"
                :class="$style.coinsIcon"
            />

            <div :class="$style.coinsText">
                {{ CHARACTER_FORM_ITEMS.remain }}
            </div>

            <div :class="$style.coinsValue">
                <VNumber :value="coins" /> {{ CHARACTER_FORM_ITEMS.coinsLabel }}
            </div>
        </div>

        <div :class="$style.items">
            <div :class="$style.itemsTitle" v-html="CHARACTER_FORM_ITEMS.itemsTitle" />

            <VTags
                v-model="selectedIds"
                :items="itemsTags"
                :layout="ETagsLayout.Grid"
                multiple
            />
        </div>
    </CharacterFormTemplate>
</template>

<style module lang="scss">
.coins {
    @include t4;

    display: flex;
    gap: $space-4;
    align-items: center;
    padding: $space-10 $space-12;
    border-radius: $radius-4;
    background-color: $surface-sunken;
}

.coinsIcon {
    color: $text-link;
}

.coinsText {
    color: $text-secondary;
    text-transform: uppercase;
}

.coinsValue {
    @include mono;

    margin-left: auto;
}

.itemsTitle {
    @include l4;

    margin-bottom: $space-8;
    color: $text-muted;
}
</style>
