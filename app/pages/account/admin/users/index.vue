<script setup lang="ts">
import { USERS_ADMIN } from '~/assets/ts/constants/content/account';

import UsersAdmin from '~/components/pages/account/admin/users/UsersAdmin.vue';

import { useUserApi } from '~/composables/api/useUserApi';

definePageMeta({
    layout: 'account',
    middleware: 'admin',
});

const { list } = useUserApi();

const { data: users, error } = await useAsyncData('admin-users', () => list());

if (error.value || !users.value) {
    throw showError({
        statusCode: error.value?.statusCode ?? 404,
        statusMessage: getApiErrorMessage(error.value, USERS_ADMIN.loadError),
    });
}
</script>

<template>
    <UsersAdmin v-if="users" :users="users" />
</template>

<style module lang="scss">
</style>
