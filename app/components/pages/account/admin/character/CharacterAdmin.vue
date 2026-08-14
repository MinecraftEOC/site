<script setup lang="ts">
import type { CharacterStatus } from '~~/generated/prisma/enums';
import type { ICharacter } from '~~/shared/@types/user';
import type { ICharacterAdminAction } from '~/@types/character';

import { CHARACTER_ADMIN_ACTIONS, CHARACTER_STATUS_COLOR } from '~/assets/ts/constants/character';
import { CHARACTER_ADMIN, CHARACTER_STATUS_LABEL } from '~/assets/ts/constants/content/account';
import { ENotificationType, ESize } from '~/assets/ts/enums/common';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import CharacterAdminComment from '~/components/pages/account/admin/character/CharacterAdminComment.vue';
import CharacterBiography from '~/components/pages/account/character/view/CharacterBiography.vue';
import CharacterSkins from '~/components/pages/account/character/view/CharacterSkins.vue';
import CharacterStates from '~/components/pages/account/character/view/CharacterStates.vue';

import { useCharacterApi } from '~/composables/api/useCharacterApi';

interface IProps {
    /** Персонаж, которого разбирает администрация */
    character: ICharacter;
}

const props = defineProps<IProps>();

const emits = defineEmits<{
    updated: [];
}>();

const notificationStore = useNotificationStore();

const { updateStatus } = useCharacterApi();

const comment = ref(getComment());

/**
 * Текст, с которым открыли карточку. Поле предзаполнено прошлыми замечаниями
 * как заготовкой, и по нему `CharacterAdminComment` понимает, правил ли его
 * админ.
 */
const initialComment = ref(comment.value);

const pendingStatus = ref<CharacterStatus | null>(null);

const actions = computed(() => CHARACTER_ADMIN_ACTIONS[props.character.status] ?? []);

function getComment() {
    return props.character.statusComment ?? props.character.reviewComment ?? '';
}

function getReviewComment(action: ICharacterAdminAction, statusComment: string) {
    if (action.review === undefined) {
        return undefined;
    }

    return action.review ? statusComment : '';
}

async function onSubmit(action: ICharacterAdminAction, statusComment: string) {
    pendingStatus.value = action.status;

    try {
        await updateStatus({
            characterId: props.character.id,
            status: action.status,
            statusComment,
            reviewComment: getReviewComment(action, statusComment),
        });

        notificationStore.add(CHARACTER_ADMIN.success);

        emits('updated');
    } catch (error) {
        notificationStore.add(CHARACTER_ADMIN.error, getApiErrorMessage(error), ENotificationType.Error);
    } finally {
        pendingStatus.value = null;
    }
}

watch(() => props.character, () => {
    comment.value = getComment();
    initialComment.value = comment.value;
});
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

            <CharacterSkins
                v-if="character.skins.length"
                :skins="character.skins"
                :class="$style.aside"
            />

            <CharacterAdminComment
                v-if="actions.length"
                v-model="comment"
                :actions="actions"
                :initial-comment="initialComment"
                :pending-status="pendingStatus"
                @submit="onSubmit"
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

.aside {
    align-self: start;
}
</style>
