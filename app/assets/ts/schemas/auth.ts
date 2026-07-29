import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

import { REQUIRED_FIELD_MESSAGE, sharedForgotPasswordSchema, sharedLoginSchema, sharedRegisterSchema, sharedResetPasswordSchema } from '~~/shared/schemas/auth';

export const registerSchema = toTypedSchema(
    sharedRegisterSchema
        .extend({
            confirm: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).min(1, REQUIRED_FIELD_MESSAGE),
        })
        .refine(data => data.password === data.confirm, {
            message: 'Пароли не совпадают',
            path: ['confirm'],
        }),
);

export const loginSchema = toTypedSchema(sharedLoginSchema);

export const forgotPasswordSchema = toTypedSchema(sharedForgotPasswordSchema);

export const resetPasswordSchema = toTypedSchema(
    sharedResetPasswordSchema
        .pick({ password: true })
        .extend({
            confirm: z.string({ required_error: REQUIRED_FIELD_MESSAGE }).min(1, REQUIRED_FIELD_MESSAGE),
        })
        .refine(data => data.password === data.confirm, {
            message: 'Пароли не совпадают',
            path: ['confirm'],
        }),
);
