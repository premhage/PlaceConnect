import { Notification } from '../models/Notification.js';

export const createNotification = async ({
  userId,
  title,
  message,
  type = 'general',
  relatedResource = null,
}) => {
  try {
    if (!userId || !title || !message) return null;
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedResource,
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
    return null;
  }
};

export const notifyUsers = async (userIds, { title, message, type, relatedResource }) => {
  try {
    const notifications = userIds.map((userId) => ({
      userId,
      title,
      message,
      type,
      relatedResource,
    }));
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('[NotificationService] Error sending bulk notifications:', error.message);
  }
};
