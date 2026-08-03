<script setup lang="ts">
import { DEFAULT_PAGE_DESCRIPTION, DEFAULT_TITLE, EMPTY_CHARACTERS } from '~/assets/ts/constants/content/account';
import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';
import { ETag } from '~/assets/ts/enums/common';

import AccountEmptyState from '~/components/pages/account/AccountEmptyState.vue';
import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
</script>

<template>
    <AccountPageTemplate
        :title="DEFAULT_TITLE"
        :description="DEFAULT_PAGE_DESCRIPTION"
        :class="$style.EmptyCharacters"
    >
        <AccountEmptyState
            icon="users-round"
            :title="EMPTY_CHARACTERS.title"
            :description="EMPTY_CHARACTERS.description"
        >
            <VButton
                :tag="ETag.NuxtLink"
                :to="ACCOUNT_ROUTES.characterCreate"
                :class="$style.mainButton"
            >
                {{ EMPTY_CHARACTERS.button }}
            </VButton>
        </AccountEmptyState>
    </AccountPageTemplate>
</template>

<style module lang="scss">
.EmptyCharacters {
    //
}

.mainButton {
    @include respond-to(mobile) {
        width: 100%;
    }
}
</style>
