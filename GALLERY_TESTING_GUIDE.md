# Photo Gallery - Quick Testing Guide

## ✅ Pre-requisites
- Supabase project created
- `gallery` bucket created (PUBLIC)
- `gallery_photos` table created in Supabase
- Environment variables configured

## 🧪 Testing Steps

### 1. Database Table Setup
```sql
-- Run this in Supabase SQL Editor
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
);

CREATE INDEX IF NOT exists gallery_photos_created_at_idx on public.gallery_photos using btree (created_at desc);
```

### 2. Test Photo Upload

**Steps:**
1. Navigate to Gallery page in the app
2. Click the **Upload** button (blue upload icon) in navbar
3. Select an image file (JPG, PNG, etc.)
4. Observe:
   - Loading spinner appears
   - Success notification shows
   - Gallery refreshes automatically

**Expected Result:** ✅ Photo appears in gallery grid

### 3. Test Photo Display

**Steps:**
1. View gallery with uploaded photos
2. Click on any photo
3. Observe lightbox opens with:
   - Full-size image
   - Navigation arrows (prev/next)
   - Photo counter (e.g., "1/5")
   - Close button (X)

**Expected Result:** ✅ Lightbox works smoothly with transitions

### 4. Test Photo Navigation

**Steps:**
1. Open lightbox with multiple photos
2. Click next arrow (>)
3. Observe photo changes
4. Click prev arrow (<)
5. Observe photo cycles correctly

**Expected Result:** ✅ Navigation works, loops at start/end

### 5. Test Responsive Design

**Mobile (< 640px):**
- Grid shows 2 columns
- Photos stack vertically
- Upload button visible
- Lightbox fits screen

**Desktop (≥ 640px):**
- Grid shows 3 columns
- Hover effects work
- Text slides up on hover
- Optimal spacing

### 6. Test Error Handling

**Test invalid file:**
1. Try uploading a `.txt` or `.pdf` file
2. Expected: Error message "Please select an image file"

**Test large file:**
1. Try uploading image > 5MB
2. Expected: Error message "File size must be less than 5MB"

**Test with no file:**
1. Click upload, cancel dialog
2. Expected: Nothing happens

### 7. Test Backend API

**Get all photos:**
```bash
curl "http://localhost:5002/api/gallery?limit=10&offset=0"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "public_url": "https://...",
      "original_name": "photo.jpg",
      "created_at": "2026-02-17T..."
    }
  ],
  "count": X,
  "limit": 10,
  "offset": 0
}
```

**Get latest 6 photos:**
```bash
curl "http://localhost:5002/api/gallery/latest?limit=6"
```

**Get gallery stats:**
```bash
curl "http://localhost:5002/api/gallery/stats"
```

**Expected Response:**
```json
{
  "success": true,
  "totalPhotos": X
}
```

### 8. Verify Database

**Check Supabase dashboard:**
1. Go to Supabase > gallery_photos table
2. Should see rows with uploaded photos
3. Verify columns populated:
   - `storage_path` ✅
   - `public_url` ✅
   - `original_name` ✅
   - `mime_type` ✅
   - `created_at` ✅

**Check Supabase storage:**
1. Go to Supabase > Storage > gallery bucket
2. Should see uploaded files
3. Files should be named: `{timestamp}_{filename}`

## 📊 Test Coverage Checklist

- [ ] Upload succeeds with valid image
- [ ] Upload shows error for invalid file type
- [ ] Upload shows error for file too large
- [ ] Gallery loads and displays photos
- [ ] Lightbox opens on photo click
- [ ] Navigation arrows work
- [ ] Lightbox closes on X or outside click
- [ ] Mobile layout (2 columns)
- [ ] Desktop layout (3 columns)
- [ ] Hover effects work on desktop
- [ ] Backend API returns photos
- [ ] Database has photo metadata
- [ ] Storage bucket has photo files
- [ ] Success notification appears
- [ ] Gallery refreshes after upload

## 🔧 Troubleshooting

### Photos not uploading
- Check browser console (F12) for errors
- Verify `.env` VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Check Supabase bucket is PUBLIC
- Check table exists in database

### Photos not displaying
- Check `gallery_photos` table has rows
- Verify `public_url` values are correct
- Check bucket is PUBLIC (not PRIVATE)
- Test URL in browser directly

### Backend API errors
- Verify server is running: `npm start` in backend folder
- Check galleryController.js is imported in server.js
- Test endpoint with curl
- Check server logs for errors

## 🎯 Quick Commands

**Start frontend:**
```bash
npm run dev
```

**Start backend:**
```bash
cd backend && npm start
```

**Test with curl:**
```bash
# Get all photos
curl http://localhost:5002/api/gallery

# Get latest 6
curl http://localhost:5002/api/gallery/latest?limit=6

# Get stats
curl http://localhost:5002/api/gallery/stats

# Get single photo
curl http://localhost:5002/api/gallery/{id}

# Delete photo
curl -X DELETE http://localhost:5002/api/gallery/{id}
```

## 📁 Key Files Modified

1. `src/Gallery.jsx` - Upload UI + handlers
2. `src/services/galleryService.js` - Upload & fetch functions
3. `backend/controllers/galleryController.js` - API handlers
4. `backend/routes/galleryRoutes.js` - API routes
5. `backend/server.js` - Route registration
6. `backend/create_gallery_table.sql` - Database schema

## ✨ Features Enabled

✅ Photo upload to Supabase Storage  
✅ Photo metadata saved to database  
✅ Auto-refresh gallery after upload  
✅ Full-screen lightbox viewer  
✅ Image navigation (prev/next)  
✅ Responsive grid layout  
✅ Mobile-friendly UI  
✅ File validation (type & size)  
✅ Error notifications  
✅ Success notifications  
✅ Backend API endpoints  
✅ Database persistence  

---

**Happy Testing! 🎉**
