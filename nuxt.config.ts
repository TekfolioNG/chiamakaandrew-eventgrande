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
    '/': { prerender: true },
    '/i/**': { ssr: true },
    '/admin': { ssr: false },
    '/admin/**': { ssr: false },
  },
  runtimeConfig: {
    turnstile: { secretKey: '' },
    access: { teamDomain: '', aud: '' },
    public: { siteUrl: '' },
  },

  nitro: {
    cloudflare: {
      deployConfig: true, // Nitro writes the Workers deploy file for us
      nodeCompat: true,
      wrangler: {
        name: 'chiamakaandrew-eventgrande', // exactly the Worker's name in your dashboard
        kv_namespaces: [{ binding: 'RSVP', id: 'e1101592d13e4361a1157ad0fe1e6218' }],
      },
    },
    storage: { rsvp: { driver: 'cloudflare-kv-binding', binding: 'RSVP' } },
    devStorage: { rsvp: { driver: 'fs', base: './.data/rsvp' } },
  },
})
