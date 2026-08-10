import type { MultiPartData } from 'h3';

/**
 * Возвращает значение текстового поля multipart-формы (не файла).
 *
 * @param parts Разобранные части multipart-запроса.
 * @param name Имя поля.
 * @returns Значение поля или `undefined`, если поля нет.
 */
export function getFormField(parts: MultiPartData[] | undefined, name: string) {
    const part = parts?.find(item => item.name === name && item.filename === undefined);

    return part?.data.toString('utf-8');
}

/**
 * Возвращает разобранное JSON-поле multipart-формы.
 *
 * @param parts Разобранные части multipart-запроса.
 * @param name Имя поля.
 * @param invalidMessage Ошибка, если значение — не валидный JSON.
 * @returns Разобранное значение или `undefined`, если поля нет.
 * @throws `400` если значение содержит невалидный JSON.
 */
export function getFormJson(parts: MultiPartData[] | undefined, name: string, invalidMessage: string): unknown {
    const raw = getFormField(parts, name);

    if (raw === undefined) {
        return undefined;
    }

    try {
        return JSON.parse(raw);
    } catch {
        throw createError({ statusCode: 400, message: invalidMessage });
    }
}
