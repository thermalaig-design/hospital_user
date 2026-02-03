-- Create notification trigger for referrals
-- This trigger creates notifications when referral status changes or remark is added/updated
-- Run this SQL in your Supabase SQL editor

CREATE OR REPLACE FUNCTION notify_referral_changes()
RETURNS TRIGGER AS $$
DECLARE
  notification_user_id TEXT;
  status_message TEXT;
  status_title TEXT;
BEGIN
  -- Determine which user_id to use for notification (prefer user_phone, fallback to user_id)
  notification_user_id := COALESCE(NEW.user_phone, NEW.user_id);
  
  -- Only create notifications when status changes or remark is added/updated
  IF (OLD.status IS DISTINCT FROM NEW.status) OR (OLD.remark IS DISTINCT FROM NEW.remark) THEN
    
    -- Handle status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      CASE NEW.status
        WHEN 'Approved' THEN
          status_title := 'Referral Approved';
          status_message := 'Hello ' || COALESCE(NEW.user_name, 'there') || ', great news! Your referral request (Membership: ' || COALESCE(NEW.user_id, 'N/A') || ') for patient ' || NEW.patient_name || ' has been approved.' || E'\n\n' ||
            '👤 Patient: ' || NEW.patient_name || E'\n' ||
            '👨‍⚕️ Referred To: Dr. ' || NEW.referred_to_doctor || E'\n' ||
            CASE WHEN NEW.department IS NOT NULL THEN '🏥 Department: ' || NEW.department || E'\n' ELSE '' END ||
            '📋 Category: ' || NEW.category || E'\n' ||
            CASE WHEN NEW.remark IS NOT NULL THEN E'\n' || '📝 Admin Message:' || E'\n' || '"' || NEW.remark || '"' ELSE '' END;
            
        WHEN 'Rejected' THEN
          status_title := 'Referral Rejected';
          status_message := 'Hello ' || COALESCE(NEW.user_name, 'there') || ', we regret to inform you that your referral request (Membership: ' || COALESCE(NEW.user_id, 'N/A') || ') for patient ' || NEW.patient_name || ' has been rejected.' || E'\n\n' ||
            '👤 Patient: ' || NEW.patient_name || E'\n' ||
            '👨‍⚕️ Referred To: Dr. ' || NEW.referred_to_doctor || E'\n' ||
            CASE WHEN NEW.department IS NOT NULL THEN '🏥 Department: ' || NEW.department || E'\n' ELSE '' END ||
            '📋 Category: ' || NEW.category || E'\n' ||
            CASE WHEN NEW.remark IS NOT NULL THEN E'\n' || '📝 Reason:' || E'\n' || '"' || NEW.remark || '"' ELSE E'\n' || 'Please contact the hospital for more details.' END;
            
        WHEN 'Completed' THEN
          status_title := 'Referral Completed';
          status_message := 'Hello ' || COALESCE(NEW.user_name, 'there') || ', your referral request (Membership: ' || COALESCE(NEW.user_id, 'N/A') || ') for patient ' || NEW.patient_name || ' has been marked as completed.' || E'\n\n' ||
            '👤 Patient: ' || NEW.patient_name || E'\n' ||
            '👨‍⚕️ Referred To: Dr. ' || NEW.referred_to_doctor || E'\n' ||
            CASE WHEN NEW.department IS NOT NULL THEN '🏥 Department: ' || NEW.department || E'\n' ELSE '' END ||
            '📋 Category: ' || NEW.category || E'\n' ||
            CASE WHEN NEW.remark IS NOT NULL THEN E'\n' || '📝 Notes:' || E'\n' || '"' || NEW.remark || '"' ELSE '' END;
            
        ELSE
          -- For any other status change (shouldn't happen, but handle gracefully)
          status_title := 'Referral Status Updated';
          status_message := 'Hello ' || COALESCE(NEW.user_name, 'there') || ', your referral request (Membership: ' || COALESCE(NEW.user_id, 'N/A') || ') status has been updated to ' || NEW.status || '.' || E'\n\n' ||
            '👤 Patient: ' || NEW.patient_name || E'\n' ||
            '👨‍⚕️ Referred To: Dr. ' || NEW.referred_to_doctor || E'\n' ||
            CASE WHEN NEW.remark IS NOT NULL THEN E'\n' || '📝 Message:' || E'\n' || '"' || NEW.remark || '"' ELSE '' END;
      END CASE;
      
      -- Insert notification for the user
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        created_at
      ) VALUES (
        notification_user_id,
        status_title,
        status_message,
        'referral_update',
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
        'admin',
        'Referral Status Updated',
        'Referral #' || NEW.id || ' for patient ' || NEW.patient_name || ' (Referred by: ' || COALESCE(NEW.user_name, NEW.user_id) || ') status changed from ' || COALESCE(OLD.status, 'N/A') || ' to ' || NEW.status || '.',
        'referral_update_admin',
        NOW()
      );
    END IF;
    
    -- Handle remark changes (when status hasn't changed)
    IF (OLD.remark IS DISTINCT FROM NEW.remark) AND (OLD.status IS NOT DISTINCT FROM NEW.status) THEN
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        created_at
      ) VALUES (
        notification_user_id,
        'New Message Regarding Your Referral',
        'Hello ' || COALESCE(NEW.user_name, 'there') || ', you have received a new message regarding your referral request (Membership: ' || COALESCE(NEW.user_id, 'N/A') || ') for patient ' || NEW.patient_name || '.' || E'\n\n' ||
          '👤 Patient: ' || NEW.patient_name || E'\n' ||
          '👨‍⚕️ Referred To: Dr. ' || NEW.referred_to_doctor || E'\n' ||
          CASE WHEN NEW.department IS NOT NULL THEN '🏥 Department: ' || NEW.department || E'\n' ELSE '' END ||
          '📋 Category: ' || NEW.category || E'\n\n' ||
          '📝 Message:' || E'\n' ||
          '"' || COALESCE(NEW.remark, 'No message') || '"',
        'referral_update',
        NOW()
      );
      
      -- Admin notification for remark
      INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        created_at
      ) VALUES (
        'admin',
        'Referral Remark Added',
        'New remark added for referral #' || NEW.id || ' (Patient: ' || NEW.patient_name || ', Referred by: ' || COALESCE(NEW.user_name, NEW.user_id) || ').',
        'referral_update_admin',
        NOW()
      );
    END IF;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS referral_changes_notification_trigger ON public.referrals;
CREATE TRIGGER referral_changes_notification_trigger
  AFTER UPDATE OF status, remark ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION notify_referral_changes();

-- Verify the trigger was created
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'referral_changes_notification_trigger';

-- Test query (uncomment to test after creating a referral)
/*
-- Test: Update a referral status to Approved
UPDATE public.referrals 
SET status = 'Approved', remark = 'Test approval message'
WHERE id = (SELECT id FROM public.referrals LIMIT 1);

-- Check if notifications were created
SELECT * FROM public.notifications 
WHERE type LIKE 'referral%' 
ORDER BY created_at DESC 
LIMIT 10;
*/

