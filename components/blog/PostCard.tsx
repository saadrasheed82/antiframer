import Link from 'next/link'
import Image from 'next/image'
import type { PostWithTags } from '@/lib/blog/types'
import { TagChip } from './TagChip'

export function PostCard({ post }: { post: PostWithTags }) {
  return (
    <article className="post-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {post.cover_image_url && (
        <Link href={`/blog/${post.slug}`} style={{ display: 'block', position: 'relative', aspectRatio: '16/9', overflow: 'hidden', borderRadius: 6 }}>
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            sizes="(max-width: 720px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        </Link>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {post.tags.map(t => <TagChip key={t.id} tag={t} />)}
      </div>
      <h2 style={{ margin: 0, fontSize: 'clamp(20px, 2.4vw, 26px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      {post.excerpt && <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.5 }}>{post.excerpt}</p>}
      <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {post.published_at && new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        {post.reading_minutes != null && ` · ${post.reading_minutes} min read`}
      </p>
    </article>
  )
}
