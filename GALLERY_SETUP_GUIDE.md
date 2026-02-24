# Photo Gallery Setup Guide - Supabase Integration

## Overview
This guide explains how to set up the photo gallery feature with Supabase storage and database integration.

## 📋 Files Created/Updated

### 1. **Database Setup**
- **File**: `backend/create_gallery_table.sql`
- **Purpose**: SQL script to create the `gallery_photos` table
- **Table Structure**:
  - `id`: UUID (primary key)
  - `storage_bucket`: Text (default: 'gallery')
  - `storage_path`: Text (file path in storage)
  - `public_url`: Text (public accessible URL)
  - `original_name`: Text (original filename)
  - `mime_type`: Text (file type)
  - `size_bytes`: BigInt (file size)
  - `uploaded_by`: UUID (user ID who uploaded)
  - `created_at`: Timestamp (upload time)

### 2. **Frontend Services**
- **File**: `src/services/galleryService.js` (Updated)
- **New Functions**:
  - `uploadGalleryPhoto(file, originalName)` - Upload photo to Supabase
  - `fetchLatestGalleryImages(limit)` - Fetch latest N photos
  - `fetchAllGalleryImages()` - Fetch all photos

### 3. **Gallery Component**
- **File**: `src/Gallery.jsx` (Updated)
- **New Features**:
  - Upload button in navbar
  - File input handler
  - Upload progress indicator
  - Success/error notifications
  - Auto-refresh after successful upload

### 4. **Backend API**
- **Controller**: `backend/controllers/galleryController.js` (New)
- **Routes**: `backend/routes/galleryRoutes.js` (New)
- **Endpoints**:
  - `GET /api/gallery` - Get all photos (paginated)
  - `GET /api/gallery/latest` - Get latest photos
  - `GET /api/gallery/:id` - Get single photo
  - `GET /api/gallery/stats` - Get gallery statistics
  - `DELETE /api/gallery/:id` - Delete a photo

## 🚀 Setup Instructions

### Step 1: Create Supabase Bucket
1. Go to Supabase Dashboard
2. Navigate to **Storage** section
3. Create a new bucket named **`gallery`**
4. Make it **PUBLIC** for direct access

### Step 2: Create Database Table
1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the SQL from `backend/create_gallery_table.sql`
5. Run the query to create the table and indexes

### Step 3: Configure RLS Policies (Optional)
The SQL script includes RLS policies:
- **Public Read**: Anyone can view gallery photos
- **Authenticated Insert**: Only logged-in users can upload
- **Authenticated Delete**: Only logged-in users can delete their photos

### Step 4: Verify Environment Variables
Check `.env` file has:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 📸 How to Use

### Upload Photos
1. Click the **Upload** button (upload icon) in the Gallery navbar
2. Select an image file (JPG, PNG, WebP, etc.)
3. File will be uploaded to Supabase Storage
4. Photo metadata saved to database
5. Gallery refreshes automatically
6. Success notification displayed

### View Photos
1. Open Gallery page
2. See all uploaded photos in grid layout
3. Click any photo to view fullscreen
4. Navigate with arrows in lightbox
5. Close with X button

### File Validation
- ✅ Must be an image file
- ✅ Maximum file size: 5MB
- ✅ Supported formats: JPG, PNG, WebP, GIF, etc.

## 🔌 API Endpoints

### Get All Photos
```bash
GET /api/gallery?limit=50&offset=0
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "public_url": "https://...",
      "original_name": "photo.jpg",
      "created_at": "2026-02-17T...",
      "uploaded_by": "user-uuid"
    }
  ],
  "count": 10,
  "limit": 50,
  "offset": 0
}
```

### Get Latest Photos
```bash
GET /api/gallery/latest?limit=6
```

### Get Gallery Stats
```bash
GET /api/gallery/stats
```

Response:
```json
{
  "success": true,
  "totalPhotos": 10
}
```

### Delete Photo
```bash
DELETE /api/gallery/:id
```

## 📱 Frontend Integration

### In React Components:
```javascript
import { uploadGalleryPhoto, fetchAllGalleryImages } from './services/galleryService';

// Upload
const result = await uploadGalleryPhoto(file, 'My Photo');
if (result.success) {
  console.log('Photo uploaded:', result.photo);
}

// Fetch
const photos = await fetchAllGalleryImages();
console.log('Photos:', photos);
```

## 🎯 Dummy Data (Fallback)
The gallery includes dummy images as fallback if:
- Database table is not created
- RLS policies block access
- Storage bucket is not accessible

These dummy images are from the gallery bucket showing real Supabase integration.

## ⚙️ Troubleshooting

### Photos not uploading
1. Check Supabase credentials in `.env`
2. Verify bucket 'gallery' exists and is PUBLIC
3. Check browser console for errors
4. Verify file size < 5MB

### Photos not displaying
1. Check table exists: `gallery_photos`
2. Verify RLS policies allow SELECT
3. Check public_url is correct
4. Verify bucket is PUBLIC

### Database table not found
1. Run the SQL script again
2. Check Supabase project ID matches `.env`
3. Try creating table manually via Supabase UI

## 🔐 Security Notes

- Use RLS policies to control access
- Only authenticated users can upload
- Set file upload limits per user (if needed)
- Validate file types on both frontend & backend
- Use signed URLs for private galleries (future enhancement)

## 📝 Next Steps

1. ✅ Create Supabase table
2. ✅ Create bucket
3. ✅ Test upload functionality
4. ✅ Verify photos display
5. Optional: Add image resizing/optimization
6. Optional: Add image filtering/search
7. Optional: Add user permissions management

## 🎨 UI/UX Features

- ✅ Responsive grid layout (2 cols mobile, 3 cols desktop)
- ✅ Lazy loading images
- ✅ Hover effects and animations
- ✅ Full-screen lightbox viewer
- ✅ Image navigation arrows
- ✅ Upload progress indicator
- ✅ Success/error notifications
- ✅ Mobile-friendly touch controls

---

**Last Updated**: February 17, 2026
