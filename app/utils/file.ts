/**
 * Подходит ли файл под значение `accept` инпута.
 *
 * @param file Проверяемый файл.
 * @param accept Значение атрибута `accept`: `image/png`, `image/*` или `.png`; пустая строка — без ограничений.
 * @returns `true`, если MIME-тип или расширение файла разрешены.
 */
export function isFileAccepted(file: File, accept: string): boolean {
    const rules = accept.split(',').map(rule => rule.trim().toLowerCase()).filter(Boolean);

    if (!rules.length) {
        return true;
    }

    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    return rules.some((rule) => {
        if (rule.startsWith('.')) {
            return name.endsWith(rule);
        }

        if (rule.endsWith('/*')) {
            return type.startsWith(rule.slice(0, -1));
        }

        return type === rule;
    });
}
