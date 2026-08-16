<script setup lang="ts">
import { UserRole } from '~~/generated/prisma/enums';
import { DISCORD_LINK, VK_LINK } from '~/assets/ts/constants/common';

import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';

import { EColor, ESize, ETag } from '~/assets/ts/enums/common';
import LogoBlock from '~/components/common/LogoBlock.vue';
import ServerStatus from '~/components/common/ServerStatus.vue';

interface IMenuItem {
    /** Подпись пункта */
    title: string;
    /** Имя иконки пункта */
    icon: string;
    /** Адрес, на который ведёт пункт */
    to: string;
    /** Пункт вложен в раздел выше — рисуется со сдвигом */
    child?: boolean;
}

interface IMenuSection {
    /** Заголовок раздела */
    title: string;
    /** Пункты раздела */
    items: IMenuItem[];
}

const ADMIN_MENU: IMenuSection = {
    title: 'Администрирование',
    items: [
        {
            title: 'Список игроков',
            icon: 'user-cog',
            to: ACCOUNT_ROUTES.adminUsers,
        },
        {
            title: 'Настройка новостей',
            icon: 'file-pen-line',
            to: ACCOUNT_ROUTES.adminNews,
        },
    ],
};

const MENU: IMenuSection = {
    title: 'Разделы',
    items: [
        {
            title: 'Мои персонажи',
            icon: 'users-round',
            to: ACCOUNT_ROUTES.root,
        },
        {
            title: 'Загрузка лаунчера',
            icon: 'download',
            to: ACCOUNT_ROUTES.download,
        },
        {
            title: 'История мира',
            icon: 'scroll-text',
            to: ACCOUNT_ROUTES.lore,
        },
        {
            title: 'Правила проекта',
            icon: 'book-open',
            to: ACCOUNT_ROUTES.rules,
        },
        {
            title: 'Новости',
            icon: 'newspaper',
            to: ACCOUNT_ROUTES.news,
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

const CHARACTER_CREATE_ITEM = {
    title: 'Создание персонажа',
    icon: 'user-round-plus',
};

const CHARACTER_DETAILS_ICON = 'user-round';

const BODY_LOCK_CLASS = 'is-locked';

const route = useRoute();

const style = useCssModule();

const userStore = useUserStore();

const adminCharacterStore = useAdminCharacterStore();

const isMenuOpen = ref(false);

const characterItem = computed<IMenuItem | null>(() => {
    if (route.path === ACCOUNT_ROUTES.characterCreate) {
        return { ...CHARACTER_CREATE_ITEM, to: route.path, child: true };
    }

    const character = userStore.getCharacterById(String(route.params.id));

    if (!character || route.path !== ACCOUNT_ROUTES.character(character.id)) {
        return null;
    }

    return { title: character.username, icon: CHARACTER_DETAILS_ICON, to: route.path, child: true };
});

const adminCharacterItem = computed<IMenuItem | null>(() => {
    const character = adminCharacterStore.character;

    if (!character || route.path !== ACCOUNT_ROUTES.adminCharacter(character.id)) {
        return null;
    }

    return { title: character.username, icon: CHARACTER_DETAILS_ICON, to: route.path, child: true };
});

/** Подпункты меню в виде «адрес родительского пункта → сам подпункт» */
const childItems = computed(() => {
    const items = new Map<string, IMenuItem>();

    if (characterItem.value) {
        items.set(ACCOUNT_ROUTES.root, characterItem.value);
    }

    if (adminCharacterItem.value) {
        items.set(ACCOUNT_ROUTES.adminUsers, adminCharacterItem.value);
    }

    return items;
});

const menu = computed(() => {
    const sections = userStore.user?.role === UserRole.ADMIN ? [ADMIN_MENU, MENU] : [MENU];
    const children = childItems.value;

    if (!children.size) {
        return sections;
    }

    return sections.map(section => ({
        ...section,
        items: section.items.flatMap((item) => {
            const child = children.get(item.to);

            return child ? [item, child] : [item];
        }),
    }));
});

const panelClassList = computed(() => [
    isMenuOpen.value ? style._open : '',
]);

function getMenuItemClassList(item: IMenuItem) {
    return [
        route.path === item.to ? style._active : '',
        item.child ? style._child : '',
    ];
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

                        <TransitionGroup
                            tag="ul"
                            name="fade"
                            :class="$style.sectionItems"
                        >
                            <li
                                v-for="item in section.items"
                                :key="item.to"
                                :class="[$style.menuItem, getMenuItemClassList(item)]"
                            >
                                <NuxtLink :to="item.to" :class="$style.menuLink">
                                    <VIcon :name="item.icon" />
                                    {{ item.title }}
                                </NuxtLink>
                            </li>
                        </TransitionGroup>
                    </div>
                </nav>
            </div>

            <div :class="$style.bottom">
                <div :class="$style.statuses">
                    <ServerStatus :size="ESize.Small" icon="users-round" />
                </div>

                <div :class="$style.actions">
                    <VButton
                        icon="log-out"
                        :color="EColor.SecondaryDark"
                        :class="$style.button"
                        @click="userStore.logout"
                    >
                        Выйти
                    </VButton>

                    <VButton
                        v-for="item in LINKS"
                        :key="item.title"
                        :href="item.href"
                        :icon="item.icon"
                        :tag="ETag.Link"
                        :color="EColor.SecondaryDark"
                        :class="$style.iconButton"
                        :aria-label="item.title"
                        :title="item.title"
                        target="_blank"
                    />
                </div>
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

    &._child {
        margin-left: $space-16;
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
    flex: 1;
}

.bottom {
    display: flex;
    flex-direction: column;
    gap: $space-16;
}

.actions {
    display: flex;
    gap: $space-8;

    .iconButton {
        padding: 0;
    }
}

.iconButton {
    flex: none;
    width: $space-40;

    & :global(.v-button__label) {
        display: none;
    }
}

.statuses {
    display: flex;
    gap: $space-8;

    > * {
        flex: 1;
        min-width: 0;
    }
}
</style>
