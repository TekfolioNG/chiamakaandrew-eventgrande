<script setup lang="ts">
defineProps<{ src: string; alt: string }>()
</script>

<template>
    <div class="foil" :style="{ '--mono': `url('${src}')` }">
        <img class="foil__base" :src="src" :alt="alt" loading="lazy" decoding="async">
        <span class="foil__gold" aria-hidden="true" />
        <span class="foil__shine" aria-hidden="true" />
    </div>
</template>

<style scoped>
.foil {
    position: relative;
    width: clamp(8rem, 30vw, 11rem);
}

.foil__base {
    display: block;
    width: 100%;
    height: auto;
    filter: brightness(0.45) saturate(0.85) drop-shadow(0 0 14px rgb(212 180 131 / 0.18));
}

/* the gold and the light are cut to the monogram's own shape */
.foil__gold,
.foil__shine {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    -webkit-mask-image: var(--mono);
    mask-image: var(--mono);
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
}

.foil__gold {
    opacity: 0.92;
}

.foil__gold::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 200%;
    height: 200%;
    background: linear-gradient(135deg,
            #8f6c35 0%, #d4b483 14%, #f6e4b8 26%, #b88a4a 40%,
            #e9cf9b 54%, #9a7439 68%, #f1dcab 82%, #8f6c35 100%);
    animation: drift 6s ease-in-out infinite alternate;
}

@keyframes drift {
    to {
        transform: translate(-45%, -45%);
    }
}

.foil__shine::before {
    content: '';
    position: absolute;
    top: -10%;
    bottom: -10%;
    left: 0;
    width: 45%;
    background: linear-gradient(100deg,
            transparent 0%, rgb(255 246 220 / 0) 20%,
            rgb(255 248 228 / 0.95) 50%,
            rgb(255 246 220 / 0) 80%, transparent 100%);
    transform: translateX(-130%) skewX(-18deg);
    animation: shine 4.2s ease-in-out 1s infinite;
}

@keyframes shine {
    0% {
        transform: translateX(-130%) skewX(-18deg);
    }

    50%,
    100% {
        transform: translateX(330%) skewX(-18deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .foil__gold::before {
        animation: none;
    }

    .foil__shine {
        display: none;
    }
}
</style>