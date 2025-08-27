import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

// Define the User schema
@Schema({ timestamps: true })
export class User {
  _id?: Types.ObjectId;

  @Prop({ required: false, unique: true, index: true })
  telegramId: number;

  @Prop({ required: false, unique: true, index: true })
  username: string;

  @Prop({ required: true, minlength: 6 })
  password: string;
}

export type UserDocument = Document & User;

export const UserSchema = SchemaFactory.createForClass(User);
