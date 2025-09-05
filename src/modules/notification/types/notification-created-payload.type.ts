import { Notification } from '../notification.entity';

export type NotificationCreatedPayload = Notification & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};
