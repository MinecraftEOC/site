<script setup lang="ts">
import rulesContent from '~~/content/rules.md';
</script>

<template>
    <div :class="$style.RulesPage">
        <div class="container">
            <VMarkdown :class="$style.content" :content="rulesContent" />
        </div>
    </div>
</template>

<style module lang="scss">
.RulesPage {
    display: flex;
    flex-direction: column;
    padding: $space-64 0;

    @include respond-to(tablet) {
        padding: $space-48 0;
    }

    @include respond-to(mobile) {
        padding: $space-32 0;
    }
}

.content {
    max-width: 100rem;
}
</style>
