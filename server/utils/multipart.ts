import type { MultiPartData } from 'h3';

/**
 * Возвращает значение текстового поля multipart-формы (не файла).
 *
 * @param parts Разобранные части multipart-запроса.
 * @param name Имя поля.
 * @returns Строковое значение поля или `undefined`, если поля нет.
 */
export function getFormField(parts: MultiPartData[] | undefined, name: string) {
    const part = parts?.find(item => item.name === name && item.filename === undefined);

    return part?.data.toString('utf-8');
}
