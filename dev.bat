@echo off
echo ========================================
echo   Starting Next.js Dev Server
echo ========================================
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo ERROR: Dependencies not installed!
    echo Please run setup.bat first
    echo.
    pause
    exit /b 1
)

:: Start dev server
echo Starting development server...
echo Open http://localhost:3000 in your browser
echo.
echo Press Ctrl+C to stop the server
echo.
pnpm dev

