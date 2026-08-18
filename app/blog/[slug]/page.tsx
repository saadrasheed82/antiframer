import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getPublishedBySlug, listRelated } from '@/lib/blog/posts'
import { generatePostMetadata, blogPostingJsonLd } from '@/lib/blog/seo'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { TagChip } from '@/components/blog/TagChip'
import { PostCard } from '@/components/blog/PostCard'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPublishedBySlug(slug)
  if (!post) return {}
  return generatePostMetadata(post)
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPublishedBySlug(slug)
  if (!post) notFound()

  const related = await listRelated(post.id, 3)
  const jsonLd = blogPostingJsonLd(post)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{ padding: '120px 28px 80px', maxWidth: 720, margin: '0 auto' }}>
        <nav style={{ marginBottom: 30, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>
          <Link href="/blog">← Journal</Link>
        </nav>
        <header style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {post.tags.map(t => <TagChip key={t.id} tag={t} />)}
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', lineHeight: 1, letterSpacing: '-0.05em', fontWeight: 800, margin: 0 }}>{post.title}</h1>
          <p style={{ marginTop: 18, fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {post.author_name}
            {post.published_at && ` · ${new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
            {post.reading_minutes != null && ` · ${post.reading_minutes} min read`}
          </p>
        </header>

        {post.cover_image_url && (
          <div style={{ position: 'relative', aspectRatio: '16/9', margin: '30px 0 50px', borderRadius: 6, overflow: 'hidden' }}>
            <Image src={post.cover_image_url} alt={post.title} fill sizes="720px" priority style={{ objectFit: 'cover' }} />
          </div>
        )}

        <MarkdownRenderer source={post.content_md} />

        {related.length > 0 && (
          <section style={{ marginTop: 100, paddingTop: 60, borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.05em', fontWeight: 800, marginBottom: 30 }}>Keep reading</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30 }}>
              {related.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
