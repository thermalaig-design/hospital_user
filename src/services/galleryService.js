import { supabase } from './supabaseClient';

const TABLE = 'gallery_photos';
const BUCKET = 'gallery';

// Temporary dummy images – used while Supabase gallery table/storage
// is being set up correctly.
// These URLs come from your Supabase storage where the photos are already uploaded.
const DUMMY_IMAGES = [
  {
    id: 'dummy-1',
    url: 'https://gskzafarbzhdcgvrrkdc.supabase.co/storage/v1/object/public/gallery/gallery/1770190814092_WhatsApp%20Image%202026-02-04%20at%2012.35.24%20PM.jpeg',
    title: 'Modern Hospital Building Exterior',
    createdAt: null
  },
  {
    id: 'dummy-2',
    url: 'https://gskzafarbzhdcgvrrkdc.supabase.co/storage/v1/object/public/gallery/gallery/1770190852039_WhatsApp%20Image%202026-02-04%20at%2012.35.31%20PM%20(1).jpeg',
    title: 'Reception & Patient Waiting Area',
    createdAt: null
  },
  {
    id: 'dummy-3',
    url: 'https://gskzafarbzhdcgvrrkdc.supabase.co/storage/v1/object/public/gallery/gallery/1770190849181_WhatsApp%20Image%202026-02-04%20at%2012.35.27%20PM.jpeg',
    title: 'Comfortable Patient Room',
    createdAt: null
  },
  {
    id: 'dummy-4',
    url: 'https://gskzafarbzhdcgvrrkdc.supabase.co/storage/v1/object/public/gallery/gallery/1770190919504_6.webp',
    title: 'Operation Theatre & Equipment',
    createdAt: null
  },
  {
    id: 'dummy-5',
    url: 'https://gskzafarbzhdcgvrrkdc.supabase.co/storage/v1/object/public/gallery/gallery/1770190852725_WhatsApp%20Image%202026-02-04%20at%2012.35.35%20PM.jpeg',
    title: 'Advanced Medical Facilities',
    createdAt: null
  },
  {
    id: 'dummy-6',
    url: 'https://gskzafarbzhdcgvrrkdc.supabase.co/storage/v1/object/public/gallery/gallery/1770190852377_WhatsApp%20Image%202026-02-04%20at%2012.35.31%20PM.jpeg',
    title: 'Caring Doctors & Nursing Staff',
    createdAt: null
  }
];

function getDummyImages(limit) {
  if (typeof limit === 'number') {
    return DUMMY_IMAGES.slice(0, limit);
  }
  return DUMMY_IMAGES;
}

function mapRowToImage(row) {
  return {
    id: row.id,
    url: row.public_url,
    title: row.original_name || 'Gallery Photo',
    createdAt: row.created_at
  };
}

function mapStorageObjToImage(obj) {
  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(obj.name).data.publicUrl;
  return {
    id: obj.id || obj.name,
    url: publicUrl,
    title: obj.name,
    createdAt: obj.created_at || obj.updated_at || null
  };
}

async function fallbackListFromStorage({ limit } = {}) {
  // Lists files from public bucket and generates public URLs
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list('', {
      limit: limit ?? 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) throw error;
  return (data || [])
    .filter((o) => o && o.name && !o.name.endsWith('/'))
    .map(mapStorageObjToImage);
}

export async function fetchLatestGalleryImages(limit = 6) {
  // TEMP: always show dummy images to avoid 404 errors from missing table.
  // Once Supabase gallery_photos table & bucket are correctly configured,
  // remove this early return and use the Supabase-backed code below.
  return getDummyImages(limit);

  /*
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, public_url, original_name, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    // If table is protected by RLS or not accessible, fall back to storage listing.
    console.warn('[galleryService] gallery_photos select failed, falling back to storage:', error);
    return await fallbackListFromStorage({ limit });
  }

  const mapped = (data || []).map(mapRowToImage).filter((img) => img.url);
  if (mapped.length > 0) return mapped;

  // If table exists but has no rows / missing public_url, fall back to storage.
  return await fallbackListFromStorage({ limit });
  */
}

export async function fetchAllGalleryImages() {
  // TEMP: always return all dummy images.
  return getDummyImages();

  /*
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, public_url, original_name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[galleryService] gallery_photos select failed, falling back to storage:', error);
    return await fallbackListFromStorage();
  }

  const mapped = (data || []).map(mapRowToImage).filter((img) => img.url);
  if (mapped.length > 0) return mapped;

  return await fallbackListFromStorage();
  */
}

