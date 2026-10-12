<script setup lang="ts">
const w = useWedding()
const inv = w.invitation
const root = ref<HTMLElement>()
useReveal(root)

// "Chiamaka Angela Ihekauche" -> "Angela Ihekauche"
const rest = (p: { first: string; full: string }) => p.full.slice(p.first.length).trim()
</script>

<template>
    <section id="invitation" ref="root" class="invite" aria-label="Invitation">
        <span class="invite__line" aria-hidden="true" />
        <GoldSprig class="invite__sprig invite__sprig--l" />
        <GoldSprig class="invite__sprig invite__sprig--r" />

        <div class="invite__inner">
            <p class="invite__families" data-reveal>{{ w.families.line }}</p>
            <p class="invite__cordially" data-reveal="0.1">{{ inv.inviteLine }}</p>
            <p class="invite__small" data-reveal="0.15">{{ inv.toThe }}</p>
            <h2 class="invite__title" data-reveal="0.2">{{ inv.title }}</h2>
            <p class="invite__small" data-reveal="0.25">{{ inv.ofTheir }}</p>

            <div class="invite__names" data-reveal="0.3">
                <div class="name">
                    <span class="name__first">{{ w.couple.partnerA.first }}</span>
                    <span class="name__rest">{{ rest(w.couple.partnerA) }}</span>
                </div>
                <i class="name__amp">&amp;</i>
                <div class="name">
                    <span class="name__first">{{ w.couple.partnerB.first }}</span>
                    <span class="name__rest">{{ rest(w.couple.partnerB) }}</span>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.invite {
    --arch-h: clamp(4.5rem, 12svh, 9rem);
    position: relative;
    z-index: 3;
    display: grid;
    place-items: center;
    min-height: 100svh;
    margin-top: calc(var(--arch-h) * -0.85);
    /* rises over the bottom of the hero */
    padding: calc(var(--arch-h) + 3.5rem) var(--space-3) clamp(4rem, 12svh, 8rem);
    overflow: hidden;
    border-radius: 50% 50% 0 0 / var(--arch-h) var(--arch-h) 0 0;
    background:
        radial-gradient(ellipse at 15% 0%, #fffdf8 0%, transparent 55%),
        var(--ivory);
    color: var(--ink);
    text-align: center;
    box-shadow: 0 -18px 60px rgb(0 0 0 / 0.35);
}

/* The thin gold line that follows the arch, like the one on the invitation card */
.invite__line {
    position: absolute;
    top: 0.9rem;
    left: 0.9rem;
    right: 0.9rem;
    height: calc(var(--arch-h) + 5rem);
    border: 1px solid rgb(184 138 74 / 0.75);
    border-bottom: 0;
    border-radius: 50% 50% 0 0 / var(--arch-h) var(--arch-h) 0 0;
    pointer-events: none;
    -webkit-mask-image: linear-gradient(#000 55%, transparent);
    mask-image: linear-gradient(#000 55%, transparent);
}

.invite__sprig {
    position: absolute;
    width: clamp(3.5rem, 9vw, 7rem);
    opacity: 0.5;
    pointer-events: none;
}

.invite__sprig--l {
    left: clamp(0.5rem, 4vw, 4rem);
    bottom: 8%;
    transform: scaleX(-1) rotate(-6deg);
}

.invite__sprig--r {
    right: clamp(0.5rem, 4vw, 4rem);
    bottom: 5%;
    transform: rotate(8deg);
}

.invite__inner {
    position: relative;
    display: grid;
    justify-items: center;
    gap: 0.4rem;
    max-width: 44rem;
}

.invite__families {
    max-width: 30rem;
    margin: 0 0 var(--space-3);
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    line-height: 1.8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink);
}

.invite__cordially {
    margin: 0 0 var(--space-2);
    font-family: var(--ff-caps);
    font-size: var(--step-1);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink);
}

.invite__small {
    margin: 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-size: var(--step-1);
    color: var(--ink);
}

.invite__title {
    margin: 0.05em 0;
    font-family: var(--ff-display);
    font-weight: 500;
    font-size: clamp(3.6rem, 2rem + 10vw, 8.5rem);
    line-height: 1;
    letter-spacing: -0.01em;
    color: var(--bronze);
}

.invite__names {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    margin-top: var(--space-3);
}

.name {
    display: grid;
    justify-items: center;
    gap: 0.1rem;
}

.name__first {
    padding: 0.05em 0.1em;
    font-family: var(--ff-script);
    font-size: clamp(3rem, 2rem + 5vw, 5.2rem);
    line-height: 1.05;
    color: var(--bronze);
}

.name__rest {
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--bronze);
}

.name__amp {
    font-family: var(--ff-display);
    font-size: var(--step-2);
    font-style: italic;
    color: var(--gold);
}

@media (min-width: 48rem) {
    .invite__names {
        flex-direction: row;
        gap: 1.6rem;
    }

    .name__amp {
        align-self: flex-start;
        margin-top: 1.4rem;
    }
}
</style>