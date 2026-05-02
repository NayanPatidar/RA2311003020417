# RA2311003020417

Campus Hiring Evaluation - Backend Track Submission

## Repository Structure

```
RA2311003020417/
├── logging_middleware/          # Reusable logging package
├── vehicle_maintenance_scheduler/  # Vehicle maintenance backend API
├── notification_app_be/         # Notification system backend API
├── notification_system_design.md   # System design document
└── .gitignore
```

## Setup Instructions

### 1. Vehicle Maintenance Scheduler

```bash
cd vehicle_maintenance_scheduler
npm install
npm start
# Runs on http://localhost:3000
```

### 3. Notification App Backend

```bash
cd notification_app_be
npm install
npm start
# Runs on http://localhost:4000
```

## API Overview

### Vehicle Maintenance Scheduler (Port 3000)
- `GET/POST /api/vehicles` — Manage vehicles
- `GET/POST /api/maintenance` — Manage maintenance records
- `GET /api/maintenance/upcoming?days=7` — Get upcoming tasks

### Notification App (Port 4000)
- `GET/POST /api/users` — Manage users
- `GET/POST /api/notifications` — Send/fetch notifications
- `PUT /api/notifications/:id/read` — Mark as read
