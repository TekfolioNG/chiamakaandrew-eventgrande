<script setup lang="ts">
const w = useWedding()
const t = w.rsvp.thanks
const { downloadIcs } = useCalendar()

const result = useState<{ attending: boolean; name: string } | null>('rsvp-result', () => null)
const attending = computed(() => result.value?.attending ?? true)
const first = computed(() => result.value?.name.split(' ')[0] ?? '')

const root = ref<HTMLElement>()
useReveal(root)

useSeoMeta({ title: 'Thank you', robots: 'noindex, nofollow' })
</script>

<template>
    <main ref="root" class="thanks">
        <div class="thanks__drone" data-reveal="0.2">
            <GateDrone :hot="false" />
        </div>

        <p class="thanks__eyebrow" data-reveal="0.5">{{ first ? `${t.eyebrow}, ${first}` : t.eyebrow }}</p>
        <h1 class="thanks__title" data-reveal="0.7">{{ attending ? t.yesTitle : t.noTitle }}</h1>
        <p class="thanks__text" data-reveal="0.9">{{ attending ? t.yesText : t.noText }}</p>

        <div class="thanks__actions" data-reveal="1.1">
            <button v-if="attending" type="button" class="btn btn--gold" @click="downloadIcs">{{ t.calendar }}</button>
            <NuxtLink class="btn btn--ghost" to="/">{{ t.back }}</NuxtLink>
        </div>

        <MusicToggle />
    </main>
</template>

<style scoped>
.thanks {
    display: grid;
    place-content: center;
    justify-items: center;
    gap: var(--space-3);
    min-height: 100svh;
    padding: var(--space-5) var(--space-3);
    background: var(--night-bg);
    color: var(--gate-particle);
    text-align: center;
}

.thanks :focus-visible {
    outline: 2px solid var(--gold-soft);
    outline-offset: 4px;
}

.thanks__drone {
    width: min(70vw, 15rem);
}

.thanks__drone svg {
    display: block;
    width: 100%;
    height: auto;
}

.thanks__eyebrow {
    margin: 0;
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.thanks__title {
    max-width: 22ch;
    margin: 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2rem, 1.4rem + 3.2vw, 3.6rem);
    line-height: 1.2;
    color: var(--cream);
}

.thanks__text {
    max-width: 28rem;
    margin: 0;
    font-size: var(--step-0);
    color: var(--mist);
}

.thanks__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.8rem;
    margin-top: var(--space-2);
}
</style>