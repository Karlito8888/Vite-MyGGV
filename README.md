# Philippine PWA App

A non-professional Progressive Web App (PWA) built for Philippine audience using Vite.js, React, and Supabase.

## Tech Stack

- **Frontend**: Vite.js + React (JSX)
- **Backend**: Supabase (Database + Auth + RLS)
- **Styling**: Standard CSS (no Tailwind)
- **State Management**: Zustand (if needed)
- **PWA**: Vite PWA Plugin
- **Project Management**: Archon MCP Server

## Features

- 🚀 Fast development with Vite
- 📱 Mobile-first responsive design
- 🔐 Protected authentication system
- 🏠 PWA capabilities (installable, offline support)
- 🛡️ Row Level Security (RLS) with Supabase

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Layout.jsx      # Main layout wrapper
│   ├── Header.jsx      # Header component
│   ├── Footer.jsx      # Footer component
│   └── ProtectedRoute.jsx # Route protection wrapper
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── Onboarding.jsx  # Onboarding flow
│   └── Home.jsx        # Protected home page
├── styles/             # CSS files
│   ├── index.css       # Global styles
│   ├── Header.css      # Header styles
│   ├── Footer.css      # Footer styles
│   ├── Login.css       # Login page styles
│   ├── Onboarding.css  # Onboarding styles
│   └── Home.css        # Home page styles
├── utils/              # Utility functions
│   └── AuthContext.jsx # Authentication context
└── main.jsx            # App entry point
```

## Authentication Flow

1. **Login** → User authenticates with social providers (Google, Facebook)
2. **Onboarding** → First-time user experience
3. **Home** → Protected main application area

## Development Guidelines

- No TypeScript - use plain JSX
- No Tailwind CSS - use standard CSS
- Keep it simple and avoid over-engineering
- Mobile-first responsive design
- Follow the existing component patterns

## Deployment

The app is configured as a PWA and can be deployed to any static hosting service.

## License

MIT