export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Cache-Control', 'private, no-store');
    requireAdmin(event);

    const job = await startSessionOperation(event, { kind: 'stop' });
    setResponseStatus(event, 202);

    return { job };
});
