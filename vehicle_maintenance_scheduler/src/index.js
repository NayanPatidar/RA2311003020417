const express = require("express");
const { initLogger, Log } = require("../../logging_middleware/index");

const AUTH_CREDENTIALS = {
  email: "np8398@srmist.edu.in",
  name: "Nayan Patidar",
  rollNo: "RA2311003020417",
  accessCode: "QkbpxH",
  clientID: "d5a1d919-a1b9-4533-8074-937479f89d6f",
  clientSecret: "gHVWkDVAxcGvDbzN",
};

async function getAuthToken() {
  const res = await fetch("http://20.207.122.201/evaluation-service/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(AUTH_CREDENTIALS),
  });
  const data = await res.json();
  return data.access_token;
}

const app = express();
app.use(express.json());

const vehicleRoutes = require("./routes/vehicleRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/schedule", scheduleRoutes);

app.get("/", (req, res) => {
  res.json({ status: "Vehicle Maintenance Scheduler API is running" });
});

app.use((err, req, res, next) => {
  Log("backend", "fatal", "handler", `Unhandled server error: ${err.message}`);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

const PORT = process.env.PORT || 3000;

(async () => {
  const token = await getAuthToken();
  initLogger(token);
  app.listen(PORT, async () => {
    await Log("backend", "info", "config", `Vehicle Scheduler running on port ${PORT}`);
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
