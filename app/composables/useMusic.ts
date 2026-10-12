// One shared audio player for the whole site, so the music survives page changes.
// Volume goes through Web Audio because iPhones ignore audio.volume.
let audio: HTMLAudioElement | undefined
let ctx: AudioContext | undefined
let gain: GainNode | undefined
let raf = 0
let master = 0 // 0..1, eased toward `goal` (user fade in / out)
let goal = 0
let hiddenPause = false

export const useMusic = () => {
    const { gate } = useWedding()
    const playing = useState('music-playing', () => false)

    const frame = () => {
        if (!audio || !gain || !ctx) return

        const step = 16.7 / gate.music.fadeMs
        master += Math.max(-step, Math.min(step, goal - master))

        // soft edges at the start and end of every pass of the song
        const d = audio.duration
        const t = audio.currentTime
        const fadeIn = Math.min(1, t / 2.5)
        const fadeOut = Number.isFinite(d) && d > 0 ? Math.min(1, (d - t) / 3) : 1
        const edge = Math.max(0, Math.min(fadeIn, fadeOut))

        gain.gain.setTargetAtTime(gate.music.volume * master * edge, ctx.currentTime, 0.08)

        if (master <= 0 && goal === 0) {
            audio.pause()
            playing.value = false
            raf = 0
            return
        }
        raf = requestAnimationFrame(frame)
    }

    const play = () => {
        if (!audio || !ctx) return
        goal = 1
        void ctx.resume()
        audio.play().catch(() => {
            goal = 0
            playing.value = false
        })
        playing.value = true
        if (!raf) raf = requestAnimationFrame(frame)
    }

    // Must be called from a click or tap handler: browsers only allow sound after a gesture
    const start = () => {
        if (import.meta.server || !gate.music.enabled) return

        if (!audio) {
            audio = new Audio(gate.music.src)
            audio.preload = 'auto'
            audio.addEventListener('ended', () => {
                if (!audio) return
                audio.currentTime = 0
                void audio.play()
            })

            const AC =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
            ctx = new AC()
            gain = ctx.createGain()
            gain.gain.value = 0
            ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination)

            document.addEventListener('visibilitychange', () => {
                if (!audio) return
                if (document.hidden && goal === 1 && !audio.paused) {
                    audio.pause()
                    hiddenPause = true
                    cancelAnimationFrame(raf)
                    raf = 0
                } else if (!document.hidden && hiddenPause) {
                    hiddenPause = false
                    play()
                }
            })
        }
        play()
    }

    const toggle = () => {
        if (playing.value) {
            goal = 0
            playing.value = false
            if (!raf) raf = requestAnimationFrame(frame)
        } else {
            start()
        }
    }

    return { playing, start, toggle }
}