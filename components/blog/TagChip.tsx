import Link from 'next/link'
import type { Tag } from '@/lib/blog/types'

export function TagChip({ tag }: { tag: Tag }) {
  return (
    <Link
      href={`/blog/tag/${tag.slug}`}
      className="tag-chip"
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        border: '1px solid var(--border)',
        borderRadius: '999px',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--muted)',
      }}
    >
      {tag.name}
    </Link>
  )
}
