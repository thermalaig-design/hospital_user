import { supabase } from '../config/supabase.js';
import axios from 'axios';
import process from 'process';

// MSG91 Configuration
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'MAHLTH';
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
const NODE_ENV = process.env.NODE_ENV || 'production';

// In-memory OTP storage (for production, use Redis or database)
const otpStore = new Map();

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via MSG91
 */
export const sendOTP = async (phoneNumber, otp) => {
  try {
    // Clean phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Format for MSG91 (should be in international format with country code)
    let formattedPhone;
    if (cleanPhone.length === 10) {
      // If it's a 10-digit number, assume it's Indian number and prepend 91
      formattedPhone = `91${cleanPhone}`;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      // If it already has 91 prefix, use as is
      formattedPhone = cleanPhone;
    } else if (cleanPhone.startsWith('+91') && cleanPhone.length === 13) {
      // If it has +91 prefix, remove + and use
      formattedPhone = cleanPhone.substring(1);
    } else {
      // For other formats, use as is
      formattedPhone = cleanPhone;
    }
    
    console.log(`📱 Sending OTP ${otp} to ${formattedPhone}`);
    
    // MSG91 API endpoint
    const url = 'https://control.msg91.com/api/v5/otp';
    
    const payload = {
      template_id: MSG91_TEMPLATE_ID,
      mobile: formattedPhone,
      authkey: MSG91_AUTH_KEY,
      otp: otp,
      // Optional: customize OTP length and expiry
      otp_length: 6,
      otp_expiry: OTP_EXPIRY_MINUTES
    };
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY
      }
    });
    
    console.log('✅ MSG91 Response:', response.data);
    
    if (response.data.type === 'success') {
      return {
        success: true,
        message: 'OTP sent successfully',
        requestId: response.data.request_id
      };
    } else {
      throw new Error(response.data.message || 'Failed to send OTP');
    }
    
  } catch (error) {
    console.error('❌ Error sending OTP via MSG91:', error.response?.data || error.message);
    throw new Error('Failed to send OTP. Please try again.');
  }
};

/**
 * Verify OTP via MSG91
 */
export const verifyOTPWithMSG91 = async (phoneNumber, otp) => {
  try {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Format for MSG91 (should be in international format with country code)
    let formattedPhone;
    if (cleanPhone.length === 10) {
      // If it's a 10-digit number, assume it's Indian number and prepend 91
      formattedPhone = `91${cleanPhone}`;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      // If it already has 91 prefix, use as is
      formattedPhone = cleanPhone;
    } else if (cleanPhone.startsWith('+91') && cleanPhone.length === 13) {
      // If it has +91 prefix, remove + and use
      formattedPhone = cleanPhone.substring(1);
    } else {
      // For other formats, use as is
      formattedPhone = cleanPhone;
    }
    
    console.log(`🔍 Verifying OTP ${otp} for ${formattedPhone}`);
    
    // MSG91 OTP verification endpoint
    const url = 'https://control.msg91.com/api/v5/otp/verify';
    
    const payload = {
      authkey: MSG91_AUTH_KEY,
      mobile: formattedPhone,
      otp: otp
    };
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': MSG91_AUTH_KEY
      }
    });
    
    console.log('✅ MSG91 Verify Response:', response.data);
    
    if (response.data.type === 'success') {
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Invalid OTP'
      };
    }
    
  } catch (error) {
    console.error('❌ Error verifying OTP:', error.response?.data || error.message);
    return {
      success: false,
      message: 'Invalid or expired OTP'
    };
  }
};

/**
 * Store OTP locally (backup method)
 */
const storeOTP = (phoneNumber, otp) => {
  // Format phone number consistently for storage
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Format the phone number to a consistent format for storage
  let formattedPhoneForStorage;
  if (cleanPhone.length === 10) {
    // If it's a 10-digit number, assume it's Indian number and prepend 91
    formattedPhoneForStorage = `91${cleanPhone}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    // If it already has 91 prefix, use as is
    formattedPhoneForStorage = cleanPhone;
  } else if (cleanPhone.startsWith('+91') && cleanPhone.length === 13) {
    // If it has +91 prefix, remove + and use
    formattedPhoneForStorage = cleanPhone.substring(1);
  } else {
    // For other formats, use as is
    formattedPhoneForStorage = cleanPhone;
  }
  const expiryTime = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
  
  otpStore.set(formattedPhoneForStorage, {
    otp: otp,
    expiryTime: expiryTime,
    attempts: 0
  });
  
  // Auto-delete after expiry
  setTimeout(() => {
    otpStore.delete(formattedPhoneForStorage);
  }, OTP_EXPIRY_MINUTES * 60 * 1000);
};

/**
 * Verify OTP locally (backup method)
 */
const verifyOTPLocal = (phoneNumber, otp) => {
  // Format phone number consistently for storage
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Format the phone number to a consistent format for storage
  let formattedPhoneForRetrieval;
  if (cleanPhone.length === 10) {
    // If it's a 10-digit number, assume it's Indian number and prepend 91
    formattedPhoneForRetrieval = `91${cleanPhone}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    // If it already has 91 prefix, use as is
    formattedPhoneForRetrieval = cleanPhone;
  } else if (cleanPhone.startsWith('+91') && cleanPhone.length === 13) {
    // If it has +91 prefix, remove + and use
    formattedPhoneForRetrieval = cleanPhone.substring(1);
  } else {
    // For other formats, use as is
    formattedPhoneForRetrieval = cleanPhone;
  }
  
  const stored = otpStore.get(formattedPhoneForRetrieval);
  
  if (!stored) {
    return { success: false, message: 'OTP expired or not found' };
  }
  
  if (Date.now() > stored.expiryTime) {
    otpStore.delete(formattedPhoneForRetrieval);
    return { success: false, message: 'OTP expired' };
  }
  
  if (stored.attempts >= 3) {
    otpStore.delete(formattedPhoneForRetrieval);
    return { success: false, message: 'Too many failed attempts' };
  }
  
  if (stored.otp === otp) {
    otpStore.delete(formattedPhoneForRetrieval);
    return { success: true, message: 'OTP verified successfully' };
  }
  
  stored.attempts += 1;
  return { success: false, message: 'Invalid OTP' };
};

/**
 * Check if phone number exists in any table
 */
export const checkPhoneExists = async (phoneNumber) => {
  try {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    console.log(`🔍 Checking if phone ${cleanPhone} exists in database...`);
    
    // Create search patterns for different phone number formats
    const searchPatterns = [];
    
    // Add the clean phone number
    if (cleanPhone.length >= 5) searchPatterns.push(cleanPhone);
    
    // Add with country code if it's a 10-digit number
    if (cleanPhone.length === 10) {
      searchPatterns.push(`91${cleanPhone}`);
      searchPatterns.push(`+91${cleanPhone}`);
    }
    
    // Add without country code if it's a 12-digit number with 91 prefix
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      searchPatterns.push(cleanPhone.substring(2));
    }
    
    // Add without country code if it's a 13-digit number with +91 prefix
    if (cleanPhone.length === 13 && cleanPhone.startsWith('+91')) {
      searchPatterns.push(cleanPhone.substring(3));
    }
    
    // Remove duplicates
    const uniquePatterns = [...new Set(searchPatterns)];
    
    console.log('📱 Search patterns:', uniquePatterns);
    
    // Build search conditions for Members Table
    const conditions = [];
    uniquePatterns.forEach(pattern => {
      conditions.push(`Mobile.ilike.%${pattern}%`);
      
      if (pattern.length === 10) {
        const formattedPatterns = [
          `${pattern.slice(0, 3)}-${pattern.slice(3, 6)}-${pattern.slice(6)}`,
          `${pattern.slice(0, 3)} ${pattern.slice(3, 6)} ${pattern.slice(6)}`,
          `(${pattern.slice(0, 3)}) ${pattern.slice(3, 6)}-${pattern.slice(6)}`,
          `${pattern.slice(0, 5)} ${pattern.slice(5)}`,
          `${pattern.slice(0, 4)} ${pattern.slice(4, 7)} ${pattern.slice(7)}`
        ];
        
        formattedPatterns.forEach(formatted => {
          conditions.push(`Mobile.ilike.%${formatted}%`);
        });
      }
    });
    
    const searchCondition = conditions.join(',');
    
    // Check in Members Table
    const { data: memberData, error: memberError } = await supabase
      .from('Members Table')
      .select(`
        "S. No.",
        "Membership number",
        "Name",
        "Address Home",
        "Company Name",
        "Address Office",
        "Resident Landline",
        "Office Landline",
        "Mobile",
        "Email",
        type
      `)
      .or(searchCondition)
      .limit(1);
    
    if (memberError) {
      console.error('❌ Error querying Members Table:', memberError);
    }
    
    if (memberData && memberData.length > 0) {
      console.log('✅ Phone found in Members Table');
      const member = memberData[0];
      
      // Check if this member is also in elected_members table
      let electedMemberData = null;
      if (member['Membership number']) {
        try {
          const cleanMembership = String(member['Membership number']).trim();
          
          let { data: electedMatch } = await supabase
            .from('elected_members')
            .select('*')
            .eq('membership_number', cleanMembership)
            .limit(1);
          
          if (!electedMatch || electedMatch.length === 0) {
            const { data: electedMatchIlike } = await supabase
              .from('elected_members')
              .select('*')
              .ilike('membership_number', `%${cleanMembership}%`)
              .limit(1);
            
            if (electedMatchIlike && electedMatchIlike.length > 0) {
              electedMatch = electedMatchIlike;
            }
          }
          
          if (electedMatch && electedMatch.length > 0) {
            electedMemberData = electedMatch[0];
            console.log(`✅ Member is also in elected_members table`);
          }
        } catch (err) {
          console.warn('Could not check elected_members:', err);
        }
      }
      
      const mergedUser = {
        'S. No.': member['S. No.'],
        'Membership number': member['Membership number'],
        'Name': member['Name'],
        'Address Home': member['Address Home'],
        'Company Name': member['Company Name'],
        'Address Office': member['Address Office'],
        'Resident Landline': member['Resident Landline'],
        'Office Landline': member['Office Landline'],
        'Mobile': member['Mobile'],
        'Email': member['Email'],
        'type': member.type,
        position: member.position || null,
        
        ...(electedMemberData && {
          position: electedMemberData.position || member.position || null,
          location: electedMemberData.location || null,
          elected_id: electedMemberData.id,
          is_elected_member: true,
          is_merged_with_elected: true
        }),
        
        id: member['S. No.'],
        name: member['Name'],
        mobile: member['Mobile'],
        membership_number: member['Membership number']
      };
      
      return {
        exists: true,
        table: electedMemberData ? 'Members Table + elected_members' : 'Members Table',
        user: mergedUser
      };
    }
    
    // Check in opd_schedule
    const opdConditions = [];
    uniquePatterns.forEach(pattern => {
      opdConditions.push(`mobile.ilike.%${pattern}%`);
    });
    
    const opdSearchCondition = opdConditions.join(',');
    
    const { data: opdData } = await supabase
      .from('opd_schedule')
      .select('id, mobile, consultant_name, department, designation')
      .or(opdSearchCondition)
      .eq('is_active', true)
      .limit(1);
    
    if (opdData && opdData.length > 0) {
      console.log('✅ Phone found in opd_schedule');
      return {
        exists: true,
        table: 'opd_schedule',
        user: {
          id: opdData[0].id,
          name: opdData[0].consultant_name,
          mobile: opdData[0].mobile,
          type: 'Doctor',
          department: opdData[0].department,
          designation: opdData[0].designation
        }
      };
    }
    
    // Check in hospitals
    const hospitalConditions = [];
    uniquePatterns.forEach(pattern => {
      hospitalConditions.push(`contact_phone.ilike.%${pattern}%`);
    });
    
    const hospitalSearchCondition = hospitalConditions.join(',');
    
    const { data: hospitalData } = await supabase
      .from('hospitals')
      .select('id, hospital_name, contact_phone, trust_name')
      .or(hospitalSearchCondition)
      .limit(1);
    
    if (hospitalData && hospitalData.length > 0) {
      console.log('✅ Phone found in hospitals');
      return {
        exists: true,
        table: 'hospitals',
        user: {
          id: hospitalData[0].id,
          name: hospitalData[0].hospital_name,
          mobile: hospitalData[0].contact_phone,
          type: 'Hospital',
          trust_name: hospitalData[0].trust_name
        }
      };
    }
    
    console.log('❌ Phone not found in any table');
    return {
      exists: false,
      table: null,
      user: null
    };
    
  } catch (error) {
    console.error('❌ Error checking phone existence:', error);
    throw error;
  }
};



/**
 * Initialize phone auth and send OTP
 */
export const initializePhoneAuth = async (phoneNumber) => {
  try {
    // Check if phone exists in database
    const phoneCheck = await checkPhoneExists(phoneNumber);
    
    if (!phoneCheck.exists) {
      return {
        success: false,
        message: 'Phone number not registered in the system'
      };
    }
    
    // Format phone number for MSG91 (should be in international format with country code)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    let formattedPhone;
    if (cleanPhone.length === 10) {
      // If it's a 10-digit number, assume it's Indian number and prepend 91
      formattedPhone = `91${cleanPhone}`;
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      // If it already has 91 prefix, use as is
      formattedPhone = cleanPhone;
    } else if (cleanPhone.startsWith('+91') && cleanPhone.length === 13) {
      // If it has +91 prefix, remove + and use
      formattedPhone = cleanPhone.substring(1);
    } else {
      // For other formats, use as is
      formattedPhone = cleanPhone;
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP locally as backup
    storeOTP(phoneNumber, otp);
    
    // Send OTP via MSG91
    const sendResult = await sendOTP(formattedPhone, otp);
    
    if (!sendResult.success) {
      throw new Error('Failed to send OTP');
    }
    
    console.log(`📱 OTP sent successfully to ${formattedPhone}`);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      data: {
        phoneNumber: formattedPhone,
        user: phoneCheck.user,
        requestId: sendResult.requestId
      }
    };
    
  } catch (error) {
    console.error('❌ Error in initializePhoneAuth:', error);
    throw error;
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (phoneNumber, otp) => {
  try {
    console.log(`🔍 Verifying OTP for ${phoneNumber}`);
    
    // 🔧 DEVELOPMENT MODE BYPASS - Accept 123456 as master OTP
    if (NODE_ENV === 'development' && otp === '123456') {
      console.log('🔧 DEVELOPMENT MODE: Bypassing OTP verification with master code 123456');
      return {
        success: true,
        message: 'OTP verified successfully (Development mode)'
      };
    }
    
    // First try MSG91 verification
    const msg91Result = await verifyOTPWithMSG91(phoneNumber, otp);
    
    if (msg91Result.success) {
      return msg91Result;
    }
    
    // Fallback to local verification
    console.log('⚠️ MSG91 verification failed, trying local verification');
    return verifyOTPLocal(phoneNumber, otp);
    
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    return {
      success: false,
      message: 'Failed to verify OTP'
    };
  }
};