# Project Context

## Purpose
Non-professional PWA project for Philippine audience with simple CRUD functionality and protected routing system.

## Tech Stack
- Vite.js
- React with JSX (NO TypeScript)
- Supabase (with SDK and RLS)
- CSS (NO Tailwind)
- Vite PWA plugin
- Zustand (only if necessary for state management)

## Project Conventions

### Code Style
- Keep it simple - no over-engineering
- React with JSX (NO TypeScript)
- Standard CSS styling
- Minimal dependencies
- Mobile-first responsive design

### Architecture Patterns
- Simple CRUD using Supabase SDK
- Respect Supabase RLS policies
- Protected route system: Login → Onboarding → Home (protected)
- Fixed layout: Header, Main (Outlet), Footer
- Only Main content changes with navigation

### Testing Strategy
- NO tests required for this non-professional project

### Git Workflow
- Simple linear workflow
- Clear, descriptive commit messages

## Domain Context
- PWA for Philippine users
- Content in English
- Mobile-first design
- Simple authentication flow
- Basic CRUD operations

## Important Constraints
- NO TypeScript under any circumstances
- NO Tailwind CSS
- No complex tech stack
- No over-engineering
- Non-professional project - keep it simple
- Must use Vite.js optimization tools intelligently

## External Dependencies
- Supabase (database, auth, RLS)
- Vite PWA plugin for PWA functionality
