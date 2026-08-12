<script setup lang="ts">
import type { TCharacterForm } from '~/@types/character';
import { useForm } from 'vee-validate';

import { PARAMETERS_DEFAULT_VALUE, SKILLS_DEFAULT_VALUE } from '~~/shared/constants/character';
import { CHARACTER_FORM_ORDER } from '~/assets/ts/constants/character';
import { CHARACTER_CREATE } from '~/assets/ts/constants/content/account';
import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';
import { ENotificationType } from '~/assets/ts/enums/common';
import { characterFormSchema } from '~/assets/ts/schemas/character';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import CharacterFormGeneral from '~/components/pages/account/character/form/CharacterFormGeneral.vue';
import CharacterFormItems from '~/components/pages/account/character/form/CharacterFormItems.vue';
import CharacterFormSkins from '~/components/pages/account/character/form/CharacterFormSkins.vue';
import CharacterFormStates from '~/components/pages/account/character/form/CharacterFormStates.vue';

import { useCharacterApi } from '~/composables/api/useCharacterApi';

const userStore = useUserStore();
const notificationStore = useNotificationStore();

const { create } = useCharacterApi();

const { handleSubmit, defineField, errors, isSubmitting } = useForm<TCharacterForm>({
    validationSchema: characterFormSchema,
    initialValues: {
        username: '',
        biography: '',
        states: {
            parameters: { ...PARAMETERS_DEFAULT_VALUE },
            skills: { ...SKILLS_DEFAULT_VALUE },
        },
        startingItems: [],
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
            const character = await create(values);
            await userStore.fetchMe();
            await navigateTo(ACCOUNT_ROUTES.character(character.id));

            notificationStore.add(CHARACTER_CREATE.success);
        } catch (error) {
            notificationStore.add(CHARACTER_CREATE.error, getApiErrorMessage(error), ENotificationType.Error);
        }
    },
    ({ errors: invalidFields }) => {
        const text = CHARACTER_FORM_ORDER
            .map(field => invalidFields[field])
            .filter(Boolean)
            .join('<br>');

        notificationStore.add(CHARACTER_CREATE.invalid, text, ENotificationType.Error);
    },
);
</script>

<template>
    <AccountPageTemplate
        :title="CHARACTER_CREATE.title"
        :description="CHARACTER_CREATE.description"
    >
        <div :class="$style.main">
            <div :class="$style.links">
                <NuxtLink
                    v-for="link in CHARACTER_CREATE.links"
                    :key="link.title"
                    :to="link.to"
                    :class="$style.link"
                >
                    <div :class="$style.linkIconWrapper">
                        <VIcon :name="link.icon" :size="18" />
                    </div>

                    <div :class="$style.linkContent">
                        <div :class="$style.linkTitle" v-html="link.title" />
                        <div :class="$style.linkDescription" v-html="link.description" />
                    </div>

                    <VIcon name="arrow-up-right" :class="$style.linkExternalIcon" />
                </NuxtLink>
            </div>

            <form :class="$style.formWrapper" @submit.prevent="onSubmit">
                <CharacterFormGeneral
                    v-model:name="username"
                    v-model:biography="biography"
                    :name-error="errors.username"
                />

                <CharacterFormStates
                    v-model:parameters="parameters"
                    v-model:skills="skills"
                />

                <CharacterFormItems v-model:items="startingItems" />

                <CharacterFormSkins v-model:files="skins" />

                <VButton
                    type="submit"
                    :loading="isSubmitting"
                    :class="$style.button"
                >
                    {{ CHARACTER_CREATE.button.title }}
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

.links {
    display: flex;
    flex-wrap: wrap;
    gap: $space-24;

    @include respond-to(tablet) {
        gap: $space-16;
    }

    @include respond-to(mobile) {
        flex-direction: column;
        gap: $space-12;
    }
}

.link {
    display: flex;
    flex: 1;
    gap: $space-12;
    align-items: center;
    padding: $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-raised;
    transition: background-color $default-transition;

    @include hover {
        background-color: $surface-sunken;
    }
}

.linkIconWrapper {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    width: rem(36);
    height: rem(36);
    border-radius: $radius-8;
    background-color: $surface-sunken;
    color: $text-link;
}

.linkContent {
    flex: 1;
}

.linkTitle {
    @include h4;
}

.linkDescription {
    color: $text-secondary;
}

.linkExternalIcon {
    color: $text-link;
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
