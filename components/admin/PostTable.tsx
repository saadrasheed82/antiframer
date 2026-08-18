import Link from 'next/link'
import { archivePostAction } from './PostEditorActions'
import type { PostWithTags } from '@/lib/blog/types'

const statusColor: Record<string, string> = {
  draft: 'var(--muted)',
  published: 'var(--red)',
  archived: '#999',
}

export function PostTable({ posts }: { posts: PostWithTags[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10, color: 'var(--muted)' }}>
          <th style={{ padding: '14px 12px' }}>Title</th>
          <th style={{ padding: '14px 12px' }}>Status</th>
          <th style={{ padding: '14px 12px' }}>Published</th>
          <th style={{ padding: '14px 12px' }}>Updated</th>
          <th style={{ padding: '14px 12px' }}>Tags</th>
          <th style={{ padding: '14px 12px', textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {posts.map(p => (
          <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={{ padding: '14px 12px', fontWeight: 500 }}>{p.title}</td>
            <td style={{ padding: '14px 12px' }}>
              <span style={{ color: statusColor[p.status], textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.1em', fontWeight: 700 }}>
                {p.status}
              </span>
            </td>
            <td style={{ padding: '14px 12px', color: 'var(--muted)', fontSize: 12 }}>
              {p.published_at ? new Date(p.published_at).toLocaleDateString() : '—'}
            </td>
            <td style={{ padding: '14px 12px', color: 'var(--muted)', fontSize: 12 }}>
              {new Date(p.updated_at).toLocaleDateString()}
            </td>
            <td style={{ padding: '14px 12px', color: 'var(--muted)', fontSize: 12 }}>
              {p.tags.map(t => t.slug).join(', ') || '—'}
            </td>
            <td style={{ padding: '14px 12px', textAlign: 'right', fontSize: 12 }}>
              <Link href={`/admin/blog/${p.slug}/edit`} style={{ marginRight: 14 }}>Edit</Link>
              {p.status === 'published' && (
                <Link href={`/blog/${p.slug}`} target="_blank" style={{ marginRight: 14 }}>View</Link>
              )}
              {p.status !== 'archived' && (
                <form action={archivePostAction.bind(null, p.slug)} style={{ display: 'inline' }}>
                  <button type="submit" style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>Archive</button>
                </form>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
