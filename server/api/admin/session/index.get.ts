export default defineEventHandler(async (event) => {
    setResponseHeader(event, 'Cache-Control', 'private, no-store');
    requireAdmin(event);

    return getSessionControlStatus(event);
});
