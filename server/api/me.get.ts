export default defineEventHandler(async (event) => {
    return requireUser(event);
});
