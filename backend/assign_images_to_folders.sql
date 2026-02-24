-- 🖼️ Assign Existing Gallery Images to Folders
-- Run this AFTER applying add_folder_columns_to_gallery.sql migration

-- Step 1: Get folder IDs (verify these exist)
SELECT id, name FROM gallery_folders ORDER BY name;

-- Step 2: Assign all images to "Hospital Pictures" folder (starter approach)
UPDATE public.gallery_photos 
SET folder_id = (SELECT id FROM gallery_folders WHERE name = 'Hospital Pictures'),
    folder_name = 'Hospital Pictures'
WHERE folder_id IS NULL;

-- OPTIONAL: Organize images by name patterns
-- Uncomment and modify these if you want to auto-organize:

-- Example: Photos with "admin" in name go to Administration folder
-- UPDATE public.gallery_photos 
-- SET folder_id = (SELECT id FROM gallery_folders WHERE name = 'Administration'),
--     folder_name = 'Administration'
-- WHERE folder_id IS NULL AND original_name ILIKE '%admin%';

-- Example: Photos with "team" in name go to Team folder
-- UPDATE public.gallery_photos 
-- SET folder_id = (SELECT id FROM gallery_folders WHERE name = 'Team'),
--     folder_name = 'Team'
-- WHERE folder_id IS NULL AND original_name ILIKE '%team%';

-- Step 3: Verify the updates
SELECT folder_name, COUNT(*) as photo_count 
FROM gallery_photos 
GROUP BY folder_name 
ORDER BY folder_name;

-- Step 4: Check if any images are still unassigned
SELECT COUNT(*) as unassigned_photos FROM gallery_photos WHERE folder_id IS NULL;

-- 🎉 All done! Images should now display with folder names in the gallery
