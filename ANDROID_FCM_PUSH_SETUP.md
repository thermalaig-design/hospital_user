# Android FCM Push Setup

Use this so `notifications` table inserts trigger real Android push (even when app is closed).

## 1. Run SQL migration

Run:

`backend/migrations/20260302_create_notification_devices.sql`

This creates `notification_devices` table used to store Android FCM tokens.

## 2. Backend env variables

Set one of these in backend environment:

- `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` (recommended)
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_SERVICE_ACCOUNT_PATH`

Also ensure existing Supabase vars are set:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 3. Android Firebase file

Place Firebase Android config file at:

`android/app/google-services.json`

Then run:

1. `npm install`
2. `npx cap sync android`
3. Rebuild app in Android Studio

## 4. Runtime flow

1. App registers FCM token via Capacitor Push Notifications.
2. Token is saved in `notification_devices` using `/api/notifications/device-token`.
3. Backend realtime worker listens for `notifications` table inserts.
4. Worker sends FCM push to mapped user device tokens.

