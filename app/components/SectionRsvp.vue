<script setup lang="ts">
import { rsvpSchema } from '#shared/schemas/rsvp'
import { normalizePhone } from '#shared/utils/phone'

const w = useWedding()
const cfg = w.rsvp
const c = cfg.copy

const root = ref<HTMLElement>()
useReveal(root)

// Evaluated in the browser, after the page opens
const closed = ref(false)
onMounted(() => { closed.value = Date.now() > new Date(cfg.deadlineISO).getTime() })

const form = reactive({
    name: '',
    attending: null as boolean | null,
    phone: '',
    guests: 1,
    email: '',
    message: '',
    website: '', // honeypot: stays empty for real people
})
const errors = reactive<Record<string, string>>({})
const token = ref('')
const turnstile = ref<{ reset: () => void } | null>(null)
const sending = ref(false)
const serverError = ref('')
const flying = ref(false)

// handed to the thank-you page
const result = useState<{ attending: boolean; name: string } | null>('rsvp-result', () => null)

const guestOptions = Array.from({ length: cfg.maxGuestsPerInvite }, (_, i) => i + 1)

const validate = () => {
    for (const k of Object.keys(errors)) delete errors[k]

    if (form.attending === null) errors.attending = c.errors.attending

    const parsed = rsvpSchema.safeParse({
        name: form.name,
        attending: form.attending ?? false,
        phone: form.phone,
        guests: form.attending ? form.guests : 0,
        email: form.email,
        message: form.message,
    })
    if (!parsed.success) {
        for (const issue of parsed.error.issues) {
            const key = String(issue.path[0] ?? '')
            if (key && !errors[key]) errors[key] = issue.message
        }
    }

    if (!errors.phone && !normalizePhone(form.phone, cfg.defaultCountry)) errors.phone = c.errors.phone
    if (!token.value) errors.token = c.errors.token

    return Object.keys(errors).length === 0
}

// Go to the thank-you page once. RsvpFlight calls this when its animation ends,
// and a timer calls it too, so a stuck animation can never leave the guest stranded.
let fallback: ReturnType<typeof setTimeout> | undefined
let navigated = false
const finish = () => {
    if (navigated) return
    navigated = true
    clearTimeout(fallback)
    return navigateTo('/thank-you')
}
onBeforeUnmount(() => clearTimeout(fallback))

const submit = async () => {
    if (sending.value || flying.value) return // ignore double clicks
    serverError.value = ''

    if (!validate()) {
        await nextTick()
        root.value
            ?.querySelector<HTMLElement>('.has-error input, .has-error select, .has-error textarea, .has-error button')
            ?.focus()
        return
    }

    sending.value = true
    try {
        await $fetch('/api/rsvp', {
            method: 'POST',
            body: {
                name: form.name,
                attending: form.attending,
                phone: form.phone,
                guests: form.attending ? form.guests : 0,
                email: form.email,
                message: form.message,
                token: token.value,
                website: form.website,
            },
        })
        result.value = { attending: form.attending === true, name: form.name.trim() }
        flying.value = true // starts RsvpFlight, which emits "done" and calls finish()
        fallback = setTimeout(finish, 5000)
    } catch (e) {
        const err = e as { statusCode?: number; statusMessage?: string; data?: { statusMessage?: string } }
        const message = err.data?.statusMessage ?? err.statusMessage
        serverError.value =
            err.statusCode === 403
                ? c.errors.closed
                : err.statusCode === 400 && message
                    ? message
                    : c.errors.generic
    } finally {
        sending.value = false
        // A Turnstile token works only once, so get a fresh one after every attempt
        turnstile.value?.reset()
        token.value = ''
    }
}
</script>

<template>
    <section id="rsvp" ref="root" class="rsvp band-rsvp" aria-label="RSVP">
        <div class="rsvp__card" data-reveal>
            <p class="rsvp__eyebrow">{{ c.eyebrow }}</p>
            <h2 class="rsvp__title">{{ c.title }}</h2>

            <p v-if="closed" class="rsvp__closed">{{ c.closed }}</p>

            <form v-else class="form" novalidate @submit.prevent="submit">
                <!-- honeypot -->
                <div class="form__trap" aria-hidden="true">
                    <label>Website <input v-model="form.website" type="text" tabindex="-1" autocomplete="off"></label>
                </div>

                <div class="field" :class="{ 'has-error': errors.name }">
                    <label for="rsvp-name">{{ c.name }}</label>
                    <input id="rsvp-name" v-model="form.name" type="text" autocomplete="name"
                        :aria-invalid="!!errors.name" aria-describedby="rsvp-name-err">
                    <p v-if="errors.name" id="rsvp-name-err" class="field__error">{{ errors.name }}</p>
                </div>

                <fieldset class="choice" :class="{ 'has-error': errors.attending }">
                    <legend>{{ c.attendLabel }}</legend>
                    <div class="choice__row">
                        <button type="button" class="choice__btn" :class="{ 'is-on': form.attending === true }"
                            :aria-pressed="form.attending === true" @click="form.attending = true">
                            {{ c.yes }}
                        </button>
                        <button type="button" class="choice__btn" :class="{ 'is-on': form.attending === false }"
                            :aria-pressed="form.attending === false" @click="form.attending = false">
                            {{ c.no }}
                        </button>
                    </div>
                    <p v-if="errors.attending" class="field__error">{{ errors.attending }}</p>
                </fieldset>

                <div class="field" :class="{ 'has-error': errors.phone }">
                    <label for="rsvp-phone">{{ c.phone }}</label>
                    <input id="rsvp-phone" v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel"
                        :aria-invalid="!!errors.phone" aria-describedby="rsvp-phone-hint">
                    <p id="rsvp-phone-hint" class="field__hint">{{ errors.phone || c.phoneHint }}</p>
                </div>

                <div v-if="form.attending" class="field">
                    <label for="rsvp-guests">{{ c.guests }}</label>
                    <select id="rsvp-guests" v-model.number="form.guests">
                        <option v-for="n in guestOptions" :key="n" :value="n">{{ n }}</option>
                    </select>
                </div>

                <div v-if="cfg.askEmail" class="field" :class="{ 'has-error': errors.email }">
                    <label for="rsvp-email">{{ c.email }}</label>
                    <input id="rsvp-email" v-model="form.email" type="email" inputmode="email" autocomplete="email"
                        maxlength="120" :aria-invalid="!!errors.email" aria-describedby="rsvp-email-hint">
                    <p id="rsvp-email-hint" class="field__hint">{{ errors.email || cfg.emailPurpose }}</p>
                </div>

                <div class="field" :class="{ 'has-error': errors.message }">
                    <label for="rsvp-message">{{ c.message }}</label>
                    <textarea id="rsvp-message" v-model="form.message" rows="3" maxlength="500" />
                    <p v-if="errors.message" class="field__error">{{ errors.message }}</p>
                </div>

                <div class="form__check">
                    <NuxtTurnstile ref="turnstile" v-model="token" :options="{ theme: 'dark' }" />
                    <p v-if="errors.token" class="field__error">{{ errors.token }}</p>
                </div>

                <p v-if="serverError" class="form__error" role="alert">{{ serverError }}</p>

                <button type="submit" class="btn btn--gold form__send" :disabled="sending || flying">
                    {{ sending ? c.sending : c.send }}
                </button>
            </form>
        </div>

        <RsvpFlight v-if="flying" @done="finish" />
    </section>
</template>

<style scoped>
.rsvp {
    display: grid;
    justify-items: center;
    padding: clamp(5rem, 12svh, 8rem) var(--space-3);
}

.rsvp :focus-visible {
    outline: 2px solid var(--gold-soft);
    outline-offset: 3px;
}

.rsvp__card {
    position: relative;
    width: min(100%, 36rem);
    padding: clamp(2rem, 6vw, 3.2rem) clamp(1.4rem, 6vw, 3rem) clamp(2rem, 5vw, 2.8rem);
    overflow: hidden;
    border: 1px solid rgb(212 180 131 / 0.35);
    border-radius: 1.2rem;
    background: linear-gradient(180deg, var(--night-2), var(--night-1));
    box-shadow: 0 30px 80px rgb(0 0 0 / 0.5);
    text-align: center;
}

.rsvp__card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold-soft), transparent);
}

.rsvp__eyebrow {
    margin: 0 0 0.6rem;
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.rsvp__title {
    margin: 0 0 var(--space-4);
    font-family: var(--ff-display);
    font-style: italic;
    font-weight: 400;
    font-size: clamp(1.8rem, 1.3rem + 2.4vw, 2.6rem);
    line-height: 1.2;
    color: var(--cream);
}

.rsvp__closed {
    margin: 0;
    font-family: var(--ff-display);
    font-style: italic;
    font-size: var(--step-1);
    color: var(--mist);
}

.form {
    display: grid;
    gap: var(--space-3);
    text-align: left;
}

.form__trap {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

.field {
    display: grid;
    gap: 0.45rem;
    min-width: 0;
}

.field label,
.choice legend {
    padding: 0;
    font-family: var(--ff-caps);
    font-size: 0.72rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.field input,
.field select,
.field textarea {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 1px solid rgb(212 180 131 / 0.28);
    border-radius: var(--radius-field);
    background: rgb(6 7 10 / 0.55);
    font: inherit;
    font-size: 1rem;
    /* 16px, so phones don't zoom in */
    color: var(--cream);
    transition: border-color var(--dur-quick) var(--ease-soft), box-shadow var(--dur-quick) var(--ease-soft);
}

.field textarea {
    resize: vertical;
    min-height: 3.2rem;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
    outline: none;
    border-color: var(--gold-soft);
    box-shadow: 0 0 0 3px rgb(212 180 131 / 0.18);
}

.field select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23d4b483' stroke-width='1.5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 0.8rem;
}

.has-error input,
.has-error select,
.has-error textarea {
    border-color: #e05a73;
}

.field__error {
    margin: 0;
    font-size: 0.85rem;
    color: #f2a3b3;
}

.field__hint {
    margin: 0;
    font-size: 0.82rem;
    line-height: 1.5;
    color: var(--mist);
    opacity: 0.8;
}

.has-error .field__hint {
    color: #f2a3b3;
    opacity: 1;
}

/* The two answers */
.choice {
    display: grid;
    gap: 0.6rem;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
}

.choice__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.7rem;
}

.choice__btn {
    padding: 0.95rem 0.6rem;
    border: 1px solid rgb(212 180 131 / 0.4);
    border-radius: var(--radius-field);
    background: rgb(6 7 10 / 0.45);
    font-family: var(--ff-display);
    font-style: italic;
    font-size: 1rem;
    color: var(--cream);
    cursor: pointer;
    transition:
        background-color var(--dur-quick) var(--ease-soft),
        border-color var(--dur-quick) var(--ease-soft),
        color var(--dur-quick) var(--ease-soft);
}

.choice__btn:hover {
    border-color: var(--gold-soft);
}

.choice__btn.is-on {
    border-color: var(--gold-soft);
    background: var(--gold-soft);
    color: #1b1309;
}

.has-error .choice__btn {
    border-color: #e05a73;
}

.form__check {
    display: grid;
    justify-items: center;
    gap: 0.4rem;
}

.form__error {
    margin: 0;
    text-align: center;
    color: #f2a3b3;
}

.form__send {
    justify-self: center;
    min-width: 14rem;
}

.form__send:disabled {
    opacity: 0.6;
    cursor: default;
}
</style>