/**
 * wedding.config.ts — the single source of truth for one wedding.
 *
 * Everything couple-specific lives here (names, date, venue, colours, photos,
 * timeline, RSVP rules). Components read from this file and never hardcode
 * couple data, so a future Eventgrande client = a new config + new assets.
 *
 * Fields marked PLACEHOLDER are not from the client's invitation card and must
 * be confirmed or replaced by the client before launch. `npm run check:config`
 * (to be added) should fail the production build while any placeholder remains.
 */

export interface Person {
    first: string
    full: string
}

export interface Swatch {
    id: string
    name: string
    hex: string // sampled from the invitation card; re-sample from the source file
    hint: string // shown when a guest taps the swatch
}

export interface TimelineEvent {
    id: string
    title: string
    date: string // YYYY-MM-DD, venue-local
    time: string // HH:mm, 24h, venue-local
    description?: string
    location?: string // omit when same as main venue
    enabled: boolean
    placeholder: boolean // true = not confirmed by the client
}

export interface GalleryPhoto {
    src: string
    alt: string
    focal?: [number, number] // 0–1 focal point for arch cropping
}

export interface WeddingConfig {
    slug: string
    couple: { partnerA: Person; partnerB: Person; monogram: string }
    families: { line: string }
    event: {
        startISO: string // always include the UTC offset
        timezone: string // IANA zone, used for .ics and the countdown label
        timezoneLabel: string
        arrivalNote?: string
        venue: {
            name: string
            addressLines: string[]
            mapsUrl: string // PLACEHOLDER until the exact pin is confirmed
            wazeUrl?: string
        }
        calendar: { durationHours: number } // PLACEHOLDER
        dressCode?: string // PLACEHOLDER
    }
    colorsOfTheDay: Swatch[]
    timeline: TimelineEvent[]
    gallery: GalleryPhoto[]
    gate: {
        particleCount: { desktop: number; mobile: number }
        morphTarget: string // SVG whose outline the heart morphs into
        skippable: boolean
        music: { enabled: boolean; src: string }
        copy: { headline: string; cta: string; silent: string }
    }
    rsvp: {
        deadlineISO: string // PLACEHOLDER; the API refuses RSVPs after this
        maxGuestsPerInvite: number // PLACEHOLDER; overridable per guest token
        askAddress: boolean
        addressPurpose: string // shown to guests; must state why we ask
        allowEditUntilDeadline: boolean
        defaultCountry: string // ISO 3166-1 alpha-2 for the phone picker
    }

    loader: {
        lines: string[] // shown in order as loading progresses
        lineMs: number
        minMs: number
        maxMs: number
        preload: string[]

    }
    contacts: Array<{ name: string; phone: string; showPublic: boolean }>
    share: {
        title: string
        personalTitle: string // {guest} is replaced server-side from the token
        description: string
        ogImage: string // 1200×630, under 300 KB for WhatsApp
    }
    features: {
        personalizedLinks: boolean
        livestream: { enabled: boolean; url: string }
        timeline: boolean
        closedPageAfterEvent: boolean
        closedAtISO: string // PLACEHOLDER; when /closed takes over
    }
}

// Anything listed here blocks the production build (checked later by scripts/check-config.mjs)
export const unconfirmed: string[] = [
    'event.venue.mapsUrl',
    'event.dressCode',
    'event.calendar.durationHours',
    'rsvp.deadlineISO',
    'rsvp.maxGuestsPerInvite',
    'features.closedAtISO',
    'couple.monogram (vector source)',
    'share.ogImage',
]

export const defineWeddingConfig = (c: WeddingConfig) => c

export default defineWeddingConfig({
    slug: 'chiamaka-and-andrew',

    couple: {
        partnerA: { first: 'Chiamaka', full: 'Chiamaka Angela Ihekauche' },
        partnerB: { first: 'Andrew', full: 'Andrew Chiedozie Uchella' },
        monogram: '/brand/monogram-ca.png', // needs vector source from client
    },

    families: {
        line: 'The families of Late Sunday Ihekauche & Dr. Sunday Chinasaokwu Uchella',
    },

    event: {
        startISO: '2026-12-19T09:00:00+01:00',
        timezone: 'Africa/Lagos',
        timezoneLabel: 'WAT',
        arrivalNote: '9:00 AM prompt',
        venue: {
            name: 'Water Cress Event Center',
            addressLines: ['48 Oritshe Street, off Balogun St', 'Allen, Ikeja, Lagos'],
            mapsUrl: '', // PLACEHOLDER
        },
        calendar: { durationHours: 8 }, // PLACEHOLDER
        dressCode: undefined, // PLACEHOLDER
    },

    colorsOfTheDay: [
        { id: 'peach', name: 'Peach', hex: '#F2C4A4', hint: 'Soft and sunlit. Lovely for dresses, scarves and pocket squares.' }, // hints are PLACEHOLDER copy
        { id: 'lilac', name: 'Lilac', hex: '#C9B8DC', hint: 'Cool and gentle. Pairs well with champagne gold accents.' },
        { id: 'champagne-gold', name: 'Champagne gold', hex: '#D4B483', hint: 'Warm metallics, beading and jewellery work beautifully here.' },
        { id: 'burnt-orange', name: 'Burnt orange', hex: '#C2561F', hint: 'The bold one. Ideal for ties, gele and statement pieces.' },
    ],

    /**
     * ORDER OF EVENTS — PLACEHOLDER PROGRAMME.
     * Only the 09:00 start comes from the invitation card. All other entries are
     * a typical Lagos white-wedding flow, to be replaced by the client's actual
     * programme. Set enabled:false to hide an entry without deleting it.
     */
    timeline: [
        {
            id: 'arrival', title: 'Guest arrival & seating', date: '2026-12-19', time: '08:30', enabled: true, placeholder: true,
            description: 'Please arrive early. The ceremony starts promptly.'
        },
        {
            id: 'ceremony', title: 'Wedding ceremony', date: '2026-12-19', time: '09:00', enabled: true, placeholder: false,
            description: 'The couple exchange vows.'
        },
        { id: 'photos', title: 'Photographs', date: '2026-12-19', time: '11:30', enabled: true, placeholder: true },
        {
            id: 'reception', title: 'Reception & lunch', date: '2026-12-19', time: '13:00', enabled: true, placeholder: true,
            description: 'Food, music and toasts.'
        },
        { id: 'cake', title: 'Cake cutting & first dance', date: '2026-12-19', time: '15:00', enabled: true, placeholder: true },
        { id: 'send-off', title: 'Send-off', date: '2026-12-19', time: '17:30', enabled: true, placeholder: true },
        // Disabled until the client says whether a traditional marriage is part of the programme.
        {
            id: 'traditional', title: 'Traditional marriage', date: '2026-12-18', time: '10:00', enabled: false, placeholder: true,
            location: 'To be confirmed'
        },
    ],

    gallery: [
        // Cutouts first: they sit best inside the arch frames.
        { src: '/gallery/traditional-cutout.webp', alt: 'The couple in traditional attire', focal: [0.5, 0.35] },
        { src: '/gallery/formal-cutout.webp', alt: 'The couple in formal evening wear', focal: [0.5, 0.3] },
        { src: '/gallery/casual-cutout.webp', alt: 'The couple in matching white jackets', focal: [0.5, 0.3] },
        { src: '/gallery/home-01.webp', alt: 'The couple at home on the staircase', focal: [0.5, 0.4] },
        { src: '/gallery/door-01.webp', alt: 'The couple at an ornate bronze door', focal: [0.5, 0.35] },
    ],

    gate: {
        particleCount: { desktop: 2400, mobile: 1500 },
        morphTarget: '/brand/monogram-ca.png',
        skippable: true,
        music: { enabled: false, src: '' },
        copy: {
            headline: 'Your invitation has arrived',
            cta: 'Tap to receive',
            silent: 'Enter without sound',
        },// opt-in, started by the gate tap
    },


    rsvp: {
        deadlineISO: '2026-12-05T23:59:00+01:00', // PLACEHOLDER
        maxGuestsPerInvite: 4, // PLACEHOLDER
        askAddress: false, // enable only if the client states a purpose
        addressPurpose: 'So the couple can post you a thank-you note.',
        allowEditUntilDeadline: true,
        defaultCountry: 'NG',
    },

    // Transcribe from the card only after the client confirms they may be public.
    contacts: [],

    share: {
        title: 'Chiamaka & Andrew — 19 December 2026',
        personalTitle: 'Dear {guest}, you are invited to Chiamaka & Andrew’s wedding',
        description: 'Saturday 19 December 2026 · Water Cress Event Center, Allen, Ikeja, Lagos.',
        ogImage: '/og/invite-1200x630.jpg',
    },

    features: {
        personalizedLinks: true,
        livestream: { enabled: false, url: '' }, // decide with the client; many RSVP contacts are abroad
        timeline: true,
        closedPageAfterEvent: true,
        closedAtISO: '2026-12-20T06:00:00+01:00', // PLACEHOLDER
    },
    loader: {
        lines: [
            'You’re here, and that means a lot to us.',
            'We saved you a seat at the table.',
            'A moment, please...',
            'We’re preparing your invitation.',
        ],
        lineMs: 2000,
        minMs: 6000, // 3 lines x 1.8s, so every line is seen once
        maxMs: 8000,
        preload: ['/brand/monogram-ca.png'],

    },
})


