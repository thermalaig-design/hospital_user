import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gskzafarbzhdcgvrrkdc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdza3phZmFyYnpoZGNndnJya2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA4NDAzMiwiZXhwIjoyMDgyNjYwMDMyfQ.Dou0kR2REzV3CdRpHfBBD-XDrE2opZ7FfXXVOzOM0Vs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Add notifications for ANY user ID (flexible)
async function addNotificationsForUser(userId) {
  console.log(`\n📝 Adding notifications for user: ${userId}\n`);

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

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(testNotifications)
      .select();

    if (error) {
      console.log('❌ Error inserting notifications:', error.message);
      return false;
    }

    console.log('✅ Successfully added', data?.length || 0, 'notifications!');
    data?.forEach((n, i) => {
      console.log(`  ${i + 1}. ${n.title}`);
    });
    return true;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Get all notifications for a user
async function getNotificationsForUser(userId) {
  console.log(`\n🔍 Fetching notifications for user: ${userId}\n`);

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Error fetching notifications:', error.message);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} notifications:\n`);
    data?.forEach((n, i) => {
      console.log(`${i + 1}. ${n.title}`);
      console.log(`   Message: ${n.message}`);
      console.log(`   Status: ${n.is_read ? '📖 Read' : '📕 Unread'}`);
      console.log();
    });
    return data || [];
  } catch (error) {
    console.log('❌ Error:', error.message);
    return [];
  }
}

// List all unique users in notifications table
async function listAllUsers() {
  console.log('\n👥 All users with notifications:\n');

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('user_id')
      .order('user_id');

    if (error) {
      console.log('❌ Error:', error.message);
      return [];
    }

    const uniqueUsers = [...new Set(data?.map(n => n.user_id) || [])];
    console.log(`Found ${uniqueUsers.length} unique users:\n`);
    uniqueUsers.forEach((user, i) => {
      const count = data?.filter(n => n.user_id === user).length;
      console.log(`  ${i + 1}. ${user} (${count} notifications)`);
    });
    return uniqueUsers;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return [];
  }
}

// Main execution
async function main() {
  console.log('════════════════════════════════════════════════════════');
  console.log('📱 Notifications Management');
  console.log('════════════════════════════════════════════════════════');

  // Get all users
  const allUsers = await listAllUsers();

  // Add notifications for existing user (use first user if available)
  let targetUser = '9911334455'; // Default user from your system
  
  if (allUsers.length > 0) {
    targetUser = allUsers[0];
    console.log(`\n✨ Adding notifications for existing user: ${targetUser}`);
  } else {
    console.log(`\n⚠️  No users found. Using default user: ${targetUser}`);
  }

  // Uncomment the user ID you want to add notifications for
  // Or pass any user ID directly:
  
  // For user 9911334455 (existing in your system)
  await addNotificationsForUser('9911334455');
  
  // For user 7890654321 (example)
  // await addNotificationsForUser('7890654321');

  // View notifications for the users
  console.log('\n════════════════════════════════════════════════════════');
  console.log('Checking all users for notifications...');
  console.log('════════════════════════════════════════════════════════');
  
  for (const user of allUsers) {
    await getNotificationsForUser(user);
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log('✅ Done!');
  console.log('════════════════════════════════════════════════════════');
  console.log('\n📲 What to do next:');
  console.log('1. Make sure you are logged in with one of the above user IDs');
  console.log('2. Refresh your app home page (F5)');
  console.log('3. The bell icon should now show unread notifications');
  console.log('4. Check browser console for any errors (F12)');
}

main().catch(console.error);
