// authService.js - Frontend API calls
// Point to live backend (same for dev and prod)
const API_URL = import.meta.env.DEV 
  ? 'https://mah.contractmitra.in/api/auth' 
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

