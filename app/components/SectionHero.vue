<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const w = useWedding()
const hero = w.hero
const root = ref<HTMLElement>()
useReveal(root)

// As you scroll, the photo sinks into the dark and the words drift away
let mm: gsap.MatchMedia | undefined
onMounted(() => {
    gsap.registerPlugin(ScrollTrigger)
    mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
        const shade = root.value?.querySelector('.hero__shade')
        const content = root.value?.querySelector('.hero__content')
        if (!shade || !content) return

        gsap.to(shade, {
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom 55%', scrub: true },
        })
        gsap.to(content, {
            yPercent: -14,
            opacity: 0,
            ease: 'none',
            scrollTrigger: { trigger: root.value, start: 'top top', end: '55% top', scrub: true },
        })
    })
})
onBeforeUnmount(() => mm?.revert())
</script>

<template>
    <section ref="root" class="hero" aria-label="Welcome">
        <div class="hero__photo">
            <img :src="hero.bg" :alt="hero.alt" width="1200" height="1600" fetchpriority="high" decoding="async">
        </div>
        <div class="hero__shade" aria-hidden="true" />
        <span class="hero__thread" aria-hidden="true"><i /></span>

        <div class="hero__content">
            <i class="corner corner--tl" aria-hidden="true" />
            <i class="corner corner--tr" aria-hidden="true" />
            <i class="corner corner--bl" aria-hidden="true" />
            <i class="corner corner--br" aria-hidden="true" />
            <p class="hero__eyebrow" data-reveal="0.6">{{ hero.eyebrow }}</p>
            <h1 class="hero__names" data-reveal="0.9">
                <span>{{ w.couple.partnerA.first }}</span>
                <span><i>&amp;</i> {{ w.couple.partnerB.first }}</span>
            </h1>
            <a class="btn btn--gold hero__cta" data-reveal="1.2" href="#rsvp">{{ hero.cta }}</a>
        </div>
    </section>
</template>

<style scoped>
.hero {
    position: relative;
    isolation: isolate;
    display: grid;
    align-items: end;
    justify-items: center;
    min-height: 100svh;
    overflow: hidden;
    padding: 0 var(--space-3) clamp(3rem, 9svh, 6rem);
    background: var(--night-bg);
    color: var(--gate-particle);
}

.hero :focus-visible {
    outline: 2px solid var(--gold-soft);
    outline-offset: 4px;
}

/* the hero melts into the matte black of the next section, with no visible edge */
.hero::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    height: 30%;
    background: linear-gradient(180deg, transparent, var(--night-0));
    pointer-events: none;
}

/* The photo fills the whole hero, on every screen size, slightly darkened */
.hero__photo {
    position: absolute;
    inset: 0;
    z-index: 0;
    animation: photo-in 2.2s var(--ease-soft) 0.2s both;
}

.hero__photo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 24%;
    /* raise or lower this number to move the photo up or down */
    filter: brightness(0.86) contrast(1.06) saturate(1.05);
}

.hero__photo::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
            rgb(6 7 10 / 0.5) 0%,
            rgb(6 7 10 / 0.22) 30%,
            rgb(6 7 10 / 0.62) 64%,
            var(--night-0) 100%);
}

@keyframes photo-in {
    from {
        opacity: 0;
        scale: 1.06;
    }

    to {
        opacity: 1;
        scale: 1;
    }
}

/* Deepens as you scroll (driven by GSAP) */
.hero__shade {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: var(--night-0);
    opacity: 0;
    pointer-events: none;
}

.hero__content {
    position: relative;
    z-index: 2;
    display: grid;
    justify-items: center;
    gap: clamp(0.7rem, 2svh, 1.2rem);
    max-width: 28rem;
    padding: clamp(1.4rem, 3svh, 2.2rem) clamp(1.6rem, 5vw, 3.4rem);
    text-align: center;
}

.hero__eyebrow {
    margin: 0;
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    line-height: 1.8;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.hero__names {
    margin: 0;
    padding: 0.1em 0.12em;
    font-family: var(--ff-script);
    font-weight: 400;
    font-size: clamp(3rem, 2rem + 6vw, 6.4rem);
    line-height: 1.08;
    background: linear-gradient(160deg, #f6e4b8 0%, var(--gold-soft) 50%, var(--gold) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 2px 18px rgb(0 0 0 / 0.55));
}

.hero__names span {
    display: block;
}

.hero__names i {
    margin-right: 0.15em;
    font-size: 0.6em;
    font-style: normal;
}

.hero__cta {
    margin-top: 0.3rem;
    padding: 0.8rem 1.6rem;
}

/* Wide screens: same layout as the phone, with the names on one line */
@media (min-width: 62rem) {
    .hero {
        min-height: min(max(100svh, 52vw), 135svh);
        padding-inline: clamp(2rem, 8vw, 8rem);
    }

    .hero__content {
        max-width: 48rem;
    }

    .hero__eyebrow {
        max-width: none;
    }

    .hero__names {
        font-size: clamp(3.4rem, 1.5rem + 4vw, 6rem);
    }

    .hero__names span {
        display: inline;
    }

    .hero__names span+span {
        margin-left: 0.25em;
    }
}

/* Fine gold lines: corner brackets around the names, and a thread hanging from the top */
.corner {
    position: absolute;
    width: 1.6rem;
    height: 1.6rem;
    border: 0 solid rgb(212 180 131 / 0.65);
    animation: corner-in 1.2s var(--ease-settle) 1.6s both;
}

.corner--tl {
    top: 0;
    left: 0;
    border-top-width: 1px;
    border-left-width: 1px;
    transform-origin: top left;
}

.corner--tr {
    top: 0;
    right: 0;
    border-top-width: 1px;
    border-right-width: 1px;
    transform-origin: top right;
}

.corner--bl {
    bottom: 0;
    left: 0;
    border-bottom-width: 1px;
    border-left-width: 1px;
    transform-origin: bottom left;
}

.corner--br {
    bottom: 0;
    right: 0;
    border-bottom-width: 1px;
    border-right-width: 1px;
    transform-origin: bottom right;
}

@keyframes corner-in {
    from {
        opacity: 0;
        scale: 0.5;
    }

    to {
        opacity: 1;
        scale: 1;
    }
}

.hero__thread {
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 2;
    width: 1px;
    height: clamp(2.8rem, 8svh, 5rem);
    background: linear-gradient(180deg, transparent, rgb(212 180 131 / 0.8));
    transform-origin: top;
    animation: thread-in 1.6s var(--ease-settle) 1.4s both;
    pointer-events: none;
}

.hero__thread i {
    position: absolute;
    left: 50%;
    bottom: -0.3rem;
    width: 0.5rem;
    height: 0.5rem;
    background: var(--gold);
    transform: translateX(-50%) rotate(45deg);
}

@keyframes thread-in {
    from {
        opacity: 0;
        scale: 1 0;
    }

    to {
        opacity: 1;
        scale: 1 1;
    }
}

@media (prefers-reduced-motion: reduce) {

    .corner,
    .hero__thread {
        animation: none;
    }
}
</style>