import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

const base = process.env.PODHOD_BASE || '/'
export default defineConfig({
  base,
  plugins: [
    react(), tailwind(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: {
        id: base, name: 'Подход — дневник тренировок', short_name: 'Подход', lang: 'ru',
        description: 'План тренировок, дневник, прогресс и питание.',
        start_url: base, scope: base, display: 'standalone',
        background_color: '#f5f5ef', theme_color: '#f5f5ef',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp,webmanifest}'],
        navigateFallback: 'index.html', cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
