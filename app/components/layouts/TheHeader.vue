<script setup lang="ts">
import { EColor, ESize, ETag } from '~/assets/ts/enums/common';

interface IProps {
    hasMenu?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    hasMenu: false,
});

const MAIN_NAV_LIST = [
    {
        title: 'О проекте',
        link: '#about',
    },
    {
        title: 'Ценности',
        link: '#rules',
    },
    {
        title: 'Как начать играть?',
        link: '#game',
    },
];

const BUTTONS = [
    {
        tag: ETag.Link,
        color: EColor.SecondaryDark,
        title: 'ВКонтакте',
        href: 'https://vk.ru/colonial_era',
        target: '_blank',
        icon: 'simple-icons:vk',
    },
    {
        tag: ETag.Link,
        color: EColor.SecondaryDark,
        title: 'Discord',
        href: 'https://discord.com/invite/cwACTVDgbm',
        target: '_blank',
        icon: 'simple-icons:discord',
    },
    {
        tag: ETag.NuxtLink,
        color: EColor.Primary,
        title: 'Личный кабинет',
        to: '/account',
        icon: 'user',
    },
];

function onNavItemClick(link: string) {
    const block = document.getElementById(link.replace('#', ''));
    if (!block) {
        return;
    }

    const top = block.getBoundingClientRect().top + window.pageYOffset - 40;

    window.scroll({
        top,
        left: 0,
        behavior: 'smooth',
    });
}
</script>

<template>
    <div :class="$style.TheHeader">
        <div :class="$style.container" class="container">
            <NuxtLink to="/" :class="$style.logoWrapper">
                <img
                    src="~/assets/images/logo.svg"
                    alt="Logo"
                    :class="$style.logo"
                >

                <div :class="$style.logoTextWrapper">
                    <div :class="$style.logoText">
                        Эпоха Колонизации
                    </div>
                    <div :class="$style.logoTextSub">
                        Приватный roleplay сервер
                    </div>
                </div>
            </NuxtLink>

            <nav v-if="props.hasMenu" :class="$style.nav">
                <span
                    v-for="item in MAIN_NAV_LIST"
                    :key="item.title"
                    :class="$style.navItem"
                    @click="onNavItemClick(item.link)"
                >
                    {{ item.title }}
                </span>
            </nav>

            <div :class="$style.buttons">
                <VButton
                    v-for="item in BUTTONS"
                    :key="item.title"
                    :tag="item.tag"
                    :to="item.to"
                    :href="item.href"
                    :target="item.target"
                    :icon="item.icon"
                    :color="item.color"
                    :size="ESize.Small"
                >
                    {{ item.title }}
                </VButton>
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.TheHeader {
    position: fixed;
    top: 0;
    z-index: 2;
    width: 100%;
    height: $header-h;
    background-color: $surface-dark;

    @include respond-to(mobile) {
        height: $header-mobile-h
    }
}

.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
}

.logoWrapper {
    display: flex;
    gap: $space-16;
    align-items: center;

    @include respond-to(mobile) {
        gap: $space-8;
    }
}

.logo {
    width: rem(48);
    height: rem(48);

    @include respond-to(mobile) {
        width: rem(32);
        height: rem(32);
    }
}

.logoTextWrapper {
    display: flex;
    flex-direction: column;
    gap: $space-2;
}

.logoText {
    @include h4;

    color: $text-inverse;

    @include respond-to(mobile) {
        @include h5;
    }
}

.logoTextSub {
    @include l4;

    color: $text-inverse-subtle;
    text-transform: uppercase;

    @include respond-to(mobile) {
        display: none;
    }
}

.nav {
    display: flex;
    gap: $space-16;
    align-items: center;

    @include respond-to(tablet) {
        gap: $space-8;
    }

    @include respond-to(mobile) {
        display: none;
    }
}

.navItem {
    @include l2;

    padding: $space-8;
    color: $text-inverse-subtle;
    cursor: pointer;
    user-select: none;
    transition: color $default-transition;

    &:hover {
        color: $text-inverse;
    }
}

.buttons {
    display: flex;
    gap: $space-12;
    align-items: center;

    @include respond-to(tablet) {
        & :global(.v-button__label) {
            display: none;
        }
    }

    @include respond-to(mobile) {
        gap: $space-8;
    }
}
</style>
