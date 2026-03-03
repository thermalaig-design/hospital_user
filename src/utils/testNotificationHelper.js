/**
 * Test Notification Helper - For debugging notifications in emulator/development
 * 
 * Usage in console:
 * window.testNotification('YOUR_PHONE_NUMBER')
 */

export const triggerTestNotification = async (userId) => {
  try {
    console.log('🧪 Triggering test notification for user:', userId);
    
    const apiUrl = import.meta.env.DEV
      ? 'https://mah.contractmitra.in/api'
      : 'https://mah.contractmitra.in/api';
    
    const response = await fetch(`${apiUrl}/notifications/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: String(userId) })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Test notification sent successfully!');
      console.log('📢 You should see a notification on your phone/emulator within 5 seconds');
      return { success: true, message: data.message };
    } else {
      console.error('❌ Failed to send test notification:', data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('❌ Error triggering test notification:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Get current user ID from localStorage
 */
export const getCurrentUserId = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) {
      console.warn('⚠️ No user found in localStorage');
      return null;
    }
    
    const parsedUser = JSON.parse(user);
    const userId = parsedUser.Mobile || parsedUser.mobile || parsedUser.phone || String(parsedUser.id || '');
    
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

/**
 * Add test notifications to database for current user
 */
export const addTestNotificationsForCurrentUser = async () => {
  try {
    console.log('📝 Adding test notifications for current user...');
    const userId = getCurrentUserId();
    
    if (!userId) {
      console.error('❌ Cannot find user ID. Make sure you are logged in!');
      return;
    }

    const { supabase } = await import('../services/supabaseClient.js');
    
    console.log('📱 User ID:', userId);

    const testNotifications = [
      {
        user_id: userId,
        title: '✅ Appointment Confirmed',
        message: 'Your appointment with Dr. Sharma on March 5, 2026 is confirmed. Please arrive 10 minutes early.',
        type: 'appointment',
        is_read: false
      },
      {
        user_id: userId,
        title: '📋 Test Report Available',
        message: 'Your COVID-19 test report is ready. Tap to view and download your report.',
        type: 'report',
        is_read: false
      },
      {
        user_id: userId,
        title: '🏥 Free Health Camp',
        message: 'Free Cardiac Checkup Camp on March 29, 2026. Limited seats available. Register now!',
        type: 'general',
        is_read: false
      }
    ];

    const { data, error } = await supabase
      .from('notifications')
      .insert(testNotifications)
      .select();

    if (error) {
      console.error('❌ Error adding notifications:', error.message);
      return;
    }

    console.log('✅ Successfully added', data?.length || 0, 'test notifications!');
    console.log('📍 Refresh the page to see them in the bell icon');
    
    data?.forEach((n, i) => {
      console.log(`  ${i + 1}. ${n.title}`);
    });
    
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Quick test - Send test notification for current user
 */
export const quickTestNotification = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    console.error('❌ Cannot find user ID. Make sure you are logged in!');
    return;
  }
  
  console.log('🧪 Sending test notification to:', userId);
  return await triggerTestNotification(userId);
};

/**
 * Setup global debug function for easy testing
 */
export const setupDebugFunctions = () => {
  if (typeof window !== 'undefined') {
    // Global function to trigger test notification
    window.testNotification = async (userId = null) => {
      const id = userId || getCurrentUserId();
      if (!id) {
        console.error('❌ Please provide a user ID or log in first');
        return;
      }
      return await triggerTestNotification(id);
    };
    
    // Global function for quick test
    window.quickTest = quickTestNotification;
    
    // Global function to add test notifications to database
    window.addNotificationsForCurrentUser = addTestNotificationsForCurrentUser;
    
    // Debug info
    window.notificationDebug = {
      userId: getCurrentUserId(),
      help: `
🧪 Notification Debug Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Add test notifications to database for current user:
   window.addNotificationsForCurrentUser()
   Then refresh the page to see them in the bell icon

2. Test Current User (push notification):
   window.quickTest()

3. Test Specific User:
   window.testNotification('9876543210')

4. Check Current User ID:
   window.notificationDebug.userId

5. Check Notification Tracker:
   JSON.parse(localStorage.getItem('shownNotifications_YOUR_PHONE'))

💡 After running the command, check your phone/emulator within 5 seconds!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `
    };
    
    console.log('%c🧪 Notification Debug Tools Active', 'color: #FF4F46E5; font-size: 14px; font-weight: bold;');
    console.log(window.notificationDebug.help);
  }
};
