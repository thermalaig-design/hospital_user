# Referral Notification System Setup

## Overview
This document explains how the referral notification system works. When an admin approves, rejects, or adds a remark to a referral, the user will receive a notification in their app (bell icon on home page).

## What Was Done

### 1. Created Notification Trigger (`backend/create_referral_notification_trigger.sql`)
- **Trigger Function**: `notify_referral_changes()`
- **Triggers On**: 
  - Status changes (Pending → Approved/Rejected/Completed)
  - Remark added/updated
- **Notification Recipients**:
  - User who created the referral (uses `user_phone` or `user_id`)
  - Admin users (for admin panel)

### 2. Updated Notification Controller (`backend/controllers/notificationController.js`)
- Added support to fetch referral notifications
- Matches notifications by phone number and referral user IDs
- Works seamlessly with existing appointment notifications

## Notification Messages

### When Referral is Approved:
```
Title: "Referral Approved"
Message: 
Hello [User Name], great news! Your referral request (ID: #[id]) for patient [Patient Name] has been approved.

👤 Patient: [Patient Name]
👨‍⚕️ Referred To: Dr. [Doctor Name]
🏥 Department: [Department] (if available)
📋 Category: [General/EWS]

📝 Admin Message:
"[Remark if available]"
```

### When Referral is Rejected:
```
Title: "Referral Rejected"
Message:
Hello [User Name], we regret to inform you that your referral request (ID: #[id]) for patient [Patient Name] has been rejected.

👤 Patient: [Patient Name]
👨‍⚕️ Referred To: Dr. [Doctor Name]
🏥 Department: [Department] (if available)
📋 Category: [General/EWS]

📝 Reason:
"[Remark if available]"
Please contact the hospital for more details.
```

### When Referral is Completed:
```
Title: "Referral Completed"
Message:
Hello [User Name], your referral request (ID: #[id]) for patient [Patient Name] has been marked as completed.

👤 Patient: [Patient Name]
👨‍⚕️ Referred To: Dr. [Doctor Name]
🏥 Department: [Department] (if available)
📋 Category: [General/EWS]

📝 Notes:
"[Remark if available]"
```

### When Remark is Added (Status unchanged):
```
Title: "New Message Regarding Your Referral"
Message:
Hello [User Name], you have received a new message regarding your referral request (ID: #[id]) for patient [Patient Name].

👤 Patient: [Patient Name]
👨‍⚕️ Referred To: Dr. [Doctor Name]
📋 Status: [Current Status]

📝 Message:
"[Remark]"
```

## Setup Instructions

### Step 1: Run the SQL Trigger
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `backend/create_referral_notification_trigger.sql`
4. Run the SQL script
5. Verify the trigger was created successfully

### Step 2: Restart Backend Server
The notification controller has been updated, so restart your backend server:
```bash
cd backend
npm start
# or
node server.js
```

### Step 3: Test the System
1. Create a referral through the app
2. In admin panel, update the referral status to "Approved" or "Rejected"
3. Check the user's app - notification should appear in the bell icon on home page

## How It Works

1. **User creates referral** → Stored in `referrals` table with `user_phone` or `user_id`
2. **Admin updates referral** → Status changes or remark added
3. **Trigger fires** → `notify_referral_changes()` function executes
4. **Notification created** → Inserted into `notifications` table with:
   - `user_id`: User's phone number (from `user_phone` or `user_id`)
   - `title`: Status-specific title
   - `message`: Formatted message with all details
   - `type`: `'referral_update'` (for users) or `'referral_update_admin'` (for admin)
5. **User opens app** → Notification appears in bell icon on home page
6. **User clicks notification** → Can view full details

## Notification Matching Logic

The notification controller matches notifications using:
1. **Direct phone match**: `notifications.user_id = user_phone`
2. **Appointment patient names**: Finds patient names from appointments table
3. **Referral user IDs**: Finds user IDs from referrals table

This ensures all notifications are properly delivered to the correct user.

## Notes

- Notifications use `user_phone` (preferred) or `user_id` from the referrals table
- Admin notifications are sent to `user_id = 'admin'` for admin panel
- All notifications are sorted by `created_at` descending (newest first)
- Notifications support emojis and formatted text for better readability

## Troubleshooting

### Notifications not appearing?
1. Check if trigger was created: Run the verification query in the SQL file
2. Check backend logs: Look for notification creation messages
3. Verify user_phone: Ensure referrals table has correct `user_phone` or `user_id`
4. Check notification table: Query `SELECT * FROM notifications WHERE type = 'referral_update' ORDER BY created_at DESC LIMIT 10;`

### Trigger not firing?
1. Verify trigger exists: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'referral_changes_notification_trigger';`
2. Check if status/remark actually changed: Trigger only fires on actual changes
3. Check Supabase logs for any errors

## Files Modified

1. `backend/create_referral_notification_trigger.sql` - New trigger function
2. `backend/controllers/notificationController.js` - Updated to handle referral notifications

