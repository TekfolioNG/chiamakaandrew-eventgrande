<script setup lang="ts">
defineProps<{ progress: number }>()

const w = useWedding()
const initials = `${w.couple.partnerA.first.charAt(0)} & ${w.couple.partnerB.first.charAt(0)}`

// If the monogram file is missing or fails, fall back to plain initials
const imgEl = ref<HTMLImageElement>()
const missing = ref(false)

// One line at a time, looping back to the first after the last
const current = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
    const el = imgEl.value
    if (el?.complete && el.naturalWidth === 0) missing.value = true

    timer = setInterval(() => {
        current.value = (current.value + 1) % w.loader.lines.length
    }, w.loader.lineMs)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
    <div class="loader" role="status" aria-live="polite">
        <div class="loader__glow" aria-hidden="true" />

        <div class="mono" :style="{ '--p': progress, '--mono': `url('${w.couple.monogram}')` }">
            <template v-if="!missing">
                <img ref="imgEl" class="mono__base" :src="w.couple.monogram"
                    :alt="`${w.couple.partnerA.first} and ${w.couple.partnerB.first}`" decoding="async"
                    fetchpriority="high" @error="missing = true">
                <div class="mono__foil" aria-hidden="true" />
                <div class="mono__shine" aria-hidden="true" />

            </template>
            <span v-else class="mono__fallback" aria-hidden="true">{{ initials }}</span>
        </div>

        <div class="loader__text">
            <p :key="current" class="loader__line" :style="{ animationDuration: `${w.loader.lineMs}ms` }">
                {{ w.loader.lines[current] }}
            </p>
        </div>
    </div>
</template>

<style scoped>
.loader {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: var(--space-4);
    min-height: 100svh;
    background:
        radial-gradient(ellipse at 50% 38%, var(--gate-sky-glow) 0%, transparent 60%),
        linear-gradient(180deg, var(--night-top) 0%, var(--gate-sky) 100%);
    color: var(--gate-particle);
}

.loader__glow {
    position: absolute;
    inset: 0;
    margin: auto;
    width: min(70vw, 28rem);
    height: min(70vw, 28rem);
    border-radius: 50%;
    background: radial-gradient(circle, rgb(212 180 131 / 0.14), transparent 65%);
    pointer-events: none;
    animation: breathe 4.5s var(--ease-soft) infinite;
}

@keyframes breathe {

    0%,
    100% {
        opacity: 0.5;
        transform: scale(0.94);
    }

    50% {
        opacity: 1;
        transform: scale(1.04);
    }
}

/* ---------- Monogram: dark base + foil + shine + glints ---------- */
.mono {
    position: relative;
    width: clamp(8.5rem, 34vw, 12rem);
}

.mono__base {
    display: block;
    width: 100%;
    height: auto;
    filter: brightness(0.32) saturate(0.8) drop-shadow(0 0 14px rgb(212 180 131 / 0.18));
}

/* Foil and shine are cut to the monogram's own shape */
.mono__foil,
.mono__shine {
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

/* The gold comes alive as loading progresses */
.mono__foil {
    opacity: var(--p);
}

.mono__foil::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 200%;
    height: 200%;
    background: linear-gradient(135deg,
            #8f6c35 0%, #d4b483 14%, #f6e4b8 26%, #b88a4a 40%,
            #e9cf9b 54%, #9a7439 68%, #f1dcab 82%, #8f6c35 100%);
    animation: foil-drift 6s ease-in-out infinite alternate;
}

@keyframes foil-drift {
    to {
        transform: translate(-45%, -45%);
    }
}

/* A soft band of light gliding across */
.mono__shine::before {
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
    animation: shine 2.8s ease-in-out 0.6s infinite;
}

@keyframes shine {
    0% {
        transform: translateX(-130%) skewX(-18deg);
    }

    55%,
    100% {
        transform: translateX(330%) skewX(-18deg);
    }
}



.mono__fallback {
    display: block;
    font-family: ui-serif, Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 3rem;
    text-align: center;
    color: var(--gold-soft);
}

/* ---------- Text ---------- */
.loader__text {
    position: relative;
    display: grid;
    place-items: start center;
    min-height: 3em;
    max-width: 22rem;
    padding-inline: var(--space-3);
    text-align: center;
}

.loader__line {
    margin: 0;
    font-family: ui-serif, Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: clamp(0.8rem, 0.76rem + 0.2vw, 0.9rem);
    letter-spacing: 0.02em;
    line-height: 1.55;
    color: rgb(240 217 168 / 0.82);
    animation: line-cycle 1800ms var(--ease-soft) both;
}

@keyframes line-cycle {
    0% {
        opacity: 0;
        transform: translateY(8px);
    }

    25% {
        opacity: 1;
        transform: translateY(0);
    }

    75% {
        opacity: 1;
        transform: translateY(0);
    }

    100% {
        opacity: 0;
        transform: translateY(-4px);
    }
}

@media (prefers-reduced-motion: reduce) {
    .loader__glow {
        animation: none;
    }

    .mono__foil::before {
        animation: none;
    }

    .mono__shine {
        display: none;
    }

    .loader__line {
        animation: none;
        opacity: 1;
    }
}
</style>