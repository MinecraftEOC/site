import { sessionStartSchema } from '~~/shared/schemas/session-control';

export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Cache-Control', 'private, no-store');
    requireAdmin(event);

    const result = sessionStartSchema.safeParse((await readBody(event)) ?? {});
    if (!result.success) {
        throw createError({
            statusCode: 400,
            message: 'Час начала и длительность должны быть целыми числами от 1 до 24',
        });
    }

    const job = await startSessionOperation(event, { kind: 'start', params: result.data });
    setResponseStatus(event, 202);

    return { job };
});
