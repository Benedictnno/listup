# ListUp - Marketplace Platform

A comprehensive marketplace platform with vendor management, product listings, and advertising system.

## 🚀 Features

- **User Management**: Vendor registration, authentication, and profiles
- **Product Listings**: Create, manage, and browse products
- **Advertising System**: Promote stores and products with paid advertising
- **Payment Integration**: Paystack payment gateway for ad purchases
- **Search & Filtering**: Advanced product search with multiple filters
- **Responsive Design**: Modern UI built with Next.js and Tailwind CSS

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Zustand** for state management
- **Framer Motion** for animations
- **Radix UI** for accessible components

### Backend
- **Node.js** with Express.js
- **Prisma ORM** for database operations
- **MongoDB** as the primary database
- **JWT** for authentication
- **Paystack** for payment processing

## 📁 Project Structure

```
ListUp/
├── Backend/                 # Node.js backend server
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Authentication & validation
│   │   └── lib/           # Utilities & configurations
│   ├── prisma/            # Database schema & migrations
│   └── package.json
├── listup_frontend/        # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # API clients & utilities
│   │   └── store/         # Zustand state management
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance
- Paystack account for payments

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `ENVIRONMENT_SETUP.md` to `.env`
   - Fill in your actual API keys and secrets
   - **Critical**: Set `FRONTEND_URL=http://localhost:3000`

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd listup_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔑 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="mongodb://localhost:27017/listup"

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Paystack (Critical for payments)
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key

# Frontend URL (Critical for payment flow)
FRONTEND_URL=http://localhost:3000
```

## 💳 Payment Setup

### Paystack Configuration
1. Sign up at [Paystack](https://paystack.com/)
2. Get your API keys from the dashboard
3. Configure webhook URL in Paystack dashboard:
   - Go to Settings → Webhooks
   - Add webhook URL: `http://localhost:4000/api/payments/webhook`
   - Select events: `charge.success`

### Payment Flow
1. **Ad Creation**: Vendor creates ad (status: PENDING)
2. **Payment Initiation**: Frontend calls payment API
3. **Paystack Redirect**: User redirected to payment page
4. **Payment Success**: Paystack redirects to success page
5. **Webhook Update**: Backend receives webhook and updates ad status
6. **Ad Activation**: Ad becomes active and visible on landing page

## 🐛 Troubleshooting

### Common Issues

#### Payment Stuck on "Pending"
1. **Check Webhook Configuration**:
   - Verify webhook URL in Paystack dashboard
   - Ensure webhook events include `charge.success`

2. **Check Backend Logs**:
   - Look for webhook received messages
   - Check for any error messages

3. **Manual Verification** (for testing):
   - Use the "Manual Verify Payment" button on success page
   - This bypasses webhook for testing purposes

#### Ads Not Showing on Landing Page
1. **Check Ad Status**:
   - Ensure `status: "ACTIVE"` and `paymentStatus: "SUCCESS"`
   - Verify dates are within valid range

2. **Check Backend Logs**:
   - Look for active ads fetching logs
   - Verify data population

#### Database Connection Issues
1. **MongoDB Status**:
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Prisma Issues**:
   - Run `npx prisma generate` after schema changes
   - Restart backend server

### Debug Endpoints

- **All Ads**: `GET /api/ads/all` (for debugging)
- **Payment Status**: `GET /api/payments/ad/:adId/status`
- **Manual Verification**: `POST /api/payments/verify-payment/:adId`

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (VENDOR, ADMIN)
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Ads
- `POST /api/ads` - Create new ad
- `GET /api/ads/active` - Get active ads (public)
- `GET /api/ads/:id` - Get specific ad
- `GET /api/ads/vendor/:vendorId` - Get vendor's ads

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/webhook` - Paystack webhook
- `GET /api/payments/ad/:adId/status` - Check payment status
- `POST /api/payments/verify-payment/:adId` - Manual verification

## 🚀 Deployment

### Production Considerations
1. **Environment Variables**: Use production API keys
2. **Database**: Use production MongoDB instance
3. **CORS**: Update CORS origins for production domain
4. **Webhooks**: Update Paystack webhook URL
5. **SSL**: Ensure HTTPS for production

### Docker (Optional)
```bash
# Build and run with Docker
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review backend logs for error details
3. Verify environment variable configuration
4. Test with manual payment verification endpoint

## 🔄 Recent Updates

- ✅ Fixed webhook date setting for ads
- ✅ Added comprehensive validation for ad creation
- ✅ Improved error handling and logging
- ✅ Enhanced frontend error states and loading
- ✅ Added manual payment verification for testing
- ✅ Fixed store/product data population in ads
- ✅ Improved API endpoint consistency 
