<script setup lang="ts">
import { gsap } from 'gsap';

const emit = defineEmits<{ done: [] }>()
const w = useWedding()

const drone = ref<HTMLElement>()
const text = ref<HTMLElement>()

let mm: gsap.MatchMedia | undefined
let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
    mm = gsap.matchMedia()

    // reduced motion: no flight, just a short pause so the message can be read
    mm.add('(prefers-reduced-motion: no-preference)', () => {
        const droneEl = drone.value
        const textEl = text.value
        if (!droneEl || !textEl) {
            emit('done')
            return
        }

        const tl = gsap.timeline({ onComplete: () => emit('done') })
        tl.fromTo(textEl, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.3)
        tl.fromTo(
            droneEl,
            { x: '-70vw', y: 40, rotation: -6 },
            { x: 0, y: 0, rotation: 0, duration: 1.2, ease: 'power3.out' },
            0,
        )
        tl.to(droneEl, { x: '75vw', y: -90, rotation: 10, scale: 0.55, duration: 1.1, ease: 'power2.in' }, 2.0)
        tl.to(textEl, { opacity: 0, duration: 0.5 }, 2.3)
    })
})

onBeforeUnmount(() => {
    mm?.revert()
    clearTimeout(timer)
})
</script>

<template>
    <div class="flight" role="status" aria-live="polite">
        <div ref="drone" class="flight__drone">
            <GateDrone :hot="false" />
        </div>
        <p ref="text" class="flight__text">{{ w.rsvp.copy.delivered }}</p>
    </div>
</template>

<style scoped>
.flight {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: var(--space-3);
    background: var(--night-bg);
    overflow: hidden;
}

.flight__drone {
    width: min(80vw, 20rem);
}

.flight__drone svg {
    display: block;
    width: 100%;
    height: auto;
}

.flight__text {
    margin: 0;
    padding-inline: var(--space-3);
    text-align: center;
    font-family: var(--ff-display);
    font-style: italic;
    font-size: var(--step-2);
    color: var(--cream);
}
</style>