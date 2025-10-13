# 🔧 ListUp Admin Panel - Troubleshooting Guide

## ✅ **Issues Fixed:**

### 1. **Webpack/Turbopack Configuration Warning**
**Problem:** `⚠ Webpack is configured while Turbopack is not, which may cause problems.`

**Solution:** Updated `admin/frontend/next.config.ts` to support both Turbopack and webpack configurations.

**Files Updated:**
- `admin/frontend/next.config.ts` - Added Turbopack configuration
- `admin/frontend/package.json` - Added `dev:webpack` script option

### 2. **MongoDB Connection Issues**
**Problem:** Admin backend can't connect to MongoDB while main backend works fine.

**Root Cause:** Admin backend needs proper environment setup and Prisma client configuration.

**Solution:** 
- ✅ Created proper `.env` file for admin backend
- ✅ Copied Prisma schema to admin backend
- ✅ Generated Prisma client for admin backend

---

## 🚀 **How to Start Everything (Fixed):**

### **Option 1: Use Fixed Scripts**

1. **Start Admin Frontend (Fixed):**
   ```bash
   node start-admin-frontend-fixed.js
   ```

2. **Start Admin Backend:**
   ```bash
   cd admin/backend
   npm run dev
   ```

### **Option 2: Manual Commands**

1. **Start Admin Frontend (without Turbopack):**
   ```bash
   cd admin/frontend
   npm run dev:webpack
   ```

2. **Start Admin Frontend (with Turbopack):**
   ```bash
   cd admin/frontend
   npm run dev
   ```

3. **Start Admin Backend:**
   ```bash
   cd admin/backend
   npm run dev
   ```

---

## 🔍 **Testing Commands:**

### **Test MongoDB Connection:**
```bash
# From Backend directory
cd Backend
node test-mongodb-connection.js
```

### **Test Admin Backend:**
```bash
# From admin/backend directory
cd admin/backend
node test-mongodb-connection.js
```

### **Verify Admin User:**
```bash
# From Backend directory
cd Backend
node verify-admin.js
```

---

## 🔧 **Configuration Files:**

### **Admin Frontend (`admin/frontend/next.config.ts`):**
```typescript
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;
```

### **Admin Backend (`admin/backend/.env`):**
```env
DATABASE_URL="mongodb://localhost:27017/listup"
ADMIN_PORT=4001
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
MAIN_FRONTEND_URL=http://localhost:3000
```

---

## 🎯 **Access URLs:**

- **Main Frontend:** http://localhost:3000
- **Admin Frontend:** http://localhost:3001
- **Main Backend:** http://localhost:4000/api
- **Admin Backend:** http://localhost:4001/api

---

## 🔐 **Admin Login Credentials:**

- **Email:** `benedictnnaoma0@gmail.com`
- **Password:** `Chigozie0@`
- **Role:** `ADMIN`

---

## 🚨 **Common Issues & Solutions:**

### **1. MongoDB Connection Errors:**
```bash
# Error: Server selection timeout
# Solution: Ensure MongoDB is running
mongod --dbpath C:\data\db
```

### **2. Prisma Client Errors:**
```bash
# Error: @prisma/client did not initialize yet
# Solution: Generate Prisma client
npx prisma generate
```

### **3. Environment Variable Errors:**
```bash
# Error: Environment variable not found: DATABASE_URL
# Solution: Check .env file exists and has correct content
```

### **4. Module Resolution Errors:**
```bash
# Error: Can't resolve '@/store/authStore'
# Solution: Use dev:webpack script or fix path mapping
```

---

## 📊 **Admin Panel Features:**

### **Available After Login:**
- ✅ **Dashboard** - Statistics and overview
- ✅ **Vendor Management** - Approve/reject vendors
- ✅ **Listing Management** - Manage marketplace items
- ✅ **Analytics** - Performance insights

### **Vendor Verification Flow:**
1. **Vendor Registration** → Status: `PENDING`
2. **Admin Review** → Can approve or reject
3. **Verification** → Status: `APPROVED` or `REJECTED`

---

## 🎉 **Success Indicators:**

### **Admin Backend Working:**
- ✅ Server starts on port 4001
- ✅ No MongoDB connection errors
- ✅ API endpoints respond correctly

### **Admin Frontend Working:**
- ✅ Server starts on port 3001
- ✅ No webpack/Turbopack warnings
- ✅ Login page loads correctly
- ✅ Can authenticate with admin credentials

### **Full System Working:**
- ✅ Can login to admin panel
- ✅ Dashboard shows statistics
- ✅ Can manage vendors
- ✅ Can view listings

---

## 🆘 **Still Having Issues?**

1. **Check MongoDB Status:**
   ```bash
   netstat -an | findstr :27017
   ```

2. **Check Port Usage:**
   ```bash
   netstat -an | findstr :3001
   netstat -an | findstr :4001
   ```

3. **Check Environment Variables:**
   ```bash
   # In admin/backend directory
   type .env
   ```

4. **Clear Next.js Cache:**
   ```bash
   # In admin/frontend directory
   rm -rf .next
   npm run dev:webpack
   ```

---

**🎯 The admin panel should now work without the webpack/Turbopack configuration conflicts!**
