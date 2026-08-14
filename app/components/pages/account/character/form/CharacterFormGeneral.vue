<script setup lang="ts">
import { BIOGRAPHY_MAX_LENGTH } from '~~/shared/constants/character';
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

const style = useCssModule();

const length = computed(() => stripRichText(biography.value).length);

const counterClassList = computed(() => [length.value > BIOGRAPHY_MAX_LENGTH ? style._error : '']);
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

        <div :class="$style.field">
            <VEditor
                v-model="biography"
                :label="CHARACTER_FORM_GENERAL.biography.label"
                :placeholder="CHARACTER_FORM_GENERAL.biography.placeholder"
                :max-height="380"
            />

            <div :class="[$style.counter, counterClassList]">
                {{ length }} / {{ BIOGRAPHY_MAX_LENGTH }}
            </div>
        </div>
    </CharacterFormTemplate>
</template>

<style module lang="scss">
.name {
    width: 100%;
}

.field {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: $space-4;
}

.counter {
    @include t4;

    align-self: flex-end;
    color: $text-secondary;

    &._error {
        color: $text-danger;
    }
}
</style>
