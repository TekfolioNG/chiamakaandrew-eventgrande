<script setup lang="ts">
import { gsap } from 'gsap';
import { defineEmits, } from 'vue';

const emit = defineEmits<{ open: []; done: [] }>()
const w = useWedding()
const copy = w.gate.copy
const music = useMusic()

const gateEl = ref<HTMLElement>()
const droneRef = ref<{ $el: SVGSVGElement; lift?: SVGGElement }>()
const heartRef = ref<{ svg?: SVGSVGElement }>()

const hot = ref(false)
const flying = ref(false)
const busy = ref(false)

const onEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') hot.value = true
}
const onLeave = () => {
    if (!busy.value) hot.value = false
}

let mm: gsap.MatchMedia | undefined

const takeoff = () => {
    const root = gateEl.value
    const lift = droneRef.value?.lift
    const droneEl = droneRef.value?.$el
    const heartSvg = heartRef.value?.svg

    mm = gsap.matchMedia()

    // Reduced motion: no flight, just a quick fade
    mm.add('(prefers-reduced-motion: reduce)', () => {
        emit('open')
        gsap.to(root!, { opacity: 0, duration: 0.5, onComplete: () => emit('done') })
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (!root || !lift || !droneEl || !heartSvg) {
            emit('open')
            emit('done')
            return
        }

        // The drone lives in SVG units, so convert screen pixels into those units
        const u = (px: number) => px * (240 / droneEl.getBoundingClientRect().width)
        const lights = heartSvg.querySelectorAll('.light')
        const line = heartSvg.querySelector('.heart__line')
        const words = root.querySelectorAll('.gate__headline, .gate__names, .gate__cta, .gate__silent')

        const tl = gsap.timeline({ onComplete: () => emit('done') })

        // words fade away
        tl.to(words, { opacity: 0, y: 8, duration: 0.5, ease: 'power1.out' }, 0)

        // the heart's lights burst upward like lanterns
        if (line) tl.to(line, { opacity: 0, duration: 0.8 }, 0)
        tl.fromTo(
            lights,
            { opacity: 1 },
            {
                opacity: 0,
                x: () => gsap.utils.random(-22, 22),
                y: () => -gsap.utils.random(50, 150),
                duration: 1.6,
                ease: 'power1.out',
                stagger: { amount: 0.7, from: 'center' },
            },
            0.1,
        )

        // the drone dips back, then sweeps up and away in an arc
        tl.to(lift, { y: 6, rotation: -5, svgOrigin: '120 100', duration: 0.3, ease: 'power1.out' }, 0.1)
        tl.to(lift, { x: u(window.innerWidth * 0.8), duration: 1.7, ease: 'power2.in' }, 0.4)
        tl.to(lift, { y: -u(window.innerHeight * 0.85), duration: 1.7, ease: 'power2.out' }, 0.4)
        tl.to(lift, { rotation: 16, scale: 0.4, duration: 1.7, ease: 'power1.inOut' }, 0.4)

        // the page appears underneath, then the gate dissolves
        tl.call(() => emit('open'), [], 1.2)
        tl.to(root, { opacity: 0, duration: 0.9, ease: 'power1.inOut' }, 1.5)
    })
}

const go = async (sound: boolean) => {
    if (busy.value) return
    busy.value = true
    // Must stay first: browsers only allow sound inside the tap itself
    if (sound) music.start()
    hot.value = true
    flying.value = true
    await nextTick()
    takeoff()
}

onBeforeUnmount(() => mm?.revert())
</script>

<template>
    <section ref="gateEl" class="gate" :class="{ 'is-hot': hot, 'is-flying': flying }">
        <button type="button" class="gate__open" :aria-label="copy.cta" :disabled="busy" @pointerenter="onEnter"
            @pointerleave="onLeave" @focus="hot = true" @blur="onLeave" @click="go(true)">
            <span class="gate__stage">
                <span class="gate__glow gate__glow--gold" aria-hidden="true" />
                <span class="gate__glow gate__glow--rose" aria-hidden="true" />
                <GateDrone ref="droneRef" class="gate__drone" :hot="hot" />
                <span class="gate__heart">
                    <GateHeart ref="heartRef" :hot="hot" :flying="flying" />
                </span>
            </span>

            <span class="gate__headline">{{ copy.headline }}</span>
            <span class="gate__names">{{ w.couple.partnerA.first }} &amp; {{ w.couple.partnerB.first }}</span>
            <span class="gate__cta">{{ copy.cta }}</span>
        </button>

        <button type="button" class="gate__silent" :disabled="busy" @click="go(false)">
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
    /* the gate never scrolls: everything scales with screen height */
    padding:
        max(0.9rem, env(safe-area-inset-top)) var(--space-3) max(0.4rem, env(safe-area-inset-bottom));
    background: var(--night-bg);
    color: var(--gate-particle);
    /* "backwards" (not "both"): otherwise the animation would keep overriding the exit fade */
    animation: gate-in 1200ms var(--ease-soft) backwards;
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

.gate__open:disabled,
.gate__silent:disabled {
    cursor: default;
}

.gate__stage {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
    width: min(100%, 17rem, 28svh);
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

/* Once the takeoff starts, stop the looping animations so the exit fades can take over */
.gate.is-flying .gate__cta,
.gate.is-flying .gate__glow--gold {
    animation: none;
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