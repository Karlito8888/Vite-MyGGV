## 1. Configuration Updates

- [x] 1.1 Update `vite.config.js` PWA manifest icons array with Android icons (6 sizes)
- [x] 1.2 Add iOS icons to PWA manifest (representative sizes: 180x180, 192x192, 512x512, 1024x1024)
- [x] 1.3 Add Windows 11 icons to PWA manifest (key sizes for tiles and logos)
- [x] 1.4 Update `includeAssets` array with actual favicon and apple-touch-icon paths from AppImages
- [x] 1.5 Add icon `purpose` field where appropriate (any, maskable)
- [x] 1.6 Ensure all icon paths use root absolute path format (starting with `/AppImages/`)

## 2. Verification

- [x] 2.1 Run development server and verify icons load correctly from `/AppImages/` paths
- [x] 2.2 Build production bundle and verify icon paths resolve correctly
- [x] 2.3 Test PWA manifest in browser DevTools (Application > Manifest)
- [x] 2.4 Verify service worker includes specified assets in cache
- [x] 2.5 Check that no 404 errors occur for referenced icon files

## 3. Documentation

- [x] 3.1 Add comment in `vite.config.js` explaining icon organization by platform
- [x] 3.2 Document the icon path convention (root absolute paths for public directory)
