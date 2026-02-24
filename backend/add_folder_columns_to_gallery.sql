-- 🚀 Create Gallery Photos Table with Folder Support
-- Single table setup with folder_id and folder_name columns

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
  folder_id uuid null,
  folder_name text null,
  constraint gallery_photos_pkey primary key (id)
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT exists gallery_photos_created_at_idx on public.gallery_photos using btree (created_at desc) TABLESPACE pg_default;

CREATE INDEX IF NOT exists gallery_photos_uploaded_by_idx on public.gallery_photos using btree (uploaded_by) TABLESPACE pg_default;

CREATE INDEX IF NOT exists gallery_photos_folder_id_idx on public.gallery_photos using btree (folder_id) TABLESPACE pg_default;

CREATE INDEX IF NOT exists gallery_photos_folder_name_idx on public.gallery_photos using btree (folder_name) TABLESPACE pg_default;

-- Enable RLS (Row Level Security)
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to gallery_photos" 
  ON public.gallery_photos 
  FOR SELECT 
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert gallery_photos" 
  ON public.gallery_photos 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update gallery_photos" 
  ON public.gallery_photos 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON public.gallery_photos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;

-- ✅ Gallery photos table created with folder support!
