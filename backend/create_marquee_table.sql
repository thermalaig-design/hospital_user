-- Create marquee_updates table for displaying scrolling messages on home page
-- This table stores active and inactive marquee messages with priority levels

create table public.marquee_updates (
  id serial not null,
  message text not null,
  is_active boolean null default true,
  priority integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  created_by character varying(100) null,
  updated_by character varying(100) null,
  constraint marquee_updates_pkey primary key (id)
) TABLESPACE pg_default;

-- Enable RLS (Row Level Security) if needed
alter table public.marquee_updates enable row level security;

-- Create policy to allow public read access to active marquee updates
create policy "Allow public read access to active marquee updates" on public.marquee_updates
  for select using (is_active = true);

-- Create policy for authenticated users to read all updates
create policy "Allow authenticated users to read all marquee updates" on public.marquee_updates
  for select using (true);

-- Create policy for admin to insert
create policy "Allow admin to insert marquee updates" on public.marquee_updates
  for insert with check (true);

-- Create policy for admin to update
create policy "Allow admin to update marquee updates" on public.marquee_updates
  for update using (true);

-- Create policy for admin to delete
create policy "Allow admin to delete marquee updates" on public.marquee_updates
  for delete using (true);

-- Insert sample marquee updates
INSERT INTO public.marquee_updates (message, is_active, priority, created_by, updated_by) VALUES
('Free Cardiac Checkup Camp on March 29, 2026', true, 1, 'admin', 'admin'),
('New Specialist Dr. Neha Kapoor Joined', true, 2, 'admin', 'admin'),
('24x7 Emergency Helpline: 1800-XXX-XXXX', true, 3, 'admin', 'admin'),
('Tele Consultation Services Now Available', true, 2, 'admin', 'admin'),
('Home Delivery of Medicines Available', true, 1, 'admin', 'admin'),
('Free Health Camp at Main Hospital', true, 0, 'admin', 'admin'),
('New MRI Machine Installed', true, 1, 'admin', 'admin'),
('OPD Timings: 9 AM to 5 PM', true, 0, 'admin', 'admin'),
('Emergency Services Available 24/7', true, 3, 'admin', 'admin')
ON CONFLICT DO NOTHING;
