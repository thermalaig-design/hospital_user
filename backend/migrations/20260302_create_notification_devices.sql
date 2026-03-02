CREATE TABLE IF NOT EXISTS public.notification_devices (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'android',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS notification_devices_user_token_uidx
  ON public.notification_devices (user_id, token);

CREATE INDEX IF NOT EXISTS notification_devices_user_id_idx
  ON public.notification_devices (user_id);

CREATE INDEX IF NOT EXISTS notification_devices_is_active_idx
  ON public.notification_devices (is_active);

