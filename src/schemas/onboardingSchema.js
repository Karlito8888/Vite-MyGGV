import { z } from 'zod'

export const onboardingSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be 50 characters or less')
    .regex(/^[a-zA-Z0-9_\s-]+$/, 'Username can only contain letters, numbers, underscores, spaces, and hyphens')
    .transform(val => val.trim()),
  
  avatar_url: z.string()
    .min(1, 'Profile picture is required'),
  
  block: z.string()
    .min(1, 'Block is required')
    .max(50, 'Block must be 50 characters or less')
    .transform(val => val.trim()),
  
  lot: z.string()
    .min(1, 'Lot is required')
    .max(50, 'Lot must be 50 characters or less')
    .transform(val => val.trim())
}).refine(
  (data) => data.avatar_url && data.avatar_url.length > 0,
  {
    message: 'Profile picture is required. Please upload an image.',
    path: ['avatar_url']
  }
)