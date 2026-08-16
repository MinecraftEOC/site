<script setup lang="ts">
import { DISCORD_LINK, VK_LINK } from '~/assets/ts/constants/common';
import { MAIN_ROUTES } from '~/assets/ts/constants/routes';
import { EColor, ESize, ETag } from '~/assets/ts/enums/common';

import LogoBlock from '~/components/common/LogoBlock.vue';

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
        href: VK_LINK,
        target: '_blank',
        icon: 'simple-icons:vk',
    },
    {
        tag: ETag.Link,
        color: EColor.SecondaryDark,
        title: 'Discord',
        href: DISCORD_LINK,
        target: '_blank',
        icon: 'simple-icons:discord',
    },
    {
        tag: ETag.NuxtLink,
        color: EColor.Primary,
        title: 'Личный кабинет',
        to: '/auth',
        icon: 'user',
    },
];

const router = useRouter();

function onNavItemClick(link: string) {
    const block = document.getElementById(link.replace('#', ''));

    // Шапка общая для всех публичных страниц: если якоря на текущей нет,
    // уводим на главную — до блока браузер доскроллит сам.
    if (!block) {
        router.push({ path: MAIN_ROUTES.root, hash: link });

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
            <LogoBlock :size="ESize.Small" mobile-small />

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
