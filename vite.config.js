import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Include commonly referenced assets in service worker cache
      // Using root absolute paths for Vite public directory convention
      includeAssets: [
        "/AppImages/ios/16.png", 
        "/AppImages/ios/180.png",
        "src/assets/img/*.png",
        "src/assets/logos/*.png"
      ],
      workbox: {
        runtimeCaching: [
          // Cache des tiles OpenStreetMap
          {
            urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles-osm',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 24 * 60 * 60 // 60 jours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache des tiles satellite
          {
            urlPattern: /^https:\/\/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles-satellite',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 24 * 60 * 60 // 60 jours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache des fonts MapLibre
          {
            urlPattern: /^https:\/\/demotiles\.maplibre\.org\/font\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-fonts',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 an
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources'
            }
          }
        ]
      },
      manifest: {
        name: "MyGGV",
        short_name: "MyGGV",
        description: "Non-professional PWA for Philippine audience",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        // Icons organized by platform (Android, iOS, Windows 11)
        // All paths use root absolute format (/AppImages/...) per Vite public directory convention
        icons: [
          // Android launcher icons
          {
            src: "/AppImages/android/android-launchericon-48-48.png",
            sizes: "48x48",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/AppImages/android/android-launchericon-72-72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/AppImages/android/android-launchericon-96-96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/AppImages/android/android-launchericon-144-144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/AppImages/android/android-launchericon-192-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/AppImages/android/android-launchericon-512-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          // iOS icons (representative sizes)
          {
            src: "/AppImages/ios/180.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/AppImages/ios/192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/AppImages/ios/512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/AppImages/ios/1024.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "any",
          },
          // Windows 11 tiles and logos (key sizes)
          {
            src: "/AppImages/windows11/SmallTile.scale-100.png",
            sizes: "71x71",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/AppImages/windows11/Square150x150Logo.scale-100.png",
            sizes: "150x150",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/AppImages/windows11/Wide310x150Logo.scale-100.png",
            sizes: "310x150",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/AppImages/windows11/LargeTile.scale-100.png",
            sizes: "310x310",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/AppImages/windows11/Square44x44Logo.scale-100.png",
            sizes: "44x44",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/AppImages/windows11/StoreLogo.scale-100.png",
            sizes: "50x50",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['@radix-ui/react-slot'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@heroicons/react'
    ]
  },
  server: {
    port: 5173,
    host: true,
  },
});