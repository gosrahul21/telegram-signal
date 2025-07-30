// Import the User model
import mongoose from "mongoose";
import { User, UserDocument } from "../models/user";

// Define the UserRepository class
class UserRepository {
  public subscribedUsers: typeof User[] = [];

  constructor() {
    this.fetchSubscribedUsers();
  }
  // Method to add a new user
  async addUser(userData: any) {
    try {
      // Create a new user instance
      if (
        this.subscribedUsers.find(
          ({ chatId }: any) => chatId === userData.chatId
        )
      )
        return;

      const newUser = new User(userData);

      // Save the user to the database
      const savedUser = await newUser.save();
      this.subscribedUsers.push(savedUser.toObject() as any);
      // Return the saved user
      return savedUser.toObject();
    } catch (error) {
      // Handle any errors
      console.error("Error adding user:", error);
      throw error;
    }
  }

  getSubscribedUsers() {
    try {
      return this.subscribedUsers;
    } catch (error) {
      console.error("Get subscribed users:", error);
      throw error;
    }
  }

  private async fetchSubscribedUserFromDb() {
    try {
      return await User.find({}).lean();
    } catch (error) {
      console.error("Get subscribed users:", error);
      throw error;
    }
  }

  // Method to delete a user by their ID
  async deleteUser(chatId: number) {
    try {
      // Delete the user from the database
      const deletedUser = await User.findOneAndDelete({chatId}).lean().lean();
      if(deletedUser){
        this.subscribedUsers = this.subscribedUsers.filter((subscribedUser: any)=>subscribedUser.chatId !== (chatId));
      }
      // Return the deleted user
      return deletedUser;
    } catch (error) {
      // Handle any errors
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Method to update a user's information
  async updateUser(userId: string, updateData: Partial<UserDocument>) {
    try {
      // Update the user's information in the database
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).lean();

      // Return the updated user
      return updatedUser;
    } catch (error) {
      // Handle any errors
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Method to retrieve a user by their ID
  async getUserById(userId: string) {
    try {
      // Retrieve the user from the database
      const user = await User.findById(userId).lean();

      // Return the user
      return user;
    } catch (error) {
      // Handle any errors
      console.error("Error retrieving user:", error);
      throw error;
    }
  }

  // Method to retrieve a user by chatId
  async getUserByChatId(chatId: string) {
    try {
      // Retrieve the user from the database
      const user = await User.findOne({ chatId }).lean();

      // Return the user
      return user;
    } catch (error) {
      // Handle any errors
      console.error("Error retrieving user:", error);
      throw error;
    }
  }

  async fetchSubscribedUsers() {
    const users = await this.fetchSubscribedUserFromDb();
    users.map((user) => this.subscribedUsers.push(user as any));
  }
}

// Export the UserService class
export default new UserRepository();
