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
    /** Id сохранённого активного скина; `null` — активного ещё нет */
    activeSkinId?: number | null;
}

const props = withDefaults(defineProps<IProps>(), {
    skins: () => [],
    activeSkinId: null,
});

const emits = defineEmits<{
    removeSkin: [skin: ISkinHashItem];
    activateSkin: [skin: ISkinHashItem];
}>();

const files = defineModel<File[]>('files', { default: () => [] });

const activeFile = defineModel<File | null>('activeFile', { default: null });

const items = computed<TSkinItem[]>(() => [
    ...props.skins,
    ...files.value.map(file => ({ file })),
]);

const restCount = computed(() => Math.max(0, SKIN_MAX_COUNT - props.skins.length));

// Повторяет выбор сервера: явно выбранный файл, иначе сохранённый активный,
// а если его нет — первый из загружаемых.
const activeItem = computed<TSkinItem | undefined>(() => {
    if (activeFile.value && files.value.includes(activeFile.value)) {
        return { file: activeFile.value };
    }

    const savedActive = props.skins.find(skin => skin.id === props.activeSkinId);
    if (savedActive) {
        return savedActive;
    }

    return files.value[0] ? { file: files.value[0] } : undefined;
});

const activeKey = computed(() => activeItem.value ? getSkinKey(activeItem.value) : '');

function removeFile(file: File) {
    files.value = files.value.filter(item => item !== file);

    if (activeFile.value === file) {
        activeFile.value = null;
    }
}

function activate(item: TSkinItem) {
    if (isSkinFileItem(item)) {
        activeFile.value = item.file;

        return;
    }

    activeFile.value = null;
    emits('activateSkin', item);
}

function removeSkin(skin: ISkinHashItem) {
    emits('removeSkin', skin);
}
</script>

<template>
    <CharacterFormTemplate
        :title="CHARACTER_FORM_SKINS.title"
        :description="CHARACTER_FORM_SKINS.description"
    >
        <VFile
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
                :active-key="activeKey"
                selectable
                @remove-file="removeFile"
                @remove-hash="removeSkin"
                @activate="activate"
            />
        </Transition>
    </CharacterFormTemplate>
</template>

<style module lang="scss">
.files {
    flex: 1;
}
</style>
