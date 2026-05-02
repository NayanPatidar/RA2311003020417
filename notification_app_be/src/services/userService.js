const db = require("../db/database");
const { Log } = require("../../../logging_middleware/index");

async function getAllUsers() {
  await Log("backend", "debug", "service", "Fetching all users");
  const users = db.getAllUsers();
  await Log("backend", "info", "service", `Retrieved ${users.length} users`);
  return users;
}

async function getUserById(id) {
  await Log("backend", "debug", "service", `Fetching user: ${id}`);
  const user = db.getUserById(id);
  if (!user) {
    await Log("backend", "warn", "service", `User not found: ${id}`);
    return null;
  }
  return user;
}

async function createUser(data) {
  const { name, email, preferences } = data;
  if (!name || !email) {
    await Log("backend", "error", "service", "User creation failed: name and email are required");
    throw new Error("name and email are required");
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    await Log("backend", "warn", "service", `User creation blocked: email ${email} already registered`);
    throw new Error("Email already in use");
  }

  await Log("backend", "debug", "service", `Creating user: ${name} (${email})`);
  const user = db.createUser({ name, email, preferences });
  await Log("backend", "info", "service", `User created: ID ${user.id} | Email: ${email}`);
  return user;
}

async function updateUser(id, updates) {
  await Log("backend", "debug", "service", `Updating user: ${id}`);
  const user = db.updateUser(id, updates);
  if (!user) {
    await Log("backend", "warn", "service", `Update failed: user ${id} not found`);
    return null;
  }
  await Log("backend", "info", "service", `User ${id} updated successfully`);
  return user;
}

async function deleteUser(id) {
  await Log("backend", "debug", "service", `Deleting user: ${id}`);
  const success = db.deleteUser(id);
  if (!success) {
    await Log("backend", "warn", "service", `Delete failed: user ${id} not found`);
    return false;
  }
  await Log("backend", "info", "service", `User ${id} and all their notifications deleted`);
  return true;
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
