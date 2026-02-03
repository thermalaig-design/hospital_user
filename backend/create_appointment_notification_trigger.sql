-- Function to create notification when appointment remark or date changes
CREATE OR REPLACE FUNCTION notify_appointment_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if remark or appointment_date has changed
  IF (OLD.remark IS DISTINCT FROM NEW.remark) OR 
     (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date) THEN
    
    -- Insert notification for the patient
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      created_at
    ) VALUES (
      NEW.patient_phone,  -- Using patient_phone as user_id since that's how the system identifies users
      'Appointment Updated',
      CASE 
        WHEN OLD.remark IS DISTINCT FROM NEW.remark AND OLD.appointment_date IS DISTINCT FROM NEW.appointment_date THEN
          'Your appointment #' || NEW.id || ' has been updated. Date changed from ' || OLD.appointment_date || ' to ' || NEW.appointment_date || ' and remark updated.'
        WHEN OLD.remark IS DISTINCT FROM NEW.remark THEN
          'Your appointment #' || NEW.id || ' has a new remark: ' || COALESCE(NEW.remark, 'No remark')
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date THEN
          'Your appointment #' || NEW.id || ' date has been changed from ' || OLD.appointment_date || ' to ' || NEW.appointment_date
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
      'Appointment Updated',
      CASE 
        WHEN OLD.remark IS DISTINCT FROM NEW.remark AND OLD.appointment_date IS DISTINCT FROM NEW.appointment_date THEN
          'Appointment #' || NEW.id || ' for ' || NEW.patient_name || ' has been updated. Date changed from ' || OLD.appointment_date || ' to ' || NEW.appointment_date || ' and remark updated.'
        WHEN OLD.remark IS DISTINCT FROM NEW.remark THEN
          'Appointment #' || NEW.id || ' for ' || NEW.patient_name || ' has a new remark: ' || COALESCE(NEW.remark, 'No remark')
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date THEN
          'Appointment #' || NEW.id || ' for ' || NEW.patient_name || ' date has been changed from ' || OLD.appointment_date || ' to ' || NEW.appointment_date
      END,
      'appointment_update_admin',
      NOW()
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on appointments table
DROP TRIGGER IF EXISTS appointment_changes_notification_trigger ON public.appointments;
CREATE TRIGGER appointment_changes_notification_trigger
  AFTER UPDATE OF remark, appointment_date ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_changes();

-- Test the trigger
-- Uncomment the following lines to test:
/*
-- First, update an existing appointment to test the trigger
UPDATE public.appointments 
SET remark = 'Test remark notification', 
    appointment_date = CURRENT_DATE + INTERVAL '7 days'
WHERE id = (SELECT id FROM public.appointments LIMIT 1);

-- Check if notifications were created
SELECT * FROM public.notifications 
WHERE type LIKE 'appointment%' 
ORDER BY created_at DESC 
LIMIT 10;
*/