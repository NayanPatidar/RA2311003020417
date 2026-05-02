# Notification System Design

## Overview

This document describes the architecture design for a scalable, real-time notification system. The system supports multiple delivery channels (email, SMS, push), user preference management, and reliable delivery with retry logic.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│              React / Next.js Frontend (notification_app_fe)         │
└────────────────────────────┬────────────────────────────────────────┘
                             │ REST API / WebSocket
┌────────────────────────────▼────────────────────────────────────────┐
│                         API GATEWAY                                 │
│              Rate Limiting · Auth Validation · Routing              │
└───────┬──────────────────────┬──────────────────────────────────────┘
        │                      │
┌───────▼──────────┐  ┌────────▼──────────────────────────────────────┐
│   Auth Service   │  │           Notification Service                 │
│  JWT Validation  │  │  Create · Read · Mark-Read · Delete            │
└──────────────────┘  └────────────────────┬────────────────────────── ┘
                                           │
                              ┌────────────▼───────────────┐
                              │      Message Queue          │
                              │  (e.g., Redis / RabbitMQ)  │
                              └────────┬───────────────────┘
                         ┌────────────┼────────────┐
               ┌─────────▼──┐  ┌─────▼──────┐  ┌──▼──────────┐
               │Email Worker│  │ SMS Worker │  │ Push Worker │
               │(Nodemailer)│  │ (Twilio)   │  │  (FCM/APNs) │
               └─────────┬──┘  └─────┬──────┘  └──┬──────────┘
                         └───────────┴─────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │      Database        │
                          │  Users · Notifications│
                          │  (PostgreSQL/MongoDB) │
                          └─────────────────────-┘
```

---

## Core Components

### 1. API Gateway
Handles all incoming requests. Responsibilities include authentication validation, rate limiting (prevent abuse), request routing to appropriate microservices, and logging via the Logging Middleware.

### 2. Auth Service
Manages JWT token generation and validation. All protected routes require a valid Bearer token. Tokens expire after a configurable duration and can be refreshed.

### 3. Notification Service
The core business logic layer. Handles:
- Creating notifications with type, channel, and user targeting
- Respecting user preferences (e.g., a user who disabled email won't receive email notifications)
- Queuing notifications to the Message Queue for async delivery
- Tracking delivery status (pending → sent → read / failed)

### 4. Message Queue
Decouples notification creation from delivery. This ensures the API responds instantly while delivery happens asynchronously. Failed deliveries are retried with exponential backoff (max 3 retries).

### 5. Delivery Workers
Separate workers per channel:
- **Email Worker**: Uses Nodemailer with SMTP
- **SMS Worker**: Integrates with Twilio API
- **Push Worker**: Uses Firebase Cloud Messaging (FCM) for Android/web and APNs for iOS

### 6. Database
Stores users (with preferences) and notifications (with status). In production, PostgreSQL is preferred for relational integrity. A Redis cache layer reduces read load for frequent queries like unread counts.

---

## Data Models

### User
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "preferences": {
    "email": true,
    "sms": false,
    "push": true
  },
  "createdAt": "ISO timestamp"
}
```

### Notification
```json
{
  "id": "uuid",
  "userId": "uuid",
  "type": "alert | reminder | promotion | system | message",
  "title": "string",
  "body": "string",
  "channel": "email | sms | push",
  "status": "pending | sent | read | failed",
  "readAt": "ISO timestamp | null",
  "createdAt": "ISO timestamp"
}
```

---

## API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List all users |
| POST | /api/users | Create user |
| GET | /api/users/:id | Get user by ID |
| PUT | /api/users/:id | Update user/preferences |
| DELETE | /api/users/:id | Delete user |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | List all notifications |
| POST | /api/notifications | Send a notification |
| GET | /api/notifications/user/:userId | Get user's notifications |
| GET | /api/notifications/user/:userId/unread | Get unread notifications |
| PUT | /api/notifications/:id/read | Mark as read |
| DELETE | /api/notifications/:id | Delete notification |

---

## Scalability Considerations

- **Horizontal Scaling**: Notification Service and Workers are stateless and can be scaled independently via container orchestration (Kubernetes).
- **Queue Backpressure**: Message Queue absorbs traffic spikes without dropping notifications.
- **Caching**: Redis caches unread counts and user preferences to reduce DB load.
- **Rate Limiting**: API Gateway enforces per-user rate limits to prevent spam.

---

## Logging Strategy

All components integrate the `logging_middleware` package. Logs are categorised by:
- **Level**: debug (development tracing), info (normal operations), warn (unexpected but handled), error (failures needing attention), fatal (system-critical failures)
- **Package**: Matches the architectural layer (controller, service, db, handler, middleware, etc.)

This enables full observability — every notification lifecycle event from creation to delivery is traceable.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | Node.js + Express |
| Database | PostgreSQL (production) / In-memory (development) |
| Cache | Redis |
| Message Queue | RabbitMQ / Redis Streams |
| Email | Nodemailer + SMTP |
| SMS | Twilio |
| Push | Firebase Cloud Messaging |
| Frontend | React / Next.js |
| Styling | Material UI |
| Logging | Custom Logging Middleware (this repo) |

---

## Stage 1 — REST API Design

### Notification Object

```json
{
  "id": "uuid",
  "studentId": "integer",
  "type": "Event | Result | Placement",
  "message": "string",
  "isRead": false,
  "timestamp": "2026-05-02T05:01:21Z"
}
```

### Endpoints

#### GET /notifications?studentId=X
Fetch all notifications for a student.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    { "id": "uuid", "studentId": 1042, "type": "Placement", "message": "Google hiring", "isRead": false, "timestamp": "..." }
  ]
}
```

---

#### GET /notifications/unread?studentId=X
Fetch only unread notifications.

**Response:** Same shape as above, filtered to `isRead: false`.

---

#### POST /notifications
Create a notification (admin only).

**Request Body:**
```json
{
  "studentId": 1042,
  "type": "Placement",
  "message": "Google on-campus hiring drive on May 10"
}
```

**Response:**
```json
{ "success": true, "data": { "id": "uuid", "studentId": 1042, "type": "Placement", "message": "...", "isRead": false, "timestamp": "..." } }
```

---

#### PATCH /notifications/:id/read
Mark a single notification as read.

**Response:**
```json
{ "success": true, "data": { "id": "uuid", "isRead": true, "readAt": "2026-05-02T06:00:00Z" } }
```

---

#### PATCH /notifications/read-all
Mark all notifications as read for a student.

**Request Body:** `{ "studentId": 1042 }`

**Response:** `{ "success": true, "updated": 5 }`

---

#### DELETE /notifications/:id
Delete a notification.

**Response:** `{ "success": true, "message": "Notification deleted" }`

---

#### GET /notifications/priority?studentId=X&top=10
Priority inbox — returns top N notifications sorted by priority score.

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "type": "Placement", "message": "...", "score": 2.94, "isRead": false, "timestamp": "..." }
  ]
}
```

---

### Real-Time Mechanism: Server-Sent Events (SSE)

SSE is chosen over WebSockets because notifications are **server-to-client only** (no bidirectional communication needed). SSE is simpler to implement, works over plain HTTP/2, and reconnects automatically on drop.

**Endpoint:** `GET /notifications/stream?studentId=X`

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache

data: {"id":"uuid","type":"Placement","message":"Google hiring","timestamp":"..."}

data: {"id":"uuid","type":"Result","message":"mid-sem results","timestamp":"..."}
```

The server pushes a new `data:` event whenever a notification is created for that student. The client opens one persistent SSE connection and appends incoming events to the UI without polling.

---

## Stage 2 — Database Design

### Choice: PostgreSQL

PostgreSQL is chosen over MongoDB because:
- Notifications relate to students — relational integrity with foreign keys prevents orphaned records
- ACID compliance ensures a notification is either fully saved or not at all
- Complex queries (filtering by type + date range, joins, aggregations) are more efficient in SQL
- Native UUID support, partial indexes, and `TIMESTAMP WITH TIME ZONE` handling

### Schema

```sql
CREATE TABLE students (
  id   SERIAL PRIMARY KEY,
  name  VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('Event', 'Result', 'Placement')),
  message           TEXT NOT NULL,
  is_read           BOOLEAN NOT NULL DEFAULT false,
  read_at           TIMESTAMP WITH TIME ZONE,
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### SQL for Each Endpoint

```sql
-- GET /notifications?studentId=X
SELECT id, student_id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = $1
ORDER BY created_at DESC;

-- GET /notifications/unread?studentId=X
SELECT id, student_id, notification_type, message, created_at
FROM notifications
WHERE student_id = $1 AND is_read = false
ORDER BY created_at DESC;

-- POST /notifications
INSERT INTO notifications (student_id, notification_type, message)
VALUES ($1, $2, $3)
RETURNING *;

-- PATCH /notifications/:id/read
UPDATE notifications
SET is_read = true, read_at = NOW()
WHERE id = $1
RETURNING *;

-- PATCH /notifications/read-all
UPDATE notifications
SET is_read = true, read_at = NOW()
WHERE student_id = $1 AND is_read = false;

-- DELETE /notifications/:id
DELETE FROM notifications WHERE id = $1;
```

### Scalability at High Volume

At millions of rows, a full table scan on `WHERE student_id = X AND is_read = false` becomes slow.

**Solutions:**
1. **Composite index** (see Stage 3) — covers the most common query pattern
2. **Table partitioning** — partition `notifications` by `created_at` month; old months are cold and can be archived
3. **Read replica** — route all SELECT queries to a read replica; writes go to primary only
4. **Archival** — move notifications older than 90 days to a `notifications_archive` table; keep the hot table small

---

## Stage 3 — Query Optimization

### Original slow query

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

### Why it is slow

1. **No index** on `(student_id, is_read, created_at)` → PostgreSQL does a full sequential scan of the entire table
2. **`SELECT *`** fetches all columns including large `message` TEXT even when only a subset is needed; wastes I/O and network bandwidth
3. **`ORDER BY createdAt DESC`** without an index requires a sort of the filtered rows in memory

### Fix 1 — Composite index

```sql
CREATE INDEX idx_notifications_student_unread
ON notifications (student_id, is_read, created_at DESC);
```

With this index, PostgreSQL uses an **index scan** instead of a seq scan: it seeks directly to `student_id = 1042, is_read = false` and reads rows pre-sorted by `created_at DESC` — the `ORDER BY` is free.

### Fix 2 — Select only needed columns

```sql
SELECT id, notification_type, message, created_at
FROM notifications
WHERE student_id = 1042 AND is_read = false
ORDER BY created_at DESC;
```

### Should every column be indexed?

No. Indexes speed up reads but slow down every INSERT, UPDATE, and DELETE because each index must be maintained. Over-indexing on a write-heavy notifications table (constant inserts) adds significant write overhead. Index only columns used in WHERE clauses, JOIN conditions, or ORDER BY on large tables.

### Placement notifications in last 7 days

```sql
SELECT student_id, message, created_at
FROM notifications
WHERE notification_type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

Add a partial index to accelerate this:

```sql
CREATE INDEX idx_notifications_placement_recent
ON notifications (created_at DESC)
WHERE notification_type = 'Placement';
```

---

## Stage 4 — Performance and Caching

### Problem

Notifications are fetched on every page load. With thousands of concurrent students, this hammers the database with identical or near-identical SELECT queries.

### Strategy 1 — Redis Cache

Cache per-student unread count and the 20 most recent notifications.

```
Key:   notif:unread:{studentId}   → integer (TTL 60s)
Key:   notif:recent:{studentId}   → JSON list (TTL 30s)
```

On a new notification INSERT, invalidate both keys for the target student. On cache miss, query PostgreSQL and repopulate.

**Tradeoff:** Adds Redis infrastructure cost and cache invalidation complexity. Stale data up to TTL seconds — acceptable for notification counts, not acceptable for billing or exam results (shorten TTL for Result/Placement types).

### Strategy 2 — Cursor-based Pagination

Instead of fetching all notifications:

```
GET /notifications?studentId=X&cursor=<last_seen_id>&limit=20
```

The cursor is the `created_at` timestamp of the last item on the previous page. The query becomes:

```sql
SELECT ... FROM notifications
WHERE student_id = $1 AND created_at < $cursor
ORDER BY created_at DESC LIMIT 20;
```

**Tradeoff:** Client must maintain cursor state. Prevents random page jumps but eliminates offset scans which get slower as offset grows.

### Strategy 3 — CDN / Edge Caching

For public or semi-public content (e.g., event announcements sent to all students), serve from a CDN edge node. The origin database is only hit on cache miss or TTL expiry.

**Tradeoff:** Only useful for shared content; per-student notifications cannot be cached at CDN level without per-user cache keys (expensive).

### Strategy 4 — Lazy Loading

Do not fetch notifications on page load. Open an SSE stream and only load the notification list when the student clicks the bell icon.

**Tradeoff:** Slightly worse UX on first open (small loading delay), but eliminates all background database reads for students who never check notifications.

---

## Stage 5 — Reliability: notify_all Redesign

### Original pseudocode (broken)

```
function notify_all(student_ids, message):
  for student_id in student_ids:
    send_email(student_id, message)   # fails at student 200 → all 49,800 after get nothing
    save_to_db(student_id, message)
    push_to_app(student_id, message)
```

### Problems

1. **Sequential loop** — processing 50,000 students one by one is too slow; takes hours
2. **Single point of failure** — if `send_email` throws at student 200, a Python/JS exception exits the loop; students 201–50,000 receive nothing
3. **Coupled operations** — DB save and email are in the same synchronous call; a network timeout on email leaves the DB in an inconsistent state (some saved, some not)
4. **No retry logic** — transient SMTP failures are permanent failures

### Redesigned pseudocode

```
function notify_all(student_ids, message):
  # Step 1: Persist all notifications first (single bulk INSERT — atomic)
  bulk_insert_notifications(student_ids, message)

  # Step 2: Enqueue delivery jobs (fast, non-blocking)
  for student_id in student_ids:
    queue.push({ student_id, message, type: "email",  retry_count: 0 })
    queue.push({ student_id, message, type: "push",   retry_count: 0 })

# Worker runs independently (multiple instances in parallel)
function worker():
  while true:
    job = queue.pop()
    try:
      if job.type == "email":  send_email(job.student_id, job.message)
      if job.type == "push":   push_to_app(job.student_id, job.message)
      mark_delivered(job.student_id, job.type)
    except TransientError:
      if job.retry_count < 3:
        delay = 2 ** job.retry_count  # exponential backoff: 1s, 2s, 4s
        queue.push(job with retry_count + 1, delay=delay)
      else:
        log_failed(job.student_id, job.type)
```

### Why this is better

| Issue | Fix |
|-------|-----|
| Sequential → slow | Multiple worker processes drain the queue in parallel |
| Crash stops all delivery | Each job is independent; one failure does not affect others |
| DB + email coupled | DB write is separated (bulk insert) before any email is attempted |
| No retry | Workers retry up to 3× with exponential backoff |
| No observability | `log_failed()` records every permanent failure for manual review |

---

## Stage 6 — Priority Inbox

### Algorithm

Each notification receives a **priority score**:

```
score = type_weight × recency_factor
recency_factor = 1 / (minutes_since_notification + 1)
```

| Type | Weight |
|------|--------|
| Placement | 3 |
| Result | 2 |
| Event | 1 |

A Placement notification from 2 minutes ago scores `3 / 3 = 1.0`.
The same Placement from 60 minutes ago scores `3 / 61 ≈ 0.049`.
An Event from 1 minute ago scores `1 / 2 = 0.5`.

Notifications are sorted descending by score; the top 10 form the priority inbox.

### Implementation

See `notification_app_be/priority_inbox.js`.

Run:
```bash
cd notification_app_be
node priority_inbox.js
```

### Sample output

```
=== PRIORITY INBOX — TOP 10 ===

1. [Placement ] Meta Platforms Inc. hiring       | Score: 0.0495 | 2026-05-01 22:01:03
2. [Result    ] mid-sem                          | Score: 0.0330 | 2026-05-02 05:01:21
3. [Placement ] Amazon hiring                    | Score: 0.0248 | 2026-05-01 19:01:00
4. [Result    ] internal                         | Score: 0.0165 | 2026-05-02 03:01:15
5. [Event     ] farewell                         | Score: 0.0083 | 2026-05-02 01:01:09
...
```

### API Endpoint

The same logic is exposed as `GET /notifications/priority?studentId=X&top=10` (see Stage 1) so any frontend can consume it without running the script locally.
