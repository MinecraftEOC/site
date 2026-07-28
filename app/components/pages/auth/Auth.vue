<script setup lang="ts">
import { FORM_HEADER, HELP_TEXT, SIDEBAR } from '~/assets/ts/constants/content/auth';
import { EAuthPageType } from '~/assets/ts/enums/auth';
import LogoBlock from '~/components/common/LogoBlock.vue';

import AuthForgotPasswordForm from '~/components/pages/auth/AuthForgotPasswordForm.vue';
import AuthFormHeader from '~/components/pages/auth/AuthFormHeader.vue';
import AuthLoginForm from '~/components/pages/auth/AuthLoginForm.vue';
import AuthRegisterForm from '~/components/pages/auth/AuthRegisterForm.vue';
import AuthResetPasswordForm from '~/components/pages/auth/AuthResetPasswordForm.vue';

const route = useRoute();

const pageType = ref(getStartPageType());

const sidebar = computed(() => SIDEBAR[pageType.value]);

const header = computed(() => FORM_HEADER[pageType.value]);

const formComponent = computed(() => {
    const components = {
        [EAuthPageType.Register]: AuthRegisterForm,
        [EAuthPageType.Login]: AuthLoginForm,
        [EAuthPageType.ChangePassword]: AuthForgotPasswordForm,
        [EAuthPageType.ResetPassword]: AuthResetPasswordForm,
    };

    return components[pageType.value];
});

function getStartPageType() {
    if (route.query.token) {
        return EAuthPageType.ResetPassword;
    }

    if (route.query.register) {
        return EAuthPageType.Register;
    }

    return EAuthPageType.Login;
}

function onChangePageType(type: EAuthPageType) {
    pageType.value = type;
}
</script>

<template>
    <div :class="$style.Auth">
        <div :class="$style.sidebar">
            <LogoBlock />

            <Transition name="fade" mode="out-in">
                <div :key="pageType" :class="$style.main">
                    <span :class="$style.pretitle" v-html="sidebar.pretitle" />
                    <h1 :class="$style.title" v-html="sidebar.title" />
                    <div :class="$style.description" v-html="sidebar.description" />
                </div>
            </Transition>

            <div :class="$style.helpText" v-html="HELP_TEXT" />
        </div>

        <div :class="$style.formWrapper">
            <Transition name="fade" mode="out-in">
                <div :key="pageType" :class="$style.form">
                    <AuthFormHeader
                        :title="header.title"
                        :pretitle="header.pretitle"
                        :description="header.description"
                    />

                    <component :is="formComponent" @change-type="onChangePageType" />
                </div>
            </Transition>
        </div>
    </div>
</template>

<style module lang="scss">
.Auth {
    display: flex;
    width: 100%;
    height: 100dvh;
}

.sidebar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 52rem;
    height: 100%;
    padding: $space-64;
    background-color: $surface-dark;

    @include respond-to(tablet) {
        display: none;
    }
}

.formWrapper {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @include respond-to(tablet) {
        padding: $space-48 $space-32;
    }

    @include respond-to(mobile) {
        padding: $space-32 $space-16;
    }
}

.form {
    width: 40rem;

    @include respond-to(tablet) {
        width: 100%;
        max-width: 40rem;
    }
}

.main {
    display: flex;
    flex-direction: column;
    gap: $space-16;
}

.pretitle {
    @include l4;

    color: $text-inverse-subtle;
    text-transform: uppercase;
}

.title {
    @include h2;

    color: $text-inverse;
}

.description {
    @include t1;

    color: $text-inverse-muted;
}

.helpText {
    @include l3;

    color: $text-inverse-subtle;

    a {
        color: $text-inverse;
        transition: opacity $default-transition;

        &:hover {
            opacity: 0.8;
        }
    }
}
</style>
