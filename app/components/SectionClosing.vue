<script setup lang="ts">
const w = useWedding()
const cl = w.closing
const ft = w.footer
const root = ref<HTMLElement>()
useReveal(root)

const a = w.couple.partnerA.first
const b = w.couple.partnerB.first

// sharing
const copied = ref(false)
const link = () => `${window.location.origin}/`

const shareWhatsApp = () => {
    const text = `You’re invited to the wedding of ${a} & ${b}. ${link()}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
}
const copyLink = async () => {
    try {
        await navigator.clipboard.writeText(link())
        copied.value = true
        setTimeout(() => { copied.value = false }, 2200)
    } catch {
        window.prompt('Copy this link', link())
    }
}

// footer: the date appears only once the guest has scratched the card
const dateRevealed = useState<boolean>('date-revealed', () => false)
const start = new Date(w.event.startISO)
const year = start.getFullYear()
const longDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: w.event.timezone,
}).format(start)
const place = computed(() => (dateRevealed.value ? [longDate, ...w.reveal.place] : w.reveal.place))
</script>

<template>
    <div ref="root" class="closing band-closing">
        <section class="closing__main" aria-label="Closing">
            <MonogramFoil :src="w.couple.monogram" :alt="`${a} and ${b}`" data-reveal />

            <h2 class="closing__line" data-reveal="0.1">{{ cl.line }}</h2>

            <p class="closing__sign" data-reveal="0.2">
                <span class="closing__with">{{ cl.signoff }}</span>
                <span class="closing__names">{{ a }} &amp; {{ b }}</span>
            </p>

            <div v-if="cl.share" class="closing__share" data-reveal="0.3">
                <button type="button" class="btn btn--gold" @click="shareWhatsApp">{{ cl.whatsapp }}</button>
                <button type="button" class="btn btn--ghost" @click="copyLink">
                    {{ copied ? cl.copied : cl.copy }}
                </button>
            </div>
        </section>

        <footer class="footer">
            <p class="footer__place">
                <template v-for="(p, i) in place" :key="p">
                    <i v-if="i > 0" aria-hidden="true" />
                    <span>{{ p }}</span>
                </template>
            </p>

            <div class="footer__bar">
                <p class="footer__copy">© {{ year }} {{ a }} &amp; {{ b }}. {{ ft.rights }}</p>
                <p class="footer__organizer">
                    {{ ft.organizerLabel }}
                    <a :href="ft.organizer.url" target="_blank" rel="noopener noreferrer">{{ ft.organizer.name }}</a>
                </p>
                <p class="footer__dev">
                    {{ ft.developerLabel }}
                    <a :href="ft.developer.url" target="_blank" rel="noopener noreferrer">{{ ft.developer.name }}</a>
                </p>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.closing {
    display: grid;
    justify-items: center;
}

.closing :focus-visible {
    outline: 2px solid var(--gold-soft);
    outline-offset: 4px;
}

.closing__main {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    padding: clamp(5rem, 12svh, 8rem) var(--space-3) clamp(3rem, 8svh, 5rem);
    text-align: center;
}

.closing__line {
    max-width: 20ch;
    margin: var(--space-2) 0 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-weight: 400;
    font-size: clamp(2rem, 1.4rem + 3.2vw, 3.6rem);
    line-height: 1.2;
    color: var(--cream);
}

.closing__sign {
    display: grid;
    justify-items: center;
    gap: 0.1rem;
    margin: 0;
}

.closing__with {
    font-family: var(--ff-display);
    font-style: italic;
    font-size: var(--step-1);
    color: var(--mist);
}

.closing__names {
    padding: 0.05em 0.12em;
    font-family: var(--ff-script);
    font-size: clamp(2.8rem, 2rem + 4vw, 4.6rem);
    line-height: 1.1;
    background: linear-gradient(160deg, #f6e4b8 0%, var(--gold-soft) 50%, var(--gold) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.closing__share {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.8rem;
    margin-top: var(--space-2);
}

.footer {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    width: min(100%, 64rem);
    padding: 0 var(--space-3) var(--space-3);
    text-align: center;
}

.footer__place {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.9rem;
    margin: 0;
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    letter-spacing: 0.34em;
    text-transform: uppercase;
    color: rgb(212 180 131 / 0.75);
}

.footer__place i {
    width: 0.4rem;
    height: 0.4rem;
    background: rgb(212 180 131 / 0.75);
    transform: rotate(45deg);
}

.footer__bar {
    display: grid;
    gap: 0.7rem;
    width: 100%;
    padding-top: var(--space-3);
    border-top: 1px solid rgb(212 180 131 / 0.16);
    font-size: 0.9rem;
    line-height: 1.6;
    letter-spacing: 0.04em;
    color: rgb(207 200 184 / 0.6);
}

.footer__bar p {
    margin: 0;
}

@media (min-width: 48rem) {
    .footer__bar {
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
    }

    .footer__copy {
        text-align: left;
    }

    .footer__dev {
        text-align: right;
    }
}

.footer a {
    color: rgb(212 180 131 / 0.88);
    text-decoration: none;
    border-bottom: 1px solid rgb(212 180 131 / 0.3);
    transition: color var(--dur-quick) var(--ease-soft), border-color var(--dur-quick) var(--ease-soft);
}

.footer a:hover {
    color: var(--cream);
    border-color: var(--cream);
}
</style>