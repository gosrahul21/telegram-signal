import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: CreateUserDto): Promise<UserDocument> {
    const user = await this.userModel.create(userData);
    return user.toJSON() as UserDocument;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).lean();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).lean();
  }

  async findByTelegramId(telegramId: number): Promise<UserDocument | null> {
    return this.userModel.findOne({ telegramId }).lean();
  }

  async findByChatId(chatId: number): Promise<UserDocument | null> {
    return this.userModel.findOne({ chatId }).lean();
  }

  async update(id: string, updateData: Partial<User>): Promise<UserDocument> {
    const user = await this.findById(id);

    // Hash password if it's being updated
    if (updateData.password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    Object.assign(user, updateData);
    return user.save();
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await user.deleteOne();
  }

  async linkTelegramAccount(
    userId: string,
    telegramId: number,
    chatId: number,
  ): Promise<UserDocument> {
    // Check if telegramId is already linked to another user
    const existingUserWithTelegram = await this.findByTelegramId(telegramId);
    if (
      existingUserWithTelegram &&
      existingUserWithTelegram._id.toString() !== userId
    ) {
      throw new ConflictException(
        'Telegram ID is already linked to another user',
      );
    }

    // Check if chatId is already linked to another user
    const existingUserWithChat = await this.findByChatId(chatId);
    if (
      existingUserWithChat &&
      existingUserWithChat._id.toString() !== userId
    ) {
      throw new ConflictException('Chat ID is already linked to another user');
    }

    // Update the user with telegram information
    const user = await this.findById(userId);
    user.telegramId = telegramId;
    user.chatId = chatId;
    user.isVerified = true; // Mark as verified since they linked their telegram
    user.lastLogin = new Date();

    return user.save();
  }

  async verifyUser(userId: string): Promise<UserDocument> {
    const user = await this.findById(userId);
    user.isVerified = true;
    return user.save();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        lastLogin: new Date(),
      })
      .exec();
  }
}
