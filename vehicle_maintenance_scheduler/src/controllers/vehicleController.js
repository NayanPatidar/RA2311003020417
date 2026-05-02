const vehicleService = require("../services/vehicleService");
const { Log } = require("../../../logging_middleware/index");

async function getAllVehicles(req, res) {
  try {
    await Log("backend", "info", "controller", "GET /api/vehicles - Fetching all vehicles");
    const vehicles = await vehicleService.getAllVehicles();
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    await Log("backend", "error", "controller", `GET /api/vehicles failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getVehicleById(req, res) {
  try {
    const { id } = req.params;
    await Log("backend", "info", "controller", `GET /api/vehicles/${id}`);
    const vehicle = await vehicleService.getVehicleById(id);
    if (!vehicle) return res.status(404).json({ success: false, error: "Vehicle not found" });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    await Log("backend", "error", "controller", `GET vehicle by ID failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function createVehicle(req, res) {
  try {
    await Log("backend", "info", "controller", `POST /api/vehicles - Creating vehicle: ${JSON.stringify(req.body)}`);
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    await Log("backend", "error", "controller", `POST /api/vehicles failed: ${err.message}`);
    res.status(400).json({ success: false, error: err.message });
  }
}

async function updateVehicle(req, res) {
  try {
    const { id } = req.params;
    await Log("backend", "info", "controller", `PUT /api/vehicles/${id}`);
    const vehicle = await vehicleService.updateVehicle(id, req.body);
    if (!vehicle) return res.status(404).json({ success: false, error: "Vehicle not found" });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    await Log("backend", "error", "controller", `PUT vehicle failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteVehicle(req, res) {
  try {
    const { id } = req.params;
    await Log("backend", "info", "controller", `DELETE /api/vehicles/${id}`);
    const success = await vehicleService.deleteVehicle(id);
    if (!success) return res.status(404).json({ success: false, error: "Vehicle not found" });
    res.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (err) {
    await Log("backend", "error", "controller", `DELETE vehicle failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };
