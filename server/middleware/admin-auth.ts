import { createRemoteJWKSet, jwtVerify } from 'jose'

let keys: ReturnType<typeof createRemoteJWKSet> | undefined

// Every request to /api/admin/* must carry a valid Cloudflare Access login
export default defineEventHandler(async (event) => {
    if (!event.path.startsWith('/api/admin')) return
    if (import.meta.dev) return // local development: no login needed

    const cfg = useRuntimeConfig(event) as unknown as {
        access?: { teamDomain?: string; aud?: string }
    }
    const team = cfg.access?.teamDomain
    const aud = cfg.access?.aud
    if (!team || !aud) {
        throw createError({ statusCode: 503, statusMessage: 'Admin is not configured yet' })
    }

    const token = getHeader(event, 'cf-access-jwt-assertion')
    if (!token) throw createError({ statusCode: 401, statusMessage: 'Please sign in' })

    try {
        keys ??= createRemoteJWKSet(new URL(`https://${team}/cdn-cgi/access/certs`))
        await jwtVerify(token, keys, { issuer: `https://${team}`, audience: aud })
    } catch {
        throw createError({ statusCode: 403, statusMessage: 'Not allowed' })
    }
})