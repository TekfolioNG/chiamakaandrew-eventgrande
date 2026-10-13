import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // Crucial for Nuxt 3/4 to lock features and silence terminal warnings
  compatibilityDate: '2024-04-03',

  devtools: { enabled: true },

  // Your global stylesheet entrypoint
  css: ['@fontsource/great-vibes/400.css', '~/assets/css/main.css'],

  // The correct way to pass the Tailwind v4 plugin into Nuxt's environment
  vite: {
    plugins: [
      tailwindcss()
    ]
  },

  // The standard array where your manually installed modules are declared
  modules: [
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@nuxtjs/turnstile',
    '@vueuse/nuxt'
  ],

  // Perfect custom configuration structure for the Google Fonts API
  fonts: {
    families: [
      { name: 'Bodoni Moda', provider: 'google', weights: [400, 500], styles: ['normal', 'italic'] },
      { name: 'Cormorant Garamond', provider: 'google', weights: [400, 500, 600], styles: ['normal', 'italic'] },
      { name: 'Marcellus', provider: 'google', weights: [400] },
    ],
  },

  // Clean Hybrid Rendering Setup: Perfect for a wedding application
  routeRules: {
    '/': { prerender: true },      // Landers/Home are completely static HTML files
    '/i/**': { ssr: true },        // Dynamic invitations rendered instantly on the server
    '/admin/**': { ssr: false },   // Private dashboards load as a client-side Single Page App (SPA)
  },
  nitro: {
    // RSVPs: a local folder in development, a Cloudflare KV namespace (bound as RSVP) once deployed
    storage: { rsvp: { driver: 'cloudflare-kv-binding', binding: 'RSVP' } },
    devStorage: { rsvp: { driver: 'fs', base: './.data/rsvp' } },
  },
  runtimeConfig: { turnstile: { secretKey: '' } },
})
