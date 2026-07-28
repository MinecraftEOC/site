import type { ILoginResponse, IMeResponse, IRegisterResponse, ISuccessResponse } from '~~/shared/@types/response';
import type { TForgotPasswordBody, TLoginBody, TRegisterBody, TResetPasswordBody } from '~~/shared/schemas/auth';

export function useAuthApi() {
    const { $api } = useNuxtApp();

    return {
        me: () => $api<IMeResponse>('/api/me'),

        login: (body: TLoginBody) => $api<ILoginResponse>('/api/auth/login', { method: 'POST', body }),

        register: (body: TRegisterBody) => $api<IRegisterResponse>('/api/auth/register', { method: 'POST', body }),

        logout: () => $api<ISuccessResponse>('/api/auth/logout', { method: 'POST' }),

        forgotPassword: (body: TForgotPasswordBody) => $api<ISuccessResponse>('/api/auth/forgot-password', { method: 'POST', body }),

        resetPassword: (body: TResetPasswordBody) => $api<ISuccessResponse>('/api/auth/reset-password', { method: 'POST', body }),
    };
}
