/**
 * Тулбар редактора по умолчанию: начертания, подзаголовки, списки, ссылка
 * и сброс формата. Формат — группы кнопок Quill; передаётся в проп `toolbar`
 * компонента `VEditor` и может использоваться как основа для своего набора.
 */
export const EDITOR_DEFAULT_TOOLBAR = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ header: [2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
];

/**
 * Пустой документ Quill: редактор всегда держит внутри хотя бы один абзац,
 * поэтому «пусто» приходит непустой строкой.
 */
export const EDITOR_EMPTY_HTML = '<p><br></p>';
