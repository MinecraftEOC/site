<script setup lang="ts">
import type { ISkinHashItem, TSkinItem } from '~/@types/skin';

import { SKIN_MAX_COUNT, SKIN_MAX_SIZE } from '~~/shared/constants/skin';
import { CHARACTER_FORM_SKINS } from '~/assets/ts/constants/content/account';
import { SKIN_ACCEPT } from '~/assets/ts/constants/skin';

import SkinsSlider from '~/components/common/SkinsSlider.vue';
import CharacterFormTemplate from '~/components/pages/account/character/form/CharacterFormTemplate.vue';

interface IProps {
    /** Уже сохранённые скины персонажа: выводятся в слайдере вместе с выбранными файлами */
    skins?: ISkinHashItem[];
    /** Только просмотр: загрузка новых файлов и удаление скинов недоступны */
    readonly?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    skins: () => [],
    readonly: false,
});

const emits = defineEmits<{
    removeSkin: [skin: ISkinHashItem];
}>();

const files = defineModel<File[]>('files', { default: () => [] });

const items = computed<TSkinItem[]>(() => [
    ...props.skins,
    ...files.value.map(file => ({ file })),
]);

const restCount = computed(() => Math.max(0, SKIN_MAX_COUNT - props.skins.length));

function removeFile(file: File) {
    files.value = files.value.filter(item => item !== file);
}

function removeSkin(skin: ISkinHashItem) {
    emits('removeSkin', skin);
}
</script>

<template>
    <CharacterFormTemplate
        :title="CHARACTER_FORM_SKINS.title"
        :description="readonly ? '' : CHARACTER_FORM_SKINS.description"
    >
        <VFile
            v-if="!readonly"
            v-model="files"
            multiple
            :accept="SKIN_ACCEPT"
            :max="restCount"
            :max-size="SKIN_MAX_SIZE"
            :description="CHARACTER_FORM_SKINS.uploadDescription"
            :class="$style.files"
        />

        <Transition name="fade">
            <SkinsSlider
                v-if="items.length"
                :items="items"
                :title="CHARACTER_FORM_SKINS.sliderTitle"
                :readonly="readonly"
                @remove-file="removeFile"
                @remove-hash="removeSkin"
            />
        </Transition>
    </CharacterFormTemplate>
</template>

<style module lang="scss">
.files {
    flex: 1;
}
</style>
