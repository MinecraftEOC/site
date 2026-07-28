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
    <div :class="$style.AuthRegisterForm">
        <form :class="$style.form">
            <VInput
                label="Email"
                placeholder="Введите Email"
                icon="mail"
                :class="$style.input"
            />

            <VInput
                type="password"
                label="Пароль"
                placeholder="Введите пароль"
                icon="lock-keyhole"
                :class="$style.input"
            />

            <VInput
                type="password"
                label="Подтверждение пароля"
                placeholder="Повторите пароль"
                icon="lock-keyhole"
                :class="$style.input"
            />

            <VButton
                type="submit"
                :class="$style.button"
            >
                Создать учетную запись
            </VButton>

            <div :class="$style.footer">
                <div :class="$style.footerText">
                    Уже есть учётная запись?
                    <span :class="$style.link" @click="onChangePageType(EAuthPageType.Login)">Войти</span>
                </div>
            </div>
        </form>
    </div>
</template>

<style module lang="scss">
.AuthRegisterForm {
    //
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
