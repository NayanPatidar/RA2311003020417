const db = require("../db/database");
const { Log } = require("../../../logging_middleware/index");

async function getAllVehicles() {
  await Log("backend", "debug", "service", "Fetching all vehicles from database");
  const vehicles = db.getAllVehicles();
  await Log("backend", "info", "service", `Retrieved ${vehicles.length} vehicles`);
  return vehicles;
}

async function getVehicleById(id) {
  await Log("backend", "debug", "service", `Fetching vehicle with ID: ${id}`);
  const vehicle = db.getVehicleById(id);
  if (!vehicle) {
    await Log("backend", "warn", "service", `Vehicle not found for ID: ${id}`);
    return null;
  }
  await Log("backend", "info", "service", `Vehicle found: ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`);
  return vehicle;
}

async function createVehicle(data) {
  const { make, model, year, licensePlate, ownerName, ownerContact } = data;

  if (!make || !model || !year || !licensePlate || !ownerName) {
    await Log("backend", "error", "service", "Vehicle creation failed: missing required fields");
    throw new Error("make, model, year, licensePlate, and ownerName are required");
  }

  await Log("backend", "debug", "service", `Creating new vehicle: ${make} ${model} (${licensePlate})`);
  const vehicle = db.createVehicle({ make, model, year, licensePlate, ownerName, ownerContact });
  await Log("backend", "info", "service", `Vehicle created successfully with ID: ${vehicle.id}`);
  return vehicle;
}

async function updateVehicle(id, updates) {
  await Log("backend", "debug", "service", `Updating vehicle ID: ${id}`);
  const vehicle = db.updateVehicle(id, updates);
  if (!vehicle) {
    await Log("backend", "warn", "service", `Update failed: vehicle not found for ID: ${id}`);
    return null;
  }
  await Log("backend", "info", "service", `Vehicle ID: ${id} updated successfully`);
  return vehicle;
}

async function deleteVehicle(id) {
  await Log("backend", "debug", "service", `Deleting vehicle ID: ${id}`);
  const success = db.deleteVehicle(id);
  if (!success) {
    await Log("backend", "warn", "service", `Delete failed: vehicle not found for ID: ${id}`);
    return false;
  }
  await Log("backend", "info", "service", `Vehicle ID: ${id} deleted along with its maintenance records`);
  return true;
}

module.exports = { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };
