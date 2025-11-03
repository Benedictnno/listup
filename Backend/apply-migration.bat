@echo off
echo ========================================
echo Email Verification Migration Script
echo ========================================
echo.

echo Step 1: Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✓ Prisma client generated successfully
echo.

echo Step 2: Pushing schema changes to database...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ERROR: Failed to push schema changes
    pause
    exit /b 1
)
echo ✓ Schema changes applied successfully
echo.

echo ========================================
echo Migration completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. (Optional) Run: node scripts/verify-existing-users.js
echo 2. Restart your backend server: npm run dev
echo 3. Test the email verification flow
echo.
pause
