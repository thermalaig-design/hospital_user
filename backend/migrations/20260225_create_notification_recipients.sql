-- Migration: Create notification_recipients and members_list, allow nullable notifications.user_id
-- Run this in your Postgres DB (psql or your migration tool)

-- 1) allow notifications.user_id to be nullable so broadcasts can exist without a single user
ALTER TABLE public.notifications ALTER COLUMN user_id DROP NOT NULL;

-- 2) optional separate members table (you said you don't want to change existing members table)
CREATE TABLE IF NOT EXISTS public.members_list (
  id serial PRIMARY KEY,
  membership_number text UNIQUE,
  type text,
  mobile text,
  created_at timestamptz DEFAULT now()
);

-- 3) notification recipients: one row per user/member target for a notification
CREATE TABLE IF NOT EXISTS public.notification_recipients (
  id serial PRIMARY KEY,
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid NULL,
  membership_number text NULL,
  mobile text NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_id ON public.notification_recipients USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification_id ON public.notification_recipients USING btree (notification_id);

-- 4) trigger function to populate recipients for common audiences
CREATE OR REPLACE FUNCTION public.populate_notification_recipients() RETURNS trigger AS $$
BEGIN
  -- If notification has a specific user_id, create recipient for that user
  IF NEW.target_audience IS NULL OR trim(NEW.target_audience) = '' THEN
    IF NEW.user_id IS NOT NULL THEN
      INSERT INTO public.notification_recipients(notification_id, user_id)
      VALUES (NEW.id, NEW.user_id);
    END IF;
    RETURN NEW;
  END IF;

  -- normalize audience string
  IF lower(NEW.target_audience) = 'trustees' THEN
    INSERT INTO public.notification_recipients(notification_id, user_id, mobile, membership_number)
    SELECT NEW.id, up.user_id, up.mobile, up.member_id
    FROM public.user_profiles up
    WHERE up.is_elected_member = true;

  ELSIF lower(NEW.target_audience) = 'patrons' THEN
    INSERT INTO public.notification_recipients(notification_id, user_id, mobile, membership_number)
    SELECT NEW.id, up.user_id, up.mobile, up.member_id
    FROM public.user_profiles up
    WHERE lower(coalesce(up.role,'')) = 'patron' OR lower(coalesce(up.position,'')) = 'patron';

  ELSIF lower(NEW.target_audience) = 'all' THEN
    INSERT INTO public.notification_recipients(notification_id, user_id, mobile, membership_number)
    SELECT NEW.id, up.user_id, up.mobile, up.member_id
    FROM public.user_profiles up
    WHERE up.user_id IS NOT NULL;

  ELSE
    -- If audience appears to be comma-separated membership numbers, insert by membership_number
    IF position(',' IN NEW.target_audience) > 0 THEN
      INSERT INTO public.notification_recipients(notification_id, membership_number)
      SELECT NEW.id, trim(m) FROM regexp_split_to_table(NEW.target_audience, ',') AS m;
    ELSE
      -- fallback: try to match a single membership number or mobile
      -- if target_audience matches a membership_number in user_profiles
      INSERT INTO public.notification_recipients(notification_id, user_id, mobile, membership_number)
      SELECT NEW.id, up.user_id, up.mobile, up.member_id
      FROM public.user_profiles up
      WHERE up.member_id = NEW.target_audience OR up.mobile = NEW.target_audience;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5) trigger on notifications to populate recipients after insert
DROP TRIGGER IF EXISTS trg_populate_notification_recipients ON public.notifications;
CREATE TRIGGER trg_populate_notification_recipients
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.populate_notification_recipients();

-- End migration
