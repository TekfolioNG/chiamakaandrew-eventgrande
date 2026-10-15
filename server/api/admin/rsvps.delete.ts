export default defineEventHandler(async (event) => {
    const storage = useStorage('rsvp')
    const { phone, all } = getQuery(event)

    // after the event: remove every reply
    if (all === 'yes') {
        const keys = await storage.getKeys('guest:')
        await Promise.all(keys.map((k) => storage.removeItem(k)))
        return { ok: true, removed: keys.length }
    }

    // otherwise: one reply, identified by its phone number
    if (typeof phone !== 'string' || !/^\+\d{6,20}$/.test(phone)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid phone number' })
    }
    await storage.removeItem(`guest:${phone}`)
    return { ok: true }
})