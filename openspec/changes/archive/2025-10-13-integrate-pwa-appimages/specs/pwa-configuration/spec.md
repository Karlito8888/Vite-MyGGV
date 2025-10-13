## ADDED Requirements

### Requirement: PWA Manifest Icon Configuration

The PWA configuration SHALL reference all available AppImages icons using Vite's public directory conventions with root absolute paths.

#### Scenario: Android icons properly configured
- **WHEN** the PWA is installed on an Android device
- **THEN** the manifest SHALL include Android launcher icons from `/AppImages/android/` directory
- **AND** icons SHALL be available in sizes: 48x48, 72x72, 96x96, 144x144, 192x192, 512x512

#### Scenario: iOS icons properly configured
- **WHEN** the PWA is accessed on an iOS device
- **THEN** the manifest SHALL include iOS icons from `/AppImages/ios/` directory
- **AND** icons SHALL cover all required iOS sizes from 16x16 to 1024x1024

#### Scenario: Windows 11 icons properly configured
- **WHEN** the PWA is installed on Windows 11
- **THEN** the manifest SHALL include Windows 11 tile and logo icons from `/AppImages/windows11/` directory
- **AND** icons SHALL include SmallTile, Square150x150Logo, Wide310x150Logo, LargeTile, Square44x44Logo, and StoreLogo variants

### Requirement: Public Asset Path Convention

All PWA icon references SHALL follow Vite's public directory conventions.

#### Scenario: Icons referenced with root absolute paths
- **WHEN** configuring icon paths in the PWA manifest
- **THEN** all paths SHALL start with `/` (e.g., `/AppImages/android/android-launchericon-192-192.png`)
- **AND** paths SHALL NOT include the `public/` prefix
- **AND** paths SHALL be served from the root path `/` during development and production

### Requirement: Icon Purpose Specification

Icons SHALL be categorized by their purpose according to Web App Manifest specification.

#### Scenario: Primary icons marked as any purpose
- **WHEN** defining standard app icons
- **THEN** icons SHALL have purpose set to `any` or omitted (defaults to `any`)
- **AND** these icons SHALL be used for general app representation

#### Scenario: Maskable icons for adaptive display
- **WHEN** platform supports maskable icons (Android adaptive icons)
- **THEN** appropriate icons SHALL be marked with purpose `maskable`
- **AND** these icons SHALL allow safe zone cropping by the platform

### Requirement: Include Assets Configuration

The VitePWA plugin SHALL include commonly referenced assets in the service worker cache.

#### Scenario: Favicon and touch icons included
- **WHEN** configuring the PWA plugin
- **THEN** `includeAssets` SHALL reference at minimum one favicon and one apple-touch-icon
- **AND** these assets SHALL exist in the `public/AppImages/` directory structure
- **AND** paths SHALL use root absolute path convention
