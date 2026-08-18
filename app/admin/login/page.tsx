import { login } from './actions'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const sp = await searchParams

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--pink)',
      }}
    >
      <form
        action={login}
        style={{
          background: '#fff',
          padding: 40,
          borderRadius: 8,
          width: 360,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em' }}>
          Studio login
        </h1>
        {sp.error && (
          <p style={{ color: 'var(--red)', margin: 0, fontSize: 13 }}>{sp.error}</p>
        )}
        <input type="hidden" name="next" value={sp.next ?? '/admin/blog'} />
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            style={{
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              font: 'inherit',
            }}
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            style={{
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              font: 'inherit',
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            padding: '14px 16px',
            background: 'var(--red)',
            color: '#fff',
            borderRadius: 4,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: 12,
          }}
        >
          Sign in
        </button>
      </form>
    </main>
  )
}
