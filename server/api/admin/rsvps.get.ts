import type { GuestReply } from '../../../shared/types/guest'

export default defineEventHandler(async () => {
    const storage = useStorage('rsvp')
    const keys = await storage.getKeys('guest:')
    const rows = await Promise.all(keys.map((k) => storage.getItem<GuestReply>(k)))

    const rsvps = rows
        .filter((r): r is GuestReply => !!r)
        .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))

    return { rsvps }
})