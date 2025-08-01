"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../models/user");
// Define the UserRepository class
class UserRepository {
    constructor() {
        this.subscribedUsers = [];
        this.fetchSubscribedUsers();
    }
    // Method to add a new user
    async addUser(userData) {
        try {
            // Create a new user instance
            if (this.subscribedUsers.find(({ chatId }) => chatId === userData.chatId))
                return;
            const newUser = new user_1.User(userData);
            // Save the user to the database
            const savedUser = await newUser.save();
            this.subscribedUsers.push(savedUser.toObject());
            // Return the saved user
            return savedUser.toObject();
        }
        catch (error) {
            // Handle any errors
            console.error("Error adding user:", error);
            throw error;
        }
    }
    getSubscribedUsers() {
        try {
            return this.subscribedUsers;
        }
        catch (error) {
            console.error("Get subscribed users:", error);
            throw error;
        }
    }
    async fetchSubscribedUserFromDb() {
        try {
            return await user_1.User.find({}).lean();
        }
        catch (error) {
            console.error("Get subscribed users:", error);
            throw error;
        }
    }
    // Method to delete a user by their ID
    async deleteUser(chatId) {
        try {
            // Delete the user from the database
            const deletedUser = await user_1.User.findOneAndDelete({ chatId }).lean().lean();
            if (deletedUser) {
                this.subscribedUsers = this.subscribedUsers.filter((subscribedUser) => subscribedUser.chatId !== (chatId));
            }
            // Return the deleted user
            return deletedUser;
        }
        catch (error) {
            // Handle any errors
            console.error("Error deleting user:", error);
            throw error;
        }
    }
    // Method to update a user's information
    async updateUser(userId, updateData) {
        try {
            // Update the user's information in the database
            const updatedUser = await user_1.User.findByIdAndUpdate(userId, updateData, {
                new: true,
            }).lean();
            // Return the updated user
            return updatedUser;
        }
        catch (error) {
            // Handle any errors
            console.error("Error updating user:", error);
            throw error;
        }
    }
    // Method to retrieve a user by their ID
    async getUserById(userId) {
        try {
            // Retrieve the user from the database
            const user = await user_1.User.findById(userId).lean();
            // Return the user
            return user;
        }
        catch (error) {
            // Handle any errors
            console.error("Error retrieving user:", error);
            throw error;
        }
    }
    // Method to retrieve a user by chatId
    async getUserByChatId(chatId) {
        try {
            // Retrieve the user from the database
            const user = await user_1.User.findOne({ chatId }).lean();
            // Return the user
            return user;
        }
        catch (error) {
            // Handle any errors
            console.error("Error retrieving user:", error);
            throw error;
        }
    }
    async fetchSubscribedUsers() {
        const users = await this.fetchSubscribedUserFromDb();
        users.map((user) => this.subscribedUsers.push(user));
    }
}
// Export the UserService class
exports.default = new UserRepository();
