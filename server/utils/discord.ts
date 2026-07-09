import type { IDiscordUserData, TLinkResult } from '~~/server/types/discord';

import { randomInt } from 'node:crypto';

import { DiscordLinkStatus, Prisma } from '~~/generated/prisma/client';
import { VERIFY_CODE_ALPHABET, VERIFY_CODE_LENGTH } from '~~/server/constants/discord';
import { ELinkReasons } from '~~/server/enums/discord';

/**
 * Генерирует криптослучайный код привязки Discord.
 * Символы берутся из {@link VERIFY_CODE_ALPHABET} длиной {@link VERIFY_CODE_LENGTH}.
 *
 * @returns Код привязки (например, `A7K2QF`).
 */
export function generateVerifyCode(): string {
    let code = '';
    for (let i = 0; i < VERIFY_CODE_LENGTH; i++) {
        code += VERIFY_CODE_ALPHABET[randomInt(VERIFY_CODE_ALPHABET.length)];
    }
    return code;
}

/**
 * Привязывает Discord-аккаунт к пользователю сайта по одноразовому коду.
 * Вызывается ботом при обработке команды `/verify`.
 *
 * Проверяет, что код существует, ещё не привязан (`PENDING`) и не протух,
 * а сам Discord не занят другим аккаунтом. Привязка и гашение кода —
 * в одной транзакции (атомарность security-операции).
 *
 * @param rawCode Код, введённый пользователем (нормализуется trim + upper-case).
 * @param discord Данные Discord-пользователя из взаимодействия.
 * @returns Успех с ником либо отказ с причиной {@link ELinkReasons}.
 */
export async function linkDiscordByCode(rawCode: string, discord: IDiscordUserData): Promise<TLinkResult> {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
        return { ok: false, reason: ELinkReasons.INVALID_CODE };
    }

    const account = await prisma.discordAccount.findFirst({
        where: {
            verifyCode: code,
            status: DiscordLinkStatus.PENDING,
            verifyExpiry: { gt: new Date() },
        },
    });

    if (!account) {
        return { ok: false, reason: ELinkReasons.INVALID_CODE };
    }

    const taken = await prisma.discordAccount.findUnique({ where: { discordId: discord.id } });
    if (taken && taken.userId !== account.userId) {
        return { ok: false, reason: ELinkReasons.DISCORD_TAKEN };
    }

    try {
        await prisma.discordAccount.update({
            where: { id: account.id },
            data: {
                discordId: discord.id,
                username: discord.username,
                avatar: discord.avatar,
                status: DiscordLinkStatus.LINKED,
                verifyCode: null,
                verifyExpiry: null,
            },
        });
    }
    catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { ok: false, reason: ELinkReasons.DISCORD_TAKEN };
        }
        throw error;
    }

    return { ok: true, username: discord.username };
}
