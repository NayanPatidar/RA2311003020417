const { Log } = require("../../../logging_middleware/index");

const AUTH_CREDENTIALS = {
  email: "np8398@srmist.edu.in",
  name: "Nayan Patidar",
  rollNo: "RA2311003020417",
  accessCode: "QkbpxH",
  clientID: "d5a1d919-a1b9-4533-8074-937479f89d6f",
  clientSecret: "gHVWkDVAxcGvDbzN",
};

const BASE_URL = "http://20.207.122.201/evaluation-service";

async function fetchToken() {
  const res = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(AUTH_CREDENTIALS),
  });
  const data = await res.json();
  return data.access_token;
}

async function fetchDepots(token) {
  await Log("backend", "debug", "service", "Fetching depots from API");
  const res = await fetch(`${BASE_URL}/depots`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  await Log("backend", "info", "service", `Fetched ${data.depots.length} depots`);
  return data.depots;
}

async function fetchTasks(token) {
  await Log("backend", "debug", "service", "Fetching vehicle tasks from API");
  const res = await fetch(`${BASE_URL}/vehicles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  await Log("backend", "info", "service", `Fetched ${data.vehicles.length} tasks`);
  return data.vehicles;
}

function knapsack(tasks, capacity) {
  const n = tasks.length;
  const table = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = tasks[i - 1];
    for (let w = 0; w <= capacity; w++) {
      table[i][w] = table[i - 1][w];
      if (Duration <= w) {
        const withItem = table[i - 1][w - Duration] + Impact;
        if (withItem > table[i][w]) table[i][w] = withItem;
      }
    }
  }

  const selected = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (table[i][w] !== table[i - 1][w]) {
      selected.push(tasks[i - 1]);
      w -= tasks[i - 1].Duration;
    }
  }

  return {
    maxImpact: table[n][capacity],
    selectedTasks: selected,
    hoursUsed: selected.reduce((sum, t) => sum + t.Duration, 0),
  };
}

async function runScheduler() {
  await Log("backend", "info", "service", "Scheduler started");

  const token = await fetchToken();
  const [depots, tasks] = await Promise.all([fetchDepots(token), fetchTasks(token)]);

  await Log("backend", "debug", "service", `Running knapsack for ${depots.length} depots`);

  const results = depots.map((depot) => {
    const result = knapsack(tasks, depot.MechanicHours);
    return {
      depotId: depot.ID,
      budget: depot.MechanicHours,
      hoursUsed: result.hoursUsed,
      maxImpact: result.maxImpact,
      scheduledTasks: result.selectedTasks.map((t) => ({
        taskId: t.TaskID,
        duration: t.Duration,
        impact: t.Impact,
      })),
    };
  });

  const totalImpact = results.reduce((s, r) => s + r.maxImpact, 0);
  await Log("backend", "info", "service", `Scheduler done. Total impact: ${totalImpact}`);

  return { depots: results, totalImpact };
}

module.exports = { runScheduler };
