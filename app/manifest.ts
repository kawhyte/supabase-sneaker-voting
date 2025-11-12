import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PurrView - Wardrobe Watchlist',
    short_name: 'PurrView',
    description: 'Track your wardrobe items and add items to a watchlist and get notified when prices drop',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#FFC700', // Sun yellow - primary brand color
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any'
      }
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'View your wardrobe collection',
        url: '/dashboard',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192'
          }
        ]
      },
      {
        name: 'Add Item',
        short_name: 'Add',
        description: 'Add a new wardrobe item',
        url: '/add-new-item',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192'
          }
        ]
      }
    ],
    categories: ['lifestyle', 'shopping'],
    lang: 'en-US'
  }
}
