// Utility script to update appointment and trigger notification
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';
import express from 'express';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const app = express();
app.use(express.json());

// API endpoint to update appointment and trigger notification
app.put('/api/appointments/:id/update-with-notification', async (req, res) => {
  try {
    const { id } = req.params;
    const { remark, appointment_date } = req.body;

    // Validate inputs
    if (!remark && !appointment_date) {
      return res.status(400).json({
        success: false,
        message: 'Either remark or appointment_date must be provided'
      });
    }

    // Get the current appointment to check for changes
    const { data: currentAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching appointment:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Prepare update data
    const updateData = {};
    if (remark !== undefined) updateData.remark = remark;
    if (appointment_date !== undefined) updateData.appointment_date = appointment_date;

    // Perform the update
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update appointment'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully, notification triggered',
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Error in update appointment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test endpoint to manually trigger notification for testing
app.post('/api/test-notification/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { type, message } = req.body;

    // Insert a test notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: 'admin',
        title: 'Test Notification',
        message: message || `Test notification for appointment ${appointmentId}`,
        type: type || 'test',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating test notification:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create notification'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Test notification created',
      data: notification
    });

  } catch (error) {
    console.error('Error in test notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Appointment notification utility server running on port ${PORT}`);
});