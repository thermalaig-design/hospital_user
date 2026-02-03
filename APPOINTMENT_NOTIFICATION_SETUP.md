# Appointment Notification Setup

This document explains how to set up automatic notifications when appointment remarks or dates are changed in the appointments table.

## Database Setup
### 1. Set up the trigger function in Supabase

1. Go to your Supabase dashboard
2. Navigate to `SQL Editor`
3. Copy and paste the following SQL code:

```sql
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
```

### 2. Run the SQL code in your Supabase SQL Editor

1. Execute the SQL code in the Supabase SQL Editor
2. Verify that the function and trigger have been created successfully

## Backend Changes

The following changes have been made to the backend:

1. Added `updateAppointment` function in `backend/controllers/appointmentController.js`
2. Added corresponding route in `backend/routes/appointmentRoutes.js`
3. Added `updateAppointment` service function in `src/services/appointmentService.js`

## Frontend Integration

The system will now automatically generate notifications when:
- Appointment `remark` field is updated
- Appointment `appointment_date` field is updated

These notifications will appear in the user's notification panel on the home page.

## How it Works

1. When an appointment's `remark` or `appointment_date` field is updated, the PostgreSQL trigger fires
2. The trigger function checks which field(s) changed and creates appropriate notifications
3. Notifications are stored in the `notifications` table
4. The frontend fetches and displays these notifications in the notification dropdown on the home page

## Testing the Setup

To test if the trigger is working:

1. Update an appointment's remark or date through the API
2. Check if notifications are created in the `notifications` table
3. Verify that notifications appear in the user interface

```sql
-- Example test query (run this in SQL Editor to test):
UPDATE public.appointments 
SET remark = 'Test remark notification', 
    appointment_date = CURRENT_DATE + INTERVAL '7 days'
WHERE id = (SELECT id FROM public.appointments LIMIT 1);

-- Check if notifications were created:
SELECT * FROM public.notifications 
WHERE type LIKE 'appointment%' 
ORDER BY created_at DESC 
LIMIT 10;
```