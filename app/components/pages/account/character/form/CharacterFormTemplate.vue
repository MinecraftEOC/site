<script setup lang="ts">
interface IProps {
    /** Заголовок блока формы */
    title?: string;
    /** Пояснение под заголовком */
    description?: string;
}

const props = withDefaults(defineProps<IProps>(), {
    title: '',
    description: '',
});
</script>

<template>
    <div :class="$style.CharacterFormTemplate">
        <slot name="header">
            <div :class="$style.header">
                <h2
                    v-if="title"
                    :class="$style.title"
                    v-html="props.title"
                />

                <div
                    v-if="description"
                    :class="$style.description"
                    v-html="props.description"
                />
            </div>
        </slot>

        <div :class="$style.form">
            <slot />
        </div>
    </div>
</template>

<style module lang="scss">
.CharacterFormTemplate {
    display: flex;
    flex-direction: column;
    padding: $space-16;
    border: 1px solid $border-subtle;
    border-radius: $radius-12;
    background-color: $surface-raised;
}

.header {
    display: flex;
    flex-direction: column;
    gap: $space-4;
}

.title {
    @include h4;
}

.description {
    @include t4;

    color: $text-secondary;
}

.form {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: $space-16;
    margin-top: $space-12;
}
</style>
