<script setup lang="ts">
import { CHARACTER_DETAILS } from '~/assets/ts/constants/content/account';

import CharacterFormTemplate from '~/components/pages/account/character/form/CharacterFormTemplate.vue';

interface IProps {
    /** Квента персонажа: HTML из редактора */
    biography: string;
}

defineProps<IProps>();
</script>

<template>
    <CharacterFormTemplate :title="CHARACTER_DETAILS.biographyTitle">
        <VEditor
            :model-value="biography"
            readonly
            :class="$style.editor"
        />
    </CharacterFormTemplate>
</template>

<style module lang="scss">
.editor:global(.v-editor--readonly) {
    :global(.ql-container.ql-snow) {
        min-height: 0;
        border: 0;
    }
}
</style>
