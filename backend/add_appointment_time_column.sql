-- Add appointment_time column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS appointment_time TIME;

-- Update the notification trigger to use patient_name instead of user_id
CREATE OR REPLACE FUNCTION notify_appointment_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if remark or appointment_date/appointment_time has changed
  IF (OLD.remark IS DISTINCT FROM NEW.remark) OR 
     (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date) OR
     (OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
    
    -- Insert notification for the patient using patient_name
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      created_at
    ) VALUES (
      NEW.patient_name,  -- Changed from patient_phone to patient_name
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
          'Hi there ' || NEW.patient_name || '! Your appointment #' || NEW.id || ' has been rescheduled to ' || NEW.appointment_date || ' at ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH12:MI AM'), 'time not specified') || '. Your doctor ' || NEW.doctor_name || ' has also sent you a new message: ' || COALESCE(NEW.remark, 'No additional message')
        WHEN OLD.remark IS DISTINCT FROM NEW.remark THEN
          'Hi there ' || NEW.patient_name || '! Your doctor ' || NEW.doctor_name || ' has sent you a new message regarding appointment #' || NEW.id || ': ' || COALESCE(NEW.remark, 'No message')
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
          'Hi there ' || NEW.patient_name || '! Your appointment #' || NEW.id || ' with ' || NEW.doctor_name || ' has been rescheduled from ' || OLD.appointment_date || ' at ' || COALESCE(TO_CHAR(OLD.appointment_time, 'HH12:MI AM'), 'time not specified') || ' to ' || NEW.appointment_date || ' at ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH12:MI AM'), 'time not specified')
      END,
      'appointment_update',
      NOW()
    );
    
    -- Also insert a notification for admin users (using a generic admin identifier)
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
          'New Message Regarding Patient Appointment'
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
          'Appointment Rescheduled'
      END,
      CASE 
        WHEN OLD.remark IS DISTINCT FROM NEW.remark AND (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
          'Appointment #' || NEW.id || ' for ' || NEW.patient_name || ' has been updated. Date changed from ' || OLD.appointment_date || ' at ' || COALESCE(TO_CHAR(OLD.appointment_time, 'HH12:MI AM'), 'time not specified') || ' to ' || NEW.appointment_date || ' at ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH12:MI AM'), 'time not specified') || ' and remark updated.'
        WHEN OLD.remark IS DISTINCT FROM NEW.remark THEN
          'Appointment #' || NEW.id || ' for ' || NEW.patient_name || ' has a new message: ' || COALESCE(NEW.remark, 'No message')
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
          'Appointment #' || NEW.id || ' for ' || NEW.patient_name || ' date has been changed from ' || OLD.appointment_date || ' at ' || COALESCE(TO_CHAR(OLD.appointment_time, 'HH12:MI AM'), 'time not specified') || ' to ' || NEW.appointment_date || ' at ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH12:MI AM'), 'time not specified')
      END,
      'appointment_update_admin',
      NOW()
    );
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS appointment_changes_notification_trigger ON public.appointments;
CREATE TRIGGER appointment_changes_notification_trigger
  AFTER UPDATE OF remark, appointment_date, appointment_time ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_changes();