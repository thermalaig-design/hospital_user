import axios from 'axios';

// Test the OTP functionality
async function testOTP() {
  // Use the provided phone number
  const phoneNumber = '7678417192';
  const API_URL = 'http://localhost:5001/api/auth';

  console.log('Testing OTP functionality with phone number:', phoneNumber);

  try {
    // Test sending OTP
    console.log('\n1. Testing send OTP...');
    const sendResponse = await axios.post(`${API_URL}/check-phone`, {
      phoneNumber: phoneNumber
    });
    
    console.log('Send OTP Response:', sendResponse.data);
    
    if (sendResponse.data.success) {
      console.log('✅ OTP sent successfully!');
      
      // If OTP was sent successfully, we could test verification
      // For this test, we'll skip actual verification since we don't know the OTP
      console.log('\n2. OTP sending test completed successfully!');
      console.log('Note: Actual OTP verification would require the received OTP code.');
    } else {
      console.log('❌ Failed to send OTP:', sendResponse.data.message);
    }
  } catch (error) {
    console.error('❌ Error testing OTP functionality:', error.response?.data || error.message);
  }
}

// Run the test
(async () => {
  await testOTP();
})();