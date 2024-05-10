import { Context, NextFunction } from "grammy";
import UserService from "../services/userService";

const userService = new UserService();

export const checkUserDataMiddleware = async (ctx: Context, next: NextFunction) => {

    const from = ctx.from || '';
  
    if (!from) return;
  
    const userData = await userService.getUserByChatId(from.id);
  
    if (
      userData?.username !== from.username ||
      userData?.firstName !== from.first_name ||
      userData?.lastName !== from.last_name
    ) {
      await userService.updateUser(
        from.id,
        from.first_name,
        from.last_name || "",
        from.username || ""
      );
    }
    await next();
  };