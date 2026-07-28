<script setup lang="ts">
import { ESize } from '~/assets/ts/enums/common';

interface IProps {
    /** Размер блоко с лого */
    size?: ESize;
    /** Булевый флаг сокращенного варианта блока в мобилке */
    mobileSmall?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    size: ESize.Medium,
    short: false,
});

const style = useCssModule();

const classList = computed(() => [
    style[`--size-${props.size}`],
    props.mobileSmall ? style._mobileSmall : '',
]);
</script>

<template>
    <NuxtLink to="/" :class="[$style.LogoBlock, classList]">
        <img
            src="~/assets/images/logo.svg"
            alt="Logo"
            :class="$style.logo"
        >

        <div :class="$style.wrapper">
            <div :class="$style.text">
                Эпоха Колонизации
            </div>
            <div :class="$style.subtext">
                Приватный roleplay сервер
            </div>
        </div>
    </NuxtLink>
</template>

<style module lang="scss">
.LogoBlock {
    display: flex;
    gap: $space-16;
    align-items: center;

    &.--size-small {
        .logo {
            width: 4.8rem;
            height: 4.8rem;

        }

        .text {
            @include h4;
        }

        .subtext {
            @include l4;
        }

        &._mobileSmall {
            @include respond-to(mobile) {
                gap: $space-8;
            }

            .logo {
                @include respond-to(mobile) {
                    width: 3.2rem;
                    height: 3.2rem;
                }
            }

            .text {
                @include respond-to(mobile) {
                    @include h5;
                }
            }

            .subtext {
                @include respond-to(mobile) {
                    display: none;
                }
            }
        }
    }

    &.--size-medium {
        .logo {
            width: 7.2rem;
            height: 7.2rem;
        }

        .text {
            @include h3;
        }

        .subtext {
            @include l3;
        }
    }
}

.wrapper {
    display: flex;
    flex-direction: column;
    gap: $space-2;
}

.text {
    color: $text-inverse;
}

.subtext {
    color: $text-inverse-subtle;
    text-transform: uppercase;
}
</style>
