<script setup lang="ts">
const w = useWedding()
const f = w.faq
const root = ref<HTMLElement>()
useReveal(root)

// one answer open at a time
const open = ref<number | null>(0)
const toggle = (i: number) => { open.value = open.value === i ? null : i }
</script>

<template>
    <section id="faq" ref="root" class="faq band-faq" aria-label="Good to know">
        <p class="faq__eyebrow" data-reveal>{{ f.eyebrow }}</p>
        <h2 class="faq__title" data-reveal="0.1">{{ f.title }}</h2>

        <ul class="faq__list" data-reveal="0.2">
            <li v-for="(item, i) in f.items" :key="item.q" class="qa" :class="{ 'is-open': open === i }">
                <h3 class="qa__q">
                    <button :id="`faq-q-${i}`" type="button" class="qa__btn" :aria-expanded="open === i"
                        :aria-controls="`faq-a-${i}`" @click="toggle(i)">
                        <span>{{ item.q }}</span>
                        <i class="qa__icon" aria-hidden="true" />
                    </button>
                </h3>
                <div :id="`faq-a-${i}`" class="qa__panel" role="region" :aria-labelledby="`faq-q-${i}`">
                    <div class="qa__inner">
                        <p>{{ item.a }}</p>
                    </div>
                </div>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.faq {
    display: grid;
    justify-items: center;
    gap: var(--space-4);
    padding: clamp(5rem, 12svh, 8rem) var(--space-3);
    text-align: center;
}

.faq :focus-visible {
    outline: 2px solid var(--gold-soft);
    outline-offset: 3px;
}

.faq__eyebrow {
    margin: 0;
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.faq__title {
    margin: 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2rem, 1.4rem + 3vw, 3.4rem);
    line-height: 1.2;
    color: var(--cream);
}

.faq__list {
    display: grid;
    gap: 0.8rem;
    width: min(100%, 44rem);
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: left;
}

.qa {
    border: 1px solid rgb(212 180 131 / 0.25);
    border-radius: 0.9rem;
    background: linear-gradient(180deg, var(--night-2), var(--night-1));
    transition: border-color var(--dur-base) var(--ease-soft);
}

.qa.is-open {
    border-color: rgb(212 180 131 / 0.55);
}

.qa__q {
    margin: 0;
}

.qa__btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
    padding: 1.15rem 1.3rem;
    border: 0;
    background: none;
    font-family: var(--ff-display);
    font-weight: 500;
    font-size: var(--step-1);
    line-height: 1.3;
    text-align: left;
    color: var(--cream);
    cursor: pointer;
}

/* a plus that turns into a minus */
.qa__icon {
    position: relative;
    flex: none;
    width: 0.9rem;
    height: 0.9rem;
}

.qa__icon::before,
.qa__icon::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background: var(--gold-soft);
    transition: transform var(--dur-base) var(--ease-soft);
}

.qa__icon::after {
    transform: rotate(90deg);
}

.qa.is-open .qa__icon::after {
    transform: rotate(0deg);
}

/* the answer slides open (grid rows animate from 0 to 1 fraction) */
.qa__panel {
    display: grid;
    grid-template-rows: 0fr;
    visibility: hidden;
    transition: grid-template-rows 500ms var(--ease-soft), visibility 0s linear 500ms;
}

.qa.is-open .qa__panel {
    grid-template-rows: 1fr;
    visibility: visible;
    transition-delay: 0s;
}

.qa__inner {
    overflow: hidden;
}

.qa__inner p {
    margin: 0;
    padding: 0 1.3rem 1.3rem;
    font-size: var(--step-0);
    line-height: 1.7;
    color: var(--mist);
}

@media (prefers-reduced-motion: reduce) {

    .qa__panel,
    .qa__icon::before,
    .qa__icon::after {
        transition: none;
    }
}
</style>