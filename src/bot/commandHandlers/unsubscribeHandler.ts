import userRepository from "../../repositories/userRepository";

// subcribe to the notification
export const unSubscribe = async (ctx: any) => {
  const telegramId = ctx.from.id;
  const chatId = ctx.chat.id;
  // Create a user object

  // Add the user to the database using userService
  try {
    const newUser = await userRepository.deleteUser(chatId);
    if (newUser) ctx.reply(`Unsubscribed successfully`);
    else ctx.reply("user not found");
  } catch (error) {
    ctx.reply(`Error adding user ${telegramId} to the database:`, error);
  }
};
