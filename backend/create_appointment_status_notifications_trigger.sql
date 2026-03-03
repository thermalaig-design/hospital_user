-- Trigger: create patient notifications when appointment is accepted/declined/rescheduled/updated
-- Run this file in Supabase SQL editor.

CREATE OR REPLACE FUNCTION public.notify_appointment_status_and_schedule_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  status_norm text := lower(trim(coalesce(NEW.status, '')));
  old_date text := to_char(OLD.appointment_date, 'DD Mon YYYY');
  new_date text := to_char(NEW.appointment_date, 'DD Mon YYYY');
  old_time text := coalesce(to_char(OLD.appointment_time, 'HH12:MI AM'), 'Not specified');
  new_time text := coalesce(to_char(NEW.appointment_time, 'HH12:MI AM'), 'Not specified');
  notif_title text;
  notif_message text;
  recipient_user_id text := nullif(trim(coalesce(NEW.patient_phone, NEW.user_id, '')), '');
BEGIN
  -- Skip when there is no meaningful change
  IF NOT (
    OLD.status IS DISTINCT FROM NEW.status OR
    OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR
    OLD.appointment_time IS DISTINCT FROM NEW.appointment_time OR
    OLD.remark IS DISTINCT FROM NEW.remark
  ) THEN
    RETURN NEW;
  END IF;

  -- Status based notification (accept/decline/cancel/complete)
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF status_norm IN ('accepted', 'approved', 'confirmed') THEN
      notif_title := 'Appointment Accepted';
      notif_message := 'Your appointment #' || NEW.id || ' has been accepted.';
    ELSIF status_norm IN ('declined', 'rejected', 'cancelled', 'canceled') THEN
      notif_title := 'Appointment Declined';
      notif_message := 'Your appointment #' || NEW.id || ' has been declined/cancelled.';
    ELSIF status_norm = 'rescheduled' THEN
      notif_title := 'Appointment Rescheduled';
      notif_message := 'Your appointment #' || NEW.id || ' has been rescheduled to ' || new_date || ' at ' || new_time || '.';
    ELSIF status_norm = 'completed' THEN
      notif_title := 'Appointment Completed';
      notif_message := 'Your appointment #' || NEW.id || ' has been marked completed.';
    ELSIF status_norm = 'pending' THEN
      notif_title := 'Appointment Pending';
      notif_message := 'Your appointment #' || NEW.id || ' is currently pending confirmation.';
    ELSE
      notif_title := 'Appointment Updated';
      notif_message := 'Your appointment #' || NEW.id || ' status changed to ' || coalesce(NEW.status, 'Updated') || '.';
    END IF;

    IF recipient_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, created_at)
      VALUES (recipient_user_id, notif_title, notif_message, 'appointment_update', now());
    END IF;
  END IF;

  -- Reschedule notification when date/time changes
  IF OLD.appointment_date IS DISTINCT FROM NEW.appointment_date OR OLD.appointment_time IS DISTINCT FROM NEW.appointment_time THEN
    notif_title := 'Appointment Rescheduled';
    notif_message :=
      'Your appointment #' || NEW.id || ' has been rescheduled from ' || old_date || ' ' || old_time ||
      ' to ' || new_date || ' ' || new_time || '.';

    IF recipient_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, created_at)
      VALUES (recipient_user_id, notif_title, notif_message, 'appointment_update', now());
    END IF;
  END IF;

  -- Doctor remark notification
  IF OLD.remark IS DISTINCT FROM NEW.remark AND nullif(trim(coalesce(NEW.remark, '')), '') IS NOT NULL THEN
    notif_title := 'New Message from Doctor';
    notif_message := 'Your appointment #' || NEW.id || ' has a new message: ' || NEW.remark;

    IF recipient_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, created_at)
      VALUES (recipient_user_id, notif_title, notif_message, 'appointment_update', now());
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS appointment_status_schedule_notification_trigger ON public.appointments;
CREATE TRIGGER appointment_status_schedule_notification_trigger
AFTER UPDATE OF status, appointment_date, appointment_time, remark
ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.notify_appointment_status_and_schedule_changes();
