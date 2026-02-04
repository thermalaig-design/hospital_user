# Fast2SMS OTP Integration Guide

## Overview
This document explains how to integrate Fast2SMS as an OTP service provider in your hospital management system.

## Prerequisites
1. Fast2SMS account - Sign up at [https://www.fast2sms.com](https://www.fast2sms.com)
2. API Key from Fast2SMS dashboard
3. Valid Indian mobile number for testing

## Setup Instructions

### 1. Get Fast2SMS API Key
1. Login to your Fast2SMS account
2. Go to **Dev API** section
3. Copy your **API Key**

### 2. Update Environment Variables
Add these variables to your `backend/.env` file:

```env
# Fast2SMS Configuration
FAST2SMS_API_KEY=your_fast2sms_api_key_here
FAST2SMS_SENDER_ID=TEIPVT
# DLT (India) - required for route=dlt
# Example values based on your DLT approval:
FAST2SMS_ENTITY_ID=1707177010134921507
FAST2SMS_MESSAGE_ID=208140
OTP_SERVICE_PREFERENCE=fast2sms  # Options: 'fast2sms' or 'msg91'
```

### 3. Service Preference Options
- `fast2sms` - Use Fast2SMS as primary service (fallback to MSG91)
- `msg91` - Use MSG91 as primary service (fallback to Fast2SMS)

## How It Works

### OTP Sending Flow
1. User enters phone number in login
2. System generates 6-digit OTP
3. Stores OTP locally with expiry (5 minutes default)
4. Sends OTP via Fast2SMS API
5. User receives SMS with OTP

### OTP Verification Flow
1. User enters received OTP
2. System verifies against stored OTP
3. If Fast2SMS verification fails, falls back to MSG91
4. If all services fail, uses local verification

## API Endpoints Used

### Send OTP via DLT Route
```
GET https://www.fast2sms.com/dev/bulkV2
Parameters:
- route: dlt
- sender_id: TEIPVT
- entity_id: 1707177010134921507 (your DLT Entity ID)
- message: 208140 (your DLT Template/Message ID)
- variables_values: OTP_VALUE|EXPIRY_MINUTES
- flash: 0
- numbers: PHONE_NUMBER (10 digits)
Headers:
- authorization: YOUR_API_KEY
```

## Testing

### Run Test Script
```bash
cd backend
node test_fast2sms.js
```

### Manual Testing
1. Start your backend server
2. Use the login flow with a registered phone number
3. Check if OTP is received via Fast2SMS
4. Enter OTP to verify

## Fallback Mechanism
The system has multiple fallbacks:
1. **Primary**: Fast2SMS (if configured)
2. **Secondary**: MSG91 (if Fast2SMS fails)
3. **Tertiary**: Local verification (in-memory storage)

## Error Handling
- Automatic retry with fallback services
- Detailed logging for debugging
- Graceful degradation when services are down

## Security Features
- OTP expiry (default 5 minutes)
- Maximum 3 verification attempts
- Automatic cleanup of expired OTPs
- Secure storage in memory only

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Check if API key is correct
   - Ensure API key has sufficient credits

2. **Phone Number Format**
   - Use 10-digit Indian numbers
   - No country code prefix needed

3. **SMS Not Received**
   - Check Fast2SMS account balance
   - Verify phone number is correct
   - Check spam/junk folders

4. **Verification Fails**
   - Ensure OTP hasn't expired
   - Check maximum attempts not exceeded
   - Verify correct OTP entered

### Logs to Check
```bash
# Backend logs show:
- 🔄 Using Fast2SMS as primary OTP service
- ✅ Fast2SMS OTP sent successfully
- 🔍 Verifying OTP for PHONE_NUMBER
- 🔒 OTP stored for PHONE_NUMBER
```

## Migration from MSG91

If you want to switch completely to Fast2SMS:
1. Set `OTP_SERVICE_PREFERENCE=fast2sms`
2. Ensure `FAST2SMS_API_KEY` is configured
3. Test thoroughly before going live
4. MSG91 credentials can be kept as backup

## Support
For Fast2SMS API issues:
- Check [Fast2SMS Documentation](https://docs.fast2sms.com/)
- Contact Fast2SMS support
- Verify API key and account status

## Example Usage

```javascript
// In your auth controller
import { initializePhoneAuth } from '../services/otpService.js';

// This will automatically use Fast2SMS if configured
const result = await initializePhoneAuth('9876543210');
```

The system handles all the complexity of service selection and fallback automatically.