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
   * Add a new subscriber or update an existing one
   */
  async addUser(userData: Partial<IUser>) {
    try {
      const existingUser = this.subscribedUsers.find(
        (u: any) => u.chatId === userData.chatId
      );
      if (existingUser) {
        return existingUser;
      }

      const defaultData = {
        ...userData,
        alertTypes: userData.alertTypes || DEFAULT_ALERT_TYPES,
        subscribedPairs: userData.subscribedPairs || config.BINANCE_KEY_PAIRS,
      };

      const newUser = new User(defaultData);
      const savedUser = await newUser.save();
      const userObj = savedUser.toObject();
      this.subscribedUsers.push(userObj);
      return userObj;
    } catch (error) {
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
        user.alertTypes !== undefined
          ? user.alertTypes
          : DEFAULT_ALERT_TYPES;

      const pairs: string[] =
        user.subscribedPairs !== undefined
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
  getUserPreferences(chatId: number): UserPreferences {
    const user = this.subscribedUsers.find((u: any) => u.chatId === chatId);
    if (!user) {
      return {
        alertTypes: [...DEFAULT_ALERT_TYPES],
        subscribedPairs: [...config.BINANCE_KEY_PAIRS],
      };
    }

    return {
      alertTypes:
        user.alertTypes !== undefined
          ? [...user.alertTypes]
          : [...DEFAULT_ALERT_TYPES],
      subscribedPairs:
        user.subscribedPairs !== undefined
          ? [...user.subscribedPairs]
          : [...config.BINANCE_KEY_PAIRS],
    };
  }

  private async persistUser(chatId: number, update: any): Promise<void> {
    try {
      if (mongoose.connection.readyState === 1) {
        await User.findOneAndUpdate({ chatId }, update, { new: true });
      }
    } catch (err) {
      console.error(`Failed to persist user preferences for ${chatId}:`, err);
    }
  }

  /**
   * Toggle an alert type (e.g., 'EMA', 'RSI', 'BB') for a user
   */
  async toggleAlertType(chatId: number, alertType: string): Promise<boolean> {
    const normAlert = alertType.toUpperCase();
    let user = this.subscribedUsers.find((u: any) => u.chatId === chatId);

    if (!user) {
      user = { chatId, telegramId: chatId, username: `user_${chatId}`, alertTypes: [...DEFAULT_ALERT_TYPES], subscribedPairs: [...config.BINANCE_KEY_PAIRS] };
      this.subscribedUsers.push(user);
    }

    let alertTypes: string[] = user.alertTypes ? [...user.alertTypes] : [...DEFAULT_ALERT_TYPES];
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
  async toggleSymbol(chatId: number, symbol: string): Promise<boolean> {
    const normSymbol = symbol.toUpperCase();
    let user = this.subscribedUsers.find((u: any) => u.chatId === chatId);

    if (!user) {
      user = { chatId, telegramId: chatId, username: `user_${chatId}`, alertTypes: [...DEFAULT_ALERT_TYPES], subscribedPairs: [...config.BINANCE_KEY_PAIRS] };
      this.subscribedUsers.push(user);
    }

    let pairs: string[] = user.subscribedPairs ? [...user.subscribedPairs] : [...config.BINANCE_KEY_PAIRS];
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
  async setAlertType(chatId: number, alertType: string, enabled: boolean): Promise<void> {
    const normAlert = alertType.toUpperCase();
    let user = this.subscribedUsers.find((u: any) => u.chatId === chatId);
    if (!user) {
      user = { chatId, telegramId: chatId, username: `user_${chatId}`, alertTypes: [...DEFAULT_ALERT_TYPES], subscribedPairs: [...config.BINANCE_KEY_PAIRS] };
      this.subscribedUsers.push(user);
    }

    let alertTypes: string[] = user.alertTypes ? [...user.alertTypes] : [...DEFAULT_ALERT_TYPES];
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
  async setSymbol(chatId: number, symbol: string, enabled: boolean): Promise<void> {
    const normSymbol = symbol.toUpperCase();
    let user = this.subscribedUsers.find((u: any) => u.chatId === chatId);
    if (!user) {
      user = { chatId, telegramId: chatId, username: `user_${chatId}`, alertTypes: [...DEFAULT_ALERT_TYPES], subscribedPairs: [...config.BINANCE_KEY_PAIRS] };
      this.subscribedUsers.push(user);
    }

    let pairs: string[] = user.subscribedPairs ? [...user.subscribedPairs] : [...config.BINANCE_KEY_PAIRS];
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
  async enableAll(chatId: number): Promise<void> {
    let user = this.subscribedUsers.find((u: any) => u.chatId === chatId);
    if (!user) {
      user = { chatId, telegramId: chatId, username: `user_${chatId}`, alertTypes: [...DEFAULT_ALERT_TYPES], subscribedPairs: [...config.BINANCE_KEY_PAIRS] };
      this.subscribedUsers.push(user);
    }

    user.alertTypes = [...DEFAULT_ALERT_TYPES];
    user.subscribedPairs = [...config.BINANCE_KEY_PAIRS];

    await this.persistUser(chatId, { alertTypes: user.alertTypes, subscribedPairs: user.subscribedPairs });
  }

  /**
   * Disable all alerts and symbols for a user
   */
  async disableAll(chatId: number): Promise<void> {
    let user = this.subscribedUsers.find((u: any) => u.chatId === chatId);
    if (!user) {
      user = { chatId, telegramId: chatId, username: `user_${chatId}`, alertTypes: [], subscribedPairs: [] };
      this.subscribedUsers.push(user);
    }

    user.alertTypes = [];
    user.subscribedPairs = [];

    await this.persistUser(chatId, { alertTypes: [], subscribedPairs: [] });
  }

  /**
   * Delete a subscriber
   */
  async deleteUser(chatId: number) {
    try {
      const deletedUser = await User.findOneAndDelete({ chatId }).lean();
      if (deletedUser) {
        this.subscribedUsers = this.subscribedUsers.filter(
          (u: any) => u.chatId !== chatId
        );
      }
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
      return await User.findOne({ chatId: Number(chatId) }).lean();
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
      this.subscribedUsers = users;
    }
  }
}

export default new UserRepository();
