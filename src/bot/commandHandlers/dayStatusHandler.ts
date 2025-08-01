import { handleStatusByDuration } from "./handleStatusByDuration";

export const dayStatus = async (ctx: any) => {
  await handleStatusByDuration(ctx, "1d");
};
