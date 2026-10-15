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

export interface HeroSlide {
    src: string
    alt: string
    kind: 'photo' | 'cutout' | 'badge' // cutout = white background, badge = the monogram
    focal?: string // CSS object-position
}

export interface Swatch {
    id: string
    name: string
    hex: string // sampled from the invitation card; re-sample from the source file
    hint: string // shown when a guest taps the swatch
}
export interface FaqItem {
    q: string
    a: string
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

export interface Moment {
    src: string
    alt: string
    caption: string
    kind: 'photo' | 'cutout' // cutout = white background
    focal?: string // CSS object-position
}

export interface WeddingConfig {
    slug: string
    couple: { partnerA: Person; partnerB: Person; monogram: string }
    families: { line: string; names: string }
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
        music: { enabled: boolean; src: string; volume: number; fadeMs: number }
        copy: { headline: string; cta: string; silent: string }
    }
    hero: {
        bg: string
        alt: string
        eyebrow: string
        cta: string
        slides: HeroSlide[]
        slideMs: number
    }
    reveal: {
        eyebrow: string
        familiesLead: string
        familiesTail: string
        scratchTitle: string
        scratchSub: string
        revealButton: string
        calendarButton: string
        countdownLabel: string
        marriedLabel: string
        place: string[]
    }
    rsvp: {
        deadlineISO: string // PLACEHOLDER; the API refuses RSVPs after this
        maxGuestsPerInvite: number // PLACEHOLDER; overridable per guest token
        askEmail: boolean
        emailPurpose: string// shown to guests; must state why we ask
        allowEditUntilDeadline: boolean
        defaultCountry: string // ISO 3166-1 alpha-2 for the phone picker
        copy: {
            eyebrow: string
            title: string
            attendLabel: string
            yes: string
            no: string
            name: string
            phone: string
            phoneHint: string
            guests: string
            email: string
            message: string
            send: string
            sending: string
            delivered: string
            closed: string
            errors: { attending: string; phone: string; token: string; generic: string; closed: string; email: string }
        }
        thanks: {
            eyebrow: string
            yesTitle: string
            yesText: string
            noTitle: string
            noText: string
            calendar: string
            back: string
        }
    }

    loader: {
        lines: string[] // shown in order as loading progresses
        lineMs: number
        minMs: number
        maxMs: number
        preload: string[]
    }
    invitation: {
        inviteLine: string
        toThe: string
        title: string
        ofTheir: string
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
    moments: {
        eyebrow: string
        title: string
        speed: number // pixels per second
        items: Moment[]
    }
    details: { eyebrow: string; lead: string; mapsButton: string; calendarButton: string }
    colorDay: { eyebrow: string; title: string; hint: string }
    order: { eyebrow: string; title: string }
    faq: { eyebrow: string; title: string; items: FaqItem[] }
    closing: {
        line: string
        signoff: string
        share: boolean
        whatsapp: string
        copy: string
        copied: string
    }
    footer: {
        rights: string
        organizerLabel: string
        organizer: { name: string; url: string }
        developerLabel: string
        developer: { name: string; url: string }
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
        names: 'Late Sunday Ihekauche & Dr. Sunday Chinasaokwu Uchella',
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
        music: { enabled: true, src: '/audio/roju.mp3', volume: 0.35, fadeMs: 2500 },
        copy: {
            headline: 'Your invitation has arrived',
            cta: 'Tap to receive',
            silent: 'Enter without sound',
        },// opt-in, started by the gate tap
    },


    rsvp: {
        deadlineISO: '2026-12-05T23:59:00+01:00', // PLACEHOLDER
        maxGuestsPerInvite: 4, // PLACEHOLDER
        askEmail: true,
        emailPurpose: 'So the couple can send you a thank-you note.',
        allowEditUntilDeadline: true,
        defaultCountry: 'NG',
        copy: {
            eyebrow: 'Kindly respond',
            title: 'Will you be joining us?',
            attendLabel: 'Your answer',
            yes: 'I’ll be there',
            no: 'With regret, I can’t',
            name: 'Full name',
            phone: 'Phone number',
            phoneHint: 'Outside Nigeria? Start with your country code, like +1 or +44.',
            guests: 'Number of guests, including you',
            email: 'Email address (optional)',
            message: 'A note for the couple (optional)',
            send: 'Send my reply',
            sending: 'Sending…',
            delivered: 'Your reply has been delivered',
            closed: 'RSVPs are now closed.',
            errors: {
                attending: 'Please choose your answer',
                phone: 'Please check your phone number',
                token: 'Please complete the security check',
                generic: 'We couldn’t send your reply. Please try again in a moment.',
                closed: 'RSVPs have now closed.',
                email: 'Please check your email address',
            },
        },
        thanks: {
            eyebrow: 'Thank you',
            yesTitle: 'We can’t wait to celebrate with you',
            yesText: 'Your reply has reached the couple. Save the day to your calendar so you don’t miss a moment.',
            noTitle: 'You will be missed',
            noText: 'Thank you for letting us know. You will be in our hearts on the day.',
            calendar: 'Add to calendar',
            back: 'Back to the invitation',
        },
    },

    // Transcribe from the card only after the client confirms they may be public.
    contacts: [],

    share: {
        title: 'Chiamaka weds Andrew! You’re specially invited.',
        personalTitle: 'Dear {guest}, you are invited to Chiamaka & Andrew’s wedding',
        description: 'Open your invitation and scratch to reveal the date.',
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
            'A moment, please...',
            'We’re preparing your invitation.',
            'So we can save you your special seat.',
        ],
        lineMs: 2000,
        minMs: 6000, // 3 lines x 1.8s, so every line is seen once
        maxMs: 8000,
        preload: ['/brand/monogram-ca.png', '/hero/couple-hero.webp'],

    },
    hero: {
        bg: '/hero/couple-hero.webp',
        alt: 'Chiamaka and Andrew leaning on a golden railing, smiling',
        eyebrow: 'You’re specially invited to the wedding of',
        cta: 'Save your seat',
        slideMs: 5500,
        slides: [
            { src: '/hero/couple-hero.jpeg', alt: 'The couple leaning on a golden railing, smiling', kind: 'photo', focal: '50% 30%' },
            { src: '/hero/couple-02.jpeg', alt: 'The couple embracing', kind: 'photo', focal: '50% 30%' },
            { src: '/hero/couple-03.jpeg', alt: 'The couple in traditional attire', kind: 'cutout', focal: '50% 8%' },
            { src: '/hero/couple-04.jpeg', alt: 'The couple in formal evening wear', kind: 'cutout', focal: '50% 8%' },
            { src: '/hero/couple-05.jpeg', alt: 'The couple in matching white jackets', kind: 'cutout', focal: '50% 8%' },
            { src: '/hero/couple-06.jpeg', alt: 'The couple at an ornate bronze door', kind: 'photo', focal: '50% 40%' },

        ],
    },
    reveal: {
        eyebrow: 'The date',
        familiesLead: 'The families of',
        familiesTail: 'cordially invite you to celebrate with them.',
        scratchTitle: 'Scratch to reveal',
        scratchSub: 'the wedding date',
        revealButton: 'Reveal the date',
        calendarButton: 'Add to calendar',
        countdownLabel: 'Counting down to the day',
        marriedLabel: 'Married for',
        place: ['Lagos', 'Nigeria'],

    },
    invitation: {
        inviteLine: 'Cordially invite you',
        toThe: 'To the',
        title: 'Wedding',
        ofTheir: 'of their children',
    },
    moments: {
        eyebrow: 'The two of us',
        title: 'Moments we hold close',
        speed: 38,
        items: [
            { src: '/moments/moment-01.webp', alt: 'The couple embracing', caption: 'Home is each other', kind: 'photo', focal: '50% 30%' },
            { src: '/moments/moment-02.webp', alt: 'The couple leaning on a golden railing', caption: 'Side by side', kind: 'photo', focal: '50% 30%' },
            { src: '/moments/moment-03.webp', alt: 'The couple in traditional attire', caption: 'Dressed in heritage', kind: 'cutout', focal: '50% 8%' },
            { src: '/moments/moment-04.webp', alt: 'The couple in formal evening wear', caption: 'Evening elegance', kind: 'cutout', focal: '50% 8%' },
            { src: '/moments/moment-05.webp', alt: 'The couple in matching white jackets', caption: 'Always matching', kind: 'cutout', focal: '50% 8%' },
            { src: '/moments/moment-06.webp', alt: 'The couple at an ornate bronze door', caption: 'Our door, our beginning', kind: 'photo', focal: '50% 40%' },
        ],
    },
    details: {
        eyebrow: 'The venue',
        lead: 'Join us at',
        mapsButton: 'Open in Maps',
        calendarButton: 'Add to calendar',
    },

    colorDay: {
        eyebrow: 'Choose your color of the day',
        title: 'Wear the colors of the day',
        hint: 'Tap a color to see how to wear it',
    },

    order: {
        eyebrow: 'Order of the day',
        title: 'How the day unfolds',
    },
    faq: {
        eyebrow: 'Good to know',
        title: 'Before the day',
        items: [
            {
                q: 'What should I wear?',
                a: 'Pick your favorite: peach, lilac, champagne gold or burnt orange, alone or mixed together. Elegant traditional or formal attire is most welcome, and the colors will make the day’s photographs even more beautiful.',
            },
            {
                q: 'What time should I arrive?',
                a: 'The wedding begins at 9:00 AM prompt, so please plan to arrive early enough to be comfortably seated before it starts.',
            },
            {
                q: 'How do I find the venue?',
                a: 'Water Cress Event Center is at 48 Oritshe Street, off Balogun St, Allen, Ikeja, Lagos. Tap “Open in Maps” in the venue section above for directions.',
            },
            {
                q: 'Is there parking?',
                a: 'Parking arrangements will be confirmed closer to the day. In the meantime, arriving early and sharing rides will make things easier.',
            },
            {
                q: 'Who can I bring with me?',
                a: 'Please include everyone in your party on the RSVP form, up to the number shown there. If you need to add anyone beyond that, kindly let the family know.',
            },
            {
                q: 'Can I take photos or videos?',
                a: 'We kindly ask that phones are put away during the ceremony so everyone can be fully present. Photographs from the day will be shared afterwards.',
            },
            {
                q: 'Can I change my reply?',
                a: 'Yes. Simply send the RSVP form again with the same phone number before the deadline, and your reply will be updated.',
            },
        ],
    },

    closing: {
        line: 'We can’t wait to celebrate with you',
        signoff: 'With love',
        share: true, // set to false to remove the share buttons
        whatsapp: 'Share on WhatsApp',
        copy: 'Copy link',
        copied: 'Link copied',
    },

    footer: {
        rights: 'All rights reserved.',
        organizerLabel: 'Organized by',
        organizer: { name: 'Eventgrande', url: 'https://eventgrande.org' },
        developerLabel: 'Website development by',
        developer: { name: 'Tekfolio', url: 'https://tekfolio.ng/' },
    },
})


