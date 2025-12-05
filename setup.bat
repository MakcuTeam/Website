@echo off
echo ========================================
echo   MAKCU Website - Setup Script
echo ========================================
echo.

:: Check if Node.js is installed
echo [1/4] Checking for Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended version: Node.js 18.x or 20.x (LTS)
    echo.
    pause
    exit /b 1
)

node --version
echo ✓ Node.js found
echo.

:: Check Node.js version (should be 18+)
for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=1 delims=." %%i in ("%NODE_VERSION%") do set NODE_MAJOR=%%i
if %NODE_MAJOR% LSS 18 (
    echo WARNING: Node.js version is below 18.x
    echo Recommended: Node.js 18.x or 20.x (LTS)
    echo.
)

:: Check if pnpm is installed
echo [2/4] Checking for pnpm...
where pnpm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo pnpm not found. Installing pnpm...
    npm install -g pnpm
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install pnpm
        echo Try running as Administrator or install manually:
        echo   npm install -g pnpm
        echo.
        pause
        exit /b 1
    )
    echo ✓ pnpm installed
) else (
    pnpm --version
    echo ✓ pnpm found
)
echo.

:: Install project dependencies
echo [3/4] Installing project dependencies...
echo This may take a few minutes...
pnpm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo.
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

:: Verify installation
echo [4/4] Verifying installation...
if not exist "node_modules" (
    echo ERROR: node_modules folder not found
    pause
    exit /b 1
)
echo ✓ Installation verified
echo.

:: Success message
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the development server, run:
echo   pnpm dev
echo.
echo Then open: http://localhost:3000
echo.
echo Other useful commands:
echo   pnpm build    - Build for production
echo   pnpm start    - Run production build
echo   pnpm dev-ssl  - Run with HTTPS
echo.
pause

