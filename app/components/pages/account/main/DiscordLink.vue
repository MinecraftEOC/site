<script setup lang="ts">
import { DISCORD_VERIFY_CHANNEL } from '~/assets/ts/constants/common';
import { DEFAULT_TITLE, DISCORD_LINK, DISCORD_PAGE_DESCRIPTION } from '~/assets/ts/constants/content/account';
import { EColor, ENotificationType, ETag } from '~/assets/ts/enums/common';

import AccountPageTemplate from '~/components/pages/account/AccountPageTemplate.vue';
import { useDiscordApi } from '~/composables/api/useDiscordApi';

const notificationStore = useNotificationStore();

const { link } = useDiscordApi();

const showModal = ref(false);
const code = ref('');
const isCodeLoading = ref(false);

async function fetchCode() {
    isCodeLoading.value = true;

    try {
        const response = await link();

        code.value = response.code;
    } catch (error) {
        notificationStore.add(getApiErrorMessage(error), '', ENotificationType.Error);
    } finally {
        isCodeLoading.value = false;
    }
}

watch(showModal, (value) => {
    if (value) {
        fetchCode();
    }
});
</script>

<template>
    <AccountPageTemplate
        :title="DEFAULT_TITLE"
        :description="DISCORD_PAGE_DESCRIPTION"
        :class="$style.DiscordLink"
    >
        <div :class="$style.main">
            <div :class="$style.iconWrapper">
                <VIcon name="link-2" size="28" />
            </div>

            <div :class="$style.title" v-html="DISCORD_LINK.title" />
            <div :class="$style.description" v-html="DISCORD_LINK.description" />

            <VButton :class="$style.mainButton" @click="showModal = !showModal">
                {{ DISCORD_LINK.button }}
            </VButton>
        </div>

        <VModal
            v-model="showModal"
            :title="DISCORD_LINK.modal.title"
            :description="DISCORD_LINK.modal.description"
        >
            <VCopyField :value="code" />

            <div :class="$style.text" v-html="DISCORD_LINK.modal.codeText" />

            <div :class="$style.buttons">
                <VButton
                    :color="EColor.Secondary"
                    :loading="isCodeLoading"
                    :class="$style.button"
                    @click="fetchCode"
                >
                    {{ DISCORD_LINK.modal.codeButton }}
                </VButton>

                <VButton
                    :tag="ETag.Link"
                    :href="DISCORD_VERIFY_CHANNEL"
                    :class="$style.button"
                    icon="external-link"
                    target="_blank"
                >
                    {{ DISCORD_LINK.modal.mainButton }}
                </VButton>
            </div>
        </VModal>
    </AccountPageTemplate>
</template>

<style module lang="scss">
.DiscordLink {
    //
}

.main {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.iconWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 6.4rem;
    height: 6.4rem;
    margin-bottom: $space-16;
    border-radius: 50%;
    background-color: $surface-sunken;
    color: $text-link;

    @include respond-to(mobile) {
        width: rem(56);
        height: rem(56);
        margin-bottom: $space-12;
    }
}

.title {
    @include h3;

    margin-bottom: $space-8;
    text-align: center;

    @include respond-to(mobile) {
        @include h4;
    }
}

.description {
    @include t2;

    margin-bottom: $space-16;
    color: $text-secondary;
    text-align: center;

    @include respond-to(mobile) {
        @include t3;
    }
}

.mainButton {
    @include respond-to(mobile) {
        width: 100%;
    }
}

.text {
    @include t4;

    margin: $space-16 0;
    color: $text-muted;
}

.buttons {
    display: flex;
    gap: $space-8;

    @include respond-to(mobile) {
        flex-direction: column;
    }
}

.button {
    flex: 1;
}
</style>
