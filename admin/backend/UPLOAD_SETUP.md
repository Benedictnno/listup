# Admin Backend Upload Setup

This document explains the image upload functionality for the admin backend.

## Overview

The admin backend has its own dedicated upload route that handles image uploads to Cloudinary, separate from the vendor backend.

## Setup Instructions

### 1. Install Dependencies

Run the following command in the admin backend directory:

```bash
npm install
```

This will install the required packages:
- `cloudinary` - Cloudinary SDK
- `multer` - File upload middleware
- `multer-storage-cloudinary` - Cloudinary storage adapter for multer

### 2. Configure Environment Variables

Add the following variables to your `.env` file:

```env
# Cloudinary Configuration (for image uploads)
CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret
```

You can get these credentials from your [Cloudinary Dashboard](https://cloudinary.com/console).

### 3. Restart the Server

After adding the environment variables, restart the admin backend server:

```bash
npm run dev
```

## API Endpoints

### Upload Image

**POST** `/api/uploads/image`

Uploads a single image to Cloudinary.

**Authentication:** Required (Bearer token)

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `image` field containing the file

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/...",
  "public_id": "listup/admin/user-id/filename"
}
```

**Example using axios:**
```javascript
const formData = new FormData();
formData.append('image', file);

const response = await axios.post(
  'http://localhost:4001/api/uploads/image',
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  }
);
```

### Delete Image

**DELETE** `/api/uploads/image/:publicId`

Deletes an image from Cloudinary.

**Authentication:** Required (Bearer token)

**Parameters:**
- `publicId` - The public ID of the image to delete (from upload response)

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

## File Upload Constraints

- **Allowed formats:** JPG, JPEG, PNG, WEBP
- **Maximum file size:** 5MB
- **Storage location:** `listup/admin/{user-id}/`
- **Transformations:** Auto quality and format optimization

## Error Handling

The upload endpoint handles the following errors:

1. **No file provided** (400)
   ```json
   {
     "success": false,
     "message": "No image file provided"
   }
   ```

2. **Upload failed** (500)
   ```json
   {
     "success": false,
     "message": "Failed to upload image"
   }
   ```

3. **Unauthorized** (401)
   - Returned when no valid authentication token is provided

## Frontend Integration

The admin frontend is configured to use this upload endpoint:

**File:** `app/dashboard/advertisements/create/page.tsx`

```typescript
const response = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/uploads/image`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  }
);
```

## Security Features

1. **Authentication Required:** All upload endpoints require a valid JWT token
2. **File Type Validation:** Only image files are accepted
3. **File Size Limit:** Maximum 5MB per file
4. **User-specific Folders:** Images are stored in user-specific folders for organization
5. **Auto Optimization:** Images are automatically optimized for web delivery

## Troubleshooting

### Upload fails with "Failed to upload image"

1. Check that Cloudinary credentials are correctly set in `.env`
2. Verify the credentials are valid in your Cloudinary dashboard
3. Check server logs for detailed error messages

### "No image file provided" error

- Ensure the form data field name is exactly `image`
- Verify the file is being attached to the request

### Authentication errors

- Ensure the JWT token is valid and not expired
- Check that the `Authorization` header is properly formatted: `Bearer {token}`

## Notes

- Images uploaded through the admin backend are stored in a separate folder (`listup/admin/`) from vendor uploads
- The upload route uses the same Cloudinary account as the vendor backend but organizes files differently
- All uploads are automatically optimized for quality and format
