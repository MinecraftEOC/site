import type { IMinecraftStatus } from '~~/server/common/@types/server-status';

import { Buffer } from 'node:buffer';
import { connect } from 'node:net';

import {
    HANDSHAKE_NEXT_STATE_STATUS,
    HANDSHAKE_PACKET_ID,
    MINECRAFT_PROTOCOL_VERSION,
    STATUS_ERRORS,
    STATUS_MAX_RESPONSE_SIZE,
    STATUS_PACKET_ID,
    STATUS_PING_TIMEOUT,
    VARINT_MAX_BYTES,
} from '~~/server/common/constants/server-status';

/** Позиция в буфере после прочитанного VarInt вместе с его значением. */
interface IVarInt {
    /** Значение числа. */
    value: number;
    /** Индекс первого байта за VarInt. */
    offset: number;
}

/**
 * Кодирует число в VarInt — формат целых чисел протокола Minecraft.
 *
 * @param value Число для кодирования.
 * @returns Буфер длиной от 1 до 5 байт.
 */
function writeVarInt(value: number) {
    const bytes: number[] = [];
    let rest = value;

    do {
        let byte = rest & 0x7F;
        rest >>>= 7;

        if (rest !== 0) {
            byte |= 0x80;
        }

        bytes.push(byte);
    } while (rest !== 0);

    return Buffer.from(bytes);
}

/**
 * Читает VarInt из буфера.
 *
 * @param buffer Буфер с ответом сервера.
 * @param offset Индекс первого байта VarInt.
 * @returns Значение и позиция за ним или `null`, если байты ещё не дочитаны.
 * @throws Error если VarInt длиннее пяти байт.
 */
function readVarInt(buffer: Buffer, offset: number): IVarInt | null {
    let value = 0;

    for (let index = 0; index < VARINT_MAX_BYTES; index += 1) {
        const position = offset + index;

        if (position >= buffer.length) {
            return null;
        }

        const byte = buffer[position]!;
        value |= (byte & 0x7F) << (7 * index);

        if ((byte & 0x80) === 0) {
            return { value, offset: position + 1 };
        }
    }

    throw new Error(STATUS_ERRORS.MALFORMED_VARINT);
}

/**
 * Кодирует строку в формат протокола: длина VarInt плюс UTF-8.
 *
 * @param value Строка для кодирования.
 * @returns Буфер со строкой.
 */
function writeString(value: string) {
    const encoded = Buffer.from(value, 'utf8');

    return Buffer.concat([writeVarInt(encoded.length), encoded]);
}

/**
 * Оборачивает тело пакета в кадр протокола: длина, id, данные.
 *
 * @param id Id пакета.
 * @param payload Тело пакета.
 * @returns Готовый к отправке пакет.
 */
function framePacket(id: number, payload: Buffer) {
    const body = Buffer.concat([writeVarInt(id), payload]);

    return Buffer.concat([writeVarInt(body.length), body]);
}

/**
 * Собирает handshake и запрос статуса — сервер ждёт их одним потоком.
 *
 * @param host Адрес сервера, каким его «видит» клиент.
 * @param port Порт сервера.
 * @returns Буфер с двумя пакетами подряд.
 */
function buildRequest(host: string, port: number) {
    const portBytes = Buffer.alloc(2);
    portBytes.writeUInt16BE(port);

    const handshake = framePacket(HANDSHAKE_PACKET_ID, Buffer.concat([
        writeVarInt(MINECRAFT_PROTOCOL_VERSION),
        writeString(host),
        portBytes,
        writeVarInt(HANDSHAKE_NEXT_STATE_STATUS),
    ]));

    return Buffer.concat([handshake, framePacket(STATUS_PACKET_ID, Buffer.alloc(0))]);
}

/**
 * Разбирает накопленный ответ сервера.
 *
 * @param buffer Всё, что пришло в сокет к этому моменту.
 * @returns Статус сервера или `null`, если пакет пришёл не целиком.
 * @throws Error если id пакета не совпал с ожидаемым.
 */
function parseResponse(buffer: Buffer): IMinecraftStatus | null {
    const length = readVarInt(buffer, 0);

    if (!length || buffer.length < length.offset + length.value) {
        return null;
    }

    const packetId = readVarInt(buffer, length.offset);

    if (!packetId) {
        return null;
    }

    if (packetId.value !== STATUS_PACKET_ID) {
        throw new Error(STATUS_ERRORS.UNEXPECTED_PACKET);
    }

    const json = readVarInt(buffer, packetId.offset);

    if (!json || buffer.length < json.offset + json.value) {
        return null;
    }

    return JSON.parse(buffer.toString('utf8', json.offset, json.offset + json.value)) as IMinecraftStatus;
}

/**
 * Запрашивает статус игрового сервера по протоколу Server List Ping.
 *
 * @param host Адрес игрового сервера.
 * @param port Игровой порт.
 * @returns Разобранный JSON статуса.
 * @throws Error если сервер недоступен, молчит дольше таймаута или ответил мусором.
 */
export function pingMinecraftServer(host: string, port: number) {
    return new Promise<IMinecraftStatus>((resolve, reject) => {
        const socket = connect({ host, port });

        let received = Buffer.alloc(0);
        let settled = false;

        const finish = (error: Error | null, status?: IMinecraftStatus) => {
            if (settled) {
                return;
            }

            settled = true;
            socket.destroy();

            if (error) {
                reject(error);
            } else {
                resolve(status!);
            }
        };

        socket.setTimeout(STATUS_PING_TIMEOUT);

        socket.on('timeout', () => finish(new Error(STATUS_ERRORS.TIMEOUT)));
        socket.on('error', error => finish(error));
        socket.on('close', () => finish(new Error(STATUS_ERRORS.CLOSED)));

        socket.on('connect', () => socket.write(buildRequest(host, port)));

        socket.on('data', (chunk) => {
            received = Buffer.concat([received, chunk]);

            if (received.length > STATUS_MAX_RESPONSE_SIZE) {
                finish(new Error(STATUS_ERRORS.RESPONSE_TOO_LARGE));

                return;
            }

            try {
                const status = parseResponse(received);

                if (status) {
                    finish(null, status);
                }
            } catch (error) {
                finish(error as Error);
            }
        });
    });
}
