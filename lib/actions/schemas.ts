import { z } from 'zod'

export const ReviewSchema = z.object({
    productId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    comment: z.string().max(1000).optional(),
    images: z.array(z.string().url()).max(5).optional(),
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().max(50).optional(),
    email: z.string().email().optional(),
})

export const SupportTicketSchema = z.object({
    subject: z.string().min(5).max(100),
    description: z.string().min(10).max(2000),
    category: z.string(),
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(15),
    userId: z.string().uuid().optional(),
    chatHistory: z.string().optional()
})

export const ContactSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    subject: z.string().min(2).max(100).optional(),
    message: z.string().min(10).max(2000),
})

export const CustomOrderSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(15),
    description: z.string().min(10).max(2000),
    images: z.array(z.string().url()).max(5).optional(),
    catalog_requested: z.boolean().optional(),
})

export const BulkOrderSchema = z.object({
    businessName: z.string().min(2).max(100),
    contactName: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(15),
    gstNumber: z.string().max(20).optional(),
    message: z.string().max(2000).optional(),
    items: z.array(z.object({
        productId: z.string().uuid(),
        productName: z.string(),
        productImage: z.string(),
        retailPrice: z.number().positive(),
        quantity: z.number().min(10),
    })).min(1),
})

export type BulkOrderValues = z.infer<typeof BulkOrderSchema>
