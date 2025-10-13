# 🎉 ListUp Admin Panel - Setup Complete!

## ✅ **Issue Fixed:**
The `initializeAuth is not a function` error has been resolved by updating the `useAdminAuth` hook to properly export the `initializeAuth` function.

## 🚀 **How to Run Everything:**

### **Option 1: Automated Scripts**

1. **Start Admin Backend:**
   ```bash
   node run-admin-backend.js
   ```

2. **Start Admin Frontend:**
   ```bash
   node start-admin-frontend.js
   ```

### **Option 2: Manual Setup**

1. **Start Main Backend (Port 4000):**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start Admin Backend (Port 4001):**
   ```bash
   cd admin/backend
   npm install
   npx prisma generate
   npm run dev
   ```

3. **Start Main Frontend (Port 3000):**
   ```bash
   cd listup_frontend
   npm run dev
   ```

4. **Start Admin Frontend (Port 3001):**
   ```bash
   cd admin/frontend
   npm install
   npm run dev
   ```

## 🔧 **Environment Setup:**

### **Admin Backend (.env):**
```env
DATABASE_URL="mongodb://localhost:27017/listup"
ADMIN_PORT=4001
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
MAIN_FRONTEND_URL=http://localhost:3000
```

### **Admin Frontend (.env.local):**
```env
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:4001
```

## 🎯 **Access URLs:**

- **Main Frontend:** http://localhost:3000
- **Admin Frontend:** http://localhost:3001
- **Main Backend API:** http://localhost:4000/api
- **Admin Backend API:** http://localhost:4001/api

## 🔐 **Admin Login:**

1. **Create Admin User:**
   You need a user with `role: "ADMIN"` in your database. You can:
   - Create one via the main backend registration
   - Or manually add to MongoDB:
     ```javascript
     db.users.updateOne(
       { email: "admin@listup.ng" },
       { $set: { role: "ADMIN" } }
     )
     ```

2. **Login:**
   - Go to http://localhost:3001
   - Use your admin credentials
   - Access dashboard and vendor management

## 🎨 **Features Available:**

### **Admin Panel:**
- ✅ Secure admin authentication
- ✅ Dashboard with statistics
- ✅ Vendor management (approve/reject)
- ✅ Listing management
- ✅ Real-time updates
- ✅ Search and filtering

### **Main Frontend:**
- ✅ Infinite scroll on listings
- ✅ Enhanced pagination
- ✅ Vendor verification system
- ✅ Improved user experience

## 🔄 **Vendor Verification Flow:**

1. **Vendor Registration:**
   - Vendor signs up → Status: `PENDING`

2. **Admin Review:**
   - Admin logs in → Reviews pending vendors
   - Can approve or reject with reason

3. **Verification Status:**
   - `PENDING` - Awaiting review
   - `APPROVED` - Can operate on platform
   - `REJECTED` - Rejected with reason

## 🛠️ **Troubleshooting:**

### **Common Issues:**

1. **Module Resolution Errors:**
   - ✅ Fixed: Updated webpack config in `next.config.ts`
   - ✅ Fixed: Corrected path mapping in `tsconfig.json`

2. **Auth Function Errors:**
   - ✅ Fixed: Added `initializeAuth` to `useAdminAuth` hook

3. **Environment Variables:**
   - Make sure `.env.local` exists in admin/frontend
   - Copy from `env.local` template if needed

4. **Database Connection:**
   - Ensure MongoDB is running
   - Check DATABASE_URL in backend .env files

5. **Port Conflicts:**
   - Main Backend: 4000
   - Admin Backend: 4001
   - Main Frontend: 3000
   - Admin Frontend: 3001

## 📊 **API Endpoints:**

### **Admin Backend:**
- `POST /api/auth/login` - Admin login
- `GET /api/vendors` - List vendors
- `PATCH /api/vendors/:id/approve` - Approve vendor
- `PATCH /api/vendors/:id/reject` - Reject vendor
- `GET /api/dashboard/overview` - Dashboard stats
- `GET /api/listings` - Manage listings

### **Main Backend:**
- All existing endpoints plus enhanced pagination
- Infinite scroll support for listings

## 🎉 **Success!**

Your ListUp marketplace now has:
- ✅ Complete admin panel with vendor verification
- ✅ Infinite scroll frontend
- ✅ Enhanced pagination
- ✅ Secure authentication
- ✅ Modern, responsive UI

**Ready to test! 🚀**

