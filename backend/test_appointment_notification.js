// Test script to verify appointment notification functionality
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testAppointmentNotification() {
  console.log('🧪 Testing appointment notification functionality...\n');
  
  try {
    // First, let's check if the trigger function exists
    console.log('🔍 Checking if trigger function exists...');
    const { data: funcData, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'notify_appointment_changes')
      .eq('routine_type', 'FUNCTION');
    
    if (funcError) {
      console.error('❌ Error checking function:', funcError.message);
    } else if (funcData && funcData.length > 0) {
      console.log('✅ Trigger function exists');
    } else {
      console.log('⚠️  Trigger function does not exist - needs to be created');
    }

    // Check if the trigger exists on appointments table
    console.log('\n🔍 Checking if trigger exists on appointments table...');
    const { data: trigData, error: trigError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name')
      .eq('event_object_table', 'appointments')
      .ilike('trigger_name', '%notification%');
    
    if (trigError) {
      console.error('❌ Error checking trigger:', trigError.message);
    } else if (trigData && trigData.length > 0) {
      console.log('✅ Trigger exists on appointments table');
    } else {
      console.log('⚠️  Trigger does not exist on appointments table');
    }

    // Check if notifications table exists
    console.log('\n🔍 Checking if notifications table exists...');
    const { data: tableData, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'notifications');
    
    if (tableError) {
      console.error('❌ Error checking table:', tableError.message);
    } else if (tableData && tableData.length > 0) {
      console.log('✅ Notifications table exists');
    } else {
      console.log('⚠️  Notifications table does not exist');
    }

    // Check if appointments table exists and has required columns
    console.log('\n🔍 Checking if appointments table has required columns...');
    const { data: colData, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'appointments')
      .in('column_name', ['remark', 'appointment_date']);
    
    if (colError) {
      console.error('❌ Error checking columns:', colError.message);
    } else if (colData && colData.length >= 2) {
      console.log('✅ Appointments table has required columns (remark, appointment_date)');
    } else {
      console.log('⚠️  Appointments table missing required columns');
      console.log('   Found columns:', colData?.map(c => c.column_name));
    }

    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAppointmentNotification();