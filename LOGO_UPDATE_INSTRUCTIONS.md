# Logo Update Instructions

## Steps to Update App Icon with New Maharaja Agrasen Logo

### 1. Save the New Logo Image
- Save the correct Maharaja Agrasen Group of Hospitals logo (the one with red ring and circular text) as an image file
- Recommended formats: PNG (with transparency) or JPG
- Recommended size: At least 512x512 pixels or larger (square image works best)
- Save it in the project root directory as `new_logo.png`

### 2. Run the Icon Generation Script
Open terminal/command prompt in the project root and run:

```bash
node resize_icon.js new_logo.png
```

Or using npm script:
```bash
npm run resize-icon new_logo.png
```

Or if your logo has a different name:
```bash
node resize_icon.js your_logo_file.png
```

### 3. Verify the Icons
The script will:
- ✅ Generate all Android icon sizes (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- ✅ Update the web logo in `src/assets/logo.png`
- ✅ Create icons for both regular and round launcher icons

### 4. Rebuild the Android App
After generating the icons:
1. Clean the Android build:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. Rebuild the app:
   ```bash
   npx cap sync android
   ```

3. Build and install the app to see the new icon

### 5. Test
- Check the app icon on your Android device/emulator
- Check the web favicon in the browser
- The icon should now show the correct Maharaja Agrasen Group of Hospitals logo

## Notes
- Make sure the source logo image is high quality (at least 512x512)
- The script automatically handles transparency if your logo has it
- If icons don't update immediately, try clearing the app cache or uninstalling/reinstalling the app

