export default defineEventHandler(async (event) => {
    setLogsNoStoreHeader(event);
    requireAdmin(event);
    return fetchEconomyAnalytics();
});
