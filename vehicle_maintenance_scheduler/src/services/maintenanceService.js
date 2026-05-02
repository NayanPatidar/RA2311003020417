const db = require("../db/database");
const { Log } = require("../../../logging_middleware/index");

const VALID_STATUSES = ["scheduled", "in-progress", "completed", "cancelled"];
const VALID_TYPES = ["oil-change", "tire-rotation", "brake-inspection", "engine-check", "general-service", "battery-replacement", "other"];

async function getAllMaintenanceRecords() {
  await Log("backend", "debug", "service", "Fetching all maintenance records");
  const records = db.getAllMaintenanceRecords();
  await Log("backend", "info", "service", `Retrieved ${records.length} maintenance records`);
  return records;
}

async function getMaintenanceByVehicle(vehicleId) {
  await Log("backend", "debug", "service", `Fetching maintenance records for vehicle: ${vehicleId}`);
  const vehicle = db.getVehicleById(vehicleId);
  if (!vehicle) {
    await Log("backend", "warn", "service", `Cannot fetch maintenance: vehicle ${vehicleId} not found`);
    throw new Error("Vehicle not found");
  }
  const records = db.getMaintenanceByVehicle(vehicleId);
  await Log("backend", "info", "service", `Found ${records.length} maintenance records for vehicle: ${vehicleId}`);
  return records;
}

async function getMaintenanceById(id) {
  await Log("backend", "debug", "service", `Fetching maintenance record ID: ${id}`);
  const record = db.getMaintenanceById(id);
  if (!record) {
    await Log("backend", "warn", "service", `Maintenance record not found: ${id}`);
    return null;
  }
  return record;
}

async function createMaintenanceRecord(data) {
  const { vehicleId, type, description, scheduledDate, status } = data;

  if (!vehicleId || !type || !scheduledDate) {
    await Log("backend", "error", "service", "Maintenance creation failed: missing vehicleId, type or scheduledDate");
    throw new Error("vehicleId, type, and scheduledDate are required");
  }

  if (!VALID_TYPES.includes(type)) {
    await Log("backend", "error", "service", `Invalid maintenance type provided: ${type}`);
    throw new Error(`Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`);
  }

  if (status && !VALID_STATUSES.includes(status)) {
    await Log("backend", "error", "service", `Invalid status value: ${status}`);
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const vehicle = db.getVehicleById(vehicleId);
  if (!vehicle) {
    await Log("backend", "error", "service", `Cannot schedule maintenance: vehicle ${vehicleId} does not exist`);
    throw new Error("Vehicle not found");
  }

  await Log("backend", "debug", "service", `Scheduling ${type} for vehicle: ${vehicleId} on ${scheduledDate}`);
  const record = db.createMaintenanceRecord({ vehicleId, type, description, scheduledDate, status });
  await Log("backend", "info", "service", `Maintenance record created: ID ${record.id} | Type: ${type} | Vehicle: ${vehicleId}`);
  return record;
}

async function updateMaintenanceRecord(id, updates) {
  if (updates.status && !VALID_STATUSES.includes(updates.status)) {
    await Log("backend", "error", "service", `Invalid status update value: ${updates.status}`);
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  await Log("backend", "debug", "service", `Updating maintenance record ID: ${id}`);
  const record = db.updateMaintenanceRecord(id, updates);
  if (!record) {
    await Log("backend", "warn", "service", `Update failed: maintenance record ${id} not found`);
    return null;
  }
  await Log("backend", "info", "service", `Maintenance record ${id} updated. New status: ${record.status}`);
  return record;
}

async function deleteMaintenanceRecord(id) {
  await Log("backend", "debug", "service", `Deleting maintenance record ID: ${id}`);
  const success = db.deleteMaintenanceRecord(id);
  if (!success) {
    await Log("backend", "warn", "service", `Delete failed: maintenance record ${id} not found`);
    return false;
  }
  await Log("backend", "info", "service", `Maintenance record ${id} deleted successfully`);
  return true;
}

async function getUpcomingMaintenance(days) {
  const d = parseInt(days) || 7;
  await Log("backend", "debug", "service", `Fetching upcoming maintenance in next ${d} days`);
  const records = db.getUpcomingMaintenance(d);
  await Log("backend", "info", "service", `Found ${records.length} upcoming maintenance tasks in next ${d} days`);
  return records;
}

module.exports = {
  getAllMaintenanceRecords, getMaintenanceByVehicle, getMaintenanceById,
  createMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord,
  getUpcomingMaintenance,
};
