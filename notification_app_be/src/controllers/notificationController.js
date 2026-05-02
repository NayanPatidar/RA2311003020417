const notificationService = require("../services/notificationService");
const { Log } = require("../../../logging_middleware/index");

async function getAllNotifications(req, res) {
  try {
    await Log("backend", "info", "controller", "GET /api/notifications");
    const notifications = await notificationService.getAllNotifications();
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    await Log("backend", "error", "controller", `GET /api/notifications failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getNotificationsByUser(req, res) {
  try {
    const { userId } = req.params;
    await Log("backend", "info", "controller", `GET /api/notifications/user/${userId}`);
    const notifications = await notificationService.getNotificationsByUser(userId);
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    await Log("backend", "error", "controller", `GET notifications by user failed: ${err.message}`);
    res.status(404).json({ success: false, error: err.message });
  }
}

async function getUnreadByUser(req, res) {
  try {
    const { userId } = req.params;
    await Log("backend", "info", "controller", `GET /api/notifications/user/${userId}/unread`);
    const notifications = await notificationService.getUnreadByUser(userId);
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    await Log("backend", "error", "controller", `GET unread notifications failed: ${err.message}`);
    res.status(404).json({ success: false, error: err.message });
  }
}

async function createNotification(req, res) {
  try {
    await Log("backend", "info", "controller", `POST /api/notifications - Body: ${JSON.stringify(req.body)}`);
    const notification = await notificationService.createNotification(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    await Log("backend", "error", "controller", `POST /api/notifications failed: ${err.message}`);
    res.status(400).json({ success: false, error: err.message });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    await Log("backend", "info", "controller", `PUT /api/notifications/${id}/read`);
    const notification = await notificationService.markAsRead(id);
    if (!notification) return res.status(404).json({ success: false, error: "Notification not found" });
    res.json({ success: true, data: notification });
  } catch (err) {
    await Log("backend", "error", "controller", `Mark as read failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    await Log("backend", "info", "controller", `DELETE /api/notifications/${id}`);
    const success = await notificationService.deleteNotification(id);
    if (!success) return res.status(404).json({ success: false, error: "Notification not found" });
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    await Log("backend", "error", "controller", `DELETE notification failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getAllNotifications, getNotificationsByUser, getUnreadByUser,
  createNotification, markAsRead, deleteNotification,
};
