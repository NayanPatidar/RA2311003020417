const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");

// GET    /api/vehicles         - Get all vehicles
// POST   /api/vehicles         - Create a new vehicle
// GET    /api/vehicles/:id     - Get vehicle by ID
// PUT    /api/vehicles/:id     - Update vehicle
// DELETE /api/vehicles/:id     - Delete vehicle

router.get("/", vehicleController.getAllVehicles);
router.post("/", vehicleController.createVehicle);
router.get("/:id", vehicleController.getVehicleById);
router.put("/:id", vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

module.exports = router;
