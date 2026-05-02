const express = require("express");
const router = express.Router();
const { Log } = require("../../../logging_middleware/index");
const { runScheduler } = require("../services/schedulerService");

// GET /api/schedule — run knapsack optimizer across all depots
router.get("/", async (req, res) => {
  try {
    await Log("backend", "info", "route", "GET /api/schedule requested");
    const result = await runScheduler();
    res.json({ success: true, data: result });
  } catch (err) {
    await Log("backend", "error", "route", `GET /api/schedule failed: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
