import { initializePhoneAuth, verifyOTP } from '../services/otpService.js';

/**
 * Check phone and send OTP
 */
export const checkPhone = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    
    // Validate phone number
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    // Clean and validate phone format
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    console.log(`📱 Checking phone and sending OTP: ${cleanPhone}`);
    
    const result = await initializePhoneAuth(cleanPhone);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phoneNumber: result.data.phoneNumber,
        user: result.data.user,
        requestId: result.data.requestId
      }
    });
    
  } catch (error) {
    console.error('❌ Error in checkPhone:', error);
    next(error);
  }
};

/**
 * Verify OTP
 */
export const verifyOTPController = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    // Validate input
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }
    
    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits'
      });
    }
    
    console.log(`🔍 Verifying OTP for ${phoneNumber}`);
    
    const result = await verifyOTP(phoneNumber, otp);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in verifyOTP:', error);
    next(error);
  }
};