import { Types, Document } from 'mongoose';
export declare class User {
    _id?: Types.ObjectId;
    telegramId: number;
    chatId: number;
    username: string;
    password: string;
    isVerified: boolean;
    lastLogin: Date;
}
export type UserDocument = User & Document;
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & Required<{
    _id: Types.ObjectId;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & Required<{
    _id: Types.ObjectId;
}>>;
