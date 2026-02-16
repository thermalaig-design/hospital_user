# Android Features & Configuration Guide

This guide documents all Android-specific features and configurations implemented in the Mah-Setu application for a seamless native Android experience.

## Features Implemented

### 1. **Status Bar & Navigation Bar Customization** 
**Hook:** `useAndroidStatusBar`

- Status bar styling with light content
- Automatic color matching with app navbar
- Navigation bar customization with dark buttons for light backgrounds
- Improves visual cohesion between status bar and app UI

**Location:** `src/hooks/useAndroidStatusBar.js`

### 2. **Haptic Feedback**
**Hook:** `useHapticFeedback`

Provides tactile feedback for user interactions:
- `lightTap()` - Light impact feedback (hover states)
- `mediumTap()` - Medium impact feedback (button clicks)
- `heavyTap()` - Heavy impact feedback (important actions)
- `success()` - Success notification pattern
- `warning()` - Warning notification pattern
- `error()` - Error notification pattern
- `selection()` - Selection feedback

**Usage Example:**
```javascript
const haptic = useHapticFeedback();

<button onClick={() => {
  haptic.mediumTap();
  // Perform action
}}>
  Click Me
</button>
```

**Location:** `src/hooks/useHapticFeedback.js`

### 3. **Safe Area Handling (Notch Support)**
**Hook:** `useAndroidSafeArea`

- Automatically detects and applies safe area insets
- Handles notches and system UI overlays
- Updates CSS variables for responsive design
- Works with orientation changes

**CSS Variables Available:**
- `--safe-area-top` - Top safe area (status bar height)
- `--safe-area-bottom` - Bottom safe area (navigation bar height)
- `--safe-area-left` - Left safe area
- `--safe-area-right` - Right safe area

**Location:** `src/hooks/useAndroidSafeArea.js`

### 4. **Screen Orientation**
**Hook:** `useAndroidScreenOrientation`

- Locks app to portrait orientation
- Prevents unwanted orientation changes
- Can dynamically change orientation if needed
- Supports unlocking for specific screens

**Usage Example:**
```javascript
useAndroidScreenOrientation('PORTRAIT'); // Lock to portrait
// or
useAndroidScreenOrientation('LANDSCAPE'); // Lock to landscape
```

**Location:** `src/hooks/useAndroidScreenOrientation.js`

### 5. **Keyboard Behavior**
**Hook:** `useAndroidKeyboard`

- Manages soft keyboard appearance and hiding
- Automatically adjusts view when keyboard appears
- Configures keyboard behavior on input focus
- Prevents content from being hidden under keyboard

**Methods:**
- `hideKeyboard()` - Manually hide the keyboard
- `showKeyboard()` - Manually show the keyboard

**Location:** `src/hooks/useAndroidKeyboard.js`

### 6. **Back Button Handling**
**Hook:** `useAndroidBackHandler`

- Handles hardware back button
- Handles virtual navigation bar back button
- Handles edge swipe gestures (system level)
- Smart navigation - goes back or exits app based on current screen
- Already implemented and active

**Location:** `src/hooks/useAndroidBackHandler.js`

### 7. **Scroll Locking**
- Implemented across all pages with sidebars
- Prevents scroll when menu/sidebar is open
- Applied to: Home, Directory, Appointments, Referral, Reports, Profile, Notifications, Notices
- Provides better UX when modals/sidebars are open

## Configuration

### Capacitor Configuration
**File:** `capacitor.config.json`

```json
{
  "appId": "com.maharajaagarsen.app",
  "appName": "Mah-Setu",
  "webDir": "dist",
  "plugins": {
    "StatusBar": { "style": "LIGHT", "backgroundColor": "#FFFFFF" },
    "NavigationBar": { "color": "#FFFFFF", "darkButtons": true },
    "Keyboard": { "resize": "body", "resizeOnFullScreen": true },
    "SplashScreen": { "launchAutoHide": true, "showSpinner": false }
  }
}
```

### Required Capacitor Plugins
All required plugins are already in `package.json`:

```
@capacitor/haptics
@capacitor/keyboard
@capacitor/navigation-bar
@capacitor/screen-orientation
@capacitor/status-bar
capacitor-plugin-safe-area
```

Install with:
```bash
npm install
```

## Usage in Components

### Import All Hooks at Once
```javascript
import {
  useAndroidBackHandler,
  useAndroidStatusBar,
  useHapticFeedback,
  useAndroidSafeArea,
  useAndroidScreenOrientation,
  useAndroidKeyboard
} from './hooks';
```

### Or Import Individually
```javascript
import { useHapticFeedback } from './hooks/useHapticFeedback';
const haptic = useHapticFeedback();
haptic.mediumTap();
```

### Example Component
```javascript
import React, { useState } from 'react';
import { useHapticFeedback } from './hooks';

const MyComponent = () => {
  const haptic = useHapticFeedback();

  const handleButtonClick = async () => {
    await haptic.mediumTap();
    // Perform action
  };

  return (
    <button onClick={handleButtonClick}>
      Click Me
    </button>
  );
};
```

## App.jsx Integration
All Android features are initialized in `App.jsx`:

```javascript
import { 
  useAndroidBackHandler,
  useAndroidStatusBar,
  useAndroidSafeArea,
  useAndroidScreenOrientation,
  useAndroidKeyboard
} from './hooks';

function HospitalTrusteeApp() {
  useAndroidBackHandler();
  useAndroidStatusBar();
  useAndroidSafeArea();
  useAndroidScreenOrientation('PORTRAIT');
  useAndroidKeyboard();

  // Rest of component
}
```

## Home Page Improvements
- Menu button click: `lightTap()` haptic feedback
- Notification bell: `lightTap()` haptic feedback
- Profile button: `lightTap()` haptic feedback
- Quick action cards: `mediumTap()` haptic feedback on click

## CSS Improvements
**File:** `src/index.css`

- Safe area variables support
- Smooth momentum scrolling (iOS-like on Android)
- Removed tap highlight color for cleaner interactions
- Fixed input font size to prevent zoom on focus
- Overscroll behavior containment

## Testing on Android

### Build for Android
```bash
npm run build
npx cap add android
npx cap build android
```

### Run on Device/Emulator
```bash
npx cap run android
```

### Debug
```bash
# Open Android Studio
npx cap open android
```

## Platform Detection
Most hooks automatically detect if running on Android:

```javascript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  // Android-specific code
}
```

## Troubleshooting

### Haptic Feedback Not Working
- Ensure device supports haptics (most modern Android devices do)
- Check that Capacitor is properly initialized
- Verify `@capacitor/haptics` is installed

### Safe Area Not Detected
- May need to manually update capacitor: `npx cap update`
- Some custom ROMs may not support safe area detection
- Fallback styling should still work

### Keyboard Issues
- Ensure `android:windowSoftInputMode="adjustResize"` in AndroidManifest.xml
- Test on actual device (emulator keyboard behavior differs)

### Status Bar Not Changing Color
- Try rebuilding with: `npx cap build android`
- May require app restart to apply changes
- Some custom ROMs may override status bar color

## Future Enhancements

1. **Deep Linking** - Add URL scheme support
2. **Notifications** - Push notification integration
3. **Biometric Auth** - Fingerprint/Face recognition
4. **Sharing** - Native share dialogs
5. **Camera** - Photo capture and upload
6. **File Picker** - Native file selection
7. **Permissions** - Runtime permission handling

## References

- [Capacitor Status Bar](https://capacitorjs.com/docs/apis/status-bar)
- [Capacitor Haptics](https://capacitorjs.com/docs/apis/haptics)
- [Capacitor Keyboard](https://capacitorjs.com/docs/apis/keyboard)
- [Safe Area Plugin](https://github.com/OskarErdfelt/capacitor-plugin-safe-area)
