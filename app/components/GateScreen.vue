<script setup lang="ts">
const emit = defineEmits<{ open: [opts: { sound: boolean }] }>()
const w = useWedding()
const copy = w.gate.copy

const hot = ref(false)
const onEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') hot.value = true
}
const onLeave = () => { hot.value = false }

// Step 3 replaces this with the takeoff animation and the music
const open = (sound: boolean) => emit('open', { sound })
</script>

<template>
    <section class="gate" :class="{ 'is-hot': hot }">

        <button type="button" class="gate__open" :aria-label="copy.cta" @pointerenter="onEnter" @pointerleave="onLeave"
            @focus="hot = true" @blur="hot = false" @click="open(true)">
            <span class="gate__stage">
                <span class="gate__glow gate__glow--gold" aria-hidden="true" />
                <span class="gate__glow gate__glow--rose" aria-hidden="true" />
                <GateDrone class="gate__drone" :hot="hot" />
                <span class="gate__heart">
                    <GateHeart :hot="hot" />
                </span>
            </span>

            <span class="gate__headline">{{ copy.headline }}</span>
            <span class="gate__names">{{ w.couple.partnerA.first }} &amp; {{ w.couple.partnerB.first }}</span>
            <span class="gate__cta">{{ copy.cta }}</span>
        </button>

        <button type="button" class="gate__silent" @click="open(false)">
            {{ copy.silent }}
        </button>
    </section>
</template>

<style scoped>
.gate {
    --heart: var(--gate-particle);
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    grid-template-rows: 1fr auto;
    justify-items: center;
    overflow: hidden;
    /* the gate never scrolls: everything below scales with screen height */
    padding:
        max(0.9rem, env(safe-area-inset-top)) var(--space-3) max(0.4rem, env(safe-area-inset-bottom));
    background: var(--night-bg);
    color: var(--gate-particle);
    animation: gate-in 1200ms var(--ease-soft) both;
}

.gate.is-hot {
    --heart: var(--rose);
}

@keyframes gate-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.gate :focus-visible {
    outline: 2px solid var(--gold-soft);
    outline-offset: 6px;
}


/* The one big button */
.gate__open {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(0.3rem, 1.4svh, 0.9rem);
    width: 100%;
    max-width: 24rem;
    padding: 0 0 5svh;
    /* lifts the whole group slightly */
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: center;
    cursor: pointer;
}

.gate__stage {
    position: relative;
    display: grid;
    justify-items: center;
    width: min(100%, 17rem, 28svh);
    grid-template-columns: minmax(0, 1fr);
    /* the heart's width follows screen height */
}

.gate__drone {
    display: block;
    width: min(86vw, 19rem, 38svh);
    max-width: none;
    aspect-ratio: 240 / 150;
    margin-bottom: -1svh;
}

.gate__heart {
    display: block;
    width: 100%;
}

/* Two glows that cross-fade: gold at rest, rose on hover */
.gate__glow {
    position: absolute;
    top: 72%;
    left: 50%;
    width: 22rem;
    height: 22rem;
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition: opacity 700ms var(--ease-soft);
}

.gate__glow--gold {
    background: radial-gradient(circle, rgb(212 180 131 / 0.15), transparent 65%);
    animation: breathe 4.5s var(--ease-soft) infinite;
}

.gate__glow--rose {
    background: radial-gradient(circle, rgb(224 90 115 / 0.22), transparent 65%);
    opacity: 0;
}

.gate.is-hot .gate__glow--gold {
    opacity: 0;
}

.gate.is-hot .gate__glow--rose {
    opacity: 1;
}

@keyframes breathe {

    0%,
    100% {
        scale: 0.94;
    }

    50% {
        scale: 1.04;
    }
}

.gate__headline {
    font-family: var(--ff-display);
    font-style: italic;
    font-size: min(var(--step-1), 3.4svh);
    line-height: 1.25;
    color: rgb(240 217 168 / 0.92);
}

.gate__names {
    padding: 0.1em 0.12em;
    font-family: var(--ff-script);
    font-size: min(var(--step-3), 8.5svh);
    line-height: 1.15;
    background: linear-gradient(160deg, #f6e4b8 0%, var(--gold-soft) 50%, var(--gold) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.gate__cta {
    margin-top: clamp(0.2rem, 1svh, 0.8rem);
    font-family: var(--ff-caps);
    font-size: min(var(--step--1), 2.4svh);
    letter-spacing: 0.34em;
    text-transform: uppercase;
    color: var(--gold-soft);
    animation: cta-pulse 3.2s ease-in-out infinite;
}

@keyframes cta-pulse {

    0%,
    100% {
        opacity: 0.6;
    }

    50% {
        opacity: 1;
    }
}

.gate__silent {
    padding: 0.6rem 1rem;
    border: 0;
    background: none;
    font-family: var(--ff-caps);
    font-size: 0.7rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgb(240 217 168 / 0.45);
    cursor: pointer;
    transition: color var(--dur-quick) var(--ease-soft);
}

.gate__silent:hover {
    color: rgb(240 217 168 / 0.8);
}

@media (prefers-reduced-motion: reduce) {

    .gate__glow--gold,
    .gate__cta {
        animation: none;
    }
}
</style>