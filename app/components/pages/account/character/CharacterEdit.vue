<script setup lang="ts">
import type { ICharacter } from '~~/shared/@types/user';
import type { TCharacterForm } from '~/@types/character';
import type { ISkinHashItem } from '~/@types/skin';
import { useForm } from 'vee-validate';

import { CharacterStatus } from '~~/generated/prisma/enums';
import { CHARACTER_FORM_ORDER } from '~/assets/ts/constants/character';
import { CHARACTER_EDIT } from '~/assets/ts/constants/content/account';
import { ENotificationType } from '~/assets/ts/enums/common';
import { getCharacterEditFormSchema } from '~/assets/ts/schemas/character';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import CharacterReview from '~/components/pages/account/character/CharacterReview.vue';
import CharacterFormGeneral from '~/components/pages/account/character/form/CharacterFormGeneral.vue';
import CharacterFormItems from '~/components/pages/account/character/form/CharacterFormItems.vue';
import CharacterFormParameters from '~/components/pages/account/character/form/CharacterFormParameters.vue';
import CharacterFormSkins from '~/components/pages/account/character/form/CharacterFormSkins.vue';

import { useCharacterApi } from '~/composables/api/useCharacterApi';

interface IProps {
    /** Редактируемый персонаж: из него берутся начальные значения формы */
    character: ICharacter;
}

const props = defineProps<IProps>();

const userStore = useUserStore();
const notificationStore = useNotificationStore();

const { update, deleteSkin } = useCharacterApi();

const title = computed(() => `${CHARACTER_EDIT.title} ${props.character.username}`);

const reviewComment = computed(() => props.character.status === CharacterStatus.RETURNED
    ? props.character.reviewComment
    : '');

// Схема пересобирается при удалении скинов: как только сохранённых не
// осталось, форма начинает требовать новый файл.
const validationSchema = computed(() => getCharacterEditFormSchema(props.character.skins.length));

const { handleSubmit, defineField, errors, isSubmitting } = useForm<TCharacterForm>({
    validationSchema,
    initialValues: {
        username: props.character.username,
        biography: props.character.biography,
        states: {
            parameters: { ...props.character.states.parameters },
            skills: { ...props.character.states.skills },
        },
        startingItems: [...props.character.startingItems],
        skins: [],
    },
});

const [username] = defineField('username');
const [biography] = defineField('biography');
const [parameters] = defineField('states.parameters');
const [skills] = defineField('states.skills');
const [startingItems] = defineField('startingItems');
const [skins] = defineField('skins');

const onSubmit = handleSubmit(
    async (values) => {
        try {
            await update(props.character.id, values);
            await userStore.fetchMe();

            skins.value = [];

            notificationStore.add(CHARACTER_EDIT.success);
        } catch (error) {
            notificationStore.add(CHARACTER_EDIT.error, getApiErrorMessage(error), ENotificationType.Error);
        }
    },
    ({ errors: invalidFields }) => {
        const text = CHARACTER_FORM_ORDER
            .map(field => invalidFields[field])
            .filter(Boolean)
            .join('<br>');

        notificationStore.add(CHARACTER_EDIT.invalid, text, ENotificationType.Error);
    },
);

async function removeSkin(skin: ISkinHashItem) {
    try {
        await deleteSkin(skin.id);
        await userStore.fetchMe();
    } catch (error) {
        notificationStore.add(CHARACTER_EDIT.skinError, getApiErrorMessage(error), ENotificationType.Error);
    }
}
</script>

<template>
    <AccountPageTemplate :title="title">
        <div :class="$style.main">
            <CharacterReview
                v-if="reviewComment"
                :text="reviewComment"
                :status="character.status"
            />

            <form :class="$style.formWrapper" @submit.prevent="onSubmit">
                <CharacterFormGeneral
                    v-model:name="username"
                    v-model:biography="biography"
                    :name-error="errors.username"
                />

                <CharacterFormParameters
                    v-model:parameters="parameters"
                    v-model:skills="skills"
                />

                <CharacterFormItems v-model:items="startingItems" />

                <CharacterFormSkins
                    v-model:files="skins"
                    :skins="character.skins"
                    @remove-skin="removeSkin"
                />

                <VButton
                    type="submit"
                    :loading="isSubmitting"
                    :class="$style.button"
                >
                    {{ CHARACTER_EDIT.button.title }}
                </VButton>
            </form>
        </div>
    </AccountPageTemplate>
</template>

<style module lang="scss">
.main {
    display: flex;
    flex-direction: column;
    gap: $space-24;
}

.formWrapper {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $space-24;

    @include respond-to(tablet) {
        grid-template-columns: minmax(0, 1fr);
        gap: $space-16;
    }
}

.button {
    grid-column: 2;

    @include respond-to(tablet) {
        grid-column: auto;
    }
}
</style>
