<script setup lang="ts">
import type { IContentAdminResponse } from '~~/shared/@types/response';
import type { TContentForm } from '~/@types/content';

import { useForm } from 'vee-validate';

import { ContentType } from '~~/generated/prisma/enums';
import {
    CONTENT_IMAGE_ACCEPT,
    CONTENT_IMAGE_MAX_SIZE,
    CONTENT_MARKDOWN_ACCEPT,
    CONTENT_MARKDOWN_MAX_SIZE,
} from '~~/shared/constants/content';
import { BYTES_IN_KB } from '~/assets/ts/constants/common';
import { CONTENT_TYPE_TABS } from '~/assets/ts/constants/content-entry';
import { CONTENT_FORM } from '~/assets/ts/constants/content/account';
import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';
import { EColor, ENotificationType, ESize, ETag } from '~/assets/ts/enums/common';
import { getContentFormSchema } from '~/assets/ts/schemas/content';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import ContentFileItem from '~/components/pages/account/admin/content/ContentFileItem.vue';
import ContentFormGallery from '~/components/pages/account/admin/content/ContentFormGallery.vue';

import { useContentApi } from '~/composables/api/useContentApi';

interface IProps {
    /** Редактируемый материал; не задан — форма создаёт новый */
    entry?: IContentAdminResponse | null;
}

const props = withDefaults(defineProps<IProps>(), {
    entry: null,
});

const emits = defineEmits<{
    saved: [];
}>();

const notificationStore = useNotificationStore();

const { create, update } = useContentApi();

const REMOVE_ICON_SIZE = 14;

const isEdit = computed(() => Boolean(props.entry));

const imageDescription = `PNG, JPEG или WebP до ${CONTENT_IMAGE_MAX_SIZE / BYTES_IN_KB / BYTES_IN_KB} МБ`;
const markdownDescription = `Файл .md до ${CONTENT_MARKDOWN_MAX_SIZE / BYTES_IN_KB} КБ`;

const { handleSubmit, defineField, errors, isSubmitting } = useForm<TContentForm>({
    validationSchema: getContentFormSchema(isEdit.value),
    initialValues: {
        type: props.entry?.type ?? ContentType.NEWS,
        slug: props.entry?.slug ?? '',
        title: props.entry?.title ?? '',
        description: props.entry?.description ?? '',
        image: [],
        markdown: [],
        gallery: [],
        removedImages: [],
    },
});

const [type] = defineField('type');
const [slug] = defineField('slug');
const [title] = defineField('title');
const [description] = defineField('description');
const [image] = defineField('image');
const [markdown] = defineField('markdown');
const [gallery] = defineField('gallery');
const [removedImages] = defineField('removedImages');

const filePreview = ref('');

const hasImageFile = computed(() => Boolean(image.value?.length));

const savedImageUrl = computed(() => props.entry ? getContentImageUrl(props.entry.image) : '');

const imageUrl = computed(() => filePreview.value || savedImageUrl.value);

const imageName = computed(() => image.value?.[0]?.name ?? CONTENT_FORM.image.currentTitle);

const markdownName = computed(() => markdown.value?.[0]?.name ?? '');

const pageTitle = computed(() => isEdit.value ? CONTENT_FORM.editTitle : CONTENT_FORM.createTitle);

const submitLabel = computed(() => isEdit.value ? CONTENT_FORM.submitEdit : CONTENT_FORM.submitCreate);

// Адрес выбранного файла живёт до следующего выбора: без отзыва браузер
// держит копию каждой картинки, которую админ примерил к материалу
watch(image, (files) => {
    if (filePreview.value) {
        URL.revokeObjectURL(filePreview.value);
    }

    const [file] = files ?? [];

    filePreview.value = file ? URL.createObjectURL(file) : '';
});

onBeforeUnmount(() => {
    if (filePreview.value) {
        URL.revokeObjectURL(filePreview.value);
    }
});

function removeImage() {
    image.value = [];
}

function removeMarkdown() {
    markdown.value = [];
}

function getErrorText(invalidFields: Record<string, string | undefined>): string {
    return Object.values(invalidFields).filter(Boolean).join('\n');
}

const onSubmit = handleSubmit(
    async (values) => {
        const { entry } = props;

        try {
            if (!entry) {
                await create(values);
                await navigateTo(ACCOUNT_ROUTES.adminContent);

                notificationStore.add(CONTENT_FORM.createSuccess);

                return;
            }

            await update(entry.id, values);

            image.value = [];
            markdown.value = [];
            gallery.value = [];
            removedImages.value = [];

            emits('saved');

            notificationStore.add(CONTENT_FORM.editSuccess);
        } catch (error) {
            const title = entry ? CONTENT_FORM.editError : CONTENT_FORM.createError;

            notificationStore.add(title, getApiErrorMessage(error), ENotificationType.Error);
        }
    },
    ({ errors: invalidFields }) => {
        notificationStore.add(CONTENT_FORM.invalid, getErrorText(invalidFields), ENotificationType.Error);
    },
);
</script>

<template>
    <AccountPageTemplate :title="pageTitle">
        <template #header-right>
            <VButton
                :tag="ETag.NuxtLink"
                :to="ACCOUNT_ROUTES.adminContent"
                :color="EColor.Secondary"
                icon="arrow-left"
                :class="$style.backButton"
            >
                {{ CONTENT_FORM.backButton }}
            </VButton>
        </template>

        <form :class="$style.form" @submit.prevent="onSubmit">
            <div :class="[$style.section, $style.mainSection]">
                <div :class="$style.sectionTitle">
                    {{ CONTENT_FORM.type.label }}
                </div>

                <VSwitcher
                    v-model="type"
                    :items="CONTENT_TYPE_TABS"
                    :size="ESize.Small"
                    :class="$style.switcher"
                />

                <div :class="$style.fields">
                    <VInput
                        v-model="title"
                        :label="CONTENT_FORM.title.label"
                        :placeholder="CONTENT_FORM.title.placeholder"
                        :icon="CONTENT_FORM.title.icon"
                        :error="errors.title"
                        :class="$style.field"
                    />

                    <VInput
                        v-model="slug"
                        :label="CONTENT_FORM.slug.label"
                        :placeholder="CONTENT_FORM.slug.placeholder"
                        :hint="CONTENT_FORM.slug.hint"
                        :icon="CONTENT_FORM.slug.icon"
                        :error="errors.slug"
                        :class="$style.field"
                    />

                    <VInput
                        v-model="description"
                        :label="CONTENT_FORM.description.label"
                        :placeholder="CONTENT_FORM.description.placeholder"
                        :hint="CONTENT_FORM.description.hint"
                        :icon="CONTENT_FORM.description.icon"
                        :error="errors.description"
                        :class="$style.field"
                    />
                </div>

                <div :class="$style.imageLabel">
                    {{ CONTENT_FORM.image.label }}
                </div>

                <VFile
                    v-model="image"
                    :accept="CONTENT_IMAGE_ACCEPT"
                    :max="1"
                    :max-size="CONTENT_IMAGE_MAX_SIZE"
                    :title="CONTENT_FORM.image.title"
                    :description="imageDescription"
                    :button="CONTENT_FORM.image.button"
                    :icon="CONTENT_FORM.image.icon"
                    :error="errors.image"
                    :class="$style.imageFile"
                />

                <ContentFileItem
                    v-if="imageUrl"
                    :preview="imageUrl"
                    :name="imageName"
                    :removable="hasImageFile"
                    @remove="removeImage"
                />
            </div>

            <div :class="$style.column">
                <div :class="$style.section">
                    <div :class="$style.sectionTitle">
                        {{ CONTENT_FORM.markdown.label }}
                    </div>

                    <VFile
                        v-model="markdown"
                        :accept="CONTENT_MARKDOWN_ACCEPT"
                        :max="1"
                        :max-size="CONTENT_MARKDOWN_MAX_SIZE"
                        :title="CONTENT_FORM.markdown.title"
                        :description="markdownDescription"
                        :button="CONTENT_FORM.markdown.button"
                        :icon="CONTENT_FORM.markdown.icon"
                        :error="errors.markdown"
                    />

                    <div v-if="markdownName" :class="$style.file">
                        <VIcon name="file-text" :size="REMOVE_ICON_SIZE" />

                        <span :class="$style.fileName">{{ CONTENT_FORM.markdown.selected }} {{ markdownName }}</span>

                        <button
                            type="button"
                            :title="CONTENT_FORM.markdown.remove"
                            :aria-label="CONTENT_FORM.markdown.remove"
                            :class="$style.fileRemove"
                            @click="removeMarkdown"
                        >
                            <VIcon name="x" :size="REMOVE_ICON_SIZE" />
                        </button>
                    </div>

                    <div v-else-if="props.entry" :class="$style.preview">
                        <div :class="$style.previewTitle">
                            {{ CONTENT_FORM.markdown.previewTitle }}
                        </div>

                        <div :class="$style.hint">
                            {{ CONTENT_FORM.markdown.previewHint }}
                        </div>

                        <VMarkdown :content="props.entry.html" :class="$style.markdown" />
                    </div>
                </div>

                <div :class="$style.section">
                    <div :class="$style.sectionTitle">
                        {{ CONTENT_FORM.gallery.label }}
                    </div>

                    <ContentFormGallery
                        v-model:files="gallery"
                        v-model:removed="removedImages"
                        :saved="props.entry?.images"
                        :description="imageDescription"
                    />
                </div>
            </div>

            <VButton
                type="submit"
                :loading="isSubmitting"
                :class="$style.submit"
            >
                {{ submitLabel }}
            </VButton>
        </form>
    </AccountPageTemplate>
</template>

<style module lang="scss">
.backButton {
    @include respond-to(mobile) {
        width: 100%;
    }
}

.form {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $space-24;
    align-items: start;

    @include respond-to(tablet) {
        grid-template-columns: minmax(0, 1fr);
        gap: $space-16;
    }
}

.column {
    display: flex;
    flex-direction: column;
    gap: $space-24;

    @include respond-to(tablet) {
        gap: $space-16;
    }
}

.section {
    display: flex;
    flex-direction: column;
    gap: $space-12;
    padding: $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-raised;
}

.mainSection {
    height: 100%;

    @include respond-to(tablet) {
        height: auto;
    }
}

.sectionTitle {
    @include h4;
}

.switcher {
    align-self: flex-start;
}

.hint {
    @include t4;

    color: $text-secondary;
}

.fields {
    display: flex;
    flex-direction: column;
    gap: $space-16;
    margin-top: $space-4;
}

.field {
    width: 100%;
}

.preview {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: $space-8;
    min-height: 0;
}

.previewTitle {
    @include l3;

    color: $text-secondary;
}

.imageLabel {
    @include l2;

    margin-bottom: -$space-4;
}

.imageFile {
    flex: 1;
    min-height: rem(200);
}

.file {
    @include t3;

    display: flex;
    gap: $space-8;
    align-items: center;
    padding: $space-12 $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface-sunken;
    color: $text-secondary;
}

.fileName {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.fileRemove {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    color: $text-muted;
    transition: color $default-transition;

    @include hover {
        color: $danger;
    }
}

.markdown {
    overflow-y: auto;
    max-height: rem(360);
    padding: $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-8;
    background-color: $surface-sunken;
}

.submit {
    grid-column: 2;
    justify-self: end;

    @include respond-to(tablet) {
        grid-column: auto;
    }

    @include respond-to(mobile) {
        justify-self: stretch;
    }
}
</style>
