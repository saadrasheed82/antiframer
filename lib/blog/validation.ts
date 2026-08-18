import { z } from 'zod'

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const tagSlug = z.string().regex(SLUG_REGEX, 'tag must be kebab-case').min(1).max(50)

export const postInputSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(SLUG_REGEX, 'slug must be kebab-case').min(1).max(100).optional(),
  excerpt: z.string().max(300).optional().nullable(),
  content_md: z.string().min(1),
  cover_image_url: z.url().startsWith('https://').optional().nullable().or(z.literal('')),
  tags: z.array(tagSlug).max(10).optional(),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  // NOTE: z.iso.datetime() / z.string().datetime() cause a Turbopack worker
  // TDZ error (ReferenceError: Cannot access 'fl' before initialization) when
  // Next.js 16 collects page data at build time. Working around by regex-match
  // on ISO-8601 instead. See https://github.com/vercel/next.js issues for
  // "Cannot access * before initialization" + zod reports.
  published_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/, {
      message: 'published_at must be an ISO 8601 datetime',
    })
    .optional(),
  author_name: z.string().min(1).max(100).optional(),
})

export const postUpdateSchema = postInputSchema.partial().extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

export type PostInput = z.infer<typeof postInputSchema>
export type PostUpdate = z.infer<typeof postUpdateSchema>

export function deriveSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

export function computeReadingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
