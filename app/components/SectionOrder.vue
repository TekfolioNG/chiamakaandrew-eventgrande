<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const w = useWedding()
const o = w.order
const events = w.timeline // only the entries switched on in the config

const root = ref<HTMLElement>()
const list = ref<HTMLElement>()
useReveal(root)

// "13:00" -> "1:00 PM"
const time12 = (hhmm: string) => {
    const [h = '0', m = '00'] = hhmm.split(':')
    const hr = Number(h)
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

let mm: gsap.MatchMedia | undefined
onMounted(() => {
    gsap.registerPlugin(ScrollTrigger)
    mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = list.value
        if (!el) return

        // the gold line draws itself as you scroll
        const fill = el.querySelector('.line__fill')
        if (fill) {
            gsap.fromTo(
                fill,
                { scaleY: 0 },
                {
                    scaleY: 1,
                    ease: 'none',
                    scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 60%', scrub: true },
                },
            )
        }
        // each marker lights up as you reach it
        el.querySelectorAll<HTMLElement>('.stop').forEach((stop) => {
            ScrollTrigger.create({
                trigger: stop,
                start: 'top 68%',
                onEnter: () => stop.classList.add('is-on'),
                onLeaveBack: () => stop.classList.remove('is-on'),
            })
        })
    })

    // reduced motion: everything simply shown
    mm.add('(prefers-reduced-motion: reduce)', () => {
        list.value?.querySelectorAll('.stop').forEach((s) => s.classList.add('is-on'))
    })
})
onBeforeUnmount(() => mm?.revert())
</script>

<template>
    <section id="order" ref="root" class="order band-order" aria-label="Order of the day">
        <p class="order__eyebrow" data-reveal>{{ o.eyebrow }}</p>
        <h2 class="order__title" data-reveal="0.1">{{ o.title }}</h2>

        <div ref="list" class="timeline">
            <div class="line" aria-hidden="true"><span class="line__fill" /></div>
            <ol class="stops">
                <li v-for="e in events" :key="e.id" class="stop">
                    <span class="stop__node" aria-hidden="true" />
                    <div class="stop__body" data-reveal>
                        <p class="stop__time">{{ time12(e.time) }}</p>
                        <h3 class="stop__title">{{ e.title }}</h3>
                        <p v-if="e.description" class="stop__text">{{ e.description }}</p>
                        <p v-if="e.location" class="stop__where">{{ e.location }}</p>
                    </div>
                </li>
            </ol>
        </div>
    </section>
</template>

<style scoped>
.order {
    display: grid;
    justify-items: center;
    gap: var(--space-4);
    padding: clamp(5rem, 12svh, 8rem) var(--space-3);
    text-align: center;
}

.order__eyebrow {
    margin: 0;
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.order__title {
    margin: 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2rem, 1.4rem + 3vw, 3.4rem);
    line-height: 1.2;
    color: var(--cream);
}

.timeline {
    position: relative;
    width: min(100%, 52rem);
    text-align: left;
}

.line {
    position: absolute;
    top: 0.4rem;
    bottom: 0.4rem;
    left: 0.45rem;
    width: 1px;
    background: rgb(212 180 131 / 0.18);
}

.line__fill {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, var(--gold-soft), var(--gold));
    transform-origin: top;
}

.stops {
    position: relative;
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
}

.stop {
    position: relative;
    padding: 0 0 2.4rem 2.2rem;
}

.stop:last-child {
    padding-bottom: 0;
}

.stop__node {
    position: absolute;
    left: 0;
    top: 0.35rem;
    width: 0.9rem;
    height: 0.9rem;
    border: 1px solid var(--gold);
    background: var(--night-1);
    transform: rotate(45deg);
    transition:
        background-color var(--dur-base) var(--ease-soft),
        box-shadow var(--dur-base) var(--ease-soft);
}

.stop.is-on .stop__node {
    background: var(--gold-soft);
    box-shadow: 0 0 18px rgb(212 180 131 / 0.6);
}

.stop__time {
    margin: 0;
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    letter-spacing: 0.3em;
    color: var(--gold-soft);
}

.stop__title {
    margin: 0.2rem 0 0.3rem;
    font-family: var(--ff-display);
    font-weight: 500;
    font-size: var(--step-2);
    line-height: 1.2;
    color: var(--cream);
}

.stop__text {
    margin: 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-size: var(--step-0);
    color: var(--mist);
}

.stop__where {
    margin: 0.3rem 0 0;
    font-family: var(--ff-caps);
    font-size: 0.7rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgb(240 217 168 / 0.6);
}

/* Wide screens: stops alternate either side of a centre line */
@media (min-width: 48rem) {
    .line {
        left: calc(50% - 0.5px);
    }

    .stop {
        width: calc(50% - 2.5rem);
        padding: 0 0 3rem;
    }

    .stop:nth-child(odd) {
        margin-right: auto;
        text-align: right;
    }

    .stop:nth-child(even) {
        margin-left: auto;
        text-align: left;
    }

    .stop:nth-child(odd) .stop__node {
        left: auto;
        right: -2.95rem;
    }

    .stop:nth-child(even) .stop__node {
        left: -2.95rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .stop__node {
        transition: none;
    }
}
</style>