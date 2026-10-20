import mongoose from "mongoose";
import config from "../config";
import { User, UserDocument, IUser } from "../models/user";

export const DEFAULT_ALERT_TYPES = ["EMA", "RSI", "BB"];

export interface UserPreferences {
  alertTypes: string[];
  subscribedPairs: string[];
}

/**
 * Repository to manage subscribed users, alert preferences, and persistence.
 */
class UserRepository {
  public subscribedUsers: any[] = [];

  constructor() {
    this.fetchSubscribedUsers();
  }

  /**
   * Helper to find a user in memory comparing chatId or telegramId as strings
   */
  private findUserInMemory(chatId: number | string): any | undefined {
    const idStr = String(chatId);
    return this.subscribedUsers.find(
      (u: any) => String(u.chatId) === idStr || String(u.telegramId) === idStr
    );
  }

  /**
   * Add a new subscriber or update an existing one
   */
  async addUser(userData: Partial<IUser>) {
    try {
      const existingUser = this.findUserInMemory(userData.chatId as any);
      if (existingUser) {
        return existingUser;
      }

      // Check DB directly in case in-memory cache was not loaded or is out of sync
      const dbUser = await User.findOne({
        $or: [
          { chatId: userData.chatId },
          { chatId: String(userData.chatId) },
          { telegramId: userData.telegramId },
          { telegramId: Number(userData.telegramId) },
        ],
      }).lean();

      if (dbUser) {
        const userObj: any = {
          ...dbUser,
          chatId: Number(dbUser.chatId) || dbUser.chatId,
          telegramId: Number(dbUser.telegramId) || dbUser.telegramId,
          alertTypes: dbUser.alertTypes && dbUser.alertTypes.length > 0 ? dbUser.alertTypes : DEFAULT_ALERT_TYPES,
          subscribedPairs: dbUser.subscribedPairs && dbUser.subscribedPairs.length > 0 ? dbUser.subscribedPairs : config.BINANCE_KEY_PAIRS,
        };
        this.subscribedUsers.push(userObj);
        return userObj;
      }

      const defaultData = {
        ...userData,
        chatId: Number(userData.chatId) || userData.chatId,
        alertTypes: userData.alertTypes && userData.alertTypes.length > 0 ? userData.alertTypes : DEFAULT_ALERT_TYPES,
        subscribedPairs: userData.subscribedPairs && userData.subscribedPairs.length > 0 ? userData.subscribedPairs : config.BINANCE_KEY_PAIRS,
      };

      const newUser = new User(defaultData);
      const savedUser = await newUser.save();
      const userObj = savedUser.toObject();
      this.subscribedUsers.push(userObj);
      return userObj;
    } catch (error: any) {
      if (error?.code === 11000) {
        const dbUser = await User.findOne({
          $or: [
            { chatId: userData.chatId },
            { chatId: String(userData.chatId) },
            { telegramId: userData.telegramId },
            { telegramId: Number(userData.telegramId) },
          ],
        }).lean();
        if (dbUser) {
          const userObj = { ...dbUser };
          this.subscribedUsers.push(userObj);
          return userObj;
        }
      }
      console.error("Error adding user:", error);
      throw error;
    }
  }

  /**
   * Get all subscribed users
   */
  getSubscribedUsers(): any[] {
    return this.subscribedUsers;
  }

  /**
   * Filter subscribed users who have BOTH the given alertType and symbol enabled
   */
  getSubscribedUsersFor(symbol: string, alertType: "EMA" | "RSI" | "BB"): any[] {
    const normSymbol = symbol.toUpperCase();
    const normAlert = alertType.toUpperCase();

    return this.subscribedUsers.filter((user: any) => {
      const alertTypes: string[] =
        user.alertTypes !== undefined && user.alertTypes.length > 0
          ? user.alertTypes
          : DEFAULT_ALERT_TYPES;

      const pairs: string[] =
        user.subscribedPairs !== undefined && user.subscribedPairs.length > 0
          ? user.subscribedPairs
          : config.BINANCE_KEY_PAIRS;

      const hasAlert = alertTypes.some(
        (t) => t.toUpperCase() === normAlert
      );
      const hasSymbol = pairs.some(
        (p) => p.toUpperCase() === normSymbol
      );

      return hasAlert && hasSymbol;
    });
  }

  /**
   * Retrieve preferences for a given user
   */
  getUserPreferences(chatId: number | string): UserPreferences {
    const user = this.findUserInMemory(chatId);
    if (!user) {
      return {
        alertTypes: [...DEFAULT_ALERT_TYPES],
        subscribedPairs: [...config.BINANCE_KEY_PAIRS],
      };
    }

    return {
      alertTypes:
        user.alertTypes !== undefined && user.alertTypes.length > 0
          ? [...user.alertTypes]
          : [...DEFAULT_ALERT_TYPES],
      subscribedPairs:
        user.subscribedPairs !== undefined && user.subscribedPairs.length > 0
          ? [...user.subscribedPairs]
          : [...config.BINANCE_KEY_PAIRS],
    };
  }

  private async persistUser(chatId: number | string, update: any): Promise<void> {
    try {
      if (mongoose.connection.readyState === 1) {
        await User.findOneAndUpdate(
          {
            $or: [
              { chatId: Number(chatId) },
              { chatId: String(chatId) },
              { telegramId: Number(chatId) },
            ],
          },
          update,
          { new: true }
        );
      }
    } catch (err) {
      console.error(`Failed to persist user preferences for ${chatId}:`, err);
    }
  }

  /**
   * Toggle an alert type (e.g., 'EMA', 'RSI', 'BB') for a user
   */
  async toggleAlertType(chatId: number | string, alertType: string): Promise<boolean> {
    const normAlert = alertType.toUpperCase();
    let user = this.findUserInMemory(chatId);

    if (!user) {
      user = {
        chatId: Number(chatId) || chatId,
        telegramId: Number(chatId) || chatId,
        username: `user_${chatId}`,
        alertTypes: [...DEFAULT_ALERT_TYPES],
        subscribedPairs: [...config.BINANCE_KEY_PAIRS],
      };
      this.subscribedUsers.push(user);
    }

    let alertTypes: string[] = user.alertTypes && user.alertTypes.length > 0 ? [...user.alertTypes] : [...DEFAULT_ALERT_TYPES];
    const exists = alertTypes.some((t) => t.toUpperCase() === normAlert);

    if (exists) {
      alertTypes = alertTypes.filter((t) => t.toUpperCase() !== normAlert);
    } else {
      alertTypes.push(normAlert);
    }

    user.alertTypes = alertTypes;
    await this.persistUser(chatId, { alertTypes });
    return !exists;
  }

  /**
   * Toggle a symbol (e.g., 'BTCUSDT', 'SOLUSDT') for a user
   */
  async toggleSymbol(chatId: number | string, symbol: string): Promise<boolean> {
    const normSymbol = symbol.toUpperCase();
    let user = this.findUserInMemory(chatId);

    if (!user) {
      user = {
        chatId: Number(chatId) || chatId,
        telegramId: Number(chatId) || chatId,
        username: `user_${chatId}`,
        alertTypes: [...DEFAULT_ALERT_TYPES],
        subscribedPairs: [...config.BINANCE_KEY_PAIRS],
      };
      this.subscribedUsers.push(user);
    }

    let pairs: string[] = user.subscribedPairs && user.subscribedPairs.length > 0 ? [...user.subscribedPairs] : [...config.BINANCE_KEY_PAIRS];
    const exists = pairs.some((p) => p.toUpperCase() === normSymbol);

    if (exists) {
      pairs = pairs.filter((p) => p.toUpperCase() !== normSymbol);
    } else {
      pairs.push(normSymbol);
    }

    user.subscribedPairs = pairs;
    await this.persistUser(chatId, { subscribedPairs: pairs });
    return !exists;
  }

  /**
   * Set specific alert type status
   */
  async setAlertType(chatId: number | string, alertType: string, enabled: boolean): Promise<void> {
    const normAlert = alertType.toUpperCase();
    let user = this.findUserInMemory(chatId);
    if (!user) {
      user = {
        chatId: Number(chatId) || chatId,
        telegramId: Number(chatId) || chatId,
        username: `user_${chatId}`,
        alertTypes: [...DEFAULT_ALERT_TYPES],
        subscribedPairs: [...config.BINANCE_KEY_PAIRS],
      };
      this.subscribedUsers.push(user);
    }

    let alertTypes: string[] = user.alertTypes && user.alertTypes.length > 0 ? [...user.alertTypes] : [...DEFAULT_ALERT_TYPES];
    alertTypes = alertTypes.filter((t) => t.toUpperCase() !== normAlert);
    if (enabled) {
      alertTypes.push(normAlert);
    }

    user.alertTypes = alertTypes;
    await this.persistUser(chatId, { alertTypes });
  }

  /**
   * Set specific symbol status
   */
  async setSymbol(chatId: number | string, symbol: string, enabled: boolean): Promise<void> {
    const normSymbol = symbol.toUpperCase();
    let user = this.findUserInMemory(chatId);
    if (!user) {
      user = {
        chatId: Number(chatId) || chatId,
        telegramId: Number(chatId) || chatId,
        username: `user_${chatId}`,
        alertTypes: [...DEFAULT_ALERT_TYPES],
        subscribedPairs: [...config.BINANCE_KEY_PAIRS],
      };
      this.subscribedUsers.push(user);
    }

    let pairs: string[] = user.subscribedPairs && user.subscribedPairs.length > 0 ? [...user.subscribedPairs] : [...config.BINANCE_KEY_PAIRS];
    pairs = pairs.filter((p) => p.toUpperCase() !== normSymbol);
    if (enabled) {
      pairs.push(normSymbol);
    }

    user.subscribedPairs = pairs;
    await this.persistUser(chatId, { subscribedPairs: pairs });
  }

  /**
   * Enable all alerts and symbols for a user
   */
  async enableAll(chatId: number | string): Promise<void> {
    let user = this.findUserInMemory(chatId);
    if (!user) {
      user = {
        chatId: Number(chatId) || chatId,
        telegramId: Number(chatId) || chatId,
        username: `user_${chatId}`,
        alertTypes: [...DEFAULT_ALERT_TYPES],
        subscribedPairs: [...config.BINANCE_KEY_PAIRS],
      };
      this.subscribedUsers.push(user);
    }

    user.alertTypes = [...DEFAULT_ALERT_TYPES];
    user.subscribedPairs = [...config.BINANCE_KEY_PAIRS];

    await this.persistUser(chatId, { alertTypes: user.alertTypes, subscribedPairs: user.subscribedPairs });
  }

  /**
   * Disable all alerts and symbols for a user
   */
  async disableAll(chatId: number | string): Promise<void> {
    let user = this.findUserInMemory(chatId);
    if (!user) {
      user = {
        chatId: Number(chatId) || chatId,
        telegramId: Number(chatId) || chatId,
        username: `user_${chatId}`,
        alertTypes: [],
        subscribedPairs: [],
      };
      this.subscribedUsers.push(user);
    }

    user.alertTypes = [];
    user.subscribedPairs = [];

    await this.persistUser(chatId, { alertTypes: [], subscribedPairs: [] });
  }

  /**
   * Delete a subscriber
   */
  async deleteUser(chatId: number | string) {
    try {
      const deletedUser = await User.findOneAndDelete({
        $or: [
          { chatId: Number(chatId) },
          { chatId: String(chatId) },
          { telegramId: Number(chatId) },
        ],
      }).lean();
      const idStr = String(chatId);
      this.subscribedUsers = this.subscribedUsers.filter(
        (u: any) => String(u.chatId) !== idStr && String(u.telegramId) !== idStr
      );
      return deletedUser;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  async updateUser(userId: string, updateData: Partial<UserDocument>) {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).lean();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      return await User.findById(userId).lean();
    } catch (error) {
      console.error("Error retrieving user:", error);
      throw error;
    }
  }

  async getUserByChatId(chatId: number | string) {
    try {
      return await User.findOne({
        $or: [
          { chatId: Number(chatId) },
          { chatId: String(chatId) },
          { telegramId: Number(chatId) },
        ],
      }).lean();
    } catch (error) {
      console.error("Error retrieving user:", error);
      throw error;
    }
  }

  private async fetchSubscribedUserFromDb() {
    try {
      if (mongoose.connection.readyState === 1) {
        return await User.find({}).lean();
      }
      return [];
    } catch (error) {
      console.error("Get subscribed users:", error);
      return [];
    }
  }

  async fetchSubscribedUsers() {
    const users = await this.fetchSubscribedUserFromDb();
    if (users && users.length > 0) {
      this.subscribedUsers = users.map((u: any) => ({
        ...u,
        chatId: Number(u.chatId) || u.chatId,
        telegramId: Number(u.telegramId) || u.telegramId,
        alertTypes: u.alertTypes && u.alertTypes.length > 0 ? u.alertTypes : DEFAULT_ALERT_TYPES,
        subscribedPairs: u.subscribedPairs && u.subscribedPairs.length > 0 ? u.subscribedPairs : config.BINANCE_KEY_PAIRS,
      }));
      console.log(`[UserRepository] Loaded ${this.subscribedUsers.length} subscribed users from database`);
    }
  }
}

export default new UserRepository();
