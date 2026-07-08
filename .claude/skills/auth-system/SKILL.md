---
name: auth-system
description: >-
  Справка по системе авторизации этого проекта (session-based auth на
  Nuxt/Nitro + Prisma/PostgreSQL). Читай ПЕРЕД любой работой, связанной с
  аутентификацией: логин, логаут, сессии, cookie, middleware, защита роутов,
  регистрация, восстановление/сброс пароля. Описывает модели БД, все эндпоинты
  auth, middleware, хелперы, константы и типы, а также правила безопасности,
  принятые в проекте.
---
# Система авторизации проекта

Авторизация **session-based**: сервер хранит сессии в БД, а браузеру отдаёт
httpOnly-cookie с id сессии. На каждый запрос middleware по cookie находит
сессию и кладёт пользователя в `event.context`.

## Модели БД (`server/database/schema.prisma`)

- **User** — `id`, `email` (`@unique`), `password` (bcrypt-хэш, тип `String`),
  `role` (`UserRole`: `USER`/`ADMIN`), `resetToken` (`@unique`, nullable),
  `resetTokenExpiry` (nullable), связи `sessions`, `characters`, `discordAccount`.
- **Session** — `id` (`String @default(cuid())` — это значение и есть секрет
  в cookie), `expiresAt`, `createdAt`, `userId` (`onDelete: Cascade`).
  Индексы `@@index([userId])` и `@@index([expiresAt])`.

Пароли хранятся **только как bcrypt-хэш** (`bcrypt.hash(pw, 10)`), тип поля —
обычный `String`, менять его не нужно.

## Эндпоинты (`server/api/auth/`)

| Файл                    | Метод/маршрут          | Назначение                                                                                                                                           |
| --------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `register.post.ts`        | `POST /api/auth/register`        | регистрация: валидация, проверка уникальности email, хэш пароля, создание юзера                  |
| `login.post.ts`           | `POST /api/auth/login`           | вход:`bcrypt.compare`, создание `Session`, установка cookie                                                                           |
| `logout.post.ts`          | `POST /api/auth/logout`          | выход: удаление текущей сессии (id из`event.context.session`), стирание cookie, идемпотентен                 |
| `forgot-password.post.ts` | `POST /api/auth/forgot-password` | генерация reset-токена (`randomBytes` из `node:crypto`) + срок; отправка письма — TODO (SMTP не настроен)    |
| `reset-password.post.ts`  | `POST /api/auth/reset-password`  | смена пароля по токену: проверка срока, хэш, гашение токена, удаление всех сессий юзера |

## Middleware (`server/middleware/auth.ts`)

Выполняется Nitro **на каждый запрос**. Логика:

1. читает cookie `SESSION_COOKIE`; нет — `return` (аноним, ошибку НЕ кидает);
2. ищет `Session` по id вместе с `user`;
3. сессии нет → стирает битую cookie, `return`;
4. `expiresAt < now` → удаляет протухшую сессию (lazy cleanup), стирает cookie, `return`;
5. иначе кладёт `event.context.user` и `event.context.session`.

Middleware только **опознаёт** юзера. **Требование** авторизации — на уровне
эндпоинта через `requireUser`.

## Хелперы, константы, типы

- `server/utils/auth.ts` → **`requireUser(event)`** — возвращает юзера из
  контекста или кидает `401 UNAUTHORIZED`. Использовать в защищённых эндпоинтах.
- `server/constants/auth.ts` → `AUTH_STATUSES` (тексты ошибок),
  `SESSION_COOKIE` (`'sessionid'`), `SESSION_MAX_AGE` (7 дней, сек),
  `RESET_TOKEN_MAX_AGE` (1 час, сек).
- `server/types/auth.ts` → `IAuthBody`, `IResetPasswordBody`, `ISafeUser`,
  `ISessionContext`, и **аугментация `H3EventContext`** (`user?`, `session?`).

## Параметры cookie сессии (login)

`httpOnly: true`, `secure: !import.meta.dev`, `sameSite: 'lax'`, `path: '/'`,
`maxAge: SESSION_MAX_AGE`. При стирании (`deleteCookie`) `path` должен совпадать.

## Правила безопасности (соблюдать всегда)

- **Единый ответ при неоднозначности:** неверный логин ИЛИ несуществующий email →
  одинаковая ошибка `INVALID_DATA`; `forgot-password` всегда возвращает
  `{ success: true }` независимо от наличия email (защита от user enumeration).
- **Сессия/токен — секреты:** id сессии только в httpOnly-cookie; reset-токен
  криптослучайный (`node:crypto`, не `Math.random`), короткоживущий, одноразовый
  (гасится после использования).
- **Смена пароля инвалидирует все сессии** юзера
  (`session.deleteMany({ where: { userId } })`).
- **Не возвращать наружу** хэш пароля — в `select` перечисляй безопасные поля.
- **Атомарность:** связанные записи в security-операциях (смена пароля +
  удаление сессий) оборачивать в `prisma.$transaction`.

## Известные TODO / улучшения

- Отправка писем в `forgot-password` (нужен SMTP / внешний сервис).
- Периодическая чистка протухших сессий (Nitro scheduled task +
  `deleteMany({ where: { expiresAt: { lt: now } } })`).
- Опционально: хранить в БД хэш reset-токена, а не сам токен.
