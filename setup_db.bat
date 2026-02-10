@echo off
echo [1/3] Setting up environment...
set "DATABASE_URL=file:./dev.db"

echo [2/3] Generating Prisma Client (Bypassing npx)...
call .\node_modules\.bin\prisma.cmd generate --schema=prisma/schema.prisma

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] generation failed.
    echo Please ensure node_modules is installed.
    pause
    exit /b
)

echo [3/3] Seeding Database...
node prisma/seed.js

echo.
echo [SUCCESS] Database is ready!
echo You can now run 'npm run dev'
pause
