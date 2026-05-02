const { initLogger, Log } = require("../logging_middleware/index");

const AUTH_CREDENTIALS = {
  email: "np8398@srmist.edu.in",
  name: "Nayan Patidar",
  rollNo: "RA2311003020417",
  accessCode: "QkbpxH",
  clientID: "d5a1d919-a1b9-4533-8074-937479f89d6f",
  clientSecret: "gHVWkDVAxcGvDbzN",
};

const BASE_URL = "http://20.207.122.201/evaluation-service";

const TYPE_WEIGHTS = { Placement: 3, Result: 2, Event: 1 };

function priorityScore(notification) {
  const weight = TYPE_WEIGHTS[notification.Type] || 1;
  const ts = new Date(notification.Timestamp.replace(" ", "T") + "Z");
  const minutesSince = (Date.now() - ts.getTime()) / 60000;
  return weight / (minutesSince + 1);
}

async function main() {
  const authRes = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(AUTH_CREDENTIALS),
  });
  const { access_token } = await authRes.json();
  initLogger(access_token);

  await Log("backend", "info", "service", "Priority inbox: fetching notifications");

  const res = await fetch(`${BASE_URL}/notifications`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const { notifications } = await res.json();

  await Log("backend", "info", "service", `Fetched ${notifications.length} notifications`);

  const scored = notifications.map((n) => ({
    ...n,
    score: priorityScore(n),
  }));

  scored.sort((a, b) => b.score - a.score);

  const top10 = scored.slice(0, 10);

  await Log("backend", "info", "service", `Top 10 selected from ${notifications.length}`);

  console.log("\n=== PRIORITY INBOX — TOP 10 ===\n");
  top10.forEach((n, i) => {
    console.log(
      `${i + 1}. [${n.Type.padEnd(9)}] ${n.Message.padEnd(30)} | Score: ${n.score.toFixed(4)} | ${n.Timestamp}`
    );
  });

  await Log("backend", "info", "service", "Priority inbox output complete");
}

main().catch(async (err) => {
  await Log("backend", "fatal", "service", `Priority inbox failed: ${err.message}`);
  process.exit(1);
});
