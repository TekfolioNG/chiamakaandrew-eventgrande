import type { H3Event } from 'h3'

// Asks Cloudflare whether the Turnstile check was really passed
export const verifyTurnstile = async (event: H3Event, token: string): Promise<boolean> => {
    const cfg = useRuntimeConfig(event) as unknown as { turnstile?: { secretKey?: string } }
    const secret = cfg.turnstile?.secretKey

    // no key configured: allowed in development only, never in production
    if (!secret) return import.meta.dev
    if (!token) return false

    try {
        const res = await $fetch<{ success: boolean }>(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                body: { secret, response: token, remoteip: getRequestIP(event) },
            },
        )
        return res.success === true
    } catch {
        return false
    }
}