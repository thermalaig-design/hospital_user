-- Final fix for notification trigger - uses patient_phone and improved message format
-- This ensures notifications are matched correctly with the user's phone number
-- Run this SQL in your Supabase SQL editor to update the trigger

CREATE OR REPLACE FUNCTION notify_appointment_changes()
RETURNS TRIGGER AS $$
DECLARE
  old_time_str TEXT;
  new_time_str TEXT;
  old_date_formatted TEXT;
  new_date_formatted TEXT;
BEGIN
  -- Check if remark or appointment_date/appointment_time has changed
  IF (OLD.remark IS DISTINCT FROM NEW.remark) OR 
     (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date) OR
     (OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
    
    -- Format time strings
    old_time_str := COALESCE(TO_CHAR(OLD.appointment_time, 'HH12:MI AM'), 'Not specified');
    new_time_str := COALESCE(TO_CHAR(NEW.appointment_time, 'HH12:MI AM'), 'Not specified');
    
    -- Format dates in readable format (DD Mon YYYY)
    old_date_formatted := TO_CHAR(OLD.appointment_date, 'DD Mon YYYY');
    new_date_formatted := TO_CHAR(NEW.appointment_date, 'DD Mon YYYY');
    
    -- Insert notification for the patient using patient_phone (matches user's mobile number)
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      created_at
    ) VALUES (
      NEW.patient_phone,  -- Use patient_phone to match user's mobile number
      CASE 
        WHEN OLD.remark IS DISTINCT FROM NEW.remark AND (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
          'Appointment Rescheduled'
        WHEN OLD.remark IS DISTINCT FROM NEW.remark THEN
          'New Message from Doctor'
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
          'Appointment Rescheduled'
      END,
      CASE 
        -- Both remark and date/time changed
        WHEN OLD.remark IS DISTINCT FROM NEW.remark AND (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
          'Hello ' || NEW.patient_name || ', your appointment (Membership: ' || COALESCE(NEW.membership_number, 'N/A') || ') with Dr. ' || NEW.doctor_name || ' has been rescheduled.' || E'\n\n' ||
          '👤 Patient: ' || NEW.patient_name || E'\n' ||
          '👨‍⚕️ Doctor: Dr. ' || NEW.doctor_name || E'\n' ||
          CASE WHEN NEW.department IS NOT NULL THEN '🏥 Department: ' || NEW.department || E'\n' ELSE '' END ||
          '📅 Previous Date & Time: ' || old_date_formatted || ' ' || old_time_str || E'\n' ||
          '➡️ New Date & Time: ' || new_date_formatted || ' ' || new_time_str || E'\n\n' ||
          '📝 Message:' || E'\n' ||
          '"' || COALESCE(NEW.remark, 'No message') || '"'
        -- Only remark changed
        WHEN OLD.remark IS DISTINCT FROM NEW.remark THEN
          'Hello ' || NEW.patient_name || ', you have received a new message regarding your appointment (Membership: ' || COALESCE(NEW.membership_number, 'N/A') || ') with Dr. ' || NEW.doctor_name || '.' || E'\n\n' ||
          '👤 Patient: ' || NEW.patient_name || E'\n' ||
          '👨‍⚕️ Doctor: Dr. ' || NEW.doctor_name || E'\n' ||
          CASE WHEN NEW.department IS NOT NULL THEN '🏥 Department: ' || NEW.department || E'\n' ELSE '' END ||
          '📅 Appointment Date: ' || new_date_formatted || E'\n' ||
          CASE WHEN NEW.appointment_time IS NOT NULL THEN '🕐 Appointment Time: ' || new_time_str || E'\n' ELSE '' END ||
          E'\n' || '📝 Message:' || E'\n' ||
          '"' || COALESCE(NEW.remark, 'No message') || '"'
        -- Only date/time changed
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
          'Hello ' || NEW.patient_name || ', your appointment (Membership: ' || COALESCE(NEW.membership_number, 'N/A') || ') with Dr. ' || NEW.doctor_name || ' has been rescheduled.' || E'\n\n' ||
          '👤 Patient: ' || NEW.patient_name || E'\n' ||
          '👨‍⚕️ Doctor: Dr. ' || NEW.doctor_name || E'\n' ||
          CASE WHEN NEW.department IS NOT NULL THEN '🏥 Department: ' || NEW.department || E'\n' ELSE '' END ||
          '📅 Previous Date & Time: ' || old_date_formatted || ' ' || old_time_str || E'\n' ||
          '➡️ New Date & Time: ' || new_date_formatted || ' ' || new_time_str
      END,
      'appointment_update',
      NOW()
    );
    
    -- Also insert a notification for admin users
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      created_at
    ) VALUES (
      'admin',  -- Admin notification
      'Appointment Updated',
      CASE 
        WHEN OLD.remark IS DISTINCT FROM NEW.remark AND (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
          'Appointment #' || NEW.id || ' for ' || NEW.patient_name || ' has been rescheduled.'
        WHEN OLD.remark IS DISTINCT FROM NEW.remark THEN
          'New remark added for appointment #' || NEW.id || ' (Patient: ' || NEW.patient_name || ').'
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
          'Appointment #' || NEW.id || ' for ' || NEW.patient_name || ' has been rescheduled.'
      END,
      'appointment_update_admin',
      NOW()
    );
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS appointment_changes_notification_trigger ON public.appointments;
CREATE TRIGGER appointment_changes_notification_trigger
  AFTER UPDATE OF remark, appointment_date, appointment_time ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_changes();

-- Verify the trigger was created
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'appointment_changes_notification_trigger';

