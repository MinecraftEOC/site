<script setup lang="ts">
</script>

<template>
    <div :class="$style.TheFooter">
        <div class="container" :class="$style.container">
            <div :class="$style.center">
                <NuxtLink to="/" :class="$style.title">
                    Эпоха Колонизации
                </NuxtLink>

                <span :class="$style.copyright">© 2026 · Приватный Minecraft RP сервер</span>
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.TheFooter {
    height: rem(72);
    background-color: $surface-dark;
}

.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    text-align: center;
}

.title {
    @include h4;

    color: $text-inverse;
}

.center {
    display: flex;
    flex-direction: column;
    gap: $space-4;
}

.copyright {
    @include t4;

    color: $text-muted;
}
</style>
