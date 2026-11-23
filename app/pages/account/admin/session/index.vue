<script setup lang="ts">
import type {
    ISessionControlResponse,
    ISessionJobState,
    ISessionStartParams,
    TSessionOperationKind,
} from '~~/shared/@types/session-control';
import { SESSION_POLL_INTERVAL_MS } from '~~/shared/constants/session-control';
import { AUTH_ROUTES } from '~/assets/ts/constants/routes';
import SessionControlAdmin from '~/components/pages/account/admin/session/SessionControlAdmin.vue';

definePageMeta({
    layout: 'account',
    middleware: 'admin',
});

useSeoMeta({ title: 'Управление сессией' });

const SESSION_API = '/api/admin/session';
const requestFetch = useRequestFetch();
const userStore = useUserStore();
const router = useRouter();

function onResponseError({ response }: { response: { status: number } }) {
    if (import.meta.client && response.status === 401) {
        userStore.reset();
        void router.push(AUTH_ROUTES.root);
    }
}
const { data, error, pending, refresh } = await useAsyncData('admin-session-control', (_, { signal }) =>
    requestFetch<ISessionControlResponse>(SESSION_API, { retry: 0, signal, onResponseError }));

const job = shallowRef<ISessionJobState | null>(data.value?.job ?? null);
const submitting = ref(false);
const actionError = ref('');
let pollTimer: ReturnType<typeof setTimeout> | undefined;
let mounted = false;

function getErrorMessage(value: unknown, fallback: string) {
    if (
        value
        && typeof value === 'object'
        && 'data' in value
        && value.data
        && typeof value.data === 'object'
        && 'message' in value.data
        && typeof value.data.message === 'string'
    ) {
        return value.data.message;
    }

    return fallback;
}

const statusError = computed(() =>
    error.value ? getErrorMessage(error.value, 'Не удалось загрузить состояние сессии') : '',
);

function schedulePoll() {
    if (!mounted || pollTimer !== undefined || job.value?.status !== 'running') {
        return;
    }

    pollTimer = setTimeout(async () => {
        try {
            await refresh({ dedupe: 'defer' });
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

async function submit(kind: TSessionOperationKind, params?: ISessionStartParams) {
    if (submitting.value || pending.value || error.value || job.value?.status === 'running') {
        return;
    }

    submitting.value = true;
    actionError.value = '';

    try {
        const response = await requestFetch<{ job: ISessionJobState }>(`${SESSION_API}/${kind}`, {
            method: 'POST',
            body: params,
            retry: 0,
            onResponseError,
        });
        job.value = response.job;
        schedulePoll();
    } catch (requestError) {
        actionError.value = getErrorMessage(requestError, 'Не удалось отправить запрос на изменение сессии');
        await refresh({ dedupe: 'defer' });
    } finally {
        submitting.value = false;
    }
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
        @refresh="refresh({ dedupe: 'defer' })"
        @start="submit('start', $event)"
        @stop="submit('stop')"
    />
</template>
