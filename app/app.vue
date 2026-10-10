<script setup lang="ts">
const w = useWedding()

useSeoMeta({
  title: w.share.title,
  description: w.share.description,
  ogTitle: w.share.title,
  ogDescription: w.share.description,
  ogImage: w.share.ogImage,
  twitterCard: 'summary_large_image',
})
useHead({
  htmlAttrs: { lang: 'en' },
  meta: [{ name: 'theme-color', content: '#06070a' }],
})
</script>

<template>
  <NuxtPage />
</template>