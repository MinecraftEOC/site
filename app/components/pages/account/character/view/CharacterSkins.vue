<script setup lang="ts">
import type { ISkinHashItem } from '~/@types/skin';

import { CHARACTER_FORM_SKINS } from '~/assets/ts/constants/content/account';

import SkinsSlider from '~/components/common/SkinsSlider.vue';
import CharacterFormTemplate from '~/components/pages/account/character/form/CharacterFormTemplate.vue';

interface IProps {
    /** Сохранённые скины персонажа: только просмотр, удалять и догружать нельзя */
    skins: ISkinHashItem[];
}

defineProps<IProps>();
</script>

<template>
    <CharacterFormTemplate>
        <SkinsSlider
            :items="skins"
            :title="CHARACTER_FORM_SKINS.title"
            readonly
        />
    </CharacterFormTemplate>
</template>

<style module lang="scss">
</style>
