<script setup lang="ts">
const w = useWedding()
const site = useRuntimeConfig().public.siteUrl as string

// WhatsApp needs full web addresses for the preview image
const absolute = (path: string) => new URL(path, site || 'http://localhost:3000').href

useSeoMeta({
  title: w.share.title,
  description: w.share.description,
  ogTitle: w.share.title,
  ogDescription: w.share.description,
  ogImage: absolute(w.share.ogImage),
  ogType: 'website',
  twitterCard: 'summary_large_image',
  robots: 'noindex, nofollow',
})
useHead({
  htmlAttrs: { lang: 'en' },
  meta: [{ name: 'theme-color', content: '#06070a' }],
})
</script>

<template>
  <NuxtPage />
</template>