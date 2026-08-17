import { logout } from '../login/actions'

export default function AdminBlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--pink)' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: '#fff',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Studio admin</span>
        <form action={logout}>
          <button
            type="submit"
            style={{
              padding: '8px 14px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 4,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </form>
      </header>
      <main style={{ padding: 24 }}>{children}</main>
    </div>
  )
}
