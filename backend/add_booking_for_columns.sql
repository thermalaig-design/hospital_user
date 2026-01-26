-- Add booking_for and patient_relationship columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS booking_for VARCHAR(20) DEFAULT 'self',
ADD COLUMN IF NOT EXISTS patient_relationship TEXT NULL;