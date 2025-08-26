# Categories System Documentation

## Overview
The Categories System provides a comprehensive way to organize and classify products in the ListUp marketplace. It includes both backend API endpoints and frontend integration for dynamic category management.

## Features

### ✅ **What's Implemented:**
1. **Dynamic Category Fetching** - Categories are loaded from the database instead of being hardcoded
2. **Comprehensive Category List** - 15 default categories covering major product types
3. **Frontend Integration** - Create listing form now uses real categories
4. **API Client** - Complete CRUD operations for categories
5. **Database Seeding** - Automatic population of default categories
6. **Form Validation** - Ensures category selection before submission

### 🔄 **What's Available:**
- **15 Default Categories** including Electronics, Fashion, Home & Furniture, etc.
- **Category API Endpoints** for full CRUD operations
- **Frontend Category Selection** with loading states and error handling
- **Database Seeding Scripts** for easy setup

## Database Schema

### Category Model
```prisma
model Category {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String   @unique
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  listings Listing[]
}
```

### Listing Model (Updated)
```prisma
model Listing {
  // ... other fields
  categoryId String?   @db.ObjectId
  category   Category? @relation(fields: [categoryId], references: [id])
  // ... other fields
}
```

## API Endpoints

### Get All Categories
```
GET /api/categories
```
**Response:** Array of Category objects
```json
[
  {
    "id": "category_id",
    "name": "Electronics & Gadgets",
    "slug": "electronics-gadgets",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Category by ID
```
GET /api/categories/:id
```

### Create Category (Admin Only)
```
POST /api/categories
```
**Body:**
```json
{
  "name": "New Category",
  "slug": "new-category"
}
```

### Update Category (Admin Only)
```
PUT /api/categories/:id
```

### Delete Category (Admin Only)
```
DELETE /api/categories/:id
```

## Frontend Integration

### Categories API Client
```typescript
import { fetchCategories, Category } from "@/lib/api/categories";

// Fetch all categories
const categories = await fetchCategories();

// Use in components
const [categories, setCategories] = useState<Category[]>([]);
```

### Create Listing Form
The create listing form now:
- ✅ Fetches categories dynamically from the API
- ✅ Shows loading states while fetching
- ✅ Handles errors gracefully
- ✅ Validates category selection
- ✅ Uses real category IDs from the database

## Default Categories

The system comes with 15 pre-configured categories:

1. **Electronics & Gadgets** - `electronics-gadgets`
2. **Fashion & Clothing** - `fashion-clothing`
3. **Home & Furniture** - `home-furniture`
4. **Books & Education** - `books-education`
5. **Sports & Outdoors** - `sports-outdoors`
6. **Beauty & Personal Care** - `beauty-personal-care`
7. **Automotive & Parts** - `automotive-parts`
8. **Health & Wellness** - `health-wellness`
9. **Toys & Games** - `toys-games`
10. **Food & Beverages** - `food-beverages`
11. **Jewelry & Accessories** - `jewelry-accessories`
12. **Art & Collectibles** - `art-collectibles`
13. **Tools & Hardware** - `tools-hardware`
14. **Pet Supplies** - `pet-supplies`
15. **Baby & Kids** - `baby-kids`

## Setup Instructions

### 1. Database Seeding
```bash
cd Backend
npx prisma db seed
```

### 2. Manual Category Seeding (if needed)
```bash
cd Backend
node prisma/seed-categories.js
```

### 3. Frontend Usage
```typescript
// In your component
import { fetchCategories } from "@/lib/api/categories";

useEffect(() => {
  const loadCategories = async () => {
    const categories = await fetchCategories();
    setCategories(categories);
  };
  loadCategories();
}, []);
```

## Benefits

### For Vendors:
- **Better Product Organization** - Products are properly categorized
- **Improved Discoverability** - Customers can find products by category
- **Professional Appearance** - Organized product listings look more professional

### For Customers:
- **Easier Navigation** - Browse products by category
- **Better Search Results** - Category-based filtering
- **Improved Shopping Experience** - Find what they're looking for faster

### For Platform:
- **Better Data Quality** - Structured product data
- **Analytics & Insights** - Category-based reporting
- **SEO Benefits** - Category-based URLs and metadata

## Future Enhancements

### Planned Features:
1. **Category Management Interface** - Admin panel for managing categories
2. **Category-Based Filtering** - Advanced search and filter options
3. **Category Analytics** - Performance metrics by category
4. **Category Recommendations** - AI-powered category suggestions
5. **Subcategories** - Hierarchical category structure
6. **Category Images** - Visual category representation

### Technical Improvements:
1. **Category Caching** - Redis-based category caching
2. **Category Validation** - Frontend and backend validation
3. **Category Permissions** - Role-based category access
4. **Category Migration** - Tools for updating existing listings

## Troubleshooting

### Common Issues:

#### 1. Categories Not Loading
- Check if the backend is running
- Verify the categories API endpoint is accessible
- Check browser console for errors
- Ensure database is seeded with categories

#### 2. Category Selection Not Working
- Verify categoryId is being set correctly
- Check if the category exists in the database
- Ensure the form validation is working

#### 3. Database Seeding Fails
- Check Prisma connection
- Verify database schema is up to date
- Run `npx prisma generate` if needed

### Debug Commands:
```bash
# Check if categories exist
npx prisma studio

# Reset and reseed database
npx prisma db push
npx prisma db seed

# Check API endpoint
curl http://localhost:4000/api/categories
```

## Support

For issues or questions about the Categories System:
1. Check this documentation first
2. Review the API endpoints
3. Check the frontend console for errors
4. Verify database seeding completed successfully
5. Contact the development team if issues persist

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
