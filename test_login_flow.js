// Test script to verify the login flow
import axios from 'axios';

const API_URL = 'http://localhost:5002/api/auth';

async function testLoginFlow() {
  try {
    console.log('🧪 Testing login flow...\n');
    
    // Test 1: Check phone number
    console.log('1️⃣ Testing phone check...');
    const phoneResponse = await axios.post(`${API_URL}/check-phone`, {
      phoneNumber: '7678417192'
    });
    
    console.log('✅ Phone check response:', phoneResponse.data);
    
    if (phoneResponse.data.success) {
      console.log('✅ Phone number found in database\n');
      
      // Test 2: Verify OTP with master code
      console.log('2️⃣ Testing OTP verification with master code 123456...');
      const otpResponse = await axios.post(`${API_URL}/verify-otp`, {
        phoneNumber: '7678417192',
        otp: '123456'
      });
      
      console.log('✅ OTP verification response:', otpResponse.data);
      
      if (otpResponse.data.success) {
        console.log('🎉 SUCCESS: Login flow working perfectly!');
        console.log('You can now login with:');
        console.log('- Phone: 7678417192');
        console.log('- OTP: 123456');
      } else {
        console.log('❌ OTP verification failed');
      }
    } else {
      console.log('❌ Phone number not found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLoginFlow();