// Counts down to the start, and counts up once the day has begun
export const useCountdown = (iso: string) => {
    const target = new Date(iso).getTime()
    const now = ref(Date.now())
    let timer: ReturnType<typeof setInterval> | undefined

    onMounted(() => {
        now.value = Date.now()
        timer = setInterval(() => { now.value = Date.now() }, 1000)
    })
    onBeforeUnmount(() => clearInterval(timer))

    const after = computed(() => now.value >= target)
    const parts = computed(() => {
        const total = Math.floor(Math.abs(target - now.value) / 1000)
        return {
            days: Math.floor(total / 86400),
            hours: Math.floor((total % 86400) / 3600),
            minutes: Math.floor((total % 3600) / 60),
            seconds: total % 60,
        }
    })

    return { parts, after }
}