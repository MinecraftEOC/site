<script setup lang="ts">
import { DiscordLinkStatus, UserRole } from '~~/generated/prisma/enums';
import { DISCORD_LINK, VK_LINK } from '~/assets/ts/constants/common';

import { EColor, ESize, ETag } from '~/assets/ts/enums/common';

import LogoBlock from '~/components/common/LogoBlock.vue';

const ADMIN_MENU = {
    title: 'Администрирование',
    items: [
        {
            title: 'Игроки',
            icon: 'user-cog',
            to: '/account/admin/users',
        },
        {
            title: 'Настройка новостей',
            icon: 'file-pen-line',
            to: '/account/admin/news',
        },
    ],
};

const MENU = {
    title: 'Разделы',
    items: [
        {
            title: 'Мои персонажи',
            icon: 'users-round',
            to: '/account',
        },
        {
            title: 'Загрузка лаунчера',
            icon: 'download',
            to: '/account/download',
        },
        {
            title: 'История мира',
            icon: 'scroll-text',
            to: '/account/lore',
        },
        {
            title: 'Правила проекта',
            icon: 'book-open',
            to: '/account/rules',
        },
        {
            title: 'Новости',
            icon: 'newspaper',
            to: '/account/news',
        },
    ],
};

const LINKS = [
    {
        title: 'ВКонтакте',
        href: VK_LINK,
        icon: 'simple-icons:vk',
    },
    {
        title: 'Discord',
        href: DISCORD_LINK,
        icon: 'simple-icons:discord',
    },
];

const BODY_LOCK_CLASS = 'is-locked';

const route = useRoute();

const style = useCssModule();

const userStore = useUserStore();

const isMenuOpen = ref(false);

const menu = computed(() => {
    if (userStore.user?.role === UserRole.ADMIN) {
        return [ADMIN_MENU, MENU];
    }

    return [MENU];
});

const discordStatus = computed(() => {
    const isLinked = userStore.user?.discordAccount?.status === DiscordLinkStatus.LINKED;

    return {
        class: isLinked ? style._linked : '',
        label: isLinked ? 'Discord привязан' : 'Discord не привязан',
    };
});

const panelClassList = computed(() => [
    isMenuOpen.value ? style._open : '',
]);

function getMenuItemClassList(to: string) {
    return [route.path === to ? style._active : ''];
}

function closeMenu() {
    isMenuOpen.value = false;
}

useHead({
    bodyAttrs: {
        class: computed(() => isMenuOpen.value ? BODY_LOCK_CLASS : ''),
    },
});

watch(() => route.path, closeMenu);
</script>

<template>
    <div :class="$style.TheAccountSidebar">
        <div :class="$style.header">
            <LogoBlock :size="ESize.Small" mobile-small />

            <button
                :class="$style.burger"
                @click="isMenuOpen = !isMenuOpen"
            >
                <VIcon :name="isMenuOpen ? 'x' : 'menu'" :size="24" />
            </button>
        </div>

        <Transition name="fade">
            <div
                v-if="isMenuOpen"
                :class="$style.overlay"
                @click="closeMenu"
            />
        </Transition>

        <aside :class="[$style.panel, panelClassList]">
            <div :class="$style.top">
                <LogoBlock :size="ESize.Small" :class="$style.logo" />

                <nav :class="$style.menu">
                    <div
                        v-for="section in menu"
                        :key="section.title"
                        :class="$style.section"
                    >
                        <div :class="$style.sectionTitle">
                            {{ section.title }}
                        </div>

                        <ul :class="$style.sectionItems">
                            <li
                                v-for="item in section.items"
                                :key="item.title"
                                :class="[$style.menuItem, getMenuItemClassList(item.to)]"
                            >
                                <NuxtLink :to="item.to" :class="$style.menuLink">
                                    <VIcon :name="item.icon" />
                                    {{ item.title }}
                                </NuxtLink>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>

            <div :class="$style.bottom">
                <div :class="$style.links">
                    <VButton
                        v-for="item in LINKS"
                        :key="item.title"
                        :href="item.href"
                        :icon="item.icon"
                        :tag="ETag.Link"
                        :color="EColor.SecondaryDark"
                        :size="ESize.Small"
                        target="_blank"
                    >
                        {{ item.title }}
                    </VButton>
                </div>

                <div :class="[$style.discordStatus, discordStatus.class]">
                    {{ discordStatus.label }}
                </div>

                <VButton
                    icon="log-out"
                    :color="EColor.SecondaryDark"
                    :class="$style.button"
                    @click="userStore.logout"
                >
                    Выйти из аккаунта
                </VButton>
            </div>
        </aside>
    </div>
</template>

<style module lang="scss">
.TheAccountSidebar {
    position: relative;
    z-index: 3;
}

.header {
    display: none;

    @include respond-to(tablet) {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 4;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: $header-h;
        padding: 0 $space-32;
        background-color: $surface-dark;
    }

    @include respond-to(mobile) {
        height: $header-mobile-h;
        padding: 0 $space-16;
    }
}

.burger {
    display: flex;
    justify-content: center;
    align-items: center;
    width: $space-40;
    height: $space-40;
    padding: 0;
    color: $text-inverse;
}

.overlay {
    display: none;

    @include respond-to(tablet) {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 2;
        display: block;
        width: 100%;
        height: 100%;
        background-color: $overlay;
    }
}

.panel {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 32rem;
    height: 100%;
    padding: $space-24;
    background-color: $surface-dark;

    @include respond-to(tablet) {
        top: $header-h;
        right: 0;
        left: auto;
        gap: $space-32;
        overflow-y: auto;
        height: calc(100% - #{$header-h});
        transition: transform $default-transition;
        transform: translateX(100%);

        &._open {
            transform: translateX(0);
        }
    }

    @include respond-to(mobile) {
        top: $header-mobile-h;
        width: 100%;
        height: calc(100% - #{$header-mobile-h});
    }
}

.logo {
    margin-bottom: $space-48;

    @include respond-to(tablet) {
        display: none;
    }
}

.menu {
    display: flex;
    flex-direction: column;
    gap: $space-24;
}

.sectionTitle {
    @include l4;

    margin-bottom: $space-8;
    color: $text-inverse-subtle;
    text-transform: uppercase;
}

.sectionItems {
    display: flex;
    flex-direction: column;
    gap: $space-8;
}

.menuItem {
    height: 3.8rem;
    color: $text-inverse;

    &:hover {
        .menuLink {
            border-color: $btn-secondary-dark-border;
        }
    }

    &._active {
        .menuLink {
            background-color: $btn-primary-bg;
            color: $btn-primary-text;
            pointer-events: none;
        }
    }
}

.menuLink {
    @include l2;

    display: flex;
    gap: $space-12;
    align-items: center;
    height: 100%;
    padding: 0 $space-12;
    border: 1px solid transparent;
    border-radius: $space-8;
    transition: all $default-transition;
}

.button {
    width: 100%;
}

.bottom {
    display: flex;
    flex-direction: column;
    gap: $space-16;
}

.links {
    display: flex;
    gap: $space-8;

    a {
        flex: 1;
    }
}

.discordStatus {
    @include l3;

    display: flex;
    align-items: center;
    width: 100%;
    height: $space-32;
    padding: $space-12;
    border: 1px solid $warning;
    border-radius: $radius-8;
    color: $text-inverse;

    &::before {
        content: '';
        width: 0.8rem;
        height: 0.8rem;
        margin-right: $space-8;
        border-radius: 50%;
        background-color: $warning;
    }

    &._linked {
        border-color: $success;

        &::before {
            background-color: $success;
        }
    }
}
</style>
