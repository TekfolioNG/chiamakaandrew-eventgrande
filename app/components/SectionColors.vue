<script setup lang="ts">
const w = useWedding()
const c = w.colorDay
const swatches = w.colorsOfTheDay
const root = ref<HTMLElement>()
useReveal(root)

const open = ref<string | null>(null)
const toggle = (id: string) => { open.value = open.value === id ? null : id }

// dark text on light swatches, light text on dark ones
const isLight = (hex: string) => {
    const n = parseInt(hex.replace('#', ''), 16)
    const r = (n >> 16) & 255
    const g = (n >> 8) & 255
    const b = n & 255
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62
}
</script>

<template>
    <section id="colors" ref="root" class="colors band-colors" aria-label="Color of the Day">
        <p class="colors__eyebrow" data-reveal>{{ c.eyebrow }}</p>
        <h2 class="colors__title" data-reveal="0.1">{{ c.title }}</h2>

        <ul class="swatches" data-reveal="0.2">
            <li v-for="s in swatches" :key="s.id" class="swatch-wrap">
                <button type="button" class="swatch" :class="{ 'is-open': open === s.id, 'is-light': isLight(s.hex) }"
                    :style="{ '--c': s.hex }" :aria-pressed="open === s.id" :aria-label="`${s.name}: ${s.hint}`"
                    @click="toggle(s.id)">
                    <span class="swatch__inner">
                        <span class="swatch__face swatch__front">
                            <span class="swatch__name">{{ s.name }}</span>
                        </span>
                        <span class="swatch__face swatch__back">
                            <span class="swatch__hint">{{ s.hint }}</span>
                        </span>
                    </span>
                </button>
            </li>
        </ul>

        <p class="colors__hint" data-reveal="0.3">{{ c.hint }}</p>
    </section>
</template>

<style scoped>
.colors {
    display: grid;
    justify-items: center;
    gap: var(--space-4);
    padding: clamp(5rem, 12svh, 8rem) var(--space-3);
    text-align: center;
}

.colors :focus-visible {
    outline: 2px solid var(--gold-soft);
    outline-offset: 4px;
    border-radius: 0.9rem;
}

.colors__eyebrow {
    margin: 0;
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.colors__title {
    margin: 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2rem, 1.4rem + 3vw, 3.4rem);
    line-height: 1.2;
    color: var(--cream);
}

.colors__hint {
    margin: 0;
    font-family: var(--ff-display);
    font-style: italic;
    color: var(--mist);
}

.swatches {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(0.8rem, 2.5vw, 1.4rem);
    width: min(100%, 54rem);
    margin: 0;
    padding: 0;
    list-style: none;
}

@media (min-width: 40rem) {
    .swatches {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

.swatch-wrap {
    perspective: 900px;
    transition: translate var(--dur-base) var(--ease-soft);
}

@media (hover: hover) {
    .swatch-wrap:hover {
        translate: 0 -6px;
    }
}

.swatch {
    display: block;
    width: 100%;
    aspect-ratio: 3 / 4;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
}

.swatch__inner {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 800ms var(--ease-settle);
}

.swatch.is-open .swatch__inner {
    transform: rotateY(180deg);
}

.swatch__face {
    position: absolute;
    inset: 0;
    display: grid;
    overflow: hidden;
    border-radius: 0.9rem;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}

/* Front: the colour, with a woven texture and a soft sheen */
.swatch__front {
    place-items: end center;
    padding: 1.3rem 0.8rem;
    background: var(--c);
    box-shadow: 0 18px 40px rgb(0 0 0 / 0.45);
}

.swatch__front::before,
.swatch__front::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.swatch__front::before {
    background:
        repeating-linear-gradient(90deg, rgb(255 255 255 / 0.06) 0 1px, transparent 1px 4px),
        repeating-linear-gradient(0deg, rgb(0 0 0 / 0.05) 0 1px, transparent 1px 4px);
}

.swatch__front::after {
    background: linear-gradient(155deg, rgb(255 255 255 / 0.28) 0%, transparent 38%, rgb(0 0 0 / 0.18) 100%);
}

.swatch__name {
    position: relative;
    font-family: var(--ff-caps);
    font-size: 0.78rem;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: #fff6e6;
}

.swatch.is-light .swatch__name {
    color: #2a1d10;
}

/* Back: how to wear it */
.swatch__back {
    place-items: center;
    padding: 1.4rem 1rem 1rem;
    transform: rotateY(180deg);
    border: 1px solid var(--c);
    border-top-width: 0.5rem;
    background: linear-gradient(180deg, var(--night-2), var(--night-1));
}

.swatch__hint {
    font-family: var(--ff-display);
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--cream);
}

@media (prefers-reduced-motion: reduce) {

    .swatch__inner,
    .swatch-wrap {
        transition: none;
    }
}
</style>