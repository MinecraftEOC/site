<script setup lang="ts">
import type { ICharacter } from '~~/shared/@types/user';
import type { ISkinHashItem } from '~/@types/skin';

import { SKIN_MANAGEABLE_STATUSES } from '~~/shared/constants/skin';
import { CHARACTER_STATUS_COLOR } from '~/assets/ts/constants/character';
import { CHARACTER_DETAILS, CHARACTER_STATUS_LABEL } from '~/assets/ts/constants/content/account';
import { ENotificationType, ESize } from '~/assets/ts/enums/common';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import CharacterFormSkins from '~/components/pages/account/character/form/CharacterFormSkins.vue';
import CharacterBiography from '~/components/pages/account/character/view/CharacterBiography.vue';
import CharacterReview from '~/components/pages/account/character/view/CharacterReview.vue';
import CharacterStates from '~/components/pages/account/character/view/CharacterStates.vue';

import { useCharacterApi } from '~/composables/api/useCharacterApi';

interface IProps {
    /** Персонаж, недоступный для правки: страница только показывает его данные */
    character: ICharacter;
}

const props = defineProps<IProps>();

const userStore = useUserStore();
const notificationStore = useNotificationStore();

const { addSkins, deleteSkin } = useCharacterApi();

const files = ref<File[]>([]);
const isSaving = ref(false);

const canManageSkins = computed(() => SKIN_MANAGEABLE_STATUSES.includes(props.character.status));

async function saveSkins() {
    isSaving.value = true;

    try {
        await addSkins(props.character.id, files.value);
        await userStore.fetchMe();

        files.value = [];

        notificationStore.add(CHARACTER_DETAILS.skinsSuccess);
    } catch (error) {
        notificationStore.add(CHARACTER_DETAILS.skinsError, getApiErrorMessage(error), ENotificationType.Error);
    } finally {
        isSaving.value = false;
    }
}

async function removeSkin(skin: ISkinHashItem) {
    try {
        await deleteSkin(skin.id);
        await userStore.fetchMe();
    } catch (error) {
        notificationStore.add(CHARACTER_DETAILS.skinDeleteError, getApiErrorMessage(error), ENotificationType.Error);
    }
}
</script>

<template>
    <AccountPageTemplate :title="character.username">
        <template #title-append>
            <VBadge :color="CHARACTER_STATUS_COLOR[character.status]" :size="ESize.Small">
                {{ CHARACTER_STATUS_LABEL[character.status] }}
            </VBadge>
        </template>

        <div :class="$style.main">
            <CharacterBiography :biography="character.biography" />

            <CharacterStates :states="character.states" />

            <div v-if="canManageSkins" :class="$style.skins">
                <CharacterFormSkins
                    v-model:files="files"
                    :skins="character.skins"
                    @remove-skin="removeSkin"
                />

                <VButton
                    :disabled="!files.length"
                    :loading="isSaving"
                    @click="saveSkins"
                >
                    {{ CHARACTER_DETAILS.skinsButton }}
                </VButton>
            </div>

            <CharacterReview
                v-if="character.statusComment"
                :text="character.statusComment"
                :status="character.status"
                :class="$style.review"
            />
        </div>
    </AccountPageTemplate>
</template>

<style module lang="scss">
.main {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $space-24;

    @include respond-to(tablet) {
        grid-template-columns: minmax(0, 1fr);
        gap: $space-16;
    }
}

.review,
.skins {
    align-self: start;
}

.skins {
    display: flex;
    flex-direction: column;
    gap: $space-16;
}
</style>
