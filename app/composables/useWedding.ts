import config from '~~/shared/wedding.config'

export const useWedding = () => {
    const start = new Date(config.event.startISO)
    const timeline = config.timeline.filter((t) => t.enabled)
    return { ...config, start, timeline }
}