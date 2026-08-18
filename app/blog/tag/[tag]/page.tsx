import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { listPublished, listTagsWithCounts } from '@/lib/blog/posts'
import { PostCard } from '@/components/blog/PostCard'
import { Pagination } from '@/components/blog/Pagination'

export const revalidate = 60

interface Props {
  params: Promise<{ tag: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  return {
    title: `${tag} — Anti Framer Journal`,
    description: `Articles and notes on ${tag} from Anti Framer.`,
    alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/tag/${tag}` },
  }
}

export default async function TagArchivePage({ params, searchParams }: Props) {
  const { tag } = await params
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  // 404 for unknown tags (no published posts OR tag doesn't exist)
  const tags = await listTagsWithCounts()
  const tagInfo = tags.find(t => t.slug === tag)
  if (!tagInfo) notFound()

  const { posts, total } = await listPublished({ page, perPage: 12, tag })
  const totalPages = Math.ceil(total / 12)

  return (
    <main style={{ padding: '120px 28px 80px', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 60 }}>
        <p className="eyebrow" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.13em', fontSize: 10, fontWeight: 600 }}>Topic</p>
        <h1 style={{ fontSize: 'clamp(56px, 8vw, 110px)', lineHeight: 0.9, letterSpacing: '-0.06em', fontWeight: 800, margin: '12px 0 0', textTransform: 'lowercase' }}>#{tag}</h1>
        <p style={{ marginTop: 12, color: 'var(--muted)' }}>{tagInfo.count} {tagInfo.count === 1 ? 'article' : 'articles'}</p>
      </header>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 40 }}>
        {posts.map(p => <PostCard key={p.id} post={p} />)}
      </section>
      <Pagination page={page} totalPages={totalPages} basePath={`/blog/tag/${tag}`} />
    </main>
  )
}
