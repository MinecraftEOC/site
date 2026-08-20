<script setup lang="ts">
import type { IContentImage } from '~~/shared/@types/content';

import { CONTENT_GALLERY_MAX_COUNT, CONTENT_IMAGE_ACCEPT, CONTENT_IMAGE_MAX_SIZE } from '~~/shared/constants/content';
import { CONTENT_FORM } from '~/assets/ts/constants/content/account';
import { COPY_NOTIFICATION } from '~/assets/ts/constants/content/common';
import { ENotificationType } from '~/assets/ts/enums/common';

import ContentFileItem from '~/components/pages/account/admin/content/ContentFileItem.vue';

interface IProps {
    /** Картинки, уже сохранённые у материала */
    saved?: IContentImage[];
    /** Пояснение под зоной загрузки: форматы и лимиты */
    description?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    saved: () => [],
    description: '',
});

const files = defineModel<File[]>('files', { default: () => [] });
const removed = defineModel<number[]>('removed', { default: () => [] });

const notificationStore = useNotificationStore();

const ACTION_ICON_SIZE = 14;

const previews = ref<string[]>([]);

const savedImages = computed(() => props.saved.filter(image => !removed.value.includes(image.id)));

const restCount = computed(() => Math.max(0, CONTENT_GALLERY_MAX_COUNT - savedImages.value.length));

// Адреса выбранных файлов живут до следующего выбора: без отзыва браузер
// держит копию каждой картинки, которую админ примерил к тексту
watch(files, (value) => {
    revokePreviews();

    previews.value = value.map(file => URL.createObjectURL(file));
}, { immediate: true });

onBeforeUnmount(revokePreviews);

function revokePreviews() {
    previews.value.forEach(url => URL.revokeObjectURL(url));
    previews.value = [];
}

function removeSaved(image: IContentImage) {
    removed.value = [...removed.value, image.id];
}

function removeFile(file: File) {
    files.value = files.value.filter(item => item !== file);
}

async function copyMarkdown(name: string) {
    try {
        await navigator.clipboard.writeText(getContentImageMarkdown(name));

        notificationStore.add(CONTENT_FORM.gallery.copied);
    } catch {
        notificationStore.add(COPY_NOTIFICATION.error, '', ENotificationType.Error);
    }
}
</script>

<template>
    <div :class="$style.ContentFormGallery">
        <div :class="$style.hint">
            <div :class="$style.hintTitle">
                <VIcon name="info" :size="ACTION_ICON_SIZE" />

                {{ CONTENT_FORM.gallery.hint.title }}
            </div>

            <ol :class="$style.hintSteps">
                <li v-for="step in CONTENT_FORM.gallery.hint.steps" :key="step">
                    {{ step }}
                </li>
            </ol>
        </div>

        <VFile
            v-model="files"
            multiple
            :accept="CONTENT_IMAGE_ACCEPT"
            :max="restCount"
            :max-size="CONTENT_IMAGE_MAX_SIZE"
            :title="CONTENT_FORM.gallery.title"
            :description="props.description"
            :button="CONTENT_FORM.gallery.button"
            :icon="CONTENT_FORM.gallery.icon"
        />

        <div v-if="savedImages.length" :class="$style.group">
            <div :class="$style.groupTitle">
                {{ CONTENT_FORM.gallery.savedTitle }}
            </div>

            <div :class="$style.list">
                <ContentFileItem
                    v-for="image in savedImages"
                    :key="image.id"
                    :preview="getContentImageUrl(image.file)"
                    :name="image.name"
                    copyable
                    removable
                    @copy="copyMarkdown(image.name)"
                    @remove="removeSaved(image)"
                />
            </div>
        </div>

        <div v-if="files.length" :class="$style.group">
            <div :class="$style.groupTitle">
                {{ CONTENT_FORM.gallery.selectedTitle }}
            </div>

            <div :class="$style.list">
                <ContentFileItem
                    v-for="(file, index) in files"
                    :key="`${file.name}-${file.lastModified}`"
                    :preview="previews[index] ?? ''"
                    :name="getContentImageName(file.name)"
                    copyable
                    removable
                    @copy="copyMarkdown(getContentImageName(file.name))"
                    @remove="removeFile(file)"
                />
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.ContentFormGallery {
    display: flex;
    flex-direction: column;
    gap: $space-12;
}

.hint {
    display: flex;
    flex-direction: column;
    gap: $space-8;
    padding: $space-12 $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface-sunken;
}

.hintTitle {
    @include l3;

    display: flex;
    gap: $space-8;
    align-items: center;
    color: $text-primary;
}

.hintSteps {
    @include t4;

    display: flex;
    flex-direction: column;
    gap: $space-4;
    padding-left: $space-20;
    list-style: decimal;
    color: $text-secondary;

    li {
        list-style: inherit;
    }
}

.group {
    display: flex;
    flex-direction: column;
    gap: $space-8;
}

.groupTitle {
    @include l3;

    color: $text-secondary;
}

.list {
    display: flex;
    flex-direction: column;
    gap: $space-8;
}
</style>
