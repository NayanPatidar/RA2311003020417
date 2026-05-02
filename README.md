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

## Vehicle Maintenance Scheduler

<p align="center">
  <img src="https://github.com/user-attachments/assets/c2ecedd8-5c02-4757-a3b0-7fa16ec2466a" width="45%" />
  <img src="https://github.com/user-attachments/assets/f16b385c-c9a9-4a9c-a953-d99c8bdba04a" width="45%" />
</p>

## Notification App

<p align="center">
  <img src="https://github.com/user-attachments/assets/949c8b9e-d397-4a3d-80f0-94cf38f9da25" width="45%" />
  <img src="https://github.com/user-attachments/assets/30db6622-f14c-4c5a-9fea-fd949502459c" width="45%" />
</p>

## Priority Inbox Script

<p align="center">
  <img src="https://github.com/user-attachments/assets/111f8df5-64d5-4cb7-bee7-820ca41bc749" width="70%" />
</p>

