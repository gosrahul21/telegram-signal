"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_entity_1 = require("./entities/user.entity");
let UserService = class UserService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(userData) {
        const user = await this.userModel.create(userData);
        return user.toJSON();
    }
    async findAll() {
        return this.userModel.find().exec();
    }
    async findById(id) {
        const user = await this.userModel.findById(id).lean();
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByUsername(username) {
        return this.userModel.findOne({ username }).lean();
    }
    async findByTelegramId(telegramId) {
        return this.userModel.findOne({ telegramId }).lean();
    }
    async findByChatId(chatId) {
        return this.userModel.findOne({ chatId }).lean();
    }
    async update(id, updateData) {
        const user = await this.findById(id);
        if (updateData.password) {
            const bcrypt = await Promise.resolve().then(() => require('bcryptjs'));
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        Object.assign(user, updateData);
        return user.save();
    }
    async remove(id) {
        const user = await this.findById(id);
        await user.deleteOne();
    }
    async linkTelegramAccount(userId, telegramId, chatId) {
        const existingUserWithTelegram = await this.findByTelegramId(telegramId);
        if (existingUserWithTelegram &&
            existingUserWithTelegram._id.toString() !== userId) {
            throw new common_1.ConflictException('Telegram ID is already linked to another user');
        }
        const existingUserWithChat = await this.findByChatId(chatId);
        if (existingUserWithChat &&
            existingUserWithChat._id.toString() !== userId) {
            throw new common_1.ConflictException('Chat ID is already linked to another user');
        }
        const user = await this.findById(userId);
        user.telegramId = telegramId;
        user.chatId = chatId;
        user.isVerified = true;
        user.lastLogin = new Date();
        return user.save();
    }
    async verifyUser(userId) {
        const user = await this.findById(userId);
        user.isVerified = true;
        return user.save();
    }
    async updateLastLogin(userId) {
        await this.userModel
            .findByIdAndUpdate(userId, {
            lastLogin: new Date(),
        })
            .exec();
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserService);
//# sourceMappingURL=user.service.js.map