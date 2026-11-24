<script setup lang="ts">
import type { ISessionJobState, ISessionStartParams } from '~~/shared/@types/session-control';

import { SESSION_POLL_INTERVAL_MS } from '~~/shared/constants/session-control';
import { SESSION_ADMIN } from '~/assets/ts/constants/content/account';

import SessionControlAdmin from '~/components/pages/account/admin/session/SessionControlAdmin.vue';

import { useSessionControlApi } from '~/composables/api/useSessionControlApi';

definePageMeta({
    layout: 'account',
    middleware: 'admin',
});

useSeoMeta({ title: SESSION_ADMIN.title });

const { get, start, stop } = useSessionControlApi();

const { data, error, pending, refresh } = await useAsyncData(
    'admin-session-control',
    (_, { signal }) => get(signal),
);

const job = shallowRef<ISessionJobState | null>(data.value?.job ?? null);
const submitting = ref(false);
const actionError = ref('');
let pollTimer: ReturnType<typeof setTimeout> | undefined;
let mounted = false;

const statusError = computed(() => error.value ? getApiErrorMessage(error.value, SESSION_ADMIN.loadError) : '');

function refreshStatus() {
    return refresh({ dedupe: 'defer' });
}

/** Планирует следующий опрос после завершения текущего запроса. */
function schedulePoll(): void {
    if (!mounted || pollTimer !== undefined || job.value?.status !== 'running') {
        return;
    }

    pollTimer = setTimeout(async () => {
        try {
            await refreshStatus();
        } finally {
            pollTimer = undefined;
            schedulePoll();
        }
    }, SESSION_POLL_INTERVAL_MS);
}

watch(data, (snapshot) => {
    if (snapshot) {
        job.value = snapshot.job;
        schedulePoll();
    }
});

onMounted(() => {
    mounted = true;
    schedulePoll();
});

onBeforeUnmount(() => {
    mounted = false;
    clearTimeout(pollTimer);
});

/**
 * Отправляет команду и начинает опрос принятой операции.
 *
 * @param request Запрос запуска или остановки сессии.
 */
async function submit(request: () => Promise<{ job: ISessionJobState }>): Promise<void> {
    if (submitting.value || pending.value || error.value || job.value?.status === 'running') {
        return;
    }

    submitting.value = true;
    actionError.value = '';

    try {
        const response = await request();

        job.value = response.job;
        schedulePoll();
    } catch (requestError) {
        actionError.value = getApiErrorMessage(requestError, SESSION_ADMIN.actionError);

        await refreshStatus();
    } finally {
        submitting.value = false;
    }
}

function onStart(params: ISessionStartParams) {
    return submit(() => start(params));
}

function onStop() {
    return submit(stop);
}
</script>

<template>
    <SessionControlAdmin
        :state="data ?? null"
        :job="job"
        :pending="pending"
        :submitting="submitting"
        :status-error="statusError"
        :action-error="actionError"
        @refresh="refreshStatus"
        @start="onStart"
        @stop="onStop"
    />
</template>
