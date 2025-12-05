@echo off
echo ========================================
echo   Starting MAKCU Website
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo Dependencies not found. Installing...
    echo.
    
    :: Check if pnpm is installed
    where pnpm >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo Installing pnpm...
        npm install -g pnpm
    )
    
    echo Installing project dependencies...
    pnpm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

:: Start dev server
echo Starting development server...
echo.
echo Open http://localhost:3000 in your browser
echo Press Ctrl+C to stop the server
echo.
pnpm dev

