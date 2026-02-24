# Photo Gallery - Code Examples & Usage

## 📚 Using Gallery Service in Your Components

### Example 1: Upload Photo in a Component

```javascript
import { uploadGalleryPhoto } from '../services/galleryService';

function MyPhotoUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (file) => {
    try {
      setIsUploading(true);
      const result = await uploadGalleryPhoto(file, 'My Photo Name');
      
      if (result.success) {
        setMessage('✅ Photo uploaded!');
        console.log('Photo ID:', result.photo.id);
      } else {
        setMessage('❌ ' + result.message);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={isUploading}
      />
      <p>{message}</p>
    </div>
  );
}
```

### Example 2: Display Latest Photos

```javascript
import { useEffect, useState } from 'react';
import { fetchLatestGalleryImages } from '../services/galleryService';

function LatestPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchLatestGalleryImages(6); // Get 6 latest
        setPhotos(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.map(photo => (
        <img 
          key={photo.id}
          src={photo.url} 
          alt={photo.title}
          className="w-full h-40 object-cover rounded"
        />
      ))}
    </div>
  );
}
```

### Example 3: Photo Gallery with Modal

```javascript
import { useState } from 'react';
import { X } from 'lucide-react';

function PhotoGrid({ photos }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-3 gap-4">
        {photos.map(photo => (
          <img 
            key={photo.id}
            src={photo.url} 
            alt={photo.title}
            onClick={() => setSelectedPhoto(photo)}
            className="cursor-pointer hover:opacity-80"
          />
        ))}
      </div>

      {/* Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedPhoto.url} 
            alt={selectedPhoto.title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
```

## 🔌 Using Backend API Directly

### Example 1: Fetch Photos with Fetch API

```javascript
// Get all photos (paginated)
async function getAllPhotos(limit = 10, offset = 0) {
  const response = await fetch(
    `/api/gallery?limit=${limit}&offset=${offset}`
  );
  const data = await response.json();
  return data.data;
}

// Get latest photos
async function getLatestPhotos(limit = 6) {
  const response = await fetch(`/api/gallery/latest?limit=${limit}`);
  const data = await response.json();
  return data.data;
}

// Get single photo
async function getPhoto(id) {
  const response = await fetch(`/api/gallery/${id}`);
  const data = await response.json();
  return data.data;
}

// Get gallery stats
async function getStats() {
  const response = await fetch('/api/gallery/stats');
  const data = await response.json();
  return data.totalPhotos;
}
```

### Example 2: Delete Photo

```javascript
async function deletePhoto(id) {
  const response = await fetch(`/api/gallery/${id}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  return data.success;
}
```

### Example 3: Using Axios

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5002/api'
});

// Get all photos
const getAllPhotos = (limit = 10) => 
  API.get(`/gallery?limit=${limit}`);

// Get latest
const getLatestPhotos = (limit = 6) => 
  API.get(`/gallery/latest?limit=${limit}`);

// Delete
const deletePhoto = (id) => 
  API.delete(`/gallery/${id}`);

// Usage
async function loadPhotos() {
  const { data } = await getLatestPhotos();
  console.log(data.data); // Array of photos
}
```

## 💾 Database Queries

### Example 1: Get Photos by Upload Date

```sql
SELECT * FROM gallery_photos
ORDER BY created_at DESC
LIMIT 10;
```

### Example 2: Get Photos by User

```sql
SELECT * FROM gallery_photos
WHERE uploaded_by = 'user-uuid'
ORDER BY created_at DESC;
```

### Example 3: Count Photos

```sql
SELECT COUNT(*) as total FROM gallery_photos;
```

### Example 4: Get Recent Photos (Last 7 days)

```sql
SELECT * FROM gallery_photos
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Example 5: Get Large Photos

```sql
SELECT * FROM gallery_photos
WHERE size_bytes > 1000000
ORDER BY size_bytes DESC;
```

## 🎯 Advanced Patterns

### Pattern 1: Photo Management Hook

```javascript
import { useState, useCallback } from 'react';
import { uploadGalleryPhoto, fetchAllGalleryImages } from '../services/galleryService';

export function useGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllGalleryImages();
      setPhotos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadPhoto = useCallback(async (file, name) => {
    try {
      const result = await uploadGalleryPhoto(file, name);
      if (result.success) {
        await loadPhotos(); // Refresh
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [loadPhotos]);

  return { photos, loading, error, loadPhotos, uploadPhoto };
}

// Usage in component
function MyComponent() {
  const { photos, loading, uploadPhoto } = useGallery();
  
  // Use hook...
}
```

### Pattern 2: Photo Cache Hook

```javascript
import { useEffect, useState } from 'react';

export function usePhotoCache(limit = 6) {
  const [photos, setPhotos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem('gallery_cache');
    if (cached) {
      setPhotos(JSON.parse(cached));
      return;
    }

    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const { data } = await fetch(`/api/gallery/latest?limit=${limit}`);
      setPhotos(data);
      localStorage.setItem('gallery_cache', JSON.stringify(data));
    } catch (err) {
      setError(err.message);
    }
  };

  const clearCache = () => {
    localStorage.removeItem('gallery_cache');
    setPhotos(null);
  };

  return { photos, error, loadPhotos, clearCache };
}
```

### Pattern 3: Infinite Scroll

```javascript
import { useEffect, useState, useRef, useCallback } from 'react';

export function useInfinitePhotos() {
  const [photos, setPhotos] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const loadMore = useCallback(async () => {
    const { data, count } = await fetch(
      `/api/gallery?limit=12&offset=${offset}`
    ).then(r => r.json()).then(d => d.data);
    
    setPhotos(prev => [...prev, ...data]);
    setOffset(prev => prev + 12);
    setHasMore((offset + 12) < count);
  }, [offset]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return { photos, hasMore, observerTarget };
}
```

## 🧪 Unit Tests

### Test 1: Upload Function

```javascript
import { uploadGalleryPhoto } from '../services/galleryService';

describe('uploadGalleryPhoto', () => {
  it('should upload valid image file', async () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadGalleryPhoto(file, 'Test Photo');
    
    expect(result.success).toBe(true);
    expect(result.photo).toBeDefined();
    expect(result.photo.original_name).toBe('test.jpg');
  });

  it('should reject non-image files', async () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const result = await uploadGalleryPhoto(file);
    
    expect(result.success).toBe(false);
  });
});
```

### Test 2: Fetch Function

```javascript
import { fetchAllGalleryImages } from '../services/galleryService';

describe('fetchAllGalleryImages', () => {
  it('should return array of photos', async () => {
    const photos = await fetchAllGalleryImages();
    
    expect(Array.isArray(photos)).toBe(true);
    expect(photos[0]).toHaveProperty('url');
    expect(photos[0]).toHaveProperty('title');
  });
});
```

## 🚀 Deployment Checklist

- [ ] database table created in Supabase
- [ ] Storage bucket 'gallery' created and PUBLIC
- [ ] Environment variables set (.env)
- [ ] Backend API deployed
- [ ] Frontend built and deployed
- [ ] CORS configured correctly
- [ ] RLS policies in place
- [ ] Backups enabled
- [ ] Monitoring set up
- [ ] Security audit passed

---

**Ready to use!** Copy these examples into your components. 🎉
