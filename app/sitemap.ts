import type { MetadataRoute } from 'next'
import { listPublished, listTagsWithCounts } from '@/lib/blog/posts'

export const revalidate = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]

  const { posts } = await listPublished({ page: 1, perPage: 50 })
  const postRoutes: MetadataRoute.Sitemap = posts.map(p => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const tags = await listTagsWithCounts()
  const tagRoutes: MetadataRoute.Sitemap = tags.map(t => ({
    url: `${SITE_URL}/blog/tag/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticRoutes, ...postRoutes, ...tagRoutes]
}
