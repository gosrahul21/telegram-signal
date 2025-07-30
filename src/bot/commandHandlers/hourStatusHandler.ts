import { handleStatusByDuration } from "./handleStatusByDuration";

export const hourStatus = async (ctx: any) => {
    await handleStatusByDuration(ctx, "1h", undefined);
  };

