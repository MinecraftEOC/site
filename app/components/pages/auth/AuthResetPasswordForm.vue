<script setup lang="ts">
import { useForm } from 'vee-validate';

import { EAuthPageType } from '~/assets/ts/enums/auth';
import { ENotificationType } from '~/assets/ts/enums/common';
import { resetPasswordSchema } from '~/assets/ts/schemas/auth';

import { useAuthApi } from '~/composables/api/useAuthApi';

const emits = defineEmits<{
    changeType: [val: EAuthPageType];
}>();

const route = useRoute();
const router = useRouter();

const notificationStore = useNotificationStore();

const { resetPassword } = useAuthApi();

const token = ref(String(route.query.token));

const { handleSubmit, defineField, errors, isSubmitting } = useForm({ validationSchema: resetPasswordSchema });

const [password] = defineField('password');
const [confirm] = defineField('confirm');

const onSubmit = handleSubmit(async (values) => {
    try {
        await resetPassword({ token: token.value, password: values.password });
        notificationStore.add('Пароль успешно изменен');
    } catch (error) {
        notificationStore.add('Ошибка', getApiErrorMessage(error), ENotificationType.Error);
    }
});

function onClickLink() {
    const { token: _token, ...query } = route.query;
    router.replace({ query });

    emits('changeType', EAuthPageType.Login);
}
</script>

<template>
    <div :class="$style.AuthResetPasswordForm">
        <form :class="$style.form" @submit.prevent="onSubmit">
            <VInput
                v-model="password"
                type="password"
                label="Новый пароль"
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
                Сохранить пароль
            </VButton>
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
