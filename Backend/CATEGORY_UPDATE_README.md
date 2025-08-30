# Category Database Update Guide

This guide explains how to update the database categories to follow the Prisma schema and match the frontend requirements.

## Overview

The database has been updated to include the following categories that match the Prisma schema:

1. **All Categories** (slug: `all-categories`)
2. **Food & Snacks** (slug: `food-snacks`)
3. **Beauty & Personal Care** (slug: `beauty-personal-care`)
4. **Fashion & Clothing** (slug: `fashion-clothing`)
5. **Electronics** (slug: `electronics`)
6. **Computers** (slug: `computers`)
7. **Mobile Phones** (slug: `mobile-phones`)
8. **Audio** (slug: `audio`)
9. **Handmade & Crafts** (slug: `handmade-crafts`)

## Database Structure

According to the Prisma schema:
- **Category Model**: Has `id`, `name`, `slug`, `createdAt`, `updatedAt` fields
- **Listing Model**: Has `categoryId` field that references the Category model
- **Relationship**: One-to-many relationship between Category and Listing

## Available Scripts

### 1. Update Categories
```bash
npm run update-categories
```
- Adds new categories to the database
- Updates existing categories if names have changed
- Preserves existing data
- Shows summary of changes

### 2. Add Categories (Alternative)
```bash
npm run add-categories
```
- Adds categories without checking for existing ones
- Good for initial setup

### 3. Migrate Listings
```bash
npm run migrate-listings
```
- Updates existing listings to use the new category structure
- Assigns default categories to listings without categories
- Shows migration statistics

## Step-by-Step Update Process

### Step 1: Update Categories
```bash
cd Backend
npm run update-categories
```

This will:
- Check existing categories
- Add missing categories
- Update category names if they've changed
- Show a summary of all changes

### Step 2: Migrate Existing Listings (if needed)
```bash
npm run migrate-listings
```

This will:
- Find all listings without categories
- Assign appropriate category IDs
- Show migration statistics

### Step 3: Verify Changes
Check the database to ensure:
- All categories are present
- Listings have proper category relationships
- No orphaned category references

## API Endpoints

The categories are available through the API:

- **GET** `/api/categories` - List all categories
- **POST** `/api/categories/seed` - Seed categories (admin only)
- **POST** `/api/categories` - Create new category
- **PUT** `/api/categories/:id` - Update category
- **DELETE** `/api/categories/:id` - Delete category

## Frontend Integration

The frontend has been updated to:
- Fetch categories from the backend
- Use category IDs for form submissions
- Display category names for user interface
- Filter listings by category

## Troubleshooting

### If categories don't appear:
1. Check if the database connection is working
2. Verify the Prisma schema is up to date
3. Run `npx prisma generate` to update Prisma client
4. Check the server logs for errors

### If listings don't show categories:
1. Ensure listings have valid `categoryId` values
2. Check if the category relationships are properly set up
3. Verify the Prisma queries include category data

### If you need to start fresh:
1. Uncomment the `deleteMany()` line in `update-categories.js`
2. Run the update script
3. Re-run the migration script

## Database Schema Reference

```prisma
model Category {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String   @unique
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  listings Listing[]
}

model Listing {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  // ... other fields ...
  
  categoryId String?   @db.ObjectId
  category   Category? @relation(fields: [categoryId], references: [id])
  
  // ... other fields ...
}
```

## Notes

- The "All Categories" category is used as a placeholder and should not be assigned to actual listings
- Category names are unique in the database
- Category slugs are used for URL-friendly identifiers
- All timestamps are automatically managed by Prisma
