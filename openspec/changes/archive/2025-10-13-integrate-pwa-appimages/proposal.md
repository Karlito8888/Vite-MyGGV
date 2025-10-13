## Why

The project has a complete set of PWA icons in `public/AppImages/` (113 files covering Android, iOS, and Windows 11 platforms) but they are not properly integrated into the PWA manifest. Currently, the `vite.config.js` only references two generic icons (`pwa-192x192.png` and `pwa-512x512.png`) that don't exist in the project. This prevents the PWA from displaying proper app icons across different platforms and devices.

## What Changes

- Update `vite.config.js` PWA manifest to reference the actual AppImages icons following Vite's public directory conventions
- Configure platform-specific icons (Android, iOS, Windows 11) in the PWA manifest
- Update `includeAssets` to reference relevant favicon and touch icons from AppImages
- Ensure all icon paths follow Vite's public asset referencing pattern (root absolute paths starting with `/`)
- Organize icons by purpose (any, maskable, monochrome) according to Web App Manifest specification

## Impact

- **Affected specs**: `pwa-configuration` (new capability)
- **Affected code**: 
  - `vite.config.js` - PWA plugin configuration
  - No changes to `public/AppImages/` directory structure (assets already exist)
- **User benefit**: Proper PWA icon display across all platforms (Android, iOS, Windows 11)
- **Technical benefit**: Compliance with Vite public directory conventions and Web App Manifest standards
