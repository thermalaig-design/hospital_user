-- Add folder column to gallery_photos table
ALTER TABLE public.gallery_photos
ADD COLUMN IF NOT EXISTS folder text DEFAULT 'General';

-- Create index for faster folder-based queries
CREATE INDEX IF NOT EXISTS gallery_photos_folder_idx ON public.gallery_photos(folder);
