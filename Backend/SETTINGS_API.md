# Settings API Documentation

## Overview

The Settings API provides comprehensive functionality for managing vendor store settings, personal information, security settings, notification preferences, and user preferences in the ListUp platform.

## Database Schema Updates

### New Models Added

#### 1. **BusinessHours**
- Stores business operating hours for each day of the week
- Each day contains: `open`, `close`, and `closed` status
- Linked to `VendorProfile` via one-to-one relationship

#### 2. **SocialMedia**
- Stores social media handles and links
- Fields: `facebook`, `twitter`, `instagram`, `linkedin`
- Linked to `VendorProfile` via one-to-one relationship

#### 3. **StoreSettings**
- Stores store-specific preferences
- Fields: `autoSave`, `emailDigest`
- Linked to `VendorProfile` via one-to-one relationship

#### 4. **UserPreferences**
- Stores user interface and system preferences
- Fields: `language`, `timezone`, `currency`, `dateFormat`, `theme`
- Linked to `User` via one-to-one relationship

#### 5. **NotificationSettings**
- Stores comprehensive notification preferences
- Order notifications: `orderUpdates`, `newMessages`, `lowStockAlerts`, `paymentNotifications`
- Marketing: `marketingEmails`, `weeklyReports`, `monthlyReports`
- Security: `emailNotifications`, `smsNotifications`
- Linked to `User` via one-to-one relationship

### Updated Models

#### **User Model**
- Added profile fields: `profileImage`, `bio`, `dateOfBirth`, `gender`, `address`, `city`, `state`, `zipCode`, `country`
- Added relation to `UserPreferences` and `NotificationSettings`

#### **VendorProfile Model**
- Added fields: `storeDescription`, `logo`, `website`
- Added relations to `BusinessHours`, `SocialMedia`, and `StoreSettings`

## API Endpoints

### Base URL
```
http://localhost:4000/api/settings
```

### Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### 1. Get User Settings
**GET** `/settings`

Returns all settings for the authenticated user including:
- User profile information
- Vendor profile with business hours, social media, and store settings
- User preferences
- Notification settings

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "vendorProfile": {
      "storeName": "Tech Haven",
      "businessHours": { ... },
      "socialMedia": { ... },
      "storeSettings": { ... }
    },
    "userPreferences": { ... },
    "notificationSettings": { ... }
  }
}
```

### 2. Update Store Settings
**PUT** `/settings/store`

Updates or creates store-related settings.

**Request Body:**
```json
{
  "storeName": "Tech Haven",
  "storeDescription": "Your one-stop shop for technology",
  "businessCategory": "Electronics",
  "storeAddress": "123 Tech Street",
  "website": "www.techhaven.com",
  "businessHours": {
    "monday": { "open": "09:00", "close": "18:00", "closed": false },
    "tuesday": { "open": "09:00", "close": "18:00", "closed": false }
  },
  "socialMedia": {
    "facebook": "techhaven",
    "twitter": "@techhaven"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Store settings updated successfully",
  "data": { ... }
}
```

### 3. Update Personal Information
**PUT** `/settings/personal`

Updates user profile information.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+234 801 234 5678",
  "bio": "Passionate entrepreneur",
  "gender": "Male",
  "address": "456 Business Avenue",
  "city": "Lagos",
  "state": "Lagos",
  "country": "Nigeria"
}
```

### 4. Update Password
**PUT** `/settings/password`

Updates user password with current password verification.

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Validation:**
- New password must be at least 6 characters
- Current password must be verified

### 5. Update Notification Settings
**PUT** `/settings/notifications`

Updates notification preferences.

**Request Body:**
```json
{
  "orderUpdates": true,
  "newMessages": true,
  "lowStockAlerts": true,
  "paymentNotifications": true,
  "marketingEmails": false,
  "weeklyReports": true,
  "monthlyReports": true,
  "emailNotifications": true,
  "smsNotifications": false
}
```

### 6. Update User Preferences
**PUT** `/settings/preferences`

Updates user interface and system preferences.

**Request Body:**
```json
{
  "language": "English",
  "timezone": "Africa/Lagos",
  "currency": "NGN",
  "dateFormat": "DD/MM/YYYY",
  "theme": "light"
}
```

### 7. Update Store Preferences
**PUT** `/settings/store-preferences`

Updates store-specific preferences.

**Request Body:**
```json
{
  "autoSave": true,
  "emailDigest": true
}
```

### 8. Upload Profile Image
**PUT** `/settings/profile-image`

Updates user profile image.

**Request Body:**
```json
{
  "imageUrl": "https://example.com/profile.jpg"
}
```

### 9. Upload Store Image
**PUT** `/settings/store-image`

Updates store logo or cover image.

**Request Body:**
```json
{
  "imageUrl": "https://example.com/logo.png",
  "imageType": "logo"
}
```

**Image Types:**
- `logo` - Store logo
- `cover` - Store cover image

## Alternative Endpoints

### User Profile Endpoints
These endpoints provide alternative ways to access user profile data:

**GET** `/users/profile` - Get user profile with all settings
**PUT** `/users/profile` - Update user profile information

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Data Validation

### Required Fields
- **Store Settings**: `storeName`, `businessCategory`, `storeAddress`
- **Personal Info**: `name`
- **Password Update**: `currentPassword`, `newPassword`

### Field Constraints
- **Password**: Minimum 6 characters
- **Email**: Valid email format
- **Phone**: Valid phone number format
- **Image URLs**: Valid URL format

## Database Seeding

The system includes comprehensive seeding for new settings models:

### Running Seeds
```bash
# Run main seed file (includes settings)
npx prisma db seed

# Run settings-specific seed
node prisma/seed-settings.js
```

### Seed Data Includes
- Sample vendor profiles
- Business hours (Monday-Sunday)
- Social media handles
- Store settings (auto-save, email digest)
- User preferences (language, timezone, currency, theme)
- Notification settings (all notification types)

## Frontend Integration

### API Client
A comprehensive TypeScript API client is provided at:
```
listup_frontend/src/lib/api/settings.ts
```

### Features
- Type-safe API calls
- Automatic authentication
- Error handling
- Request/response interfaces

### Usage Example
```typescript
import { updateStoreSettings, StoreSettings } from '@/lib/api/settings';

const storeData: StoreSettings = {
  storeName: "My Store",
  businessCategory: "Electronics",
  storeAddress: "123 Main St"
};

try {
  const result = await updateStoreSettings(storeData);
  console.log('Settings updated:', result);
} catch (error) {
  console.error('Update failed:', error);
}
```

## Security Features

### Authentication
- JWT token required for all endpoints
- Token validation middleware
- User ID extraction from token

### Password Security
- Current password verification
- Bcrypt hashing for new passwords
- Minimum password length validation

### Data Validation
- Input sanitization
- Required field validation
- Data type validation

## Performance Considerations

### Database Queries
- Efficient joins using Prisma
- Selective field inclusion
- Upsert operations for data consistency

### Caching
- Consider implementing Redis for frequently accessed settings
- Cache user preferences and notification settings

## Future Enhancements

### Planned Features
- Bulk settings updates
- Settings import/export
- Settings templates
- Advanced business hours (holidays, special hours)
- Multi-language support
- Advanced notification scheduling

### Scalability
- Pagination for large datasets
- Rate limiting
- Background job processing for notifications

## Troubleshooting

### Common Issues

1. **Prisma Schema Sync**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

2. **Authentication Errors**
   - Verify JWT token is valid
   - Check token expiration
   - Ensure proper Authorization header

3. **Database Connection**
   - Verify MongoDB connection string
   - Check network connectivity
   - Validate database permissions

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=prisma:*
```

## Support

For technical support or questions about the Settings API:
- Check the main README.md file
- Review the API documentation
- Check server logs for detailed error information
- Verify database schema and connections
