const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");

// GET    /api/maintenance                        - Get all records
// GET    /api/maintenance/upcoming?days=7        - Get upcoming (next N days)
// GET    /api/maintenance/vehicle/:vehicleId     - Get by vehicle
// GET    /api/maintenance/:id                    - Get by ID
// POST   /api/maintenance                        - Create record
// PUT    /api/maintenance/:id                    - Update record
// DELETE /api/maintenance/:id                    - Delete record

router.get("/", maintenanceController.getAllMaintenanceRecords);
router.get("/upcoming", maintenanceController.getUpcomingMaintenance);
router.get("/vehicle/:vehicleId", maintenanceController.getMaintenanceByVehicle);
router.get("/:id", maintenanceController.getMaintenanceById);
router.post("/", maintenanceController.createMaintenanceRecord);
router.put("/:id", maintenanceController.updateMaintenanceRecord);
router.delete("/:id", maintenanceController.deleteMaintenanceRecord);

module.exports = router;
