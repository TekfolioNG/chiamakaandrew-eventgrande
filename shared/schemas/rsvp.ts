import { z } from 'zod'

export const rsvpSchema = z.object({
    name: z.string().trim().min(2, 'Please enter your full name').max(120, 'That name is a little long'),
    attending: z.boolean(),
    phone: z.string().trim().min(6, 'Please enter your phone number').max(30, 'That number looks too long'),
    guests: z.number().int().min(0).max(20),
    email: z
        .string()
        .trim()
        .max(120, 'That email address looks too long')
        .regex(/^$|^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please check your email address'),
    message: z.string().trim().max(500, 'Please keep your note under 500 characters'),
})

export type RsvpInput = z.infer<typeof rsvpSchema>