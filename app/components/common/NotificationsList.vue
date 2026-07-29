<script setup lang="ts">
const notificationStore = useNotificationStore();

function onBeforeLeave(el: Element) {
    const item = el as HTMLElement;
    const list = item.parentElement;

    if (!list) {
        return;
    }

    item.style.bottom = `${list.offsetHeight - item.offsetTop - item.offsetHeight}px`;
}
</script>

<template>
    <TransitionGroup
        tag="div"
        name="notification"
        :class="$style.NotificationsList"
        @before-leave="onBeforeLeave"
    >
        <VToastNotification
            v-for="item in notificationStore.list"
            :key="`notification_${item.id}`"
            :type="item.type"
            :title="item.title"
            :text="item.text"
            @close="notificationStore.remove(item.id)"
        />
    </TransitionGroup>
</template>

<style module lang="scss">
.NotificationsList {
    position: fixed;
    right: $space-24;
    bottom: $space-24;
    display: flex;
    flex-direction: column;
    gap: $space-16;
    width: 30rem;
}
</style>
