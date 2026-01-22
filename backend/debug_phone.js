// Simple test to debug phone number existence
import { checkPhoneExists } from './services/otpService.js';

async function testPhone() {
  const phoneNumber = '7678417192';
  console.log(`Checking if phone number ${phoneNumber} exists in database...`);
  
  try {
    const result = await checkPhoneExists(phoneNumber);
    console.log('Check phone result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error checking phone:', error);
  }
}

testPhone();