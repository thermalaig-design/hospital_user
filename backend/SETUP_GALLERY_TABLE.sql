-- 🚀 Gallery Photos Table Setup
-- Copy and paste this ENTIRE script into Supabase SQL Editor and execute

-- Step 1: Create the gallery_photos table
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id uuid not null default gen_random_uuid (),
  storage_bucket text not null default 'gallery'::text,
  storage_path text not null,
  public_url text not null,
  original_name text null,
  mime_type text null,
  size_bytes bigint null,
  uploaded_by uuid null,
  created_at timestamp with time zone not null default now(),
  constraint gallery_photos_pkey primary key (id)
) TABLESPACE pg_default;

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS gallery_photos_created_at_idx 
  on public.gallery_photos using btree (created_at desc) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS gallery_photos_uploaded_by_idx 
  on public.gallery_photos using btree (uploaded_by) TABLESPACE pg_default;

-- Step 3: Enable RLS (Row Level Security)
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Step 4: Remove existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to gallery_photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Allow authenticated users to insert gallery_photos" ON public.gallery_photos;

-- Step 5: Create RLS policies
CREATE POLICY "Allow public read access to gallery_photos" 
  ON public.gallery_photos 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated users to insert gallery_photos" 
  ON public.gallery_photos 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Step 6: Grant permissions
GRANT SELECT ON public.gallery_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;

-- ✅ Done! Table is ready to use
