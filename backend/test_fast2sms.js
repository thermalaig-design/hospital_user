import { initializeFast2SMSService, verifyOTP } from './services/fast2smsService.js';

// Test Fast2SMS OTP functionality
async function testFast2SMS() {
  const phoneNumber = '7678417192'; // Test phone number
  
  console.log('🔍 Testing Fast2SMS OTP Integration...\n');
  
  try {
    // Test 1: Send OTP
    console.log('1️⃣ Testing OTP sending via Fast2SMS...');
    const sendResult = await initializeFast2SMSService(phoneNumber);
    
    console.log('✅ Send OTP Result:', sendResult);
    
    if (sendResult.success) {
      console.log('✅ OTP sent successfully via Fast2SMS!\n');
      
      // Note: In real scenario, you would get the actual OTP from SMS
      // For testing, we'll use a dummy OTP
      const testOTP = '123456'; // This should be the actual OTP received
      
      console.log('2️⃣ Testing OTP verification...');
      const verifyResult = verifyOTP(phoneNumber, testOTP);
      
      console.log('✅ Verify OTP Result:', verifyResult);
      
      if (verifyResult.success) {
        console.log('🎉 SUCCESS: Fast2SMS OTP integration working perfectly!');
      } else {
        console.log('❌ OTP verification failed:', verifyResult.message);
      }
    } else {
      console.log('❌ Failed to send OTP:', sendResult.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing Fast2SMS:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
(async () => {
  await testFast2SMS();
})();