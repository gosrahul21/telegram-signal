import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

// Define the User schema
@Schema({ timestamps: true })
export class User {
  _id?: Types.ObjectId;

  @Prop({ required: false, unique: true, sparse: true, default: null })
  telegramId: number;

  @Prop({ required: false, unique: true, sparse: true, default: null })
  chatId: number;

  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: Date.now })
  lastLogin: Date;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
