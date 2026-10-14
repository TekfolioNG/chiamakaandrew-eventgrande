import { rsvpSchema } from '../../shared/schemas/rsvp'
import { normalizePhone } from '../../shared/utils/phone'
import config from '../../shared/wedding.config'

type Body = Record<string, unknown>
type Stored = { createdAt?: string }

export default defineEventHandler(async (event) => {
    const body = (await readBody<Body>(event)) ?? {}

    // Honeypot: real people never fill the hidden field. Pretend it worked so bots move on.
    if (typeof body.website === 'string' && body.website.length > 0) return { ok: true }

    // Closed after the deadline
    if (Date.now() > new Date(config.rsvp.deadlineISO).getTime()) {
        throw createError({ statusCode: 403, statusMessage: 'RSVPs are closed' })
    }

    const parsed = rsvpSchema.safeParse(body)
    if (!parsed.success) {
        throw createError({ statusCode: 400, statusMessage: 'Please check your details' })
    }
    const input = parsed.data

    const token = typeof body.token === 'string' ? body.token : ''
    if (!(await verifyTurnstile(event, token))) {
        throw createError({ statusCode: 400, statusMessage: 'Security check failed' })
    }

    const phone = normalizePhone(input.phone, config.rsvp.defaultCountry)
    if (!phone) {
        throw createError({ statusCode: 400, statusMessage: 'Please check the phone number' })
    }

    const guests = input.attending
        ? Math.min(Math.max(input.guests, 1), config.rsvp.maxGuestsPerInvite)
        : 0

    // One reply per phone number; replying again updates it
    const storage = useStorage('rsvp')
    const key = `guest:${phone}`
    const existing = await storage.getItem<Stored>(key)
    if (existing && !config.rsvp.allowEditUntilDeadline) {
        throw createError({ statusCode: 409, statusMessage: 'A reply from this number already exists' })
    }

    const now = new Date().toISOString()
    await storage.setItem(key, {
        name: input.name,
        phone,
        attending: input.attending,
        guests,
        email: input.email.toLowerCase(),
        message: input.message,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
    })

    return { ok: true, attending: input.attending }
})