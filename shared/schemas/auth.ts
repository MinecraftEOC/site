import { z } from 'zod';

/** Регэксп для проверки email. */
export const EMAIL_REGEX = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

/** Минимальная длина пароля. */
export const PASSWORD_MIN_LENGTH = 8;

/** Текст ошибки для незаполненного обязательного поля. */
export const REQUIRED_FIELD_MESSAGE = 'Обязательное поле';

/**
 * Поле email: обрезка пробелов, нижний регистр, обязательность и проверка
 * формата. Общее для всех ручек, где передаётся почта.
 */
const emailField = z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .trim()
    .toLowerCase()
    .min(1, REQUIRED_FIELD_MESSAGE)
    .regex(EMAIL_REGEX, 'Некорректный email');

/** Поле пароля с проверкой минимальной длины (регистрация, сброс пароля). */
const strongPasswordField = z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .min(PASSWORD_MIN_LENGTH, `Пароль должен быть не короче ${PASSWORD_MIN_LENGTH} символов`);

/** Поле пароля без проверки длины — только присутствие (вход). */
const requiredPasswordField = z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .min(1, REQUIRED_FIELD_MESSAGE);

/** Поле обязательного непустого токена (reset-токен из письма). */
const tokenField = z
    .string({ required_error: REQUIRED_FIELD_MESSAGE })
    .min(1, REQUIRED_FIELD_MESSAGE);

/**
 * Схема тела `POST /api/auth/register` (email + пароль со строгими правилами).
 */
export const sharedRegisterSchema = z.object({
    email: emailField,
    password: strongPasswordField,
});

/**
 * Схема тела `POST /api/auth/login`. Email проверяется на формат, пароль —
 * только на присутствие: политику длины при входе применять не нужно.
 */
export const sharedLoginSchema = z.object({
    email: emailField,
    password: requiredPasswordField,
});

/** Схема тела `POST /api/auth/forgot-password` — только email. */
export const sharedForgotPasswordSchema = z.object({
    email: emailField,
});

/** Схема тела `POST /api/auth/reset-password` — reset-токен и новый пароль. */
export const sharedResetPasswordSchema = z.object({
    token: tokenField,
    password: strongPasswordField,
});

/** Тип валидного тела регистрации. */
export type TRegisterBody = z.infer<typeof sharedRegisterSchema>;

/** Тип валидного тела входа. */
export type TLoginBody = z.infer<typeof sharedLoginSchema>;

/** Тип валидного тела запроса восстановления. */
export type TForgotPasswordBody = z.infer<typeof sharedForgotPasswordSchema>;

/** Тип валидного тела сброса пароля. */
export type TResetPasswordBody = z.infer<typeof sharedResetPasswordSchema>;
