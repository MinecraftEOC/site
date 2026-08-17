/**
 * Импорт `.md`-файла отдаёт готовую HTML-строку: разметку собирает
 * Vite-плагин `build/vite-markdown.ts` на этапе сборки.
 */
declare module '*.md' {
    const html: string;

    export default html;
}
