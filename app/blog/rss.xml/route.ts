import { listPublished } from '@/lib/blog/posts'
import { renderMarkdownToHtml } from '@/lib/blog/markdown'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const SITE_NAME = 'Anti Framer'
const DESCRIPTION = 'Strategy, craft, and behind-the-scenes from an AI creative studio.'

export const revalidate = 300

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const { posts } = await listPublished({ page: 1, perPage: 50 })

  const items = await Promise.all(
    posts.map(async p => {
      const url = `${SITE_URL}/blog/${p.slug}`
      const html = await renderMarkdownToHtml(p.content_md)
      return `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.published_at ?? p.created_at).toUTCString()}</pubDate>
      <author>hello@antiframer.com (${escapeXml(p.author_name)})</author>
      ${p.excerpt ? `<description>${escapeXml(p.excerpt)}</description>` : ''}
      <content:encoded><![CDATA[${html}]]></content:encoded>
      ${p.tags.map(t => `<category>${escapeXml(t.slug)}</category>`).join('\n      ')}
    </item>`
    })
  )

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} — Journal</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(DESCRIPTION)}</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items.join('\n')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
    },
  })
}
