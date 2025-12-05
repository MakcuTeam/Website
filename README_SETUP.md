# Windows Setup Guide

## Quick Start

1. **Run the setup script:**
   ```
   setup.bat
   ```
   This will:
   - Check for Node.js (install from https://nodejs.org/ if missing)
   - Install pnpm package manager
   - Install all project dependencies

2. **Start development server:**
   ```
   dev.bat
   ```
   Or manually:
   ```
   pnpm dev
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

## Prerequisites

- **Node.js 18.x or 20.x (LTS)** - Download from https://nodejs.org/
  - The setup script will check for this
  - If missing, install it and run `setup.bat` again

## Manual Setup (if scripts don't work)

```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

## Available Commands

- `pnpm dev` - Start development server (hot reload)
- `pnpm dev-ssl` - Start with HTTPS (experimental)
- `pnpm build` - Build for production
- `pnpm start` - Run production build locally
- `pnpm lint` - Run ESLint

## Troubleshooting

### "Node.js is not installed"
- Download and install from https://nodejs.org/
- Choose LTS version (18.x or 20.x)
- Restart your terminal/command prompt
- Run `setup.bat` again

### "pnpm command not found"
- Run: `npm install -g pnpm`
- Or run `setup.bat` which will install it automatically

### "Permission denied" errors
- Run Command Prompt as Administrator
- Or install Node.js/pnpm without admin (user-level install)

### Port 3000 already in use
- Close other applications using port 3000
- Or set custom port: `pnpm dev -- -p 3001`

## Development Tips

- **Hot Reload**: Changes auto-refresh in browser
- **TypeScript Errors**: Check terminal for type errors
- **Build Errors**: Run `pnpm build` to test production build
- **Offline Mode**: Works completely offline (no internet needed for dev)

## Next Steps

After setup:
1. Make your code changes
2. Test locally with `pnpm dev`
3. Build test with `pnpm build`
4. Deploy to Vercel when ready

