## Notification System – Full Stack Implementation Specification

Implement a complete notification system for the Weather Dashboard using **Next.js (frontend)** and **NestJS + PostgreSQL + Prisma (backend)**. The current notification bell icon in the header is only decorative; make it fully functional.

### Goal

Create a production-ready notification feature with authentication-aware visibility, backend-managed notification data, unread state, and a premium minimal dropdown UI.

---

# Authentication Behavior

- The notification bell icon must be visible **only when a user is authenticated**.
- If the user is not logged in, the icon must not be rendered at all.
- Authentication state is determined from the existing JWT-based auth system.
- The frontend should rely on the auth store / session state, not on local assumptions.

---

# Backend Requirements (NestJS)

Create a dedicated **Notifications module**.

## Prisma Model

```prisma
model Notification {
  id         String   @id @default(cuid())
  userId     String
  title      String
  message    String
  type       NotificationType @default(INFO)
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

enum NotificationType {
  INFO
  WEATHER_ALERT
  SYSTEM
  WARNING
}
```

Run a Prisma migration after adding the model.

---

# API Endpoints

All endpoints must be protected with the existing **JWT Auth Guard**.

## Get Notifications

```http
GET /notifications
```

Query params:

- `limit` (default 20)
- `offset` (default 0)

Response:

```json
[
  {
    "id": "ntf_1",
    "title": "Rain expected today",
    "message": "Light rain is expected between 14:00 and 18:00.",
    "type": "WEATHER_ALERT",
    "isRead": false,
    "createdAt": "2026-08-04T08:30:00Z"
  }
]
```

---

## Unread Count

```http
GET /notifications/unread-count
```

Response:

```json
{
  "count": 3
}
```

---

## Mark Single Notification as Read

```http
PATCH /notifications/:id/read
```

Response:

```json
{
  "success": true
}
```

---

## Mark All as Read

```http
PATCH /notifications/read-all
```

Response:

```json
{
  "success": true
}
```

---

## Delete Notification (optional but recommended)

```http
DELETE /notifications/:id
```

---

# Backend Service Rules

- Notifications must always be filtered by the authenticated user ID.
- Sort by `createdAt DESC`.
- Never expose notifications belonging to another user.
- Use DTO validation for all request parameters.
- Return proper HTTP status codes.

---

# Seed Data

Create a small seed script that inserts sample notifications for development:

- Weather alert
- Air quality warning
- System update
- Forecast reminder

---

# Frontend Requirements (Next.js)

Create a reusable component:

```text
components/header/NotificationBell.tsx
```

Use:

- **shadcn/ui Popover** (preferred) or DropdownMenu.
- Framer Motion for subtle fade/slide animation.

---

# Header Integration

- Place the bell icon on the right side of the header next to the search/settings icons.
- Show a small unread badge when unread count > 0.
- Hide the entire component when the user is not authenticated.

Example badge:

```text
🔔 3
```

---

# Dropdown Design

### Visual Style

- Width: `320px`
- Max height: `420px`
- Scrollable content area
- Dark glassmorphism background
- Rounded corners
- Soft border and shadow
- Minimal spacing consistent with the dashboard

### Header

Display:

- **Notifications**
- Unread count
- "Mark all as read" action button

---

# Notification Item Layout

Each item should contain:

- Small type icon
- Title
- Short message (max 2 lines)
- Relative time (e.g. “5m ago”, “2h ago”)

Unread items:

- Slightly brighter background
- Left accent dot or border

Read items:

- Lower opacity

---

# Interaction Behavior

### Click Bell

- Open/close dropdown.

### Click Notification

- Mark as read via API.
- Update unread badge immediately.
- Optionally navigate to a related page later.

### Click “Mark all as read”

- Call backend endpoint.
- Optimistically update UI.

### Outside Click / Escape

- Close dropdown.

---

# Empty State

When there are no notifications:

- Show a centered empty state icon.
- Text: **No notifications yet**.

---

# Loading & Error States

### Loading

- Show skeleton placeholders for 3 items.

### Error

- Show compact inline error message with a retry button.

---

# State Management

Create a dedicated store (Zustand or React Query).

Example state:

```ts
type NotificationState = {
  items: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};
```

---

# Performance

- Fetch notifications lazily when the dropdown is opened for the first time.
- Cache results for a short period (e.g. 60 seconds).
- Refetch unread count on app focus.

---

# Accessibility

- Bell button must have `aria-label="Notifications"`.
- Dropdown should be keyboard navigable.
- Focus should move into the dropdown when opened.
- Escape closes the dropdown.

---

# Weather-Specific Notification Examples

Use realistic weather events:

- "Heavy rain expected this evening"
- "UV index will be very high at 13:00"
- "Air quality has improved to Moderate"
- "Strong winds expected tomorrow morning"

---

# Acceptance Criteria

The implementation is complete only if:

- Bell icon appears only for logged-in users.
- Notifications are stored and served from PostgreSQL.
- JWT-protected endpoints work correctly.
- Unread badge updates in real time after user actions.
- Dropdown is minimal, scrollable, and visually consistent with the dashboard.
- Mark-as-read and mark-all-as-read work end-to-end.
- Empty, loading, and error states are handled gracefully.
- The feature is fully typed with TypeScript and integrated into the existing project architecture.
