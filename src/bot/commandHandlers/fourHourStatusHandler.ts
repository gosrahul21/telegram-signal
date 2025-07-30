import { handleStatusByDuration } from "./handleStatusByDuration";

export const fourHourStatus = async (ctx: any) => {
    await handleStatusByDuration(ctx, "4h", undefined);
};