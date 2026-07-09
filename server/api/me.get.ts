import type { IMeResponse } from '~~/shared/@types/response';

export default defineEventHandler(async (event): Promise<IMeResponse> => {
    return requireUser(event);
});
