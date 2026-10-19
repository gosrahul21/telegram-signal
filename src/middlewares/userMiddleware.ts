import { Context, NextFunction } from "grammy";
import userService from "../services/userService";

export const checkUserDataMiddleware = async (
  ctx: Context,
  next: NextFunction
) => {
  const from = ctx.from;

  if (!from) return;

  const userData = await userService.getUserByChatId(from.id);

  if (userData && userData.username !== from.username) {
    await userService.updateUser(String(userData._id || from.id), {
      username: from.username || "",
    } as any);
  }
  await next();
};
