import { supabase } from './supabaseClient';

const TABLE = 'gallery_photos';
const BUCKET = 'gallery';



function mapRowToImage(row) {
  return {
    id: row.id,
    url: row.public_url,
    title: row.original_name || 'Gallery Photo',
    folderId: row.folder_id,
    folderName: row.folder_name || 'General',
    createdAt: row.created_at
  };
}

// Upload photo to Supabase Storage and save metadata to database
export async function uploadGalleryPhoto(file, originalName = null, folderId = null, folderName = 'General') {
  try {
    if (!file) throw new Error('No file provided');

    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storagePath = fileName;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Get user info
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    // Save metadata to gallery_photos table
    const { data: insertData, error: insertError } = await supabase
      .from(TABLE)
      .insert([
        {
          storage_bucket: BUCKET,
          storage_path: storagePath,
          public_url: publicUrl,
          original_name: originalName || file.name,
          mime_type: file.type,
          size_bytes: file.size,
          uploaded_by: userId,
          folder_id: folderId,
          folder_name: folderName || 'General'
        }
      ])
      .select();

    if (insertError) throw insertError;

    return {
      success: true,
      photo: insertData[0],
      message: 'Photo uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading photo:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to upload photo'
    };
  }
}

// Fetch all gallery folders from gallery_photos table (get distinct folders)
export async function fetchGalleryFolders() {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('folder_id, folder_name');

    if (error) throw error;

    // Get unique folders from photos
    const folders = [];
    const seen = new Set();
    
    (data || []).forEach(row => {
      const folderId = row.folder_id || `folder_${row.folder_name}`;
      const folderName = row.folder_name || 'General';
      
      if (!seen.has(folderName)) {
        seen.add(folderName);
        folders.push({
          id: folderId || folderName,
          name: folderName
        });
      }
    });

    // Sort by name
    folders.sort((a, b) => a.name.localeCompare(b.name));

    return folders;
  } catch (err) {
    console.error('Error fetching folders:', err);
    return [];
  }
}

// Fetch images by folder
export async function fetchImagesByFolder(folderId = null) {
  try {
    let query = supabase
      .from(TABLE)
      .select('id, public_url, original_name, folder_id, folder_name, created_at');

    if (folderId) {
      query = query.eq('folder_id', folderId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapRowToImage).filter((img) => img.url);
  } catch (err) {
    console.error('Error fetching images by folder:', err);
    return [];
  }
}

// Fetch latest gallery images from database
export async function fetchLatestGalleryImages(limit = 6) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, public_url, original_name, folder_id, folder_name, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(mapRowToImage).filter((img) => img.url);
}

// Fetch all gallery images from database
export async function fetchAllGalleryImages() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, public_url, original_name, folder_id, folder_name, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(mapRowToImage).filter((img) => img.url);
}

