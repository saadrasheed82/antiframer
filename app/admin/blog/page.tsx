import Link from 'next/link'
import { listAll } from '@/lib/blog/posts'
import { PostTable } from '@/components/admin/PostTable'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminBlogPage({ searchParams }: Props) {
  const sp = await searchParams
  const status = (['draft', 'published', 'archived'] as const).find(s => s === sp.status)
  const posts = await listAll({ status })

  return (
    <main style={{ padding: '40px 28px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, letterSpacing: '-0.05em' }}>Posts</h1>
        <Link
          href="/admin/blog/new"
          style={{ padding: '12px 20px', background: 'var(--red)', color: '#fff', borderRadius: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}
        >
          + New post
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <Link href="/admin/blog" style={{ opacity: !status ? 1 : 0.4 }}>All</Link>
        <Link href="/admin/blog?status=draft" style={{ opacity: status === 'draft' ? 1 : 0.4 }}>Drafts</Link>
        <Link href="/admin/blog?status=published" style={{ opacity: status === 'published' ? 1 : 0.4 }}>Published</Link>
        <Link href="/admin/blog?status=archived" style={{ opacity: status === 'archived' ? 1 : 0.4 }}>Archived</Link>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--muted)', padding: '40px 0' }}>No posts yet. Create one or POST to /api/posts.</p>
      ) : (
        <PostTable posts={posts} />
      )}
    </main>
  )
}
