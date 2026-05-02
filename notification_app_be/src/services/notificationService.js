const db = require("../db/database");
const { Log } = require("../../../logging_middleware/index");

const VALID_TYPES = ["alert", "reminder", "promotion", "system", "message"];
const VALID_CHANNELS = ["email", "sms", "push"];
const VALID_STATUSES = ["pending", "sent", "read", "failed"];

async function getAllNotifications() {
  await Log("backend", "debug", "service", "Fetching all notifications");
  const notifications = db.getAllNotifications();
  await Log("backend", "info", "service", `Retrieved ${notifications.length} notifications`);
  return notifications;
}

async function getNotificationsByUser(userId) {
  await Log("backend", "debug", "service", `Fetching notifications for user: ${userId}`);
  const user = db.getUserById(userId);
  if (!user) {
    await Log("backend", "warn", "service", `Cannot fetch notifications: user ${userId} not found`);
    throw new Error("User not found");
  }
  const notifications = db.getNotificationsByUser(userId);
  await Log("backend", "info", "service", `Found ${notifications.length} notifications for user: ${userId}`);
  return notifications;
}

async function getUnreadByUser(userId) {
  await Log("backend", "debug", "service", `Fetching unread notifications for user: ${userId}`);
  const user = db.getUserById(userId);
  if (!user) {
    await Log("backend", "warn", "service", `Cannot fetch unread: user ${userId} not found`);
    throw new Error("User not found");
  }
  const unread = db.getUnreadByUser(userId);
  await Log("backend", "info", "service", `User ${userId} has ${unread.length} unread notifications`);
  return unread;
}

async function createNotification(data) {
  const { userId, type, title, body, channel } = data;

  if (!userId || !type || !title || !body) {
    await Log("backend", "error", "service", "Notification creation failed: missing required fields (userId, type, title, body)");
    throw new Error("userId, type, title, and body are required");
  }

  if (!VALID_TYPES.includes(type)) {
    await Log("backend", "error", "service", `Invalid notification type: ${type}`);
    throw new Error(`Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`);
  }

  if (channel && !VALID_CHANNELS.includes(channel)) {
    await Log("backend", "error", "service", `Invalid channel: ${channel}`);
    throw new Error(`Invalid channel. Must be one of: ${VALID_CHANNELS.join(", ")}`);
  }

  const user = db.getUserById(userId);
  if (!user) {
    await Log("backend", "error", "service", `Cannot send notification: user ${userId} does not exist`);
    throw new Error("User not found");
  }

  const preferredChannel = channel || "push";
  if (!user.preferences[preferredChannel]) {
    await Log("backend", "warn", "service", `User ${userId} has disabled ${preferredChannel} notifications, skipping delivery`);
  }

  await Log("backend", "debug", "service", `Creating ${type} notification for user: ${userId} via ${preferredChannel}`);
  const notification = db.createNotification({ userId, type, title, body, channel: preferredChannel, status: "sent" });
  await Log("backend", "info", "service", `Notification created: ID ${notification.id} | Type: ${type} | User: ${userId} | Channel: ${preferredChannel}`);
  return notification;
}

async function markAsRead(id) {
  await Log("backend", "debug", "service", `Marking notification ${id} as read`);
  const notification = db.markAsRead(id);
  if (!notification) {
    await Log("backend", "warn", "service", `Mark as read failed: notification ${id} not found`);
    return null;
  }
  await Log("backend", "info", "service", `Notification ${id} marked as read at ${notification.readAt}`);
  return notification;
}

async function deleteNotification(id) {
  await Log("backend", "debug", "service", `Deleting notification ID: ${id}`);
  const success = db.deleteNotification(id);
  if (!success) {
    await Log("backend", "warn", "service", `Delete failed: notification ${id} not found`);
    return false;
  }
  await Log("backend", "info", "service", `Notification ${id} deleted successfully`);
  return true;
}

module.exports = {
  getAllNotifications, getNotificationsByUser, getUnreadByUser,
  createNotification, markAsRead, deleteNotification,
};
