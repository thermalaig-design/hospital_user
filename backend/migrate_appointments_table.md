# Migration Instructions for Appointments Table

To add the new columns for the "Booking for Self/Something Else" feature, run the following SQL command in your Supabase SQL editor:

```sql
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS booking_for VARCHAR(20) DEFAULT 'self',
ADD COLUMN IF NOT EXISTS patient_relationship TEXT NULL;
```

## Steps to Execute:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Paste and run the above SQL command
4. The command will add the two new columns to your appointments table:
   - `booking_for`: Indicates whether the appointment is booked for 'self' or 'someone' (defaults to 'self')
   - `patient_relationship`: Stores the relationship of the person booking to the patient (null if booking for self)

## Why This Manual Step is Required:

Supabase doesn't allow direct ALTER TABLE commands through the client library for security reasons. Schema changes must be made through the SQL editor or using migrations.

## Verification:

After running the command, the appointments table will have these additional columns to properly store the booking type and relationship information.