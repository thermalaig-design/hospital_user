import { supabase } from './supabaseClient';

// Fetch doctors from Supabase `opd_schedule` table with correct image URLs
export const getOpdDoctors = async () => {
  try {
    const { data, error } = await supabase
      .from('opd_schedule')
      .select('*')
      .eq('is_active', true)
      .order('consultant_name', { ascending: true });

    if (error) throw error;

    // Normalize doctor_image_url: if it's a storage path (not a full URL),
    // convert to public URL using the 'doctor-images' bucket
    const normalized = (data || []).map((row) => {
      const copy = { ...row };
      const img = copy.doctor_image_url;
      if (img && typeof img === 'string') {
        if (!img.startsWith('http')) {
          // Remove leading slash if present — get just the filename/path
          const path = img.startsWith('/') ? img.slice(1) : img;
          try {
            const { data: urlData } = supabase.storage
              .from('doctor-images')
              .getPublicUrl(path);
            copy.doctor_image_url = urlData?.publicUrl || img;
          } catch (e) {
            console.warn('Could not get public URL for doctor image:', path, e);
          }
        }
        // If it already starts with http — use as-is (already a full URL)
      }
      return copy;
    });

    return { success: true, data: normalized };
  } catch (err) {
    console.error('Error fetching opd_schedule from Supabase:', err);
    return { success: false, error: err };
  }
};

