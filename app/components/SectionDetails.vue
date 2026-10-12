<script setup lang="ts">
const w = useWedding()
const d = w.details
const v = w.event.venue
const root = ref<HTMLElement>()
useReveal(root)
const { downloadIcs } = useCalendar()

// Uses the client's exact map pin when supplied, otherwise searches the address
const mapsHref = computed(
    () =>
        v.mapsUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([v.name, ...v.addressLines].join(', '))}`,
)
</script>

<template>
    <section id="details" ref="root" class="details band-details" aria-label="Venue">
        <p class="details__eyebrow" data-reveal>{{ d.eyebrow }}</p>

        <div class="venue" data-reveal="0.1">
            <svg class="venue__pin" viewBox="0 0 24 24" aria-hidden="true">
                <path
                    d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>

            <p class="venue__lead">{{ d.lead }}</p>
            <h2 class="venue__name">{{ v.name }}</h2>
            <p class="venue__address">
                <span v-for="line in v.addressLines" :key="line">{{ line }}</span>
            </p>

            <GoldRule class="venue__rule" />
            <p v-if="w.event.arrivalNote" class="venue__time">{{ w.event.arrivalNote }}</p>

            <div class="venue__actions">
                <a class="btn btn--gold" :href="mapsHref" target="_blank" rel="noopener">{{ d.mapsButton }}</a>
                <button type="button" class="btn btn--ghost" @click="downloadIcs">{{ d.calendarButton }}</button>
            </div>
        </div>
    </section>
</template>

<style scoped>
.details {
    display: grid;
    justify-items: center;
    gap: var(--space-4);
    padding: clamp(5rem, 12svh, 8rem) var(--space-3);
    text-align: center;
}

.details :focus-visible {
    outline: 2px solid var(--gold-soft);
    outline-offset: 4px;
}

.details__eyebrow {
    margin: 0;
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

/* An arch-topped card with a double gold outline */
.venue {
    position: relative;
    display: grid;
    justify-items: center;
    gap: 0.7rem;
    width: min(100%, 34rem);
    padding: 6rem clamp(1.5rem, 6vw, 3.5rem) 3rem;
    border: 1px solid rgb(212 180 131 / 0.5);
    border-radius: 50% 50% 1rem 1rem / 7rem 7rem 1rem 1rem;
    background: radial-gradient(ellipse at 50% 0%, var(--night-2), var(--night-1) 75%);
    box-shadow: 0 30px 80px rgb(0 0 0 / 0.5), 0 0 60px rgb(212 180 131 / 0.08);
}

.venue::before {
    content: '';
    position: absolute;
    inset: 0.55rem;
    border: 1px solid rgb(212 180 131 / 0.22);
    border-radius: inherit;
    pointer-events: none;
}

.venue__pin {
    position: absolute;
    top: 2.2rem;
    width: 1.7rem;
    height: 1.7rem;
    fill: var(--gold);
}

.venue__lead {
    margin: 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-size: var(--step-1);
    color: var(--mist);
}

.venue__name {
    margin: 0.1rem 0;
    font-family: var(--ff-display);
    font-weight: 500;
    font-size: clamp(1.9rem, 1.3rem + 2.6vw, 3rem);
    line-height: 1.15;
    color: var(--cream);
}

.venue__address {
    display: grid;
    gap: 0.15rem;
    margin: 0;
    font-size: var(--step-0);
    color: var(--mist);
}

.venue__rule {
    margin: 0.6rem 0;
}

.venue__time {
    margin: 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-size: var(--step-2);
    color: var(--gold-soft);
}

.venue__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.8rem;
    margin-top: var(--space-2);
}
</style>