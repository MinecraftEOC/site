import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

import { sharedCharacterSchema } from '~~/shared/schemas/character';
import { CHARACTER_SKINS_FIELD } from '~/assets/ts/constants/character';

/** Текст ошибки поля скинов — файлы есть только на клиенте, в общей схеме их нет. */
export const SKINS_REQUIRED_ERROR = 'Загрузите хотя бы один скин';

/** Схема формы персонажа: общие правила ручки плюс клиентское поле скинов. */
export const characterFormSchema = toTypedSchema(
    sharedCharacterSchema.extend({
        [CHARACTER_SKINS_FIELD]: z
            .array(z.custom<File>())
            .min(1, SKINS_REQUIRED_ERROR),
    }),
);
