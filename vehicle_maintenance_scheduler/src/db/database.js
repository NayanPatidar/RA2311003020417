const { v4: uuidv4 } = require("uuid");

const db = {
  vehicles: [],
  maintenanceRecords: [],
};

function getAllVehicles() {
  return db.vehicles;
}

function getVehicleById(id) {
  return db.vehicles.find((v) => v.id === id) || null;
}

function createVehicle({ make, model, year, licensePlate, ownerName, ownerContact }) {
  const vehicle = {
    id: uuidv4(),
    make,
    model,
    year: parseInt(year),
    licensePlate,
    ownerName,
    ownerContact,
    createdAt: new Date().toISOString(),
  };
  db.vehicles.push(vehicle);
  return vehicle;
}

function updateVehicle(id, updates) {
  const idx = db.vehicles.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  db.vehicles[idx] = { ...db.vehicles[idx], ...updates, updatedAt: new Date().toISOString() };
  return db.vehicles[idx];
}

function deleteVehicle(id) {
  const idx = db.vehicles.findIndex((v) => v.id === id);
  if (idx === -1) return false;
  db.vehicles.splice(idx, 1);
  db.maintenanceRecords = db.maintenanceRecords.filter((r) => r.vehicleId !== id);
  return true;
}

function getAllMaintenanceRecords() {
  return db.maintenanceRecords;
}

function getMaintenanceByVehicle(vehicleId) {
  return db.maintenanceRecords.filter((r) => r.vehicleId === vehicleId);
}

function getMaintenanceById(id) {
  return db.maintenanceRecords.find((r) => r.id === id) || null;
}

function createMaintenanceRecord({ vehicleId, type, description, scheduledDate, status }) {
  const record = {
    id: uuidv4(),
    vehicleId,
    type,
    description,
    scheduledDate,
    status: status || "scheduled",
    createdAt: new Date().toISOString(),
  };
  db.maintenanceRecords.push(record);
  return record;
}

function updateMaintenanceRecord(id, updates) {
  const idx = db.maintenanceRecords.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  db.maintenanceRecords[idx] = {
    ...db.maintenanceRecords[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return db.maintenanceRecords[idx];
}

function deleteMaintenanceRecord(id) {
  const idx = db.maintenanceRecords.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  db.maintenanceRecords.splice(idx, 1);
  return true;
}

function getUpcomingMaintenance(days = 7) {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return db.maintenanceRecords.filter((r) => {
    const d = new Date(r.scheduledDate);
    return d >= now && d <= future && r.status === "scheduled";
  });
}

module.exports = {
  getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle,
  getAllMaintenanceRecords, getMaintenanceByVehicle, getMaintenanceById,
  createMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord,
  getUpcomingMaintenance,
};
