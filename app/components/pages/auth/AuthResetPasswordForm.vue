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
    <div :class="$style.AuthResetPasswordForm">
        <div :class="$style.form">
            <VInput
                type="password"
                label="Новый пароль"
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

            <VButton :class="$style.button">
                Сохранить пароль
            </VButton>
        </div>

        <div :class="$style.footer">
            <div :class="$style.footerText">
                Вспомнили пароль?
                <span :class="$style.link" @click="onChangePageType(EAuthPageType.Login)">Вернуться ко входу</span>
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.AuthResetPasswordForm {
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
