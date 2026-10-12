<script setup lang="ts">
const w = useWedding()
const { parts, after } = useCountdown(w.event.startISO)

const label = computed(() => (after.value ? w.reveal.marriedLabel : w.reveal.countdownLabel))
const items = computed(() => [
    ['Days', parts.value.days],
    ['Hours', parts.value.hours],
    ['Minutes', parts.value.minutes],
    ['Seconds', parts.value.seconds],
] as const)
const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
    <div class="count">
        <p class="count__label">{{ label }}</p>
        <div class="tiles" role="timer" aria-live="off">
            <div v-for="[name, value] in items" :key="name" class="tile">
                <span class="tile__box">{{ pad(value) }}</span>
                <span class="tile__label">{{ name }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.count {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
}

.count__label {
    margin: 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-size: var(--step-1);
    color: var(--cream);
}

.tiles {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 5.2rem));
    justify-content: center;
    gap: clamp(0.5rem, 2vw, 1rem);
}

.tile {
    display: grid;
    justify-items: center;
    gap: 0.6rem;
}

.tile__box {
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: 3 / 4;
    border: 1px solid rgb(212 180 131 / 0.45);
    border-radius: var(--arch);
    background: linear-gradient(180deg, var(--night-2), var(--night-1));
    font-family: var(--ff-display);
    font-size: clamp(1.7rem, 1.2rem + 2.4vw, 2.6rem);
    font-variant-numeric: tabular-nums;
    color: var(--cream);
}

.tile__label {
    font-family: var(--ff-caps);
    font-size: 0.68rem;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--gold-soft);
}
</style>