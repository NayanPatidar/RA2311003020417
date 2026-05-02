const userService = require("../services/userService");
const { Log } = require("../../../logging_middleware/index");

async function getAllUsers(req, res) {
  try {
    await Log("backend", "info", "controller", "GET /api/users");
    const users = await userService.getAllUsers();
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    await Log("backend", "error", "controller", `GET /api/users failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    await Log("backend", "error", "controller", `GET user by ID failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function createUser(req, res) {
  try {
    await Log("backend", "info", "controller", `POST /api/users - Creating user: ${req.body.email}`);
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    await Log("backend", "error", "controller", `POST /api/users failed: ${err.message}`);
    res.status(400).json({ success: false, error: err.message });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    await Log("backend", "info", "controller", `PUT /api/users/${id}`);
    const user = await userService.updateUser(id, req.body);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    await Log("backend", "error", "controller", `PUT /api/users failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await Log("backend", "info", "controller", `DELETE /api/users/${id}`);
    const success = await userService.deleteUser(id);
    if (!success) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    await Log("backend", "error", "controller", `DELETE /api/users failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
