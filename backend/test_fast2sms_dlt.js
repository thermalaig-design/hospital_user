import { initializeFast2SMSService } from './services/fast2smsService.js';

// Test Fast2SMS DLT route implementation
async function testFast2SMSDLT() {
  const phoneNumber = '7678417192'; // Test phone number
  
  console.log('🔍 Testing Fast2SMS DLT Route Implementation...\n');
  
  try {
    // Test sending OTP via DLT route
    console.log('1️⃣ Testing OTP sending via Fast2SMS DLT route...');
    const sendResult = await initializeFast2SMSService(phoneNumber);
    
    console.log('✅ DLT Route Send Result:', sendResult);
    
    if (sendResult.success) {
      console.log('✅ OTP sent successfully via Fast2SMS DLT route!\n');
      console.log('🎉 SUCCESS: Fast2SMS DLT integration working perfectly!');
    } else {
      console.log('❌ Failed to send OTP via DLT route:', sendResult.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing Fast2SMS DLT:', error.message);
    // This is expected if DLT verification is not complete
    console.log('⚠️ This error is expected if DLT verification is not complete in your Fast2SMS account');
  }
}

// Run the test
(async () => {
  await testFast2SMSDLT();
})();