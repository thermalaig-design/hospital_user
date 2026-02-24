🚀 **QUICK START - GET IMAGES SHOWING IN 2 MINUTES**

## Do This Now:

### 1️⃣ Open Supabase → SQL Editor

### 2️⃣ Copy + Paste This SQL (Run First):
```sql
-- Add folder columns
ALTER TABLE public.gallery_photos ADD COLUMN IF NOT EXISTS folder_id uuid;
ALTER TABLE public.gallery_photos ADD COLUMN IF NOT EXISTS folder_name text DEFAULT 'General';

-- Create folders table
CREATE TABLE IF NOT EXISTS public.gallery_folders (
  id uuid not null default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone not null default now(),
  constraint gallery_folders_pkey primary key (id),
  constraint gallery_folders_name_unique unique (name)
);

-- Add default folders
INSERT INTO public.gallery_folders (name) VALUES
  ('Administration'), ('Hospital Pictures'), ('Team'), ('Events'), ('General')
ON CONFLICT (name) DO NOTHING;

-- Create RLS if needed
ALTER TABLE public.gallery_folders ENABLE ROW LEVEL SECURITY;

-- Assign all images to Hospital Pictures folder
UPDATE public.gallery_photos 
SET folder_id = (SELECT id FROM gallery_folders WHERE name = 'Hospital Pictures'),
    folder_name = 'Hospital Pictures'
WHERE folder_id IS NULL;
```

### 3️⃣ Click **Run** ▶️

### 4️⃣ Done! ✅
Open your Gallery page - images will now show with folder names!

---

## What You'll See:

Each image now shows:
- 📷 Thumbnail
- 🏷️ **Folder badge** (bottom-left) showing "Hospital Pictures", "Administration", etc.
- 📊 Photo count per folder
- 📂 Clickable folder tabs to filter

---

## Files Created:

1. ✅ `backend/add_folder_columns_to_gallery.sql` - Full migration
2. ✅ `backend/assign_images_to_folders.sql` - Folder assignment script
3. ✅ Updated `src/services/galleryService.js` - Folder support
4. ✅ Updated `src/Gallery.jsx` - Shows folder badges on images
5. ✅ `GALLERY_FOLDER_SETUP.md` - Full documentation

---

**Need to move images between folders?** Use this SQL:
```sql
UPDATE public.gallery_photos 
SET folder_id = (SELECT id FROM gallery_folders WHERE name = 'YOUR_FOLDER_NAME'),
    folder_name = 'YOUR_FOLDER_NAME'
WHERE original_name LIKE '%keyword%';
```

Done! 🎉
