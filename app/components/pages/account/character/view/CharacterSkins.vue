<script setup lang="ts">
import type { ISkinHashItem, TSkinItem } from '~/@types/skin';

import { CHARACTER_FORM_SKINS } from '~/assets/ts/constants/content/account';

import SkinsSlider from '~/components/common/SkinsSlider.vue';
import CharacterFormTemplate from '~/components/pages/account/character/form/CharacterFormTemplate.vue';

interface IProps {
    /** Сохранённые скины персонажа: удалять и догружать нельзя */
    skins: ISkinHashItem[];
    /** Id активного скина — того, что уходит в игру; `null` — активного нет */
    activeSkinId?: number | null;
    /** Выводить кнопку «Сделать активным» на остальных скинах */
    selectable?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    activeSkinId: null,
    selectable: false,
});

const emits = defineEmits<{
    activate: [skin: ISkinHashItem];
}>();

const activeKey = computed(() => {
    const active = props.skins.find(skin => skin.id === props.activeSkinId);

    return active ? getSkinKey(active) : '';
});

function activate(item: TSkinItem) {
    if (!isSkinFileItem(item)) {
        emits('activate', item);
    }
}
</script>

<template>
    <CharacterFormTemplate>
        <SkinsSlider
            :items="props.skins"
            :title="CHARACTER_FORM_SKINS.title"
            :active-key="activeKey"
            :selectable="props.selectable"
            readonly
            @activate="activate"
        />
    </CharacterFormTemplate>
</template>

<style module lang="scss">
</style>
