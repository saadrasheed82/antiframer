import Link from 'next/link'

interface Props {
  page: number
  totalPages: number
  basePath: string  // e.g. '/blog' or '/blog/tag/react'
}

export function Pagination({ page, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null
  const url = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`)
  return (
    <nav style={{ display: 'flex', gap: 12, marginTop: 40, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }} aria-label="Pagination">
      {page > 1 && <Link href={url(page - 1)}>← Prev</Link>}
      <span style={{ color: 'var(--muted)' }}>Page {page} / {totalPages}</span>
      {page < totalPages && <Link href={url(page + 1)}>Next →</Link>}
    </nav>
  )
}
