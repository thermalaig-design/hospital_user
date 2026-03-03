# 📱 Notifications Table Architecture & Integration

## Database Table: `public.notifications`

### Table Schema
```sql
create table public.notifications (
  id uuid not null default gen_random_uuid(),
  user_id text not null,
  title text not null,
  message text not null,
  is_read boolean null default false,
  type text null default 'general'::text,
  created_at timestamp with time zone null default now(),
  target_audience text null,
  constraint notifications_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists notifications_user_id_idx 
  on public.notifications using btree (user_id) TABLESPACE pg_default;

create index IF not exists notifications_created_at_idx 
  on public.notifications using btree (created_at desc) TABLESPACE pg_default;
```

### Table Fields
| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Unique notification identifier (auto-generated) |
| `user_id` | text | Target user (phone number or membership ID) |
| `title` | text | Notification title (e.g., "Appointment Updated") |
| `message` | text | Notification message body |
| `is_read` | boolean | Read status (default: false) |
| `type` | text | Notification type (default: 'general') |
| `created_at` | timestamp | Auto-generated timestamp |
| `target_audience` | text | For broadcast notifications to audience segment |

---

## 🔄 Data Flow: Database → App UI

### 1. **Database Insert (Trigger)**
When a database trigger fires (e.g., appointment status change), it inserts a record:
```sql
INSERT INTO public.notifications (user_id, title, message, type, created_at)
VALUES ('8765432109', 'Appointment Confirmed', 'Your appointment is confirmed', 'appointment', now());
```

### 2. **Frontend Fetches Notifications**
Location: `src/services/api.js` → `getUserNotifications()`
```javascript
// Queries Supabase notifications table for current user
const { data: userNotifications } = supabase
  .from('notifications')
  .select('*')
  .in('user_id', userIdVariants)  // Matches phone, mobile, membership ID
  .order('created_at', { ascending: false });
```

### 3. **Home Page Displays Notifications**
Location: `src/Home.jsx`

**Display Methods:**
- ✅ **Notification Bell Dropdown** - Shows 4 most recent notifications
- ✅ **Live Updates** - Refetches every 30 seconds
- ✅ **Push Notification Trigger** - Refetches when push arrives in foreground
- ✅ **Unread Badge** - Shows count of unread notifications

**UI Location:**
```
Home Page Header
  └─ Bell Icon (notification-button)
     └─ Dropdown Panel (notification-dropdown)
        ├─ Notifications List (max 4 visible)
        ├─ Mark as Read
        ├─ Clear All
        └─ View All Link
```

---

## 🎯 Notification Flow Summary

```
Trigger Event (Appointment Change)
    ↓
INSERT INTO public.notifications
    ↓
Frontend: getUserNotifications() (every 30s or on push)
    ↓
State: setNotifications(data)
    ↓
Render: <notification-dropdown>
    ↓
User Sees Notification in Home Page Bell Icon
    ↓
User Can: Mark Read / Dismiss / View All
```

---

## 📲 Notification Actions

### Mark as Read
- Endpoint: `markNotificationAsRead(id)`
- Updates: `is_read = true`

### Mark All as Read
- Endpoint: `markAllNotificationsAsRead()`
- Updates: All notifications → `is_read = true`

### Delete/Dismiss
- Endpoint: `deleteNotification(id)`
- Removes notification from database

### Auto-Refetch Triggers
1. **On App Load** - Fetches immediately
2. **Every 30 seconds** - Regular polling
3. **On Push Notification Received** - Custom event listener
4. **On Birthday Notification** - Custom event listener

---

## ✅ Current Status

The notifications table is:
- ✅ Defined in `create_notifications_table.sql`
- ✅ Integrated with `src/Home.jsx` UI
- ✅ Fetching from Supabase via `src/services/api.js`
- ✅ Displaying in notification dropdown
- ✅ Supporting user interactions (read, dismiss, clear)
- ✅ Auto-updating with real-time listeners

---

## 🚀 To Create This Table in Supabase

1. Go to Supabase SQL Editor
2. Copy the table schema above
3. Execute the SQL
4. Table will be automatically included in realtime publication
5. Notifications will appear in Home page bell icon when inserted

---

## 📍 Code References

- **Database Integration**: `src/services/api.js` (lines 328-370)
- **Frontend Component**: `src/Home.jsx` (lines 223-265)
- **Notification UI**: `src/Home.jsx` (lines 454-530)
- **Push Notification Listener**: `src/services/pushNotificationService.js` (line 62)

