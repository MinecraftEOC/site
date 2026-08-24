import { z } from 'zod';

import { ContentType } from '~~/generated/prisma/enums';
import {
    CONTENT_DESCRIPTION_MAX_LENGTH,
    CONTENT_LIST_MAX_TAKE,
    CONTENT_SLUG_MAX_LENGTH,
    CONTENT_SLUG_REGEX,
    CONTENT_TITLE_MAX_LENGTH,
} from '~~/shared/constants/content';

/**
 * Тексты ошибок формы контента. Уходят и в уведомление на фронте, и в ответ
 * ручки, поэтому каждый должен читаться сам по себе, без привязки к полю формы.
 */
export const CONTENT_FORM_ERRORS = {
    TYPE_INVALID: 'Выберите раздел материала',
    SLUG_REQUIRED: 'Укажите слаг материала',
    SLUG_INVALID: 'Слаг — латиница в нижнем регистре, цифры и дефис между ними',
    SLUG_TOO_LONG: `Слаг не должен быть длиннее ${CONTENT_SLUG_MAX_LENGTH} символов`,
    TITLE_REQUIRED: 'Укажите заголовок материала',
    TITLE_TOO_LONG: `Заголовок не должен быть длиннее ${CONTENT_TITLE_MAX_LENGTH} символов`,
    DESCRIPTION_TOO_LONG: `Описание не должно быть длиннее ${CONTENT_DESCRIPTION_MAX_LENGTH} символов`,
    IMAGE_REQUIRED: 'Загрузите картинку материала',
    MARKDOWN_REQUIRED: 'Загрузите .md-файл с текстом материала',
};

/** Тексты ошибок параметров выборки списка материалов. */
export const CONTENT_LIST_ERRORS = {
    TAKE_INVALID: `Размер выборки — целое число от 1 до ${CONTENT_LIST_MAX_TAKE}`,
};

/** Поле раздела: значение из enum Prisma. */
const typeField = z.nativeEnum(ContentType, {
    required_error: CONTENT_FORM_ERRORS.TYPE_INVALID,
    invalid_type_error: CONTENT_FORM_ERRORS.TYPE_INVALID,
});

/** Поле слага: обязательность, формат и длина. */
const slugField = z
    .string({ required_error: CONTENT_FORM_ERRORS.SLUG_REQUIRED })
    .trim()
    .min(1, CONTENT_FORM_ERRORS.SLUG_REQUIRED)
    .max(CONTENT_SLUG_MAX_LENGTH, CONTENT_FORM_ERRORS.SLUG_TOO_LONG)
    .regex(CONTENT_SLUG_REGEX, CONTENT_FORM_ERRORS.SLUG_INVALID);

/** Поле заголовка: обязательность и длина. */
const titleField = z
    .string({ required_error: CONTENT_FORM_ERRORS.TITLE_REQUIRED })
    .trim()
    .min(1, CONTENT_FORM_ERRORS.TITLE_REQUIRED)
    .max(CONTENT_TITLE_MAX_LENGTH, CONTENT_FORM_ERRORS.TITLE_TOO_LONG);

/** Поле краткого описания: необязательное, ограничено длиной карточки. */
const descriptionField = z
    .string()
    .trim()
    .max(CONTENT_DESCRIPTION_MAX_LENGTH, CONTENT_FORM_ERRORS.DESCRIPTION_TOO_LONG);

/**
 * Схема текстовых полей материала для `POST /api/content` — без файлов:
 * картинка и `.md` приходят частями multipart-запроса и проверяются отдельно.
 */
export const sharedContentSchema = z.object({
    type: typeField,
    slug: slugField,
    title: titleField,
    description: descriptionField.optional(),
});

/** Схема полей `PATCH /api/content/:id`: любое подмножество полей материала. */
export const sharedContentUpdateSchema = sharedContentSchema.partial();

/** Схема параметров `GET /api/content` — раздел и слаг материала. */
export const sharedContentQuerySchema = z.object({
    type: typeField,
    slug: slugField,
});

/** Поле размера выборки: целое в границах одного запроса списка. */
const takeField = z.coerce
    .number({ invalid_type_error: CONTENT_LIST_ERRORS.TAKE_INVALID })
    .int(CONTENT_LIST_ERRORS.TAKE_INVALID)
    .min(1, CONTENT_LIST_ERRORS.TAKE_INVALID)
    .max(CONTENT_LIST_MAX_TAKE, CONTENT_LIST_ERRORS.TAKE_INVALID);

/**
 * Схема параметров `GET /api/content/list` — раздел и размер выборки. Без
 * `take` отдаётся раздел целиком: так список забирают страницы разделов и
 * админка, ограничение нужно только блоку новостей на главной.
 */
export const sharedContentListSchema = z.object({
    type: typeField.optional(),
    take: takeField.optional(),
});

/** Тип валидных параметров выборки списка материалов. */
export type TContentListQuery = z.infer<typeof sharedContentListSchema>;

/** Тип валидных текстовых полей материала. */
export type TContentBody = z.infer<typeof sharedContentSchema>;

/** Тип валидных текстовых полей правки материала. */
export type TContentUpdateBody = z.infer<typeof sharedContentUpdateSchema>;
