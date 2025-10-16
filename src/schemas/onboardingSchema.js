import { z } from 'zod'

export const onboardingSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be 50 characters or less')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  
  avatar_url: z.string()
    .optional()
    .or(z.literal('')),
  
  block: z.string()
    .min(1, 'Block is required')
    .max(50, 'Block must be 50 characters or less'),
  
  lot: z.string()
    .min(1, 'Lot is required')
    .max(50, 'Lot must be 50 characters or less')
})