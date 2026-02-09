# Android Back Navigation Setup

This document explains how Android back navigation is implemented in your React + Capacitor app.

## Features Implemented

✅ **Edge Swipe Gestures** (Left/Right) - System handles automatically  
✅ **Hardware Back Button** - Using `@capacitor/app` plugin  
✅ **Virtual Navigation Bar Back Button** - Same as hardware button  
✅ **Bottom Navigation Buttons** (3-button navigation) - Same handler  
✅ **Proper Back Stack Management** - Works with React Router  

## How It Works

### 1. System-Level Handling (Automatic)
- **Edge swipe gestures** (left/right screen edges) are handled by Android system automatically
- No code needed - WebView respects system gestures by default
- Works on Android 13+ with predictive back animations

### 2. App-Level Handling (Custom Code)
- **Hardware/virtual back buttons** are handled by our custom hook
- Uses `@capacitor/app` plugin to listen for back button events
- Integrates with React Router for proper navigation

## Implementation Details

### Files Modified/Added:

1. **`package.json`** - Added `@capacitor/app` dependency
2. **`android/app/src/main/AndroidManifest.xml`** - Added `android:enableOnBackInvokedCallback="true"` for predictive back gestures
3. **`src/hooks/useAndroidBackHandler.js`** - New custom hook (created)
4. **`src/App.jsx`** - Integrated the back handler hook

### The Hook Logic:

```javascript
useEffect(() => {
  const backButtonListener = App.addListener('backButton', () => {
    if (rootScreens.includes(location.pathname)) {
      // On home/root screen - exit app
      App.exitApp();
    } else {
      // Navigate back in history
      navigate(-1);
    }
  });

  return () => backButtonListener.remove();
}, [location.pathname, navigate]);
```

### Root Screens (Where App Exits):
- `/` (Home)
- `/home` 
- `/login`

All other screens will navigate back in the history stack.

## Testing Instructions

### Test Edge Swipe Gestures:
1. Build and install the APK on Android device
2. Navigate to any screen (e.g., Profile, Directory)
3. Swipe from left edge of screen towards right
4. Should go back to previous screen
5. On home screen, swipe should exit app

### Test Hardware Back Button:
1. Press physical back button on device
2. Should behave same as swipe gesture

### Test Virtual Navigation Bar:
1. On devices with on-screen navigation buttons
2. Press the back button
3. Should behave same as above

### Test Bottom 3-Button Navigation:
1. On older Android devices with 3-button navigation
2. Press the back button
3. Should work identically

## Build Commands

```bash
# Development
npm run build
npx cap sync
npx cap run android

# Production
npm run build
npx cap sync
npx cap build android
```

## Troubleshooting

### If back button doesn't work:
1. Make sure `@capacitor/app` is installed: `npm list @capacitor/app`
2. Check that `useAndroidBackHandler()` is called in App.jsx
3. Verify AndroidManifest.xml has `enableOnBackInvokedCallback="true"`

### If swipe gestures don't work:
1. This is usually a system-level issue
2. Make sure your device supports gesture navigation
3. Check device settings: System > Gestures > System navigation

### If app doesn't exit on home screen:
1. Verify root screens are correctly defined in the hook
2. Check console logs for debugging

## Customization

You can modify the behavior by editing `src/hooks/useAndroidBackHandler.js`:

### Add Modal/Drawer Handling:
```javascript
const backButtonListener = App.addListener('backButton', () => {
  if (isModalOpen) {
    closeModal();
    return;
  }
  
  if (isDrawerOpen) {
    closeDrawer();
    return;
  }
  
  // ... rest of logic
});
```

### Change Root Screens:
```javascript
const rootScreens = ['/', '/home', '/dashboard', '/main'];
```

### Add Confirmation Before Exit:
```javascript
if (rootScreens.includes(location.pathname)) {
  const confirm = window.confirm('Exit the app?');
  if (confirm) {
    App.exitApp();
  }
}
```

## Compatibility

- ✅ Android 5.0+ (API 21+)
- ✅ All navigation modes: Gesture, 3-button, 2-button
- ✅ React Router v6+
- ✅ Capacitor v5+

## Notes

1. The `android:enableOnBackInvokedCallback="true"` enables predictive back gestures on Android 13+
2. Edge swipe gestures work automatically - no JavaScript needed
3. The hook automatically cleans up event listeners to prevent memory leaks
4. Works with both `navigate(-1)` and `window.history.back()`

## References

- [Capacitor App Plugin Documentation](https://capacitorjs.com/docs/apis/app)
- [Android Back Navigation Guidelines](https://developer.android.com/guide/navigation/navigation-principles)
- [React Router Navigation](https://reactrouter.com/en/main/hooks/use-navigate)