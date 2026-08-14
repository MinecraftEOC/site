<script setup lang="ts">
import type { CharacterStatus } from '~~/generated/prisma/enums';
import type { ICharacterAdminAction } from '~/@types/character';

import { CHARACTER_COMMENT_OPTIONAL_STATUSES, STATUS_COMMENT_MAX_LENGTH } from '~~/shared/constants/character';
import { CHARACTER_ADMIN } from '~/assets/ts/constants/content/account';
import { ESize } from '~/assets/ts/enums/common';

import CharacterFormTemplate from '~/components/pages/account/character/form/CharacterFormTemplate.vue';

interface IProps {
    /** Кнопки смены статуса: набор зависит от текущего статуса персонажа */
    actions: ICharacterAdminAction[];
    /** Текст, которым поле предзаполнено при открытии карточки */
    initialComment?: string;
    /** Статус, в который персонаж переводится прямо сейчас: его кнопка показывает загрузку */
    pendingStatus?: CharacterStatus | null;
}

const props = withDefaults(defineProps<IProps>(), {
    initialComment: '',
    pendingStatus: null,
});

const emits = defineEmits<{
    submit: [action: ICharacterAdminAction, comment: string];
}>();

const EDITOR_MAX_HEIGHT = 150;

const comment = defineModel<string>({ default: '' });

const style = useCssModule();

/**
 * Что уйдёт в ручку. Прошлые замечания предзаполняют поле как заготовка, но
 * нетронутый текст комментарием не считается: иначе список правок уехал бы в
 * комментарий к одобрению заявки.
 */
const submitted = computed(() => (comment.value === props.initialComment ? '' : comment.value));

const length = computed(() => stripRichText(comment.value).length);

const isTooLong = computed(() => length.value > STATUS_COMMENT_MAX_LENGTH);

const isEmpty = computed(() => !hasRichText(submitted.value));

const isPending = computed(() => !!props.pendingStatus);

const counterClassList = computed(() => [isTooLong.value ? style._error : '']);

function isActionDisabled(action: ICharacterAdminAction) {
    const needsComment = isEmpty.value && !CHARACTER_COMMENT_OPTIONAL_STATUSES.includes(action.status);

    return needsComment || isTooLong.value || (isPending.value && props.pendingStatus !== action.status);
}
</script>

<template>
    <CharacterFormTemplate :title="CHARACTER_ADMIN.commentTitle">
        <div :class="$style.field">
            <VEditor
                v-model="comment"
                :placeholder="CHARACTER_ADMIN.commentPlaceholder"
                :max-height="EDITOR_MAX_HEIGHT"
            />

            <div :class="[$style.counter, counterClassList]">
                {{ length }} / {{ STATUS_COMMENT_MAX_LENGTH }}
            </div>
        </div>

        <div :class="$style.actions">
            <VButton
                v-for="action in actions"
                :key="action.status"
                :size="ESize.Small"
                :color="action.color"
                :disabled="isActionDisabled(action)"
                :loading="pendingStatus === action.status"
                :class="$style.action"
                @click="emits('submit', action, submitted)"
            >
                {{ action.label }}
            </VButton>
        </div>
    </CharacterFormTemplate>
</template>

<style module lang="scss">
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

.actions {
    display: flex;
    gap: $space-12;

    @include respond-to(mobile) {
        flex-direction: column;
    }
}

.action {
    flex: 1;
}
</style>
