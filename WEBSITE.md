# MAKCU Website - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features & Pages](#features--pages)
5. [Internationalization (i18n)](#internationalization-i18n)
6. [Components Architecture](#components-architecture)
7. [API Routes](#api-routes)
8. [Configuration Files](#configuration-files)
9. [Development Setup](#development-setup)
10. [Build & Deployment](#build--deployment)
11. [Key Features Breakdown](#key-features-breakdown)
12. [MAKCU Device Integration](#makcu-device-integration)
13. [Styling & Theming](#styling--theming)
14. [Content Management](#content-management)
15. [Future Enhancements](#future-enhancements)

---

## Project Overview

The MAKCU Website is the official documentation and tooling platform for the MAKCU ecosystem. It provides:

- **Comprehensive API Documentation** - Complete reference for MAKCU KM Host Protocol v3.9
- **Device Management Tools** - Firmware flashing, device settings, and troubleshooting
- **Multi-language Support** - English and Chinese (Simplified)
- **Interactive Documentation** - Searchable guides, code examples, and live device interaction
- **Modern UI/UX** - Responsive design with dark/light theme support

### Project Information

- **Name**: MAKCU Official Website
- **Version**: 2.0.0
- **Framework**: Next.js 15.1.4
- **Language**: TypeScript
- **Package Manager**: pnpm

---

## Tech Stack

### Core Framework
- **Next.js 15.1.4** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5.8.2** - Type safety

### UI Components & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Headless UI components (Accordion, Dialog, Dropdown, etc.)
- **Lucide React** - Icon library
- **next-themes** - Theme management (dark/light mode)
- **@tailwindcss/typography** - Typography plugin for prose content

### State Management
- **Redux Toolkit 2.6.1** - State management (Discord data)
- **React Context API** - Local state (theme, dictionary, audio, MAKCU connection)

### Content & Documentation
- **next-mdx-remote** - MDX content rendering
- **gray-matter** - Front matter parsing
- **remark-gfm** - GitHub Flavored Markdown support
- **rehype-prism-plus** - Syntax highlighting
- **rehype-slug** - Heading ID generation
- **rehype-autolink-headings** - Auto-link headings

### Device Communication
- **Web Serial API** - Browser-based serial communication
- **esptool-js** - ESP32-S3 firmware flashing
- **web-serial-polyfill** - Web Serial API polyfill

### Utilities
- **crypto-js** - Encryption utilities
- **clsx** & **tailwind-merge** - Conditional class names
- **sonner** - Toast notifications
- **class-variance-authority** - Component variants

### Fonts
- **Space Grotesk** - Primary sans-serif font
- **Space Mono** - Monospace font for code
- **Noto Serif SC** - Chinese serif font
- **Road Rage** (Local) - Logo font

---

## Project Structure

```
Website/
├── app/                          # Next.js App Router
│   ├── [lang]/                   # Language-specific routes
│   │   ├── api/                  # API documentation page
│   │   ├── discord/              # Discord integration page
│   │   ├── docs/                 # Documentation pages
│   │   │   ├── [[...slug]]/     # Dynamic doc routes
│   │   │   └── layout.tsx       # Docs layout
│   │   ├── firmware/             # Firmware flashing page
│   │   ├── information/          # Information page
│   │   ├── settings/             # Device settings page
│   │   ├── setup/                # Setup guide page
│   │   ├── troubleshooting/      # Troubleshooting page
│   │   ├── xim/                  # XIM integration page
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout
│   │   ├── provider.tsx          # Context providers
│   │   ├── error.tsx             # Error boundary
│   │   └── not-found.tsx         # 404 page
│   └── api/                      # API routes
│       ├── download/             # File download routes
│       ├── makcu/                # MAKCU device API
│       └── pages/                # Page data API
│
├── components/                    # React components
│   ├── contexts/                 # Context providers
│   │   ├── audio-provider.tsx
│   │   ├── dictionary-provider.tsx
│   │   ├── makcu-connection-provider.tsx
│   │   └── theme-provider.tsx
│   ├── hooks/                    # Custom React hooks
│   │   └── useLocale.ts
│   ├── markdown/                 # Markdown components
│   │   ├── copy.tsx              # Code copy button
│   │   ├── image.tsx             # Image component
│   │   ├── link.tsx              # Link component
│   │   ├── note.tsx              # Note callout
│   │   ├── outlet.tsx            # Content outlet
│   │   ├── pre.tsx               # Code block
│   │   └── stepper.tsx           # Step-by-step guide
│   ├── ui/                       # UI components (shadcn/ui)
│   │   ├── accordion.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (more UI components)
│   ├── anchor.tsx                # Anchor links
│   ├── audio-player.tsx          # Audio player
│   ├── audio-toggle.tsx          # Audio toggle button
│   ├── deviceTool.tsx            # Device tool component
│   ├── discord.tsx               # Discord integration
│   ├── docs-menu.tsx             # Documentation menu
│   ├── footer.tsx                # Site footer
│   ├── home-sidebar.tsx          # Home page sidebar
│   ├── lang-select.tsx           # Language selector
│   ├── leftbar.tsx               # Left sidebar
│   ├── localized-link.tsx        # Localized navigation
│   ├── makcu-connection-button.tsx # MAKCU connect button
│   ├── makcu-settings.tsx        # MAKCU settings UI
│   ├── navbar.tsx                # Navigation bar
│   ├── page-sidebar.tsx          # Page sidebar
│   ├── search-bar.tsx            # Search functionality
│   ├── section.tsx               # Section component
│   ├── theme-toggle.tsx          # Theme switcher
│   ├── toc.tsx                   # Table of contents
│   └── typography.tsx            # Typography components
│
├── contents/                      # Content files
│   └── docs/                      # Documentation content
│       ├── cn/                    # Chinese content
│       └── en/                    # English content
│
├── dictionaries/                  # Translation files
│   ├── cn.json                    # Chinese translations
│   └── en.json                    # English translations
│
├── lib/                           # Utility libraries
│   ├── dictionaries.ts            # Dictionary loader
│   ├── discordBot.ts              # Discord bot integration
│   ├── locale.ts                  # Locale utilities
│   ├── markdown.ts                # Markdown processing
│   ├── routes-config.ts           # Route configuration
│   ├── search-index.ts            # Search indexing
│   ├── sections-config.ts         # Section configuration
│   └── utils.ts                   # General utilities
│
├── store/                         # Redux store
│   ├── discordSlice.ts            # Discord state slice
│   └── index.ts                   # Store configuration
│
├── styles/                         # Global styles
│   ├── globals.css                # Global CSS
│   └── syntax.css                 # Syntax highlighting
│
├── types/                          # TypeScript types
│   └── global.d.ts                # Global type definitions
│
├── public/                         # Static assets
│   ├── audio.mp3                  # Background audio
│   ├── blog.png                   # Blog image
│   ├── docs.png                   # Docs image
│   └── home.png                   # Home image
│
├── assets/                         # Source assets
│   └── makcu.png                  # MAKCU logo
│
├── fonts/                          # Custom fonts
│   └── Road-Rage.otf              # Logo font
│
├── hooks/                          # Global hooks
│   └── useScrollToBottom.ts       # Scroll hook
│
├── middleware.ts                   # Next.js middleware
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript configuration
├── components.json                 # shadcn/ui configuration
└── package.json                    # Dependencies
```

---

## Features & Pages

### 1. Home Page (`/` or `/[lang]`)

**Route**: `app/[lang]/page.tsx`

**Features**:
- Hero section with MAKCU branding
- Info cards showing:
  - Server members count (from Discord)
  - Supported mice information
  - Full pass-through capabilities
- Discord integration card
- Contribution list
- Background product image

**Components Used**:
- `HomeSidebar` - Navigation sidebar
- `InfoCard` - Feature information cards
- `DiscordCard` - Discord community card

---

### 2. API Documentation (`/[lang]/api`)

**Route**: `app/[lang]/api/page.tsx`

**Features**:
- Complete MAKCU KM Host Protocol v3.9 reference
- Comprehensive keyboard key reference with:
  - Letters (HID 4-29)
  - Numbers & Shift Variants (HID 30-39)
  - Control Keys (HID 40-44)
  - Symbols & Shift Variants (HID 45-57)
  - Function Keys (HID 58-69)
  - System Keys (HID 70-83)
  - Numpad Keys (HID 84-99)
  - Modifier Keys (HID 224-231)
- Organized sections:
  - Transport & Framing
  - Mouse Buttons
  - Mouse Movement
  - Mouse Advanced
  - Mouse Remap
  - Keyboard
  - Streaming
  - Position & Screen
  - System Commands
- Interactive code examples
- Copy-to-clipboard functionality
- Table of contents navigation

**Key Components**:
- `SpecCard` - Specification card component
- `CodeBlock` - Syntax-highlighted code blocks
- `Section` & `SubSection` - Content organization
- `Tip` - Tip callout component

---

### 3. Documentation Pages (`/[lang]/docs/[...slug]`)

**Route**: `app/[lang]/docs/[[...slug]]/page.tsx`

**Features**:
- Dynamic MDX content rendering
- Markdown support with GFM extensions
- Syntax highlighting for code blocks
- Auto-generated table of contents
- Breadcrumb navigation
- Sidebar navigation
- Search functionality
- Copy code button
- Image optimization
- Note callouts
- Step-by-step guides

**Content Structure**:
- Content stored in `contents/docs/[lang]/`
- Supports nested folder structure
- Front matter support for metadata

---

### 4. Firmware Flashing (`/[lang]/firmware`)

**Route**: `app/[lang]/firmware/page.tsx`

**Features**:
- Web Serial API integration
- ESP32-S3 firmware flashing
- Browser compatibility detection
- Flash mode detection
- Firmware file selection
- Progress indicators
- Error handling
- Connection status display

**Requirements**:
- Chrome/Edge 89+ or Opera 76+
- USB 1 or USB 3 connection
- Device in flash mode

---

### 5. Device Settings (`/[lang]/settings`)

**Route**: `app/[lang]/settings/page.tsx`

**Features**:
- MAKCU device configuration
- Web Serial connection
- Real-time device communication
- Settings management
- Connection status monitoring
- Mode detection (Normal/Flash)
- COM port display

**Requirements**:
- Firmware 3.9+
- USB 1 and USB 2 connected
- Device in normal mode

**See**: `SETTINGS.md` for complete specifications

---

### 6. Troubleshooting (`/[lang]/troubleshooting`)

**Route**: `app/[lang]/troubleshooting/page.tsx`

**Features**:
- Device setup instructions
- Connection troubleshooting
- LED status guide
- Common issues and solutions
- Flash mode vs Normal mode explanation
- USB connection requirements

**See**: `DEVICE_LED_STATUS.md` for LED status reference

---

### 7. Setup Guide (`/[lang]/setup`)

**Route**: `app/[lang]/setup/page.tsx`

**Features**:
- Step-by-step setup instructions
- Initial configuration guide
- Device connection walkthrough

---

### 8. Information (`/[lang]/information`)

**Route**: `app/[lang]/information/page.tsx`

**Features**:
- General information about MAKCU
- Product details
- Feature highlights

---

### 9. Discord Integration (`/[lang]/discord`)

**Route**: `app/[lang]/discord/page.tsx`

**Features**:
- Discord community information
- Member count display
- Community links
- Discord bot integration

---

### 10. XIM Integration (`/[lang]/xim`)

**Route**: `app/[lang]/xim/page.tsx`

**Features**:
- XIM device integration guide
- Controller pass-through information
- Setup instructions

---

## Internationalization (i18n)

### Supported Languages

- **English (en)** - Default
- **Chinese Simplified (cn)**

### Implementation

**Locale Detection**:
- Middleware redirects to `/[lang]/` if no locale in path
- Defaults to English if locale not detected
- Locale stored in URL path

**Translation Files**:
- `dictionaries/en.json` - English translations
- `dictionaries/cn.json` - Chinese translations

**Translation Structure**:
```json
{
  "metadata": { "title": "...", "description": "..." },
  "home": { "main_header": "...", "read_guide": "..." },
  "navbar": { "links": { "guide": "...", "api": "..." } },
  "info": { "title": "...", "list": [...] },
  "contributions": { "title": "...", "more": "..." }
}
```

**Usage**:
```tsx
const dict = useDictionary(); // From context
const t = (en: string, cn: string) => (isCn ? cn : en);
```

**Language Switcher**:
- `LangSelect` component in navbar
- Switches between `/en/` and `/cn/` routes
- Maintains current page path

---

## Components Architecture

### Context Providers

#### 1. Dictionary Provider
**File**: `components/contexts/dictionary-provider.tsx`

Provides translation dictionary to all components.

```tsx
const dict = useDictionary();
```

#### 2. Theme Provider
**File**: `components/contexts/theme-provider.tsx`

Manages dark/light theme state using `next-themes`.

```tsx
const { theme, setTheme } = useTheme();
```

#### 3. Audio Provider
**File**: `components/contexts/audio-provider.tsx`

Manages background audio playback state.

#### 4. MAKCU Connection Provider
**File**: `components/contexts/makcu-connection-provider.tsx`

Manages MAKCU device connection state globally.

**Connection States**:
- `Disconnected` - No connection
- `Connecting` - Connection in progress
- `Connected (Normal mode)` - Device ready for commands
- `Connected (Flash mode)` - Device ready for flashing
- `Fault` - Connection error

**Features**:
- Global status across all pages
- Navbar status indicator
- Connection button in navbar
- Mode detection (Normal/Flash)
- COM port display

---

### UI Components (shadcn/ui)

All UI components follow shadcn/ui patterns:

- **Accordion** - Collapsible content
- **Avatar** - User avatars
- **Button** - Button variants
- **Card** - Container cards
- **Dialog** - Modal dialogs
- **Dropdown Menu** - Dropdown menus
- **Input** - Form inputs
- **Label** - Form labels
- **Progress** - Progress bars
- **Radio Group** - Radio buttons
- **Scroll Area** - Custom scrollbars
- **Select** - Select dropdowns
- **Sheet** - Side sheets
- **Skeleton** - Loading skeletons
- **Switch** - Toggle switches
- **Table** - Data tables
- **Tabs** - Tab navigation
- **Toast (Sonner)** - Toast notifications

**Configuration**: `components.json`

---

### Markdown Components

Custom components for MDX rendering:

- **Copy** - Copy code button
- **Image** - Optimized images
- **Link** - Internal/external links
- **Note** - Callout boxes
- **Outlet** - Content wrapper
- **Pre** - Code blocks with syntax highlighting
- **Stepper** - Step-by-step guides

---

## API Routes

### 1. Download API
**Route**: `app/api/download/[filename]/route.ts`

Handles file downloads (firmware files, etc.)

### 2. MAKCU API
**Route**: `app/api/makcu/route.ts`

MAKCU device communication endpoints

**Route**: `app/api/makcu/client/route.ts`

Client-side MAKCU API proxy

### 3. Pages API
**Route**: `app/api/pages/[page]/[section]/route.ts`

Dynamic page content API

**Route**: `app/api/pages/search/route.ts`

Search functionality API

---

## Configuration Files

### 1. Next.js Config (`next.config.ts`)

```typescript
{
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com/**" }
    ]
  },
  eslint: { ignoreDuringBuilds: true }
}
```

### 2. Tailwind Config (`tailwind.config.ts`)

- Custom color scheme
- Font variables
- Animation utilities
- Typography plugin

### 3. TypeScript Config (`tsconfig.json`)

- Path aliases (`@/` → root)
- Strict type checking
- Next.js types

### 4. Middleware (`middleware.ts`)

- Locale detection and redirection
- Pathname locale validation

---

## Development Setup

### Prerequisites

- **Node.js**: 22.x.x
- **pnpm**: Latest version

### Installation

```bash
# Clone repository
git clone https://github.com/MakcuTeam/Website.git
cd Website

# Initialize submodules (if any)
git submodule sync
git submodule update --init --recursive

# Install dependencies
pnpm install
```

### Environment Variables

Create `.env.local`:

```env
# Optional: GitHub token for API rate limits
GITHUB_TOKEN=your_github_token_here
```

### Development Commands

```bash
# Start development server
pnpm dev

# Start with HTTPS (for Web Serial API testing)
pnpm dev-ssl

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Development Server

- **URL**: `http://localhost:3000`
- **HTTPS**: `https://localhost:3000` (with `dev-ssl`)

---

## Build & Deployment

### Build Process

```bash
pnpm build
```

**Output**: `.next/` directory with optimized production build

### Static Export

Next.js generates static pages for:
- All language routes
- Documentation pages
- API documentation

### Deployment Considerations

1. **Web Serial API**: Requires HTTPS in production
2. **Static Assets**: Optimized images and fonts
3. **API Routes**: Server-side routes for dynamic content
4. **Environment Variables**: Set in deployment platform

### Recommended Platforms

- **Vercel** - Optimal for Next.js
- **Netlify** - Good Next.js support
- **Self-hosted** - Node.js server required

---

## Key Features Breakdown

### 1. Search Functionality

**Implementation**: `components/search-bar.tsx`

- Full-text search across documentation
- Search index built from MDX content
- Real-time search results
- Keyboard shortcuts (Ctrl/Cmd + K)

### 2. Theme System

**Implementation**: `next-themes` + custom CSS variables

- Dark mode / Light mode
- System preference detection
- Persistent theme selection
- Smooth transitions

**CSS Variables**:
- `--background`
- `--foreground`
- `--primary`
- `--secondary`
- `--border`
- `--muted`
- etc.

### 3. Responsive Design

- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Collapsible sidebars on mobile
- Touch-friendly interactions

### 4. Code Highlighting

**Implementation**: `rehype-prism-plus`

- Syntax highlighting for code blocks
- Copy-to-clipboard button
- Multiple language support
- Custom theme in `styles/syntax.css`

### 5. Table of Contents

**Implementation**: `components/toc.tsx` + `toc-observer.tsx`

- Auto-generated from headings
- Scroll spy (highlights current section)
- Smooth scroll navigation
- Nested heading support

### 6. Audio Player

**Implementation**: `components/audio-player.tsx`

- Background audio playback
- Toggle button in navbar
- Persistent state
- Volume control

---

## MAKCU Device Integration

### Web Serial API

**Browser Support**:
- Chrome 89+
- Edge 89+
- Opera 76+

**Connection Flow**:
1. User clicks "Connect" button
2. Browser prompts for serial port selection
3. Port opens at 115200 baud
4. Mode detection:
   - Try Normal mode: Send `km.version()\r`
   - If fails, try Flash mode: ESPLoader connection
5. Status update based on response

### Normal Mode

**Detection**: Device responds to `km.version()` with `"km.MAKCU()\r\n>>> "`

**Features**:
- Settings page functionality
- Command execution
- Real-time communication

### Flash Mode

**Detection**: Device responds to ESPLoader protocol

**Features**:
- Firmware flashing
- Settings disabled

### Connection States

- **Disconnected**: No active connection
- **Connecting**: Connection in progress
- **Connected (Normal mode)**: Ready for commands
- **Connected (Flash mode)**: Ready for flashing
- **Fault**: Connection error

### Global Status System

**Implementation**: `makcu-connection-provider.tsx`

- Status shared across all pages
- Navbar indicator
- Connection button in navbar
- COM port display
- Mode-specific UI states

---

## Styling & Theming

### CSS Architecture

1. **Global Styles** (`styles/globals.css`)
   - CSS variables
   - Base styles
   - Theme definitions

2. **Syntax Highlighting** (`styles/syntax.css`)
   - Code block themes
   - Dark/light variants

3. **Tailwind Utilities**
   - Utility classes
   - Custom utilities
   - Responsive variants

### Font System

- **Primary**: Space Grotesk (sans-serif)
- **Monospace**: Space Mono (code)
- **Chinese**: Noto Serif SC
- **Logo**: Road Rage (custom)

### Color Scheme

**Light Mode**:
- Background: White/Light gray
- Foreground: Dark gray/Black
- Primary: Brand colors
- Accent: Highlight colors

**Dark Mode**:
- Background: Dark gray/Black
- Foreground: Light gray/White
- Primary: Brand colors (adjusted)
- Accent: Highlight colors (adjusted)

---

## Content Management

### Documentation Content

**Location**: `contents/docs/[lang]/`

**Structure**:
```
contents/docs/
├── en/
│   └── getting-started/
│       └── introduction/
│           └── index.mdx
└── cn/
    └── getting-started/
        └── introduction/
            └── index.mdx
```

**MDX Features**:
- Front matter support
- React components in markdown
- Syntax highlighting
- Custom components (Note, Stepper, etc.)

### Route Configuration

**File**: `lib/routes-config.ts`

Defines documentation structure and navigation:

```typescript
export const ROUTES: EachRoute[] = [
  {
    title: "getting_started",
    href: "/getting-started",
    noLink: true,
    items: [
      { title: "introduction", href: "/introduction" }
    ]
  }
];
```

### Search Index

**File**: `lib/search-index.ts`

Builds searchable index from MDX content:
- Extracts headings
- Indexes content
- Supports full-text search

---

## Future Enhancements

### Planned Features

1. **Enhanced Settings Page**
   - Real-time configuration
   - Device information display
   - Advanced settings controls

2. **Firmware Management**
   - Version checking
   - Auto-update notifications
   - Firmware changelog

3. **Device Monitoring**
   - Real-time device status
   - Performance metrics
   - Connection quality indicators

4. **Community Features**
   - User contributions
   - Community guides
   - FAQ system

5. **Advanced Search**
   - Filter by category
   - Search history
   - Saved searches

6. **Documentation Improvements**
   - Interactive examples
   - Video tutorials
   - API playground

7. **Multi-device Support**
   - Multiple MAKCU devices
   - Device switching
   - Batch operations

---

## Additional Resources

### Documentation Files

- **README.md** - Basic project information
- **SETTINGS.md** - Settings page specifications
- **DEVICE_LED_STATUS.md** - LED status reference
- **MAKCU_COMMANDS.md** - Command reference

### External Links

- **GitHub Repository**: https://github.com/MakcuTeam/Website
- **Web Serial API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API
- **Next.js Documentation**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Contributing

### Code Style

- TypeScript strict mode
- ESLint configuration
- Prettier formatting (if configured)
- Component-based architecture

### Adding New Pages

1. Create page in `app/[lang]/[page-name]/page.tsx`
2. Add route to navigation in `dictionaries/[lang].json`
3. Add translations for page content
4. Update route config if needed

### Adding Documentation

1. Create MDX file in `contents/docs/[lang]/`
2. Add route to `lib/routes-config.ts`
3. Add translations to dictionary files
4. Test rendering and navigation

### Adding Translations

1. Update `dictionaries/en.json`
2. Update `dictionaries/cn.json`
3. Ensure all keys match
4. Test language switching

---

## Version History

- **v2.0.0** - Current version
  - Complete API documentation
  - MAKCU device integration
  - Multi-language support
  - Modern UI/UX

---

## Support & Contact

For issues, questions, or contributions:

- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Join the MAKCU community
- **Documentation**: Refer to this file and other docs

---

**Last Updated**: 2024
**Maintained by**: MAKCU Team

