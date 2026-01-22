# Marquee Updates Implementation Guide

## Overview
The marquee system displays scrolling notifications on the home page, pulling data dynamically from Supabase instead of using hardcoded values.

## Database Setup

### Create Marquee Table in Supabase
Run the SQL script: [create_marquee_table.sql](create_marquee_table.sql)

**Schema:**
```sql
create table public.marquee_updates (
  id serial not null,
  message text not null,
  is_active boolean null default true,
  priority integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  created_by character varying(100) null,
  updated_by character varying(100) null,
  constraint marquee_updates_pkey primary key (id)
) TABLESPACE pg_default;
```

**Features:**
- `message`: The text content displayed in marquee
- `is_active`: Controls visibility (only active messages shown)
- `priority`: Sorting order (lower numbers = higher priority)
- `created_at/updated_at`: Timestamps for audit trail
- `created_by/updated_by`: User tracking

### Sample Data
The SQL script includes 9 sample marquee messages that are automatically inserted.

## Backend Implementation

### Routes
**File:** [routes/marqueeRoutes.js](routes/marqueeRoutes.js)

- `GET /api/marquee` - Get all active marquee updates (public route)
- `GET /api/marquee/all` - Get all updates including inactive (admin only)
- `POST /api/marquee` - Add new marquee update (admin only)
- `PUT /api/marquee/:id` - Update marquee update (admin only)
- `DELETE /api/marquee/:id` - Delete marquee update (admin only)

### Controller
**File:** [controllers/marqueeController.js](controllers/marqueeController.js)

Functions implemented:
- `getMarqueeUpdates()` - Fetches active marquee messages
- `addMarqueeUpdate()` - Creates new message
- `updateMarqueeUpdate()` - Modifies existing message
- `deleteMarqueeUpdate()` - Removes message
- `getAllMarqueeUpdates()` - Fetches all messages (active + inactive)

## Frontend Implementation

### API Service
**File:** [src/services/api.js](../src/services/api.js)

Added function:
```javascript
export const getMarqueeUpdates = async () => {
  try {
    const response = await api.get('/marquee');
    return response.data;
  } catch (error) {
    console.error('Error fetching marquee updates:', error);
    throw error;
  }
};
```

### Home Page Component
**File:** [src/Home.jsx](../src/Home.jsx)

**Changes:**
1. Added state for dynamic marquee updates
2. Added loading state
3. Implemented useEffect hook to fetch marquee data from API
4. Messages sorted by priority
5. Fallback to default messages if fetch fails
6. Removed hardcoded marquee array

**Code:**
```javascript
const [marqueeUpdates, setMarqueeUpdates] = useState([...defaultMessages]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadMarqueeUpdates = async () => {
    try {
      setLoading(true);
      const response = await getMarqueeUpdates();
      if (response.success && response.data && response.data.length > 0) {
        const updates = response.data
          .sort((a, b) => (a.priority || 0) - (b.priority || 0))
          .map(item => item.message);
        setMarqueeUpdates(updates);
      }
    } catch (error) {
      console.error('Error loading marquee updates:', error);
    } finally {
      setLoading(false);
    }
  };

  loadMarqueeUpdates();
}, []);
```

## How It Works

1. **Backend:** Marquee route serves active messages from Supabase
2. **Frontend:** Home page fetches data on component mount
3. **Display:** Messages sorted by priority and displayed in scrolling marquee
4. **Fallback:** Default messages shown if API unavailable
5. **Admin:** Manage messages via `/api/marquee` endpoints

## API Response Format

```javascript
{
  success: true,
  data: [
    {
      id: 1,
      message: "Free Cardiac Checkup Camp on March 29, 2026",
      is_active: true,
      priority: 1,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      created_by: "admin",
      updated_by: "admin"
    },
    ...
  ],
  count: 9
}
```

## Testing

### Test Get Marquee Updates
```bash
curl -X GET http://localhost:5001/api/marquee
```

### Expected Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "message": "Free Cardiac Checkup Camp on March 29, 2026",
      "is_active": true,
      "priority": 1,
      ...
    }
  ],
  "count": 9
}
```

## Admin Operations

### Add New Message
```javascript
POST /api/marquee
{
  "message": "New message here",
  "priority": 0,
  "created_by": "admin"
}
```

### Update Message
```javascript
PUT /api/marquee/1
{
  "message": "Updated message",
  "is_active": true,
  "priority": 2,
  "updated_by": "admin"
}
```

### Delete Message
```javascript
DELETE /api/marquee/1
```

## Key Features

✅ **Dynamic Data:** Messages fetched from Supabase database
✅ **Priority Sorting:** Control message order with priority field
✅ **Active/Inactive:** Toggle visibility without deleting
✅ **Audit Trail:** Track creation/update by user and timestamp
✅ **Fallback:** Default messages if database unavailable
✅ **RLS Enabled:** Row-level security policies for data protection
✅ **RESTful API:** Standard CRUD operations

## Deployment Notes

1. Run the SQL script in Supabase to create the table and policies
2. Ensure marquee routes are registered in server.js (already done)
3. Deploy frontend and backend
4. Home page will automatically fetch marquee data on load

## Troubleshooting

**Marquee not updating:**
- Check browser console for errors
- Verify API endpoint is accessible
- Confirm Supabase connection
- Check if any messages are marked `is_active = false`

**Empty marquee:**
- Insert sample data using the provided SQL script
- Check database table has records
- Verify RLS policies allow public read access

**Slow loading:**
- Add loading spinner in marquee component
- Consider caching data in localStorage
- Implement request debouncing
