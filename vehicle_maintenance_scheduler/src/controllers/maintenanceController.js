const maintenanceService = require("../services/maintenanceService");
const { Log } = require("../../../logging_middleware/index");

async function getAllMaintenanceRecords(req, res) {
  try {
    await Log("backend", "info", "controller", "GET /api/maintenance - Fetching all maintenance records");
    const records = await maintenanceService.getAllMaintenanceRecords();
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    await Log("backend", "error", "controller", `GET /api/maintenance failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getMaintenanceByVehicle(req, res) {
  try {
    const { vehicleId } = req.params;
    await Log("backend", "info", "controller", `GET /api/maintenance/vehicle/${vehicleId}`);
    const records = await maintenanceService.getMaintenanceByVehicle(vehicleId);
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    await Log("backend", "error", "controller", `GET maintenance by vehicle failed: ${err.message}`);
    res.status(404).json({ success: false, error: err.message });
  }
}

async function getMaintenanceById(req, res) {
  try {
    const { id } = req.params;
    const record = await maintenanceService.getMaintenanceById(id);
    if (!record) return res.status(404).json({ success: false, error: "Record not found" });
    res.json({ success: true, data: record });
  } catch (err) {
    await Log("backend", "error", "controller", `GET maintenance by ID failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function createMaintenanceRecord(req, res) {
  try {
    await Log("backend", "info", "controller", `POST /api/maintenance - Body: ${JSON.stringify(req.body)}`);
    const record = await maintenanceService.createMaintenanceRecord(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    await Log("backend", "error", "controller", `POST /api/maintenance failed: ${err.message}`);
    res.status(400).json({ success: false, error: err.message });
  }
}

async function updateMaintenanceRecord(req, res) {
  try {
    const { id } = req.params;
    await Log("backend", "info", "controller", `PUT /api/maintenance/${id}`);
    const record = await maintenanceService.updateMaintenanceRecord(id, req.body);
    if (!record) return res.status(404).json({ success: false, error: "Record not found" });
    res.json({ success: true, data: record });
  } catch (err) {
    await Log("backend", "error", "controller", `PUT /api/maintenance failed: ${err.message}`);
    res.status(400).json({ success: false, error: err.message });
  }
}

async function deleteMaintenanceRecord(req, res) {
  try {
    const { id } = req.params;
    await Log("backend", "info", "controller", `DELETE /api/maintenance/${id}`);
    const success = await maintenanceService.deleteMaintenanceRecord(id);
    if (!success) return res.status(404).json({ success: false, error: "Record not found" });
    res.json({ success: true, message: "Maintenance record deleted" });
  } catch (err) {
    await Log("backend", "error", "controller", `DELETE /api/maintenance failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getUpcomingMaintenance(req, res) {
  try {
    const { days } = req.query;
    await Log("backend", "info", "controller", `GET /api/maintenance/upcoming?days=${days || 7}`);
    const records = await maintenanceService.getUpcomingMaintenance(days);
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    await Log("backend", "error", "controller", `GET upcoming maintenance failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getAllMaintenanceRecords, getMaintenanceByVehicle, getMaintenanceById,
  createMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord,
  getUpcomingMaintenance,
};
