# 🧪 Emulator Notification Testing Guide

## Quick Start - Test Notifications in 30 Seconds

### Step 1: Open Browser DevTools in Emulator
1. While app is running in Android Studio emulator
2. Click your phone number to open sidebar
3. Go to **Settings → Developer Options** (scroll down in Notifications page)

### Step 2: Open JavaScript Console
1. In Chrome DevTools (F12 or DevTools extension)
2. Go to **Console** tab

### Step 3: Run Test Command
Copy and paste this command in the console:

```javascript
window.quickTest()
```

**That's it!** You should see a notification appear on the emulator screen within 5 seconds! 🎉

---

## Detailed Testing Steps

### For Current Logged-In User

#### Method 1: Using Quick Test (Easiest)
```javascript
// Opens console and run:
window.quickTest()

// Wait 5 seconds and you should see notification appear!
```

#### Method 2: Using Specific Phone Number
```javascript
// Replace with your phone number:
window.testNotification('9876543210')

// Wait 5 seconds
```

#### Method 3: Check Your User ID First
```javascript
// See what user ID is being used:
console.log(window.notificationDebug.userId)

// Output: "9876543210" (your phone number)
```

### Verification Commands

#### Check if Notification Was Created in Database
```javascript
// View notification tracker
const userId = window.notificationDebug.userId
const tracker = JSON.parse(localStorage.getItem(`shownNotifications_${userId}`))
console.log('Shown notifications:', tracker)
```

#### Get Help in Console
```javascript
// Shows all available commands:
console.log(window.notificationDebug.help)
```

---

## What Should Happen

### Successfully Working Notification Flow:

1. ✅ You run `window.quickTest()`
2. ✅ Console shows: `"✅ Test notification sent successfully!"`
3. ✅ Within 5 seconds, notification appears at top of emulator screen
4. ✅ Notification shows:
   - Title: 🧪 Test Notification
   - Message: Hindi and English text about test system
   - Time/Date info
5. ✅ You can tap notification → Opens Notifications page
6. ✅ Notification appears in your notification list

### If It's Not Working

**Check these in order:**

#### 1️⃣ Verify App is Downloaded
```javascript
// Should return your phone number (you're logged in):
window.notificationDebug.userId

// If empty/null → You need to log in first
```

#### 2️⃣ Check Backend is Running
- Open terminal where backend runs
- Should show: `🚀 Server is running on port 5002`
- If not, run: `cd backend && npm start`

#### 3️⃣ Check Permissions
- Emulator Settings → Apps → Your App → Notifications
- Toggle "Allow notifications" ON

#### 4️⃣ Check Logcat Output
In Android Studio:
1. View → Tool Windows → Logcat
2. Search for: `NotifListener`
3. Look for messages like:
   - `📢 [NotifListener] Polling for notifications...`
   - `📢 [NotifListener] New notification detected`

#### 5️⃣ Check Supabase Connection
In Console, run:
```javascript
// This checks if app can talk to Supabase:
fetch('https://mah.contractmitra.in/api/notifications/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: window.notificationDebug.userId })
})
.then(r => r.json())
.then(d => console.log('Server response:', d))
.catch(e => console.error('Server error:', e))
```

---

## Emulator-Specific Setup

### If Using Android Studio Emulator WITHOUT Google Play Services:

**Don't worry!** The app uses Capacitor LocalNotifications which works without Google Play Services.

**For notifications to show:**

1. ✅ Emulator must be running (obvious but important!)
2. ✅ App must be installed and running
3. ✅ Notification permissions must be granted
4. ✅ Backend must be running on your computer

### EmulatorOptions for Better Testing:

**Recommended Emulator Settings:**
- Device: Pixel 5 or Pixel 6 Pro
- API Level: 31 or higher
- RAM: 2GB minimum (4GB recommended)
- Target: Android 12 or higher

**Enable in Emulator Advanced Settings:**
- ✅ Use Host GPU
- ✅ Boot animation (doesn't affect notifications)

---

##Test Scenarios

### Scenario 1: Test Basic Notification
```javascript
window.quickTest()
// Expected: See notification within 5 seconds
```

### Scenario 2: Send Multiple Test Notifications
```javascript
// Send 3 test notifications
window.testNotification('9876543210')
setTimeout(() => window.testNotification('9876543210'), 1000)
setTimeout(() => window.testNotification('9876543210'), 2000)

// You should see 3 different notifications appear
```

### Scenario 3: Test After Booking Appointment
```javascript
// 1. Use app to book an appointment
// 2. Notification should appear automatically
// 3. Or use: window.quickTest()
```

### Scenario 4: Test Different Notification Types
```javascript
// Appointments are tested with:
window.testNotification('your_phone')

// For referrals: Create a referral in the app
// For birthdays: Set DOB to today and restart app
```

---

## Debug Output Explanation

### Expected Console Logs:

```
📢 [NotifListener] Setting up real-time listener for user: 9876543210
📢 [NotifListener] Polling for notifications...
📢 [NotifListener] Real-time subscription status: SUBSCRIBED
🧪 Triggering test notification for user: 9876543210
✅ Test notification sent successfully!
📢 [NotifListener] Found 1 notifications
📢 [NotifListener] New notification detected: 🧪 Test Notification
📢 [NotifListener] Showing push notification: 🧪 Test Notification
📢 [NotifListener] Permission result: granted
📢 [NotifListener] Push notification scheduled! ID: 1704...
```

### If You See These Errors:

#### Error: "No user found in localStorage"
- **Fix**: Log in to the app first
- **Command**: Restart app and log in

#### Error: "OFFLINE" subscription status
- **Fix**: Check internet connection on host machine
- **Command**: `ping google.com` to verify

#### Error: "Permission not granted"
- **Fix**: Grant notification permissions
- **Step**: Emulator Settings → Apps → App → Notifications → Allow

#### Error: "Failed to send test notification"
- **Fix**: Backend is not running
- **Command**: `cd backend && npm start`

---

## Logcat Monitoring (Advanced)

To see detailed logs in Android Studio:

1. Open: **View → Tool Windows → Logcat**
2. Filter by tag: `CapacitorLocalNotif` or `NotifListener`
3. Watch logs while running `window.quickTest()`

Expected logs:
```
I CapacitorLocalNotif: Creating notification channel
I CapacitorLocalNotify: Scheduled notification with ID: 1704...
I NotifListener: Polling found new notification
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Notification not showing | Run `window.quickTest()` - check console for errors |
| "Cannot read property 'testNotification'" | Wait for app to fully load (2-3 seconds) |
| Notification appears but no sound | Sound is muted for test notifications (by design) |
| Same notification shows twice | Clear localStorage: `localStorage.clear()` |
| App crashes on notification | Update Capacitor: `npm install @capacitor/core@latest` |

---

## Once Testing is Complete

### For Real-World Testing:
1. ✅ Book an appointment → Notification appears automatically
2. ✅ Create a referral → Notification appears automatically  
3. ✅ Birthday: Set DOB to today → Notification on app restart
4. ✅ Admin changes status → User gets notification

### Deploy to Real Device:
1. Run: `npx cap open android`
2. Build APK in Android Studio
3. Install on device
4. Use `window.quickTest()` to verify on real phone

---

## Need Help?

If notifications still aren't working:

1. **Check backend logs**: `npm start` in backend folder
2. **Check app console**: DevTools Console tab
3. **Check device permissions**: Settings → Apps → Notifications
4. **Check Supabase**: Database should show new `notifications` records
5. **Restart everything**: App, emulator, backend

🎉 **You're ready to test!** Run `window.quickTest()` now!
