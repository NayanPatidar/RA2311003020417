const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// GET    /api/notifications                        - Get all notifications
// GET    /api/notifications/user/:userId           - Get by user
// GET    /api/notifications/user/:userId/unread    - Get unread by user
// POST   /api/notifications                        - Create notification
// PUT    /api/notifications/:id/read               - Mark as read
// DELETE /api/notifications/:id                    - Delete notification

router.get("/", notificationController.getAllNotifications);
router.get("/user/:userId", notificationController.getNotificationsByUser);
router.get("/user/:userId/unread", notificationController.getUnreadByUser);
router.post("/", notificationController.createNotification);
router.put("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
