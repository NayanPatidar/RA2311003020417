const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");

router.get("/", maintenanceController.getAllMaintenanceRecords);
router.get("/upcoming", maintenanceController.getUpcomingMaintenance);
router.get("/vehicle/:vehicleId", maintenanceController.getMaintenanceByVehicle);
router.get("/:id", maintenanceController.getMaintenanceById);
router.post("/", maintenanceController.createMaintenanceRecord);
router.put("/:id", maintenanceController.updateMaintenanceRecord);
router.delete("/:id", maintenanceController.deleteMaintenanceRecord);

module.exports = router;
