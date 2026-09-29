/**
 * Создаёт симлинки `storage/active/<uuid>.png` для всех персонажей с активным
 * скином. Нужен после миграции `active_skin`: SQL проставляет `activeSkinId`,
 * а файлы для лаунчера создать не может. Повторный запуск безопасен.
 *
 * Запуск: `bun run skins:link`.
 */
import process from 'node:process';

import { prisma } from '~~/server/utils/prisma';
import { linkActiveSkin } from '~~/server/utils/skins';

const characters = await prisma.character.findMany({
    where: { activeSkin: { isNot: null } },
    select: { uuid: true, username: true, activeSkin: { select: { hash: true } } },
});

let failed = 0;

for (const { uuid, username, activeSkin } of characters) {
    try {
        await linkActiveSkin(uuid, activeSkin!.hash);
    } catch (error) {
        failed++;
        console.error(`Не удалось создать симлинк для «${username}» (${uuid}):`, error);
    }
}

console.log(`Симлинков создано: ${characters.length - failed} из ${characters.length}`);

await prisma.$disconnect();
process.exit(failed ? 1 : 0);
