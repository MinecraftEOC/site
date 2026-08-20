/** Колонки таблицы материалов в админке. */
export enum EContentColumn {
    /** Картинка материала. */
    Image = 'image',
    /** Заголовок и краткое описание. */
    Title = 'title',
    /** Слаг материала. */
    Slug = 'slug',
    /** Дата публикации. */
    CreatedAt = 'createdAt',
    /** Дата последней правки. */
    UpdatedAt = 'updatedAt',
    /** Кнопки управления материалом. */
    Actions = 'actions',
}
