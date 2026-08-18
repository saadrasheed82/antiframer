import Link from 'next/link'
import { logout } from '../login/actions'

export default function AdminBlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
        <div style={{ display: 'flex', gap: 24, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <Link href="/admin/blog" style={{ fontWeight: 700 }}>Posts</Link>
          <Link href="/admin/blog/new">+ New</Link>
          <Link href="/blog" target="_blank" style={{ color: 'var(--muted)' }}>View public →</Link>
        </div>
        <form action={logout}>
          <button type="submit" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
        </form>
      </nav>
      {children}
    </>
  )
}
