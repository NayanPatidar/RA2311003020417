const cron = require("node-cron");
const db = require("../db/database");
const { Log } = require("../../../logging_middleware/index");

/**
 * Cron job: Runs every day at 8:00 AM
 * Checks for maintenance scheduled in the next 3 days and logs reminders.
 */
function startMaintenanceReminderJob() {
  cron.schedule("0 8 * * *", async () => {
    await Log("backend", "info", "cron_job", "Running daily maintenance reminder check");

    const upcoming = db.getUpcomingMaintenance(3);

    if (upcoming.length === 0) {
      await Log("backend", "info", "cron_job", "No upcoming maintenance in next 3 days");
      return;
    }

    await Log(
      "backend",
      "warn",
      "cron_job",
      `Found ${upcoming.length} maintenance task(s) due in next 3 days`
    );

    for (const record of upcoming) {
      const vehicle = db.getVehicleById(record.vehicleId);
      await Log(
        "backend",
        "info",
        "cron_job",
        `Reminder: ${record.type} for ${vehicle?.make} ${vehicle?.model} (${vehicle?.licensePlate}) scheduled on ${record.scheduledDate}`
      );
    }
  });

  console.log("[CronJob] Maintenance reminder scheduler started (runs daily at 8:00 AM)");
}

module.exports = { startMaintenanceReminderJob };
