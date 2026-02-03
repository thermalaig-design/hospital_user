-- Fix the notification trigger to use patient_phone instead of patient_name for user_id
-- This ensures notifications are matched correctly with the user's phone number

CREATE OR REPLACE FUNCTION notify_appointment_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if remark or appointment_date/appointment_time has changed
  IF (OLD.remark IS DISTINCT FROM NEW.remark) OR 
     (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date) OR
     (OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
    
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
          'New Message Regarding Your Appointment'
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
          'Appointment Rescheduled'
      END,
      CASE 
        WHEN OLD.remark IS DISTINCT FROM NEW.remark AND (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
          'Hi there! Your appointment with Dr. ' || NEW.doctor_name || ' has been rescheduled from ' || OLD.appointment_date || ' at ' || COALESCE(TO_CHAR(OLD.appointment_time, 'HH12:MI AM'), 'time not specified') || ' to ' || NEW.appointment_date || ' at ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH12:MI AM'), 'time not specified') || '. New message: ' || COALESCE(NEW.remark, 'No message')
        WHEN OLD.remark IS DISTINCT FROM NEW.remark THEN
          'Hi there! New message regarding your appointment with Dr. ' || NEW.doctor_name || ': "' || COALESCE(NEW.remark, 'No message') || '"'
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
          'Hi there! Your appointment with Dr. ' || NEW.doctor_name || ' has been rescheduled from ' || OLD.appointment_date || ' at ' || COALESCE(TO_CHAR(OLD.appointment_time, 'HH12:MI AM'), 'time not specified') || ' to ' || NEW.appointment_date || ' at ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH12:MI AM'), 'time not specified')
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
      CASE 
        WHEN OLD.remark IS DISTINCT FROM NEW.remark AND (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
          'Appointment Rescheduled'
        WHEN OLD.remark IS DISTINCT FROM NEW.remark THEN
          'New Message Regarding Appointment'
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
          'Appointment Rescheduled'
      END,
      CASE 
        WHEN OLD.remark IS DISTINCT FROM NEW.remark AND (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
          'Appointment #' || NEW.id || ' for ' || NEW.patient_name || ' with Dr. ' || NEW.doctor_name || ' has been rescheduled from ' || OLD.appointment_date || ' at ' || COALESCE(TO_CHAR(OLD.appointment_time, 'HH12:MI AM'), 'time not specified') || ' to ' || NEW.appointment_date || ' at ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH12:MI AM'), 'time not specified') || '. New message: ' || COALESCE(NEW.remark, 'No message')
        WHEN OLD.remark IS DISTINCT FROM NEW.remark THEN
          'Appointment #' || NEW.id || ' for ' || NEW.patient_name || ' with Dr. ' || NEW.doctor_name || ' has a new message: ' || COALESCE(NEW.remark, 'No message')
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
          'Appointment #' || NEW.id || ' for ' || NEW.patient_name || ' with Dr. ' || NEW.doctor_name || ' date has been changed from ' || OLD.appointment_date || ' at ' || COALESCE(TO_CHAR(OLD.appointment_time, 'HH12:MI AM'), 'time not specified') || ' to ' || NEW.appointment_date || ' at ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH12:MI AM'), 'time not specified')
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