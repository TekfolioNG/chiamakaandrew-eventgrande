export const usePreloader = () => {
    const progress = ref(0)

    const loadImage = (src: string) =>
        new Promise<void>((resolve) => {
            const img = new Image()
            img.onload = () => resolve()
            img.onerror = () => resolve() // a missing file must never block the invite
            img.src = src
        })

    const run = (opts: { minMs: number; maxMs: number; assets: string[] }) =>
        new Promise<void>((resolve) => {
            const started = performance.now()
            const jobs = opts.assets.map(loadImage)
            let settled = 0
            jobs.forEach((j) => j.then(() => settled++))

            const frame = (now: number) => {
                const elapsed = now - started
                const t = Math.min(1, elapsed / opts.minMs)
                const timeFraction = t * (2 - t) // gentle ease-out
                const realFraction =
                    jobs.length === 0 || elapsed >= opts.maxMs ? 1 : settled / jobs.length

                progress.value = Math.max(progress.value, Math.min(timeFraction, realFraction))

                if (progress.value >= 1) setTimeout(resolve, 600) // let the fill finish
                else requestAnimationFrame(frame)
            }
            requestAnimationFrame(frame)
        })

    return { progress, run }
}