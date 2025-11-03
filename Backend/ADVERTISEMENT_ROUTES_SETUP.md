# Advertisement Routes Setup for Main Backend

This document describes the files that need to be created in the gitignored `Backend/src` directory to enable public advertisement functionality.

## Files to Create

### 1. Advertisement Routes
**File:** `Backend/src/routes/advertisements.routes.js`

```javascript
const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// Get random active advertisement (public endpoint)
router.get('/random', async (req, res) => {
  try {
    const now = new Date();
    
    // Get all active, non-expired advertisements
    const activeAds = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        expiryDate: {
          gte: now
        }
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        targetUrl: true
      }
    });

    if (activeAds.length === 0) {
      return res.json({
        success: true,
        data: { advertisement: null }
      });
    }

    // Select random advertisement
    const randomIndex = Math.floor(Math.random() * activeAds.length);
    const advertisement = activeAds[randomIndex];

    res.json({
      success: true,
      data: { advertisement }
    });
  } catch (error) {
    console.error('Get random advertisement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisement'
    });
  }
});

// Track advertisement impression (public endpoint)
router.post('/:id/impression', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.advertisement.update({
      where: { id },
      data: {
        impressions: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      message: 'Impression tracked'
    });
  } catch (error) {
    console.error('Track impression error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track impression'
    });
  }
});

// Track advertisement click (public endpoint)
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await prisma.advertisement.update({
      where: { id },
      data: {
        clicks: {
          increment: 1
        }
      }
    });

    // Return the target URL for redirection
    res.json({
      success: true,
      data: {
        targetUrl: advertisement.targetUrl
      }
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click'
    });
  }
});

module.exports = router;
```

### 2. Advertisement Expiry Cron Job
**File:** `Backend/src/jobs/advertisement-expiry.job.js`

```javascript
const cron = require('node-cron');
const prisma = require('../lib/prisma');

// Run every hour to check and expire advertisements
const scheduleAdvertisementExpiry = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      
      // Find and deactivate expired advertisements
      const result = await prisma.advertisement.updateMany({
        where: {
          isActive: true,
          expiryDate: {
            lt: now
          }
        },
        data: {
          isActive: false
        }
      });

      if (result.count > 0) {
        console.log(`[Advertisement Expiry] Deactivated ${result.count} expired advertisement(s) at ${now.toISOString()}`);
      }
    } catch (error) {
      console.error('[Advertisement Expiry] Error:', error);
    }
  });

  console.log('[Advertisement Expiry] Cron job scheduled - runs every hour');
};

module.exports = { scheduleAdvertisementExpiry };
```

## Integration Steps

### Step 1: Register Routes in Main App

Add to `Backend/src/routes/index.js` or `Backend/src/app.js`:

```javascript
const advertisementsRoutes = require('./advertisements.routes');

// Add this line with other route registrations
app.use('/api/advertisements', advertisementsRoutes);
```

### Step 2: Initialize Cron Job

Add to `Backend/src/server.js` (after app initialization):

```javascript
const { scheduleAdvertisementExpiry } = require('./jobs/advertisement-expiry.job');

// Initialize cron jobs
scheduleAdvertisementExpiry();

// Then start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 3: Apply Database Schema

Run these commands to apply the Advertisement model:

```bash
cd Backend
npx prisma generate
npx prisma db push
```

## Testing the Implementation

### Test Random Ad Endpoint
```bash
curl http://localhost:4000/api/advertisements/random
```

### Test Impression Tracking
```bash
curl -X POST http://localhost:4000/api/advertisements/{ad-id}/impression
```

### Test Click Tracking
```bash
curl -X POST http://localhost:4000/api/advertisements/{ad-id}/click
```

## Frontend Integration Example

Here's how to integrate advertisements in your user-facing frontend:

```typescript
// Example: listup_frontend/src/components/Advertisement.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string;
}

export default function Advertisement() {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetchRandomAd();
  }, []);

  const fetchRandomAd = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/advertisements/random`
      );

      if (response.data.data.advertisement) {
        setAd(response.data.data.advertisement);
        // Track impression
        trackImpression(response.data.data.advertisement.id);
      }
    } catch (error) {
      console.error('Error fetching advertisement:', error);
    }
  };

  const trackImpression = async (adId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/advertisements/${adId}/impression`
      );
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const handleClick = async () => {
    if (!ad) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/advertisements/${ad.id}/click`
      );

      if (ad.targetUrl) {
        window.open(ad.targetUrl, '_blank');
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  if (!ad) return null;

  return (
    <div className="advertisement-container my-4">
      <div className="text-xs text-gray-500 mb-1">Advertisement</div>
      <div
        onClick={handleClick}
        className="cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
      >
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
```

## API Endpoints Summary

### Public Endpoints (No Authentication Required)
- `GET /api/advertisements/random` - Get a random active advertisement
- `POST /api/advertisements/:id/impression` - Track when an ad is displayed
- `POST /api/advertisements/:id/click` - Track when an ad is clicked

### Admin Endpoints (Authentication Required)
These are already implemented in the admin backend at `http://localhost:4001`:
- `GET /api/advertisements` - List all advertisements
- `GET /api/advertisements/:id` - Get single advertisement
- `POST /api/advertisements` - Create new advertisement
- `PUT /api/advertisements/:id` - Update advertisement
- `DELETE /api/advertisements/:id` - Delete advertisement
- `GET /api/advertisements/stats/overview` - Get advertisement statistics

## Environment Variables

Make sure your `.env` file has:
```env
DATABASE_URL="your-mongodb-connection-string"
```

## Notes

1. **Cron Job Schedule**: The cron job runs every hour (`0 * * * *`). You can adjust this in the `advertisement-expiry.job.js` file.

2. **Random Selection**: Ads are selected randomly from all active, non-expired advertisements each time the `/random` endpoint is called.

3. **Tracking**: Impressions are tracked when an ad is displayed, and clicks are tracked when a user clicks on the ad.

4. **Expiry**: Ads automatically become inactive after their expiry date through the cron job.

5. **Image Hosting**: All advertisement images should be hosted externally (e.g., Cloudinary, AWS S3) and only the URL is stored in the database.

## Troubleshooting

### Ads not appearing
- Check if there are active advertisements in the database
- Verify the expiry date is in the future
- Ensure `isActive` is set to `true`

### Cron job not running
- Check server logs for initialization message
- Verify `node-cron` is installed: `npm list node-cron`
- Check for any error messages in the console

### Tracking not working
- Verify the advertisement ID is valid
- Check network requests in browser dev tools
- Look for error messages in server logs
