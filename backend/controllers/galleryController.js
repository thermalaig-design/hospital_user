import { supabase } from '../config/supabase.js';

const TABLE = 'gallery_photos';
const BUCKET = 'gallery';

/**
 * Get all gallery photos
 */
export const getAllGalleryPhotos = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data, error, count } = await supabase
      .from(TABLE)
      .select('id, public_url, original_name, created_at, uploaded_by', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch gallery photos',
        error: error.message
      });
    }

    res.json({
      success: true,
      data,
      count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error in getAllGalleryPhotos:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get latest gallery photos
 */
export const getLatestGalleryPhotos = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const { data, error } = await supabase
      .from(TABLE)
      .select('id, public_url, original_name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch latest gallery photos',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error in getLatestGalleryPhotos:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get single gallery photo by ID
 */
export const getGalleryPhotoById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Gallery photo not found',
        error: error.message
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in getGalleryPhotoById:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Delete gallery photo (and storage file)
 */
export const deleteGalleryPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    // Get photo details first
    const { data: photo, error: fetchError } = await supabase
      .from(TABLE)
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({
        success: false,
        message: 'Gallery photo not found',
        error: fetchError.message
      });
    }

    // Delete from storage
    if (photo?.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([photo.storage_path]);

      if (storageError) {
        console.warn('Error deleting file from storage:', storageError);
        // Continue with DB deletion even if file deletion fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete gallery photo',
        error: deleteError.message
      });
    }

    res.json({
      success: true,
      message: 'Gallery photo deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteGalleryPhoto:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get gallery stats
 */
export const getGalleryStats = async (req, res) => {
  try {
    const { count, error } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch gallery stats',
        error: error.message
      });
    }

    res.json({
      success: true,
      totalPhotos: count || 0
    });
  } catch (error) {
    console.error('Error in getGalleryStats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
