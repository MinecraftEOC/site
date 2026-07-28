<script setup lang="ts">
import { useForm } from 'vee-validate';

import { EAuthPageType } from '~/assets/ts/enums/auth';
import { forgotPasswordSchema } from '~/assets/ts/schemas/auth';

import { useAuthApi } from '~/composables/api/useAuthApi';

const emits = defineEmits<{
    changeType: [val: EAuthPageType];
}>();

const showNotification = ref(false);

const { forgotPassword } = useAuthApi();

const { handleSubmit, defineField, errors, isSubmitting, setFieldError } = useForm({ validationSchema: forgotPasswordSchema });

const [email] = defineField('email');

const onSubmit = handleSubmit(async (values) => {
    try {
        await forgotPassword({ email: values.email });

        showNotification.value = true;
    } catch (error) {
        setFieldError('email', getApiErrorMessage(error));
    }
});

function onClickLink() {
    emits('changeType', EAuthPageType.Login);
}
</script>

<template>
    <div :class="$style.AuthForgotPasswordForm">
        <form :class="$style.form" @submit.prevent="onSubmit">
            <VInput
                v-model="email"
                label="Email"
                placeholder="name@example.com"
                icon="mail"
                :error="errors.email"
                :class="$style.input"
            />

            <VButton
                type="submit"
                :loading="isSubmitting"
                :class="$style.button"
            >
                Отправить ссылку
            </VButton>

            <Transition name="fade">
                <VNotification v-show="showNotification" text="Письмо отправлено и должно прийти в течение нескольких минут. Проверьте папку «Спам»." />
            </Transition>
        </form>

        <div :class="$style.footer">
            <div :class="$style.footerText">
                Вспомнили пароль?
                <span :class="$style.link" @click="onClickLink">Вернуться ко входу</span>
            </div>
        </div>
    </div>
</template>

<style module lang="scss">
.AuthForgotPasswordForm {
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
