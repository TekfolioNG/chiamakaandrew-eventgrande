<script setup lang="ts">
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Particle = { x: number; y: number; vx: number; vy: number; life: number; r: number }

const w = useWedding()
const r = w.reveal
const { downloadIcs } = useCalendar()

const root = ref<HTMLElement>()
useReveal(root)

// The date, always written in the venue's own time zone
const start = new Date(w.event.startISO)
const fmt = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-GB', { timeZone: w.event.timezone, ...o }).format(start)
const weekday = fmt({ weekday: 'long' })
const day = fmt({ day: 'numeric' })
const month = fmt({ month: 'long' })
const year = fmt({ year: 'numeric' })

const THRESHOLD = 0.5 // how much must be scratched before the rest dissolves

const cardEl = ref<HTMLElement>()
const canvasEl = ref<HTMLCanvasElement>()
const fxEl = ref<HTMLCanvasElement>()

const armed = ref(false) // the foil is drawn, so the date underneath may show where scratched
const finishing = ref(false)
const foilGone = ref(false)
const revealed = ref(false)

let ctx: CanvasRenderingContext2D | null = null
let fx: CanvasRenderingContext2D | null = null
let track: HTMLCanvasElement | null = null
let tctx: CanvasRenderingContext2D | null = null
let cw = 0
let ch = 0
let brush = 36
let drawing = false
let finished = false
let reduced = false
let lx = 0
let ly = 0
let lastCheck = 0
let fxRaf = 0
const particles: Particle[] = []

// ---------- the foil ----------
const drawFoil = async () => {
    const canvas = canvasEl.value
    const fxCanvas = fxEl.value
    if (!canvas || !fxCanvas) throw new Error('foil elements missing')

    await document.fonts.ready

    const rect = canvas.getBoundingClientRect()
    cw = rect.width
    ch = rect.height
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = fxCanvas.width = Math.round(cw * dpr)
    canvas.height = fxCanvas.height = Math.round(ch * dpr)

    ctx = canvas.getContext('2d')
    fx = fxCanvas.getContext('2d')
    if (!ctx || !fx) throw new Error('canvas unavailable')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    fx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // gold gradient
    const g = ctx.createLinearGradient(0, 0, cw, ch)
    g.addColorStop(0, '#8f6c35')
    g.addColorStop(0.2, '#d4b483')
    g.addColorStop(0.38, '#f6e4b8')
    g.addColorStop(0.55, '#b88a4a')
    g.addColorStop(0.75, '#e9cf9b')
    g.addColorStop(1, '#8f6c35')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, cw, ch)

    // fine diagonal lines
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    for (let x = -ch; x < cw; x += 9) {
        ctx.beginPath()
        ctx.moveTo(x, ch)
        ctx.lineTo(x + ch, 0)
        ctx.stroke()
    }

    // grain
    for (let i = 0; i < 2600; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(60,40,10,0.1)'
        ctx.fillRect(Math.random() * cw, Math.random() * ch, 1.2, 1.2)
    }

    // the words on the foil
    const text = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(58,38,10,0.85)'
    ctx.font = `${Math.round(ch * 0.075)}px Marcellus, Georgia, serif`
    text.letterSpacing = `${Math.round(ch * 0.02)}px`
    ctx.fillText(r.scratchTitle.toUpperCase(), cw / 2, ch * 0.45)
    text.letterSpacing = '0px'
    ctx.font = `italic ${Math.round(ch * 0.1)}px "Bodoni Moda", Georgia, serif`
    ctx.fillText(r.scratchSub, cw / 2, ch * 0.58)

    // a small hidden copy of the scratches, used only to measure progress
    brush = Math.max(34, ch * 0.2)
    track = document.createElement('canvas')
    track.width = Math.ceil(cw / 4)
    track.height = Math.ceil(ch / 4)
    tctx = track.getContext('2d', { willReadFrequently: true })
    if (tctx) {
        tctx.strokeStyle = '#fff'
        tctx.lineCap = 'round'
        tctx.lineJoin = 'round'
        tctx.lineWidth = brush / 4
    }

    armed.value = true
}

// ---------- scratching ----------
const pos = (e: PointerEvent) => {
    const c = canvasEl.value
    if (!c) return { x: 0, y: 0 }
    const b = c.getBoundingClientRect()
    return { x: e.clientX - b.left, y: e.clientY - b.top }
}

const scratch = (x: number, y: number) => {
    if (!ctx || !tctx) return
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = brush
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowBlur = 14
    ctx.shadowColor = '#000'
    ctx.beginPath()
    ctx.moveTo(lx, ly)
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.restore()

    tctx.beginPath()
    tctx.moveTo(lx / 4, ly / 4)
    tctx.lineTo(x / 4, y / 4)
    tctx.stroke()

    lx = x
    ly = y

    const now = performance.now()
    if (now - lastCheck > 140) {
        lastCheck = now
        check()
    }
}

const check = () => {
    if (!track || !tctx || finished) return
    const { data } = tctx.getImageData(0, 0, track.width, track.height)
    let n = 0
    for (let i = 3; i < data.length; i += 4) if ((data[i] ?? 0) > 128) n++
    if (n / (track.width * track.height) >= THRESHOLD) finish()
}

const onDown = (e: PointerEvent) => {
    if (finished || !ctx) return
    drawing = true
    canvasEl.value?.setPointerCapture(e.pointerId)
    const p = pos(e)
    lx = p.x
    ly = p.y
    scratch(p.x + 0.01, p.y)
}
const onMove = (e: PointerEvent) => {
    const p = pos(e)
    // the light on the foil follows the pointer
    cardEl.value?.style.setProperty('--mx', `${(p.x / (cw || 1)) * 100}%`)
    cardEl.value?.style.setProperty('--my', `${(p.y / (ch || 1)) * 100}%`)
    if (!drawing) return
    scratch(p.x, p.y)
    spawn(p.x, p.y)
}
const onUp = () => { drawing = false }

// ---------- gold flecks ----------
const spawn = (x: number, y: number, n = 2) => {
    if (reduced) return
    for (let i = 0; i < n && particles.length < 90; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2.4,
            vy: -Math.random() * 2 - 0.3,
            life: 1,
            r: Math.random() * 1.4 + 0.7,
        })
    }
    if (!fxRaf) fxRaf = requestAnimationFrame(tick)
}

const tick = () => {
    fxRaf = 0
    if (!fx) return
    fx.clearRect(0, 0, cw, ch)
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        if (!p) continue
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.07
        p.life -= 0.022
        if (p.life <= 0) {
            particles.splice(i, 1)
            continue
        }
        fx.fillStyle = `rgba(246,228,184,${p.life.toFixed(2)})`
        fx.beginPath()
        fx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        fx.fill()
    }
    if (particles.length) fxRaf = requestAnimationFrame(tick)
}

// ---------- the reveal ----------
const finish = () => {
    if (finished) return
    finished = true
    finishing.value = true
    drawing = false

    navigator.vibrate?.(30)

    const canvas = canvasEl.value
    if (!canvas || reduced) {
        foilGone.value = true
        revealed.value = true
        return
    }
    spawn(cw / 2, ch / 2, 60)
    gsap.to(canvas, {
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        onComplete: () => { foilGone.value = true },
    })
    setTimeout(() => { revealed.value = true }, 500)
}

// the page below grows once the countdown appears, so scroll effects are re-measured
const dateRevealed = useState<boolean>('date-revealed', () => false)

watch(revealed, async (v) => {
    if (!v) return
    dateRevealed.value = true
    await nextTick()
    ScrollTrigger.refresh()
})
onMounted(async () => {
    gsap.registerPlugin(ScrollTrigger)
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    await nextTick()
    try {
        await drawFoil()
    } catch {
        // if the canvas can't run, never hide the date
        armed.value = true
        foilGone.value = true
        revealed.value = true
    }
})

onBeforeUnmount(() => cancelAnimationFrame(fxRaf))
</script>

<template>
    <section id="date" ref="root" class="date band-date" aria-label="The date">
        <p class="date__eyebrow" data-reveal>{{ r.eyebrow }}</p>

        <p class="date__families" data-reveal="0.1">
            <span class="date__lead">{{ r.familiesLead }}</span>
            <span class="date__names">{{ w.families.names }}</span>
            <span class="date__lead">{{ r.familiesTail }}</span>
        </p>

        <div class="date__stage" data-reveal="0.2">
            <div ref="cardEl" class="card" :class="{ 'is-armed': armed, 'is-open': revealed }">
                <!-- the date itself: always in the page, so screen readers can read it -->
                <div class="card__date">
                    <span class="card__weekday">{{ weekday }}</span>
                    <span class="card__row">
                        <span class="card__day">{{ day }}</span>
                        <span class="card__month"><b>{{ month }}</b><i>{{ year }}</i></span>
                    </span>
                    <span v-if="w.event.arrivalNote" class="card__time">{{ w.event.arrivalNote }}</span>
                </div>

                <template v-if="!foilGone">
                    <canvas ref="canvasEl" class="card__foil" aria-hidden="true" @pointerdown="onDown"
                        @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp" />
                    <span class="card__sheen" aria-hidden="true" />
                    <canvas ref="fxEl" class="card__fx" aria-hidden="true" />
                </template>
            </div>
            <p class="date__place" data-reveal="0.3">
                <template v-for="(p, i) in r.place" :key="p">
                    <i v-if="i > 0" aria-hidden="true" />
                    <span>{{ p }}</span>
                </template>
            </p>

            <button v-if="!finishing && !revealed" type="button" class="btn btn--ghost" @click="finish">
                {{ r.revealButton }}
            </button>
        </div>

        <Transition name="rise" appear>
            <div v-if="revealed" class="date__after">
                <button type="button" class="btn btn--gold" @click="downloadIcs">{{ r.calendarButton }}</button>
                <CountdownTiles />
            </div>
        </Transition>
    </section>
</template>

<style scoped>
.date {
    position: relative;
    display: grid;
    justify-items: center;
    gap: var(--space-4);
    padding: clamp(5rem, 14svh, 9rem) var(--space-3) clamp(4rem, 10svh, 7rem);
    text-align: center;
}

.date :focus-visible {
    outline: 2px solid var(--gold-soft);
    outline-offset: 4px;
}

.date__eyebrow {
    margin: 0;
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.date__families {
    display: grid;
    gap: 0.4rem;
    max-width: 30rem;
    margin: 0;
}

.date__lead {
    font-family: var(--ff-display);
    font-style: italic;
    font-size: var(--step-1);
    line-height: 1.5;
    color: var(--cream);
}

.date__names {
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    line-height: 1.8;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.date__stage {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
    width: min(100%, 38rem);
}

/* ---------- the card ---------- */
.card {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 2.6;
    overflow: hidden;
    border: 1px solid rgb(212 180 131 / 0.5);
    border-radius: 1rem;
    background: radial-gradient(ellipse at 50% 0%, var(--night-2), var(--night-1) 70%);
    box-shadow: 0 30px 80px rgb(0 0 0 / 0.55), 0 0 60px rgb(212 180 131 / 0.12);
}

@media (min-width: 40rem) {
    .card {
        aspect-ratio: 5 / 2.15;
    }
}

.card.is-open {
    animation: glow 1.8s ease-out;
}

@keyframes glow {
    0% {
        box-shadow: 0 30px 80px rgb(0 0 0 / 0.55), 0 0 0 rgb(212 180 131 / 0);
    }

    40% {
        box-shadow: 0 30px 80px rgb(0 0 0 / 0.55), 0 0 90px rgb(212 180 131 / 0.45);
    }

    100% {
        box-shadow: 0 30px 80px rgb(0 0 0 / 0.55), 0 0 60px rgb(212 180 131 / 0.12);
    }
}

.card__date {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 0.2rem;
    text-align: center;
    opacity: 0;
    /* stays hidden until the foil is drawn, so nothing can flash */
    transition: opacity 600ms var(--ease-soft);
}

.card.is-armed .card__date,
.card.is-open .card__date {
    opacity: 1;
}

.card__weekday {
    padding-left: 0.5em;
    font-family: var(--ff-caps);
    font-size: clamp(0.8rem, 0.7rem + 0.4vw, 1rem);
    letter-spacing: 0.5em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.card__row {
    display: flex;
    align-items: center;
    gap: clamp(0.8rem, 3vw, 1.4rem);
}

.card__day {
    font-family: var(--ff-display);
    font-weight: 500;
    font-size: clamp(4rem, 2.6rem + 7vw, 7rem);
    line-height: 0.9;
    color: var(--cream);
}

.card__month {
    display: grid;
    gap: 0.3rem;
    text-align: left;
}

.card__month b {
    font-family: var(--ff-caps);
    font-size: clamp(0.9rem, 0.8rem + 0.5vw, 1.2rem);
    font-weight: 400;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--cream);
}

.card__month i {
    font-family: var(--ff-caps);
    font-size: clamp(0.8rem, 0.7rem + 0.4vw, 1rem);
    font-style: normal;
    letter-spacing: 0.3em;
    color: var(--gold-soft);
}

.card__time {
    margin-top: 0.3rem;
    font-family: var(--ff-display);
    font-style: italic;
    font-size: var(--step-0);
    color: var(--mist);
}

/* the foil and its effects */
.card__foil,
.card__fx {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}

.card__foil {
    cursor: pointer;
    touch-action: none;
    /* so a finger can scratch without scrolling the page */
    user-select: none;
}

.card__fx {
    pointer-events: none;
}

.card__sheen {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    mix-blend-mode: soft-light;
    background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%),
            rgba(255, 248, 228, 0.75),
            transparent 45%);
}

.card__sheen::before {
    content: '';
    position: absolute;
    top: -10%;
    bottom: -10%;
    left: 0;
    width: 35%;
    background: linear-gradient(100deg, transparent, rgba(255, 246, 220, 0.55), transparent);
    transform: translateX(-130%) skewX(-18deg);
    animation: sweep 3.6s ease-in-out 1s infinite;
}

@keyframes sweep {
    0% {
        transform: translateX(-130%) skewX(-18deg);
    }

    55%,
    100% {
        transform: translateX(380%) skewX(-18deg);
    }
}

/* ---------- after the reveal ---------- */
.date__after {
    display: grid;
    justify-items: center;
    gap: var(--space-5);
    margin-top: var(--space-3);
}

.date__place {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.9rem;
    margin: 0;
    font-family: var(--ff-caps);
    font-size: var(--step--1);
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--gold-soft);
}

.date__place i {
    width: 0.4rem;
    height: 0.4rem;
    background: var(--gold);
    transform: rotate(45deg);
}

.rise-enter-active {
    transition: opacity 900ms var(--ease-soft), transform 900ms var(--ease-soft);
}

.rise-enter-from {
    opacity: 0;
    transform: translateY(16px);
}

@media (prefers-reduced-motion: reduce) {
    .card__sheen::before {
        animation: none;
    }

    .card.is-open {
        animation: none;
    }
}
</style>