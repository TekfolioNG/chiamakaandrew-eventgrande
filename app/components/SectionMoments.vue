<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const w = useWedding()
const m = w.moments
const items = m.items
const waves = [0, 2.4, 0.8, 3.2, 1.2, 2.6, 0.4] // vertical offsets in rem: a gentle wave

const root = ref<HTMLElement>()
const viewport = ref<HTMLElement>()
const track = ref<HTMLElement>()

const reduced = ref(false)
const paused = ref(false)
// three copies make the loop seamless even on very wide screens
const loop = computed(() => (reduced.value ? items : [...items, ...items, ...items]))

useReveal(root)

let x = 0
let speed = 0
let boost = 0
let setWidth = 0
let active = false
let hovering = false
let dragging = false
let startX = 0
let startOffset = 0
let st: ScrollTrigger | undefined

const measure = () => {
    const t = track.value
    const first = t?.children[0] as HTMLElement | undefined
    const next = t?.children[items.length] as HTMLElement | undefined
    if (first && next) setWidth = next.offsetLeft - first.offsetLeft
}
const wrap = () => {
    if (!setWidth) return
    while (x <= -setWidth) x += setWidth
    while (x > 0) x -= setWidth
}
const apply = () => {
    if (track.value) track.value.style.transform = `translate3d(${x}px, 0, 0)`
}

// runs on every animation frame while the section is on screen
const tick = (_time: number, deltaMs: number) => {
    if (!active || !setWidth) return
    const dt = Math.min(deltaMs, 64) / 1000
    boost *= Math.pow(0.92, dt * 60) // the scroll boost fades back to nothing
    const target = paused.value || hovering || dragging ? 0 : m.speed + boost
    speed += (target - speed) * Math.min(1, dt * 5)
    if (!dragging) {
        x -= speed * dt
        wrap()
        apply()
    }
}

// drag with a finger or mouse
const onDown = (e: PointerEvent) => {
    if (reduced.value || (e.pointerType === 'mouse' && e.button !== 0)) return
    dragging = true
    startX = e.clientX
    startOffset = x
    viewport.value?.setPointerCapture(e.pointerId)
}
const onMove = (e: PointerEvent) => {
    if (!dragging) return
    x = startOffset + (e.clientX - startX)
    wrap()
    apply()
}
const onUp = () => { dragging = false }
const onEnter = (e: PointerEvent) => { if (e.pointerType === 'mouse') hovering = true }
const onLeave = () => { hovering = false }

const onResize = () => {
    measure()
    wrap()
    apply()
}

onMounted(async () => {
    gsap.registerPlugin(ScrollTrigger)
    reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    await nextTick()
    if (reduced.value) return

    measure()
    gsap.ticker.add(tick)
    st = ScrollTrigger.create({
        trigger: root.value,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => { active = self.isActive },
        // scrolling makes the strip speed up
        onUpdate: (self) => { boost = Math.min(240, Math.abs(self.getVelocity()) / 16) },
    })
    active = st.isActive
    window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
    gsap.ticker.remove(tick)
    st?.kill()
    window.removeEventListener('resize', onResize)
})
</script>

<template>
    <section id="moments" ref="root" class="moments band-moments" aria-label="Moments">
        <header class="moments__head">
            <p class="moments__eyebrow" data-reveal>{{ m.eyebrow }}</p>
            <h2 class="moments__title" data-reveal="0.1">{{ m.title }}</h2>
        </header>

        <div ref="viewport" class="moments__viewport" :class="{ 'is-static': reduced }" @pointerdown="onDown"
            @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp" @pointerenter="onEnter"
            @pointerleave="onLeave">
            <ul ref="track" class="moments__track">
                <li v-for="(it, i) in loop" :key="`${it.src}-${i}`" class="moment" :class="`moment--${it.kind}`"
                    :style="{ '--dy': `${waves[i % items.length] ?? 0}rem` }" :aria-hidden="i >= items.length">
                    <figure>
                        <div class="moment__frame">
                            <div class="moment__arch">
                                <img :src="it.src" :alt="i < items.length ? it.alt : ''" width="900" height="1200"
                                    loading="lazy" decoding="async" draggable="false"
                                    :style="{ objectPosition: it.focal ?? '50% 20%' }">
                            </div>
                        </div>
                        <figcaption>{{ it.caption }}</figcaption>
                    </figure>
                </li>
            </ul>
        </div>

        <button v-if="!reduced" type="button" class="moments__pause" :aria-pressed="paused"
            aria-label="Pause the movement of the photos" @click="paused = !paused">
            {{ paused ? 'Play' : 'Pause' }}
        </button>
    </section>
</template>

<style scoped>
.moments {
    position: relative;
    display: grid;
    gap: var(--space-4);
    padding: clamp(5rem, 12svh, 8rem) 0 clamp(4rem, 10svh, 7rem);
    overflow: hidden;
    text-align: center;
}

.moments :focus-visible {
    outline: 2px solid var(--gold-soft);
    outline-offset: 4px;
}

.moments__head {
    display: grid;
    justify-items: center;
    gap: var(--space-2);
    padding-inline: var(--space-3);
}

.moments__eyebrow {
    margin: 0;
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.moments__title {
    margin: 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2rem, 1.4rem + 3vw, 3.4rem);
    line-height: 1.2;
    color: var(--cream);
}

/* The strip: soft edges, room above and below for the wave and the hover lift */
.moments__viewport {
    overflow: hidden;
    padding-block: 1.5rem 3rem;
    cursor: grab;
    touch-action: pan-y;
    /* vertical scrolling still works; horizontal drags move the strip */
    -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 10%, #000 90%, transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0, #000 10%, #000 90%, transparent 100%);
}

.moments__viewport:active {
    cursor: grabbing;
}

.moments__track {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: clamp(1rem, 3vw, 2.2rem);
    width: max-content;
    margin: 0;
    padding: 0;
    list-style: none;
    will-change: transform;
}

.moment {
    flex: none;
    width: clamp(11rem, 22vw, 17rem);
    margin-top: var(--dy, 0rem);
    user-select: none;
}

.moment figure {
    margin: 0;
}

.moment__frame {
    position: relative;
}

.moment__frame::before {
    content: '';
    position: absolute;
    inset: -0.45rem;
    border: 1px solid rgb(212 180 131 / 0.3);
    border-radius: var(--arch);
    pointer-events: none;
}

.moment__arch {
    aspect-ratio: 3 / 4;
    overflow: hidden;
    isolation: isolate;
    transform: translateZ(0);
    border: 1px solid rgb(212 180 131 / 0.5);
    border-radius: var(--arch);
    background: var(--night-2);
    box-shadow: 0 20px 50px rgb(0 0 0 / 0.45);
    transition:
        transform var(--dur-base) var(--ease-soft),
        box-shadow var(--dur-base) var(--ease-soft);
}

.moment img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* White-background photos: the white becomes champagne */
.moment--cutout .moment__arch {
    background: linear-gradient(165deg, #f6ead2 0%, #e6cf9f 100%);
}

.moment--cutout img {
    mix-blend-mode: multiply;
}

@media (hover: hover) {
    .moment:hover .moment__arch {
        transform: translateY(-8px);
        box-shadow: 0 28px 60px rgb(0 0 0 / 0.55), 0 0 40px rgb(212 180 131 / 0.2);
    }
}

.moment figcaption {
    margin-top: 1rem;
    font-family: var(--ff-caps);
    font-size: 0.68rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.moments__pause {
    justify-self: center;
    padding: 0.5rem 1.1rem;
    border: 1px solid rgb(212 180 131 / 0.4);
    border-radius: 999px;
    background: none;
    font-family: var(--ff-caps);
    font-size: 0.68rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--gold-soft);
    cursor: pointer;
    transition: background-color var(--dur-quick) var(--ease-soft);
}

.moments__pause:hover {
    background: rgb(212 180 131 / 0.12);
}

/* Reduced motion: a normal row you swipe or scroll yourself */
.moments__viewport.is-static {
    overflow-x: auto;
    cursor: auto;
    scroll-snap-type: x proximity;
    -webkit-mask-image: none;
    mask-image: none;
}

.is-static .moments__track {
    padding-inline: var(--space-3);
}

.is-static .moment {
    scroll-snap-align: center;
}
</style>