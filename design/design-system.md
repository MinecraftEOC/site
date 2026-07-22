# Дизайн-система «Эпоха Колонизации»

Дизайн-система сайта и лаунчера ролевого сервера. Опорные цвета взяты из логотипа: тёплый почти-чёрный `#2B2A29` и кремовый `#F6E6D7` (он же близок к фону
`#F2E6D6`).

Структура: **палитра → типографика → SCSS-переменные → где что использовать**.

---

## 1. Палитра

Легенда: **★** — основной тон рампы (используется по умолчанию).

### Нейтрали — пергамент

Тёплые бежевые тона: фон, поверхности, границы.

| Токен           | HEX         | Назначение                                           |
| -------------------- | ----------- | -------------------------------------------------------------- |
| `parchment-50`     | `#FBF6EE` | Верхняя (приподнятая) поверхность |
| `parchment-100`    | `#F7EEE1` | Карточки, панели                                 |
| `parchment-200` ★ | `#F2E6D6` | Фон страницы                                        |
| `parchment-300`    | `#EAD9C4` | Hover, заливка полей ввода                    |
| `parchment-400`    | `#DCC7AB` | Мягкая граница, разделитель            |
| `parchment-500`    | `#C9B08E` | Сильная граница                                  |

### Чернила и тёмные тона

| Токен    | HEX         | Назначение                                                          |
| ------------- | ----------- | ----------------------------------------------------------------------------- |
| `taupe-400` | `#94856F` | Приглушённый текст, подписи                           |
| `taupe-600` | `#6B5F52` | Вторичный текст                                                 |
| `ink` ★    | `#2B2A29` | Основной текст (из логотипа)                           |
| `black`     | `#1A1A1A` | Тёмные поверхности: шапка, сайдбар, футер   |
| `cream`     | `#F6E6D7` | Текст на тёмных поверхностях (из логотипа) |

### Основной — кожа (brass)

Главный цвет действий и бренда. Родной коричневый лаунчера в аккуратной рампе.

| Токен       | HEX         | Назначение                                                             |
| ---------------- | ----------- | -------------------------------------------------------------------------------- |
| `brass-50`     | `#F3ECE3` | Светлая заливка, ховер-фон                                 |
| `brass-100`    | `#E6D5C3` | Светлый фон блока                                                 |
| `brass-300`    | `#C4A488` | Декоративный тон                                                  |
| `brass-400`    | `#A5866A` | Hover основной кнопки                                              |
| `brass-500` ★ | `#8E6C4F` | Основная кнопка, ссылки, активные состояния |
| `brass-600`    | `#71543C` | Нажатое состояние, текст ссылки                       |
| `brass-700`    | `#543E2C` | Текст на светлой кожаной заливке                     |

### Гербовый красный — кирпич

Деструктивные действия и геральдические акценты.

| Токен       | HEX         | Назначение                                             |
| ---------------- | ----------- | ---------------------------------------------------------------- |
| `brick-50`     | `#F8E7E1` | Фон уведомления об ошибке                  |
| `brick-100`    | `#EFC7BB` | Светлая заливка                                    |
| `brick-400`    | `#C05A44` | Hover                                                            |
| `brick-500` ★ | `#A63A2A` | Кнопка «Сбросить», удаление              |
| `brick-600`    | `#892C20` | Нажатое состояние                                |
| `brick-700`    | `#6C2018` | Текст на светлой кирпичной заливке |

### Хвойный — вспомогательный

Единственный вспомогательный акцент.

| Токен      | HEX         | Назначение                                         |
| --------------- | ----------- | ------------------------------------------------------------ |
| `pine-50`     | `#E9EFE4` | Фон тега/статуса «онлайн»              |
| `pine-400`    | `#6E8A5E` | Hover                                                        |
| `pine-500` ★ | `#4B6440` | Акцентная кнопка, теги, статусы    |
| `pine-600`    | `#38502F` | Текст на светлой хвойной заливке |

### Семантика

Статусы, подстроенные под тёплую гамму.

| Роль    | Основной              | Светлый фон | Текст на фоне |
| ----------- | ----------------------------- | --------------------- | ------------------------ |
| `success` | `#4B7A4E`                   | `#E9F0E6`           | `#2E5233`              |
| `warning` | `#C0892A`                   | `#F8ECD2`           | `#7A5410`              |
| `danger`  | `#A63A2A` _(= brick-500)_ | `#F8E7E1`           | `#6C2018`              |
| `info`    | `#3E6B8A`                   | `#E4EDF2`           | `#234459`              |

### Прозрачности и оверлеи

Полупрозрачные тона на базе `#1A1A1A` (`black`) и `#F6E6D7` (`cream`). HEX — восьмизначный (с альфа-каналом); в SCSS выражаются через `rgba()`.

| Токен                    | HEX           | Назначение                                             |
| ------------------------ | ------------- | ------------------------------------------------------ |
| `transparent`          | `#00000000` | Полностью прозрачный (сброс фона)     |
| `overlay-50`           | `#1A1A1A80` | Лёгкое затемнение                            |
| `overlay-55`           | `#1A1A1A8C` | Затемнение под модалкой / дровером |
| `overlay-85`           | `#1A1A1AD9` | Глубокое затемнение                        |
| `overlay-95`           | `#1A1A1AF2` | Почти сплошное затемнение              |
| `shadow-dark-80`       | `#1A1A1ACC` | Тёмная тень                                    |
| `text-inverse-subtle`  | `#F6E6D7B8` | Приглушённый текст на тёмном       |
| `text-inverse-muted`   | `#F6E6D7CC` | Вторичный текст на тёмном             |
| `text-inverse-strong`  | `#F6E6D7E6` | Основной текст на тёмном (усиленный) |
| `border-inverse-faint` | `#F6E6D71A` | Слабая граница на тёмном               |

---

## 2. Типографика

Пара шрифтов: **Alegreya** для заголовков и **Alegreya Sans** для текста и интерфейса. Alegreya — литературная антиква под длинное чтение: заголовки получают
тёплый каллиграфический характер, а парный Alegreya Sans держит тексты и UI лёгкими. Одно суперсемейство, кириллица родная у обоих, лицензия OFL (бесплатно,
можно самохостить). `JetBrains Mono` — под числа, версии и пути.

### 2.1 Шрифты

| Роль                   | Стек                                      | Назначение               |
| -------------------------- | --------------------------------------------- | ---------------------------------- |
| Serif (заголовки) | `"Alegreya", Georgia, serif`                | h1–h4                             |
| Sans (текст, UI)      | `"Alegreya Sans", system-ui, sans-serif`    | t1–t4, l1–l4                     |
| Mono                       | `"JetBrains Mono", ui-monospace, monospace` | Числа, версии, пути |

### 2.2 Начертания

| Вес        | Шрифт    | Где                                                  |
| ------------- | ------------- | ------------------------------------------------------- |
| 400 Regular   | Alegreya Sans | t1–t4 (весь текст)                            |
| 500 Medium    | Alegreya Sans | l1–l4 (лейблы, кнопки, оверлайны) |
| 700 Bold      | Alegreya      | h3–h4                                                  |
| 800 ExtraBold | Alegreya      | h1–h2                                                  |

### 2.3 Шкала (токены)

Три группы: `h` — заголовки, `t` — текст, `l` — лейблы; плюс `mono`. Базовый текст — `t2`, базовый лейбл — `l2` (★). **Все кегли кратны 2.** Интерлиньяж —
безразмерный множитель, масштабируется вместе с кеглем.

| Токен | Шрифт     | Размер | Вес | Интерлиньяж | Трекинг    | Назначение                                              |
| ---------- | -------------- | ------------ | ------ | ---------------------- | ----------------- | ----------------------------------------------------------------- |
| `h1`     | Alegreya       | 52px         | 800    | 1.08                   | −0.01em          | Заголовок главного экрана (hero)           |
| `h2`     | Alegreya       | 42px         | 800    | 1.15                   | —                | Заголовок страницы / крупный раздел |
| `h3`     | Alegreya       | 28px         | 700    | 1.2                    | —                | Раздел                                                      |
| `h4`     | Alegreya       | 20px         | 700    | 1.3                    | —                | Подраздел, заголовок карточки           |
| `t1`     | Alegreya Sans  | 18px         | 400    | 1.6                    | —                | Вводный абзац (lede)                                  |
| `t2` ★  | Alegreya Sans  | 16px         | 400    | 1.65                   | —                | Основной текст                                       |
| `t3`     | Alegreya Sans  | 14px         | 400    | 1.55                   | —                | Второстепенный текст                           |
| `t4`     | Alegreya Sans  | 12px         | 400    | 1.5                    | —                | Сноски, мелкие пояснения                     |
| `l1`     | Alegreya Sans  | 16px         | 500    | 1.4                    | —                | Крупная кнопка, акцентная подпись    |
| `l2` ★  | Alegreya Sans  | 14px         | 500    | 1.4                    | —                | Кнопки, подписи полей                           |
| `l3`     | Alegreya Sans  | 12px         | 500    | 1.35                   | —                | Бейджи, мелкие лейблы                           |
| `l4`     | Alegreya Sans  | 10px         | 500    | 1.4                    | +0.1em, uppercase | Оверлайн-кикер над заголовком           |
| `mono`   | JetBrains Mono | 14px         | 400    | 1.5                    | —                | Версии, пути                                            |

---

## 3. SCSS-переменные

### 3.1 Палитра

```scss
// Нейтрали — пергамент
$parchment-50: #fbf6ee;
$parchment-100: #f7eee1;
$parchment-200: #f2e6d6; // фон страницы
$parchment-300: #ead9c4;
$parchment-400: #dcc7ab;
$parchment-500: #c9b08e;

// Чернила и тёмные тона
$taupe-400: #94856f;
$taupe-600: #6b5f52;
$ink: #2b2a29; // основной текст
$black: #1a1a1a; // тёмные поверхности
$cream: #f6e6d7; // текст на тёмном

// Основной — кожа (brass)
$brass-50: #f3ece3;
$brass-100: #e6d5c3;
$brass-300: #c4a488;
$brass-400: #a5866a;
$brass-500: #8e6c4f; // основная кнопка
$brass-600: #71543c;
$brass-700: #543e2c;

// Гербовый красный — кирпич
$brick-50: #f8e7e1;
$brick-100: #efc7bb;
$brick-400: #c05a44;
$brick-500: #a63a2a; // деструктив
$brick-600: #892c20;
$brick-700: #6c2018;

// Хвойный — вспомогательный
$pine-50: #e9efe4;
$pine-400: #6e8a5e;
$pine-500: #4b6440;
$pine-600: #38502f;

// Семантика
$success: #4b7a4e;
$success-bg: #e9f0e6;
$success-fg: #2e5233;
$warning: #c0892a;
$warning-bg: #f8ecd2;
$warning-fg: #7a5410;
$danger: #a63a2a;
$danger-bg: #f8e7e1;
$danger-fg: #6c2018; // danger = brick-500
$info: #3e6b8a;
$info-bg: #e4edf2;
$info-fg: #234459;

// Прозрачности и оверлеи (на базе $black и $cream)
$transparent: rgba($black, 0); // #00000000 — сброс фона
$overlay-50: rgba($black, 0.5); // #1a1a1a80 — лёгкое затемнение
$overlay-55: rgba($black, 0.55); // #1a1a1a8c — под модалкой / дровером
$overlay-85: rgba($black, 0.85); // #1a1a1ad9 — глубокое затемнение
$overlay-95: rgba($black, 0.95); // #1a1a1af2 — почти сплошное
$shadow-dark-80: rgba($black, 0.8); // #1a1a1acc — тёмная тень
$text-inverse-subtle: rgba($cream, 0.72); // #f6e6d7b8 — приглушённый на тёмном
$text-inverse-muted: rgba($cream, 0.8); // #f6e6d7cc — вторичный на тёмном
$text-inverse-strong: rgba($cream, 0.9); // #f6e6d7e6 — основной на тёмном
$border-inverse-faint: rgba($cream, 0.1); // #f6e6d71a — слабая граница на тёмном
```

### 3.2 Семантические роли

Слой поверх палитры. **В компонентах используйте только эти переменные**, а не сырые `$parchment-*` / `$brass-*`. Подключать после блока 3.1.

```scss
// Поверхности
$surface-page: $parchment-200; // фон страницы
$surface: $parchment-100; // карточки, панели
$surface-raised: $parchment-50; // модалки, поповеры
$surface-sunken: $parchment-300; // инсет, ховер-заливка
$surface-dark: $black; // тёмные секции: шапка, сайдбар, футер
$overlay: $overlay-55; // затемнение под модалкой (шкала $overlay-* в 3.1)
$shadow-dark: $shadow-dark-80; // тёмная тень

// Текст
$text-primary: $ink;
$text-secondary: $taupe-600;
$text-muted: $taupe-400; // подписи, плейсхолдеры
$text-inverse: $cream; // основной текст на тёмном (полная непрозрачность)
// приглушённые градации на тёмном — $text-inverse-{strong,muted,subtle} из 3.1
$text-link: $brass-600;
$text-link-hover: $brass-500;
$text-danger: $brick-700; // инлайн-ошибка
$text-success: $success-fg;

// Границы
$border-subtle: $parchment-400; // мягкая, разделители
$border: $parchment-500; // по умолчанию
$border-focus: $brass-500; // фокус-кольцо
$border-inverse: $border-inverse-faint; // разделитель на тёмном (0.1)

// Кнопка: основная (brass)
$btn-primary-bg: $brass-500;
$btn-primary-bg-hover: $brass-400;
$btn-primary-bg-active: $brass-600;
$btn-primary-text: $cream;
$btn-primary-disabled-bg: rgba($brass-500, 0.28);
$btn-primary-disabled-text: $taupe-400;

// Кнопка: второстепенная (контурная)
$btn-secondary-bg: transparent;
$btn-secondary-border: $parchment-500;
$btn-secondary-text: $brass-600;
$btn-secondary-bg-hover: $parchment-300;

// Кнопка: акцентная (pine)
$btn-accent-bg: $pine-500;
$btn-accent-bg-hover: $pine-400;
$btn-accent-text: $cream;

// Кнопка: деструктивная (brick)
$btn-danger-bg: $brick-500;
$btn-danger-bg-hover: $brick-400;
$btn-danger-bg-active: $brick-600;
$btn-danger-text: $cream;

// Поля ввода и контролы
$input-bg: $parchment-50;
$input-bg-disabled: $parchment-300;
$input-border: $parchment-500;
$input-text: $ink;
$input-placeholder: $taupe-400;
$control-active: $brass-500; // чекбокс / радио / тоггл во вкл.

// Интерактивные состояния
$focus-ring: $brass-500;
$hover-surface: $parchment-300;

// Бейджи / теги
$badge-neutral-bg: $parchment-300;
$badge-neutral-text: $taupe-600;
$badge-online-bg: $pine-50;
$badge-online-text: $pine-600;

// Статусы — берутся напрямую из блока 3.1:
// $success / $success-bg / $success-fg  и аналогично warning / danger / info
```

### 3.3 Типографика

Подключение через Google Fonts; для продакшена — самохостинг через `@fontsource` (`@fontsource/alegreya`, `@fontsource/alegreya-sans`,
`@fontsource/jetbrains-mono`). Использование: `@include h1;`, `@include t2;`, `@include l4;`.

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700;800&family=Alegreya+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

```scss
// Семейства
$font-serif: 'Alegreya', Georgia, serif; // заголовки h1–h4
$font-sans: 'Alegreya Sans', system-ui, sans-serif; // текст t / лейблы l
$font-mono: 'JetBrains Mono', ui-monospace, monospace;

// Начертания
$fw-regular: 400;
$fw-medium: 500;
$fw-bold: 700;
$fw-extrabold: 800;

// Размеры (все кратны 2)
$fs-h1: 52px;
$fs-h2: 42px;
$fs-h3: 28px;
$fs-h4: 20px;
$fs-t1: 18px;
$fs-t2: 16px;
$fs-t3: 14px;
$fs-t4: 12px;
$fs-l1: 16px;
$fs-l2: 14px;
$fs-l3: 12px;
$fs-l4: 10px;
$fs-mono: 14px;

// Заголовки — Alegreya
@mixin h1 {
  font: #{$fw-extrabold} #{$fs-h1}/ 1.08 $font-serif;
  letter-spacing: -0.01em;
}
@mixin h2 {
  font: #{$fw-extrabold} #{$fs-h2}/ 1.15 $font-serif;
}
@mixin h3 {
  font: #{$fw-bold} #{$fs-h3}/ 1.2 $font-serif;
}
@mixin h4 {
  font: #{$fw-bold} #{$fs-h4}/ 1.3 $font-serif;
}

// Текст — Alegreya Sans
@mixin t1 {
  font: #{$fw-regular} #{$fs-t1}/ 1.6 $font-sans;
}
@mixin t2 {
  font: #{$fw-regular} #{$fs-t2}/ 1.65 $font-sans;
}
@mixin t3 {
  font: #{$fw-regular} #{$fs-t3}/ 1.55 $font-sans;
}
@mixin t4 {
  font: #{$fw-regular} #{$fs-t4}/ 1.5 $font-sans;
}

// Лейблы — Alegreya Sans 500
@mixin l1 {
  font: #{$fw-medium} #{$fs-l1}/ 1.4 $font-sans;
}
@mixin l2 {
  font: #{$fw-medium} #{$fs-l2}/ 1.4 $font-sans;
}
@mixin l3 {
  font: #{$fw-medium} #{$fs-l3}/ 1.35 $font-sans;
}
@mixin l4 {
  font: #{$fw-medium} #{$fs-l4}/ 1.4 $font-sans;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

// Моно — JetBrains Mono
@mixin mono {
  font: #{$fw-regular} #{$fs-mono}/ 1.5 $font-mono;
}
```

### 3.4 Отступы и радиусы

Базовый шаг — 4px; для тонкой подгонки допустим 2px. Все значения кратны 2, крупные — кратны 8. Одна шкала на padding / margin / gap.

```scss
// Отступы
$space-2: 2px; // микрозазоры
$space-4: 4px; // иконка ↔ текст
$space-8: 8px; // внутри мелких элементов
$space-12: 12px; // padding кнопок
$space-16: 16px; // базовый отступ, padding карточек
$space-24: 24px; // между блоками секции
$space-32: 32px; // отступы секций
$space-48: 48px; // крупные разделители
$space-64: 64px; // вертикальные отступы страницы

// Радиусы
$radius-4: 4px; // поля ввода, теги
$radius-8: 8px; // кнопки, карточки (по умолчанию)
$radius-12: 12px; // панели, модалки
$radius-16: 16px; // крупные контейнеры, hero-блоки
$radius-full: 999px; // пилюли, круглые аватары
```

---

## 4. Где что использовать

### 4.1 Сайт

**Поверхности.** Фон страницы — `$surface-page`; карточки и панели — `$surface`; модалки и поповеры — `$surface-raised`. Тёмные секции (шапка, футер) —
`$surface-dark`, текст на них — `$text-inverse`.

**Текст.** `h1` — один на экран, в первом блоке; `h2` — заголовок страницы; `h3`/`h4` — разделы и карточки. Вводный абзац — `t1`; основной текст — `t2`;
вторичный и сноски — `t3`/`t4`. Цвета: основной `$text-primary`, вторичный `$text-secondary`, подписи `$text-muted`. Ссылки — `$text-link` (ховер
`$text-link-hover`). Оверлайн-кикер над заголовком — `l4` тоном `$text-muted` (не злоупотреблять).

**Кнопки.** Одна основная (`$btn-primary-*`, текст `l2`/`l1`) на экран; второстепенная контурная — `$btn-secondary-*`; акцентная — `$btn-accent-*`;
деструктивная — `$btn-danger-*`.

**Поля и контролы.** Поля ввода — `$input-*`; активные чекбоксы/радио/тогглы — `$control-active`. Фокус — `$focus-ring`.

**Границы и бейджи.** Мягкие разделители — `$border-subtle`, обычные — `$border`. Нейтральный бейдж — `$badge-neutral-*`; статус «онлайн» — `$badge-online-*`.

### 4.2 Лаунчер

Лаунчер — тот же светлый режим, что и сайт, те же роли.

**Каркас.** Тёмный сайдбар — `$surface-dark`, логотип и текст на нём — `$text-inverse`. Кнопка «Сохранить» — основная (`$btn-primary-*`), «Сбросить» —
деструктивная (`$btn-danger-*`).

**Экран настроек.** Заголовок окна («Настройки») — `h3`; названия секций («Опции», «Java») — `l2`; названия опций — `l2`, пояснения под ними — `t4`; значения
(`Java 8 b8`, путь к директории) — `mono`. Поле пути — `$input-*` (в неактивном виде — `$input-bg-disabled`), кнопка «Сменить директорию» — основная. Активные
чекбоксы — `$control-active`.
