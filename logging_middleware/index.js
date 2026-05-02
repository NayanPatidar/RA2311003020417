const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_PACKAGES_BACKEND = [
  "cache", "controller", "cron_job", "db", "domain",
  "handler", "repository", "route", "service"
];
const VALID_PACKAGES_FRONTEND = [
  "api", "component", "hook", "page", "state", "style"
];
const VALID_PACKAGES_BOTH = ["auth", "config", "middleware", "utils"];

const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";

let _authToken = null;

function initLogger(token) {
  _authToken = token;
}

function validateParams(stack, level, pkg) {
  if (!VALID_STACKS.includes(stack)) {
    throw new Error(`Invalid stack "${stack}". Must be one of: ${VALID_STACKS.join(", ")}`);
  }
  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`Invalid level "${level}". Must be one of: ${VALID_LEVELS.join(", ")}`);
  }

  const allValidPackages = [
    ...VALID_PACKAGES_BOTH,
    ...(stack === "backend" ? VALID_PACKAGES_BACKEND : VALID_PACKAGES_FRONTEND),
  ];

  if (!allValidPackages.includes(pkg)) {
    throw new Error(
      `Invalid package "${pkg}" for stack "${stack}". Must be one of: ${allValidPackages.join(", ")}`
    );
  }
}

async function Log(stack, level, pkg, message) {
  try {
    validateParams(stack, level, pkg);

    if (!_authToken) {
      console.error("[Logger] Auth token not set. Call initLogger(token) first.");
      return;
    }

    const payload = {
      stack,
      level,
      package: pkg,
      message: message.slice(0, 48),
    };

    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${_authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[Logger] Failed to send log. Status ${response.status}: ${errBody}`);
      return;
    }

    const result = await response.json();
    console.log(`[Logger] Log sent successfully. LogID: ${result.logID}`);
    return result;
  } catch (err) {
    console.error("[Logger] Exception while sending log:", err.message);
  }
}

module.exports = { Log, initLogger };
