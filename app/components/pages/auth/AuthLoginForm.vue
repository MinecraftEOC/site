<script setup lang="ts">
import { useForm } from 'vee-validate';

import { EAuthPageType } from '~/assets/ts/enums/auth';
import { loginSchema } from '~/assets/ts/schemas/auth';

const emits = defineEmits<{
    changeType: [val: EAuthPageType];
}>();

const userStore = useUserStore();

const { handleSubmit, defineField, errors, isSubmitting, setFieldError } = useForm({ validationSchema: loginSchema });

const [email] = defineField('email');
const [password] = defineField('password');

const onSubmit = handleSubmit(async (values) => {
    try {
        await userStore.login({ email: values.email, password: values.password });
        await navigateTo('/account');
    } catch (error) {
        setFieldError('email', getApiErrorMessage(error));
    }
});

function onClickLink(type: EAuthPageType) {
    emits('changeType', type);
}
</script>

<template>
    <div :class="$style.AuthLoginForm">
        <form :class="$style.form" @submit.prevent="onSubmit">
            <VInput
                v-model="email"
                label="Email"
                placeholder="name@example.com"
                icon="mail"
                :error="errors.email"
                :class="$style.input"
            />

            <VInput
                v-model="password"
                type="password"
                label="Пароль"
                placeholder="12345678"
                icon="lock-keyhole"
                :error="errors.password"
                :class="$style.input"
            />

            <VButton
                type="submit"
                :loading="isSubmitting"
                :class="$style.button"
            >
                Войти
            </VButton>
        </form>

        <div :class="$style.footer">
            <span :class="$style.link" @click="onClickLink(EAuthPageType.ChangePassword)">Забыли пароль?</span>

            <div :class="$style.footerText">
                Впервые здесь?
                <span :class="$style.link" @click="onClickLink(EAuthPageType.Register)">Создать аккаунт</span>
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
