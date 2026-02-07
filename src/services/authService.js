// authService.js - Frontend API calls
// Point to local backend for testing
const API_URL = import.meta.env.DEV 
  ? 'http://localhost:5002/api/auth' 
  : 'https://mah.contractmitra.in/api/auth';


/**
 * Check phone number and send OTP
 */
export const checkPhoneNumber = async (phoneNumber) => {
  try {
    const response = await fetch(`${API_URL}/check-phone`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ phoneNumber })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking phone:', error);
    throw error;
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (phoneNumber, otp) => {
  try {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        phoneNumber, 
        otp 
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Special login for phone number 9911334455
 */
export const specialLogin = async (phoneNumber, passcode) => {
  try {
    const response = await fetch(`${API_URL}/special-login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        phoneNumber, 
        passcode 
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in special login:', error);
    throw error;
  }
};

