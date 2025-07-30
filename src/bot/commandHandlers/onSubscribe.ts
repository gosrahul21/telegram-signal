import userRepository from "../../repositories/userRepository";

// subcribe to the notification
export const onSubscribe = async (ctx: any) => {
    const telegramId = ctx.from.id;
    const chatId = ctx.chat.id;
    // Create a user object
    const user: any = {
      telegramId, // The user's Telegram ID
      username:
        ctx.from.username || ctx.from.first_name + " " + ctx.from.last_name,
      chatId, // The user's chat ID
      // subscriptions: pairName ? [pairName] : fallbackKeyPairs // List of subscriptions (individual or fallback pairs)
    };
    // Add the user to the database using userService
    try {
     const newUser = await userRepository.addUser(user);
      ctx.reply(`Subscribed successfully with ${userRepository.getSubscribedUsers().length} users`);
    } catch (error) {
      ctx.reply(`Error adding user ${telegramId} to the database:`, error);
    }
  };