const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// GET    /api/users       - Get all users
// POST   /api/users       - Create user
// GET    /api/users/:id   - Get user by ID
// PUT    /api/users/:id   - Update user
// DELETE /api/users/:id   - Delete user

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
