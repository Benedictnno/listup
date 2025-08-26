# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the Backend directory with the following variables:

### Database Configuration
```env
DATABASE_URL="mongodb://localhost:27017/listup"
```

### Server Configuration
```env
PORT=4000
NODE_ENV=development
```

### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

### Payment Gateway (Paystack)
```env
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
```

### Frontend URL (Critical for Payment Flow)
```env
FRONTEND_URL=http://localhost:3000
```

### File Upload (Cloudinary)
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### SMS Service (Africa's Talking)
```env
AT_API_KEY=your-africas-talking-api-key
AT_USERNAME=your-africas-talking-username
```

### Security
```env
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=your-session-secret-key
```

## Critical Notes

1. **FRONTEND_URL**: This must be set correctly for the payment flow to work. It's used in:
   - Payment callback URLs
   - Redirect URLs after payment
   - CORS configuration

2. **PAYSTACK_SECRET_KEY**: Required for payment processing and webhook verification

3. **JWT_SECRET**: Must be a strong, unique secret for user authentication

4. **DATABASE_URL**: Ensure MongoDB is running and accessible

## Setup Steps

1. Copy this file to `.env` in your Backend directory
2. Fill in your actual API keys and secrets
3. Restart your backend server after making changes
4. Run `npx prisma generate` if you've updated the database schema

## Testing Environment

For development, you can use:
- Paystack test keys (available in your Paystack dashboard)
- Local MongoDB instance
- Local frontend (http://localhost:3000)
