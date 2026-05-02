# Logging Middleware

A reusable logging package that sends structured log entries to the Affordmed evaluation server.

## Usage

```js
const { Log, initLogger } = require("./index");

// Initialize with your Bearer token after auth
initLogger("your_access_token_here");

// Log an event
await Log("backend", "info", "service", "Vehicle scheduled successfully");
await Log("backend", "error", "handler", "received string, expected bool");
await Log("backend", "fatal", "db", "Critical database connection failure.");
```

## API

### `initLogger(token)`
Sets the Bearer token used for all subsequent log calls.

### `Log(stack, level, package, message)`
Sends a log entry to the evaluation server.

| Parameter | Allowed Values |
|-----------|---------------|
| stack     | `backend`, `frontend` |
| level     | `debug`, `info`, `warn`, `error`, `fatal` |
| package (backend) | `cache`, `controller`, `cron_job`, `db`, `domain`, `handler`, `repository`, `route`, `service` |
| package (frontend) | `api`, `component`, `hook`, `page`, `state`, `style` |
| package (both) | `auth`, `config`, `middleware`, `utils` |
