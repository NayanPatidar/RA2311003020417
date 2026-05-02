const { v4: uuidv4 } = require("uuid");

const db = {
  users: [],
  notifications: [],
};

function getAllUsers() { return db.users; }

function getUserById(id) { return db.users.find((u) => u.id === id) || null; }

function getUserByEmail(email) { return db.users.find((u) => u.email === email) || null; }

function createUser({ name, email, preferences }) {
  const user = {
    id: uuidv4(),
    name,
    email,
    preferences: preferences || { email: true, sms: false, push: true },
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  return user;
}

function updateUser(id, updates) {
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...updates, updatedAt: new Date().toISOString() };
  return db.users[idx];
}

function deleteUser(id) {
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  db.users.splice(idx, 1);
  db.notifications = db.notifications.filter((n) => n.userId !== id);
  return true;
}

function getAllNotifications() { return db.notifications; }

function getNotificationsByUser(userId) {
  return db.notifications.filter((n) => n.userId === userId);
}

function getNotificationById(id) {
  return db.notifications.find((n) => n.id === id) || null;
}

function createNotification({ userId, type, title, body, channel, status }) {
  const notification = {
    id: uuidv4(),
    userId,
    type,
    title,
    body,
    channel: channel || "push",
    status: status || "pending",
    readAt: null,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(notification);
  return notification;
}

function markAsRead(id) {
  const idx = db.notifications.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  db.notifications[idx].status = "read";
  db.notifications[idx].readAt = new Date().toISOString();
  return db.notifications[idx];
}

function updateNotificationStatus(id, status) {
  const idx = db.notifications.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  db.notifications[idx].status = status;
  db.notifications[idx].updatedAt = new Date().toISOString();
  return db.notifications[idx];
}

function deleteNotification(id) {
  const idx = db.notifications.findIndex((n) => n.id === id);
  if (idx === -1) return false;
  db.notifications.splice(idx, 1);
  return true;
}

function getUnreadByUser(userId) {
  return db.notifications.filter((n) => n.userId === userId && n.status !== "read");
}

module.exports = {
  getAllUsers, getUserById, getUserByEmail, createUser, updateUser, deleteUser,
  getAllNotifications, getNotificationsByUser, getNotificationById,
  createNotification, markAsRead, updateNotificationStatus, deleteNotification, getUnreadByUser,
};
