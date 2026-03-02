-- Function to create notification when a new appointment is created
CREATE OR REPLACE FUNCTION notify_appointment_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for the patient when appointment is created
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    created_at
  ) VALUES (
    NEW.patient_phone,  -- Using patient_phone as user_id
    'Appointment Booked',
    'आपकी appointment successfully book हुई है। ' || NEW.patient_name || ' के लिए ' || TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' को ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH:MI'), 'बिना समय निर्दिष्ट') || ' पर appointment है। Doctor: ' || NEW.doctor_name,
    'appointment_insert',
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
    'Appointment Booked',
    'नया appointment #' || NEW.id || ' created हुआ है। Patient: ' || NEW.patient_name || ' | Phone: ' || NEW.patient_phone || ' | Date: ' || TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' | Doctor: ' || NEW.doctor_name,
    'appointment_insert_admin',
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS appointment_insert_notification_trigger ON public.appointments;

-- Create trigger on appointments table for INSERT operations
CREATE TRIGGER appointment_insert_notification_trigger
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_insert();

-- Also ensure the UPDATE trigger for changes is still in place
-- Update the existing notify_appointment_changes function to handle appointment_time as well
CREATE OR REPLACE FUNCTION notify_appointment_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if appointment_date, appointment_time, or remark has changed
  IF (OLD.remark IS DISTINCT FROM NEW.remark) OR 
     (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date) OR
     (OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
    
    -- Insert notification for the patient
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      created_at
    ) VALUES (
      NEW.patient_phone,  -- Using patient_phone as user_id
      'Appointment Updated',
      CASE 
        WHEN (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date) AND (OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
          'आपकी appointment #' || NEW.id || ' को update किया गया है। नया date: ' || TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH:MI'), 'कोई समय निर्दिष्ट नहीं') || ' पर।'
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date THEN
          'आपकी appointment #' || NEW.id || ' का date बदल दिया गया है। पुराना date: ' || TO_CHAR(OLD.appointment_date, 'DD/MM/YYYY') || ' | नया date: ' || TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY')
        WHEN OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
          'आपकी appointment #' || NEW.id || ' का समय बदल दिया गया है। नया समय: ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH:MI'), 'कोई समय निर्दिष्ट नहीं')
        WHEN OLD.remark IS DISTINCT FROM NEW.remark THEN
          'आपकी appointment #' || NEW.id || ' में एक नोट जोड़ा गया है: ' || COALESCE(NEW.remark, 'No remark')
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
        WHEN (OLD.appointment_date IS DISTINCT FROM NEW.appointment_date) AND (OLD.appointment_time IS DISTINCT FROM NEW.appointment_time) THEN
          'Appointment #' || NEW.id || ' (' || NEW.patient_name || ') को update किया गया है। Date: ' || TO_CHAR(OLD.appointment_date, 'DD/MM/YYYY') || ' → ' || TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || ' | Time: ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH:MI'), 'no time')
        WHEN OLD.appointment_date IS DISTINCT FROM NEW.appointment_date THEN
          'Appointment #' || NEW.id || ' (' || NEW.patient_name || ') date: ' || TO_CHAR(OLD.appointment_date, 'DD/MM/YYYY') || ' → ' || TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY')
        WHEN OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
          'Appointment #' || NEW.id || ' (' || NEW.patient_name || ') time: ' || COALESCE(TO_CHAR(OLD.appointment_time, 'HH:MI'), 'no time') || ' → ' || COALESCE(TO_CHAR(NEW.appointment_time, 'HH:MI'), 'no time')
        WHEN OLD.remark IS DISTINCT FROM NEW.remark THEN
          'Appointment #' || NEW.id || ' (' || NEW.patient_name || ') में remark update किया गया है'
      END,
      'appointment_update_admin',
      NOW()
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing update trigger and recreate with appointment_time
DROP TRIGGER IF EXISTS appointment_changes_notification_trigger ON public.appointments;

CREATE TRIGGER appointment_changes_notification_trigger
  AFTER UPDATE OF remark, appointment_date, appointment_time ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_changes();

-- Test the INSERT trigger (uncomment to test)
/*
-- Insert a test appointment
INSERT INTO public.appointments (
  patient_name,
  patient_phone,
  patient_email,
  patient_age,
  patient_gender,
  doctor_id,
  doctor_name,
  department,
  appointment_date,
  appointment_time,
  status,
  reason,
  created_at
) VALUES (
  'Test Patient',
  '9999999999',
  'test@example.com',
  30,
  'Male',
  'doc_001',
  'Dr. Test',
  'General',
  CURRENT_DATE + INTERVAL '3 days',
  '14:00:00',
  'Pending',
  'Regular checkup',
  NOW()
);

-- Check notifications
SELECT * FROM public.notifications 
WHERE type LIKE 'appointment%' 
ORDER BY created_at DESC 
LIMIT 10;
*/
