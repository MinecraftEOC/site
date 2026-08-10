<script setup lang="ts">
import { CHARACTER_FORM_GENERAL } from '~/assets/ts/constants/content/account';
import CharacterFormTemplate from '~/components/pages/account/character/form/CharacterFormTemplate.vue';

interface IProps {
    /** Текст ошибки поля имени персонажа */
    nameError?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    nameError: '',
});

const name = defineModel<string>('name', { default: '' });
const biography = defineModel<string>('biography', { default: '' });
</script>

<template>
    <CharacterFormTemplate :title="CHARACTER_FORM_GENERAL.title" :class="$style.CharacterFormGeneral">
        <VInput
            v-model="name"
            :label="CHARACTER_FORM_GENERAL.name.label"
            :placeholder="CHARACTER_FORM_GENERAL.name.placeholder"
            :hint="CHARACTER_FORM_GENERAL.name.hint"
            :icon="CHARACTER_FORM_GENERAL.name.icon"
            :error="props.nameError"
            :class="$style.name"
        />

        <VEditor
            v-model="biography"
            :label="CHARACTER_FORM_GENERAL.biography.label"
            :placeholder="CHARACTER_FORM_GENERAL.biography.placeholder"
            :max-height="380"
        />
    </CharacterFormTemplate>
</template>

<style module lang="scss">
.name {
    width: 100%;
}
</style>
