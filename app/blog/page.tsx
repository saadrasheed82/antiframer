import type { Metadata } from 'next'
import { listPublished } from '@/lib/blog/posts'
import { PostCard } from '@/components/blog/PostCard'
import { Pagination } from '@/components/blog/Pagination'

export const metadata: Metadata = {
  title: 'Blog — Anti Framer',
  description: 'Strategy, craft, and behind-the-scenes from an AI creative studio.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog` },
}

export const revalidate = 60

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const { posts, total } = await listPublished({ page, perPage: 12 })
  const totalPages = Math.ceil(total / 12)

  return (
    <main style={{ padding: '120px 28px 80px', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 60 }}>
        <p className="eyebrow" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.13em', fontSize: 10, fontWeight: 600 }}>Journal</p>
        <h1 style={{ fontSize: 'clamp(56px, 8vw, 110px)', lineHeight: 0.9, letterSpacing: '-0.06em', fontWeight: 800, margin: '12px 0 0' }}>From the <em style={{ fontFamily: 'Georgia, serif', fontWeight: 400 }}>studio</em></h1>
      </header>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 40 }}>
        {posts.map(p => <PostCard key={p.id} post={p} />)}
      </section>
      {posts.length === 0 && (
        <p style={{ color: 'var(--muted)', margin: '80px 0', textAlign: 'center' }}>No posts yet. Check back soon.</p>
      )}
      <Pagination page={page} totalPages={totalPages} basePath="/blog" />
    </main>
  )
}
