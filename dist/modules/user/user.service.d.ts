import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';
export declare class UserService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(userData: CreateUserDto): Promise<UserDocument>;
    findAll(): Promise<UserDocument[]>;
    findById(id: string): Promise<UserDocument>;
    findByUsername(username: string): Promise<UserDocument | null>;
    findByTelegramId(telegramId: number): Promise<UserDocument | null>;
    findByChatId(chatId: number): Promise<UserDocument | null>;
    update(id: string, updateData: Partial<User>): Promise<UserDocument>;
    remove(id: string): Promise<void>;
    linkTelegramAccount(userId: string, telegramId: number, chatId: number): Promise<UserDocument>;
    verifyUser(userId: string): Promise<UserDocument>;
    updateLastLogin(userId: string): Promise<void>;
}
