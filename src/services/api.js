import axios from 'axios';


// Use live backend URL for both development and production
const API_BASE_URL = import.meta.env.DEV 

  ? 'https://mah.contractmitra.in/api'
  : 'https://mah.contractmitra.in/api';


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

// Get user notifications
export const getUserNotifications = async () => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;
    
    if (!userId) {
      throw new Error('No user found in localStorage');
    }
    
    const response = await api.get('/notifications', {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (id) => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;
    
    if (!userId) {
      throw new Error('No user found in localStorage');
    }
    
    const response = await api.patch(`/notifications/${id}/read`, {}, {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user).Mobile || JSON.parse(user).mobile || JSON.parse(user).id : null;
    
    if (!userId) {
      throw new Error('No user found in localStorage');
    }
    
    const response = await api.patch('/notifications/read-all', {}, {
      headers: {
        'user-id': userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
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
