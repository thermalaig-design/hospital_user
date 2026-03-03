import axios from 'axios';
import { getCurrentNotificationContext } from './notificationAudience';


// Use /api prefix in both environments (backend routes are mounted under /api/*)
// In emulator/device testing, localhost points to the device itself.
// So in dev we derive backend host from current page host unless explicitly overridden.
const resolveDevApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5002/api';

  const protocol = window.location.protocol || 'http:';
  const hostname = window.location.hostname || 'localhost';
  return `${protocol}//${hostname}:5002/api`;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? resolveDevApiBaseUrl()
    : 'https://mah.contractmitra.in/api');


// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Get all members
export const getAllMembers = async () => {
  try {
    const response = await api.get('/members');
    return response.data;
  } catch (error) {
    console.error('Error fetching all members:', error);
    throw error;
  }
};

// Get members by page
export const getMembersPage = async (page = 1, limit = 100) => {
  try {
    const response = await api.get(`/members?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching members page:', error);
    throw error;
  }
};

// Get doctors
export const getDoctors = async () => {
  try {
    const response = await api.get('/doctors');
    return response.data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

// Get members by type
export const getMembersByType = async (type) => {
  try {
    const response = await api.get(`/members/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching members of type ${type}:`, error);
    throw error;
  }
};

// Search members
export const searchMembers = async (query, type = null) => {
  try {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (type) params.append('type', type);

    const response = await api.get(`/members/search?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error searching members:', error);
    throw error;
  }
};

// Get member types
export const getMemberTypes = async () => {
  try {
    const response = await api.get('/members/types');
    return response.data;
  } catch (error) {
    console.error('Error fetching member types:', error);
    throw error;
  }
};

// Get all doctors
export const getAllDoctors = async () => {
  try {
    const response = await api.get('/doctors');
    return response.data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

// Get all committee members
export const getAllCommitteeMembers = async () => {
  try {
    const response = await api.get('/committee');
    return response.data;
  } catch (error) {
    console.error('Error fetching committee members:', error);
    throw error;
  }
};

// Get all hospitals
export const getAllHospitals = async () => {
  try {
    const response = await api.get('/hospitals');
    return response.data;
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    throw error;
  }
};

// Get all elected members
export const getAllElectedMembers = async () => {
  try {
    const response = await api.get('/elected-members');
    return response.data;
  } catch (error) {
    console.error('Error fetching elected members:', error);
    throw error;
  }
};

// Referral API functions
export const createReferral = async (referralData) => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    const response = await api.post('/referrals', referralData, {
      headers: {
        'user-id': userId,
        'user': user
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating referral:', error);
    throw error;
  }
};

export const getUserReferrals = async () => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    const response = await api.get('/referrals/my-referrals', {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching referrals:', error);
    throw error;
  }
};

export const getReferralCounts = async () => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    const response = await api.get('/referrals/counts', {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching referral counts:', error);
    throw error;
  }
};

export const updateReferral = async (referralId, referralData) => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    const response = await api.patch(`/referrals/${referralId}`, referralData, {
      headers: {
        'user-id': userId,
        'user': user
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating referral:', error);
    throw error;
  }
};

export const deleteReferral = async (referralId) => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    const response = await api.delete(`/referrals/${referralId}`, {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting referral:', error);
    throw error;
  }
};

// Preload commonly used data
// Get user profile
export const getProfile = async () => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    if (!userId) {
      throw new Error('No user found in localStorage');
    }

    const response = await api.get('/profile', {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Save user profile
export const saveProfile = async (profileData, profilePhotoFile) => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    if (!userId) {
      throw new Error('No user found in localStorage');
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('profileData', JSON.stringify(profileData));
    if (profilePhotoFile) {
      formData.append('profilePhoto', profilePhotoFile);
    }

    const response = await api.post('/profile/save', formData, {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

// Get marquee updates
export const getMarqueeUpdates = async () => {
  try {
    const response = await api.get('/marquee');
    return response.data;
  } catch (error) {
    console.error('Error fetching marquee updates:', error);
    throw error;
  }
};

// Get sponsor information
export const getSponsors = async () => {
  try {
    const response = await api.get('/sponsors');
    return response.data;
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    throw error;
  }
};

// Get specific sponsor by ID
export const getSponsorById = async (id) => {
  try {
    const response = await api.get(`/sponsors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    throw error;
  }
};

// Get user reports
export const getUserReports = async () => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    if (!userId) {
      throw new Error('No user found in localStorage');
    }

    const response = await api.get('/reports', {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Get user notifications — directly from Supabase
export const getUserNotifications = async () => {
  try {
    const { supabase } = await import('./supabaseClient.js');
    const { userId, userIdVariants, audienceVariants } = getCurrentNotificationContext();

    if (!userId) {
      throw new Error('No user found in localStorage');
    }

    // Fallback mapping:
    // Notifications can be stored with user_id = patient_phone, patient_name, membership_number, or user_id.
    // We query appointments by patient_phone variants to find all possible user_ids used in notifications.
    const { data: linkedAppointments } = await supabase
      .from('appointments')
      .select('patient_name, membership_number, user_id, patient_phone')
      .in('patient_phone', userIdVariants)
      .limit(500);

    const fallbackUserIds = new Set();
    (linkedAppointments || []).forEach((row) => {
      const patientName = String(row?.patient_name || '').trim();
      const membershipNumber = String(row?.membership_number || '').trim();
      const appointmentUserId = String(row?.user_id || '').trim();
      // ✅ patient_phone explicitly — this is what the Supabase trigger stores as user_id
      const patientPhone = String(row?.patient_phone || '').trim();

      if (patientName) fallbackUserIds.add(patientName);
      if (membershipNumber) fallbackUserIds.add(membershipNumber);
      if (appointmentUserId) fallbackUserIds.add(appointmentUserId);

      // Add patient_phone and its variants (e.g. 9911334455, 919911334455, +919911334455)
      if (patientPhone) {
        fallbackUserIds.add(patientPhone);
        const digitsOnly = patientPhone.replace(/\D/g, '');
        if (digitsOnly) {
          fallbackUserIds.add(digitsOnly);
          if (digitsOnly.length >= 10) fallbackUserIds.add(digitsOnly.slice(-10));
          if (!digitsOnly.startsWith('91') && digitsOnly.length === 10) {
            fallbackUserIds.add(`91${digitsOnly}`);
          }
          if (digitsOnly.length === 10) fallbackUserIds.add(`+91${digitsOnly}`);
          fallbackUserIds.add(`+${digitsOnly}`);
        }
      }
    });

    const notificationUserIds = [...new Set([...userIdVariants, ...fallbackUserIds])];

    const { data: userNotifications, error: userNotifError } = await supabase
      .from('notifications')
      .select('*')
      .in('user_id', notificationUserIds)
      .order('created_at', { ascending: false });

    if (userNotifError) throw userNotifError;

    const { data: audienceNotifications, error: audienceError } = await supabase
      .from('notifications')
      .select('*')
      .in('target_audience', audienceVariants)
      .order('created_at', { ascending: false });

    if (audienceError) throw audienceError;

    const merged = [...(userNotifications || []), ...(audienceNotifications || [])];
    const unique = [...new Map(merged.map((item) => [item.id, item])).values()];
    unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { success: true, data: unique };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, message: error.message, data: [] };
  }
};

// Mark notification as read — directly via Supabase
export const markNotificationAsRead = async (id) => {
  try {
    const { supabase } = await import('./supabaseClient.js');
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read — directly via Supabase
export const markAllNotificationsAsRead = async () => {
  try {
    const { supabase } = await import('./supabaseClient.js');
    const { userId, userIdVariants, audienceVariants } = getCurrentNotificationContext();

    if (!userId) {
      throw new Error('No user found in localStorage');
    }

    const { data: linkedAppointments } = await supabase
      .from('appointments')
      .select('patient_name, membership_number, user_id, patient_phone')
      .in('patient_phone', userIdVariants)
      .limit(500);

    const fallbackUserIds = new Set();
    (linkedAppointments || []).forEach((row) => {
      const patientName = String(row?.patient_name || '').trim();
      const membershipNumber = String(row?.membership_number || '').trim();
      const appointmentUserId = String(row?.user_id || '').trim();
      const patientPhone = String(row?.patient_phone || '').trim();

      if (patientName) fallbackUserIds.add(patientName);
      if (membershipNumber) fallbackUserIds.add(membershipNumber);
      if (appointmentUserId) fallbackUserIds.add(appointmentUserId);

      // ✅ patient_phone variants — matches notifications stored by trigger using patient_phone
      if (patientPhone) {
        fallbackUserIds.add(patientPhone);
        const digitsOnly = patientPhone.replace(/\D/g, '');
        if (digitsOnly) {
          fallbackUserIds.add(digitsOnly);
          if (digitsOnly.length >= 10) fallbackUserIds.add(digitsOnly.slice(-10));
          if (!digitsOnly.startsWith('91') && digitsOnly.length === 10) {
            fallbackUserIds.add(`91${digitsOnly}`);
          }
          if (digitsOnly.length === 10) fallbackUserIds.add(`+91${digitsOnly}`);
          fallbackUserIds.add(`+${digitsOnly}`);
        }
      }
    });

    const notificationUserIds = [...new Set([...userIdVariants, ...fallbackUserIds])];

    const { error: userError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
      .in('user_id', notificationUserIds);

    if (userError) throw userError;

    const { error: audienceError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
      .in('target_audience', audienceVariants);

    if (audienceError) throw audienceError;
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete/dismiss a specific notification — uses Supabase directly (no backend needed)
export const deleteNotification = async (id) => {
  try {
    const { supabase } = await import('./supabaseClient.js');
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Upload user report
export const uploadUserReport = async (reportData, reportFile) => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;

    if (!userId) {
      throw new Error('No user found in localStorage');
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('reportName', reportData.reportName);
    formData.append('reportType', reportData.reportType);
    formData.append('testDate', reportData.testDate);
    if (reportFile) {
      formData.append('reportFile', reportFile);
    }

    const response = await api.post('/reports/upload', formData, {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading report:', error);
    throw error;
  }
};


// Get profile photos for multiple members
export const getProfilePhotos = async (memberIds) => {
  try {
    const response = await api.post('/profile/photos', { memberIds });
    return response.data;
  } catch (error) {
    console.error('Error fetching profile photos:', error);
    throw error;
  }
};

export const preloadCommonData = async () => {
  try {
    // Load small amounts of data in parallel for quick initial load
    const [membersPreview, memberTypes, hospitals] = await Promise.allSettled([
      getMembersPage(1, 50),  // Get a small preview
      getMemberTypes(),
      getAllHospitals()       // Hospitals are typically small dataset
    ]);

    const result = {
      membersPreview: membersPreview.status === 'fulfilled' ? membersPreview.value : null,
      memberTypes: memberTypes.status === 'fulfilled' ? memberTypes.value : null,
      hospitals: hospitals.status === 'fulfilled' ? hospitals.value : null
    };

    console.log('✅ Preloaded common data for faster directory loading');
    return result;
  } catch (error) {
    console.error('Error preloading common data:', error);
    return {};
  }
};
