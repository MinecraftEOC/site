<script setup lang="ts">
import { useForm } from 'vee-validate';

import { EAuthPageType } from '~/assets/ts/enums/auth';
import { registerSchema } from '~/assets/ts/schemas/auth';

import { useAuthApi } from '~/composables/api/useAuthApi';

const emits = defineEmits<{
    changeType: [val: EAuthPageType];
}>();

const userStore = useUserStore();
const notificationStore = useNotificationStore();

const { register } = useAuthApi();

const { handleSubmit, defineField, errors, isSubmitting, setFieldError } = useForm({ validationSchema: registerSchema });

const [email] = defineField('email');
const [password] = defineField('password');
const [confirm] = defineField('confirm');

const onSubmit = handleSubmit(async (values) => {
    try {
        await register({ email: values.email, password: values.password });
        await userStore.login({ email: values.email, password: values.password });
        await navigateTo('/account');

        notificationStore.add('Учетная запись успешно создана');
    } catch (error) {
        setFieldError('email', getApiErrorMessage(error));
    }
});

function onClickLink() {
    emits('changeType', EAuthPageType.Login);
}
</script>

<template>
    <div :class="$style.AuthRegisterForm">
        <form :class="$style.form" @submit.prevent="onSubmit">
            <VInput
                v-model="email"
                label="Email"
                placeholder="Введите Email"
                icon="mail"
                :error="errors.email"
                :class="$style.input"
            />

            <VInput
                v-model="password"
                type="password"
                label="Пароль"
                placeholder="Введите пароль"
                icon="lock-keyhole"
                :error="errors.password"
                :class="$style.input"
            />

            <VInput
                v-model="confirm"
                type="password"
                label="Подтверждение пароля"
                placeholder="Повторите пароль"
                icon="lock-keyhole"
                :error="errors.confirm"
                :class="$style.input"
            />

            <VButton
                type="submit"
                :loading="isSubmitting"
                :class="$style.button"
            >
                Создать аккаунт и войти
            </VButton>

            <div :class="$style.footer">
                <div :class="$style.footerText">
                    Уже есть учётная запись?
                    <span :class="$style.link" @click="onClickLink">Войти</span>
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
