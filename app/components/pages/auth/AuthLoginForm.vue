<script setup lang="ts">
import { EAuthPageType } from '~/assets/ts/enums/auth';

const emits = defineEmits<{
    changeType: [val: EAuthPageType];
}>();

function onChangePageType(type: EAuthPageType) {
    emits('changeType', type);
}
</script>

<template>
    <div :class="$style.AuthLoginForm">
        <div :class="$style.form">
            <VInput
                label="Email"
                placeholder="name@example.com"
                icon="mail"
                :class="$style.input"
            />

            <VInput
                type="password"
                label="Пароль"
                placeholder="12345678"
                icon="lock-keyhole"
                :class="$style.input"
            />

            <VButton :class="$style.button">
                Войти
            </VButton>
        </div>

        <div :class="$style.footer">
            <span :class="$style.link" @click="onChangePageType(EAuthPageType.ChangePassword)">Забыли пароль?</span>

            <div :class="$style.footerText">
                Впервые здесь?
                <span :class="$style.link" @click="onChangePageType(EAuthPageType.Register)">Создать аккаунт</span>
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.AuthLoginForm {
    width: 100%;
}

.form {
    display: flex;
    flex-direction: column;
    gap: $space-16;
    margin: $space-24 0;

    @include respond-to(mobile) {
        gap: $space-12;
        margin: $space-16 0;
    }
}

.input {
    width: 100%;
}

.button {
    margin-top: $space-8;
}

.footer {
    display: flex;
    flex-direction: column;
    gap: $space-8;
    align-items: center;
}

.footerText {
    @include t3;

    color: $text-secondary;
}

.link {
    @include t3;

    color: $text-link;
    font-weight: 500;
    cursor: pointer;
    transition: opacity $default-transition;

    &:hover {
        opacity: .8;
    }
}
</style>
