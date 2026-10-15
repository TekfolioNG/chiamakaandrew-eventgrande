// What is saved for each reply
export interface GuestReply {
    name: string
    phone: string
    attending: boolean
    guests: number
    email?: string
    address?: string // only present on older test replies
    message?: string
    createdAt: string
    updatedAt: string
}