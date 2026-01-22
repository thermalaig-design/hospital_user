// authService.js - Frontend API calls
const API_URL = import.meta.env.DEV 
  ? 'http://localhost:5001/api/auth' 
  : 'https://hospital-trustee-fiwe.vercel.app/api/auth';


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

