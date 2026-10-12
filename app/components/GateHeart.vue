<script setup lang="ts">
defineProps<{ hot: boolean; flying?: boolean }>()

const COUNT = 72
const pts = Array.from({ length: COUNT }, (_, i) => {
    const t = (i / COUNT) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    return {
        x: +(50 + 2.9 * x).toFixed(2),
        y: +(46 - 2.9 * y).toFixed(2),
        r: +(0.7 + ((i * 37) % 7) / 10).toFixed(2),
        dur: +(2.4 + ((i * 53) % 9) / 5).toFixed(2),
        del: +(((i * 29) % 17) / 6).toFixed(2),
    }
})
const outline = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ') + ' Z'

// Exposed so the takeoff animation (step 3) can reach the lights
const svg = ref<SVGSVGElement>()
defineExpose({ svg })
</script>

<template>
    <svg ref="svg" class="heart" :class="{ 'is-hot': hot, 'is-flying': flying }" viewBox="0 0 100 100"
        aria-hidden="true">
        <path class="heart__line" :d="outline" />
        <circle v-for="(p, i) in pts" :key="i" class="light" :cx="p.x" :cy="p.y" :r="p.r"
            :style="{ '--dur': `${p.dur}s`, '--del': `-${p.del}s` }" />
    </svg>
</template>

<style scoped>
.heart {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    transform-origin: 50% 50%;
}

.heart.is-hot {
    animation: beat 1.6s ease-in-out infinite;
}

.heart.is-flying {
    animation: none;
}

.heart.is-flying .light {
    animation: none;
}

.heart__line {
    fill: none;
    stroke: var(--heart, var(--gate-particle));
    stroke-width: 0.35;
    opacity: 0.22;
    transition: stroke 700ms var(--ease-soft);
}

.light {
    fill: var(--heart, var(--gate-particle));
    transition: fill 700ms var(--ease-soft);
    animation: twinkle var(--dur) ease-in-out var(--del) infinite;
}

@keyframes twinkle {

    0%,
    100% {
        opacity: 0.3;
    }

    50% {
        opacity: 1;
    }
}

@keyframes beat {

    0%,
    100% {
        transform: scale(1);
    }

    14% {
        transform: scale(1.035);
    }

    28% {
        transform: scale(1);
    }

    42% {
        transform: scale(1.025);
    }
}

@media (prefers-reduced-motion: reduce) {
    .heart.is-hot {
        animation: none;
    }

    .light {
        animation: none;
        opacity: 0.85;
    }
}
</style>