import { describe, it, expect } from 'vitest'
import { postInputSchema, postUpdateSchema, deriveSlug, computeReadingMinutes } from './validation'

describe('postInputSchema', () => {
  const valid = {
    title: 'Hello world',
    content_md: '# Hi\n\nSome body text.',
  }

  it('accepts minimal valid input', () => {
    expect(() => postInputSchema.parse(valid)).not.toThrow()
  })

  it('rejects empty title', () => {
    const r = postInputSchema.safeParse({ ...valid, title: '' })
    expect(r.success).toBe(false)
  })

  it('rejects title over 200 chars', () => {
    const r = postInputSchema.safeParse({ ...valid, title: 'x'.repeat(201) })
    expect(r.success).toBe(false)
  })

  it('rejects bad slug format', () => {
    const r = postInputSchema.safeParse({ ...valid, slug: 'Not Kebab!' })
    expect(r.success).toBe(false)
  })

  it('accepts valid slug', () => {
    const r = postInputSchema.safeParse({ ...valid, slug: 'hello-world-2' })
    expect(r.success).toBe(true)
  })

  it('rejects more than 10 tags', () => {
    const r = postInputSchema.safeParse({ ...valid, tags: Array.from({ length: 11 }, (_, i) => `tag-${i}`) })
    expect(r.success).toBe(false)
  })

  it('rejects excerpt over 300 chars', () => {
    const r = postInputSchema.safeParse({ ...valid, excerpt: 'x'.repeat(301) })
    expect(r.success).toBe(false)
  })

  it('defaults status to draft', () => {
    const r = postInputSchema.parse(valid)
    expect(r.status).toBe('draft')
  })
})

describe('postUpdateSchema', () => {
  it('accepts empty object', () => {
    expect(postUpdateSchema.parse({})).toEqual({})
  })
  it('rejects invalid status', () => {
    expect(postUpdateSchema.safeParse({ status: 'weird' }).success).toBe(false)
  })
})

describe('deriveSlug', () => {
  it('kebab-cases basic title', () => {
    expect(deriveSlug('Hello World')).toBe('hello-world')
  })
  it('strips punctuation', () => {
    expect(deriveSlug("useEffect mistakes you're still making!")).toBe('useeffect-mistakes-youre-still-making')
  })
  it('collapses dashes and trims', () => {
    expect(deriveSlug('- Hello  -- World -')).toBe('hello-world')
  })
  it('returns empty string for no alphanumeric', () => {
    expect(deriveSlug('!!!')).toBe('')
  })
})

describe('computeReadingMinutes', () => {
  it('returns 1 for short content', () => {
    expect(computeReadingMinutes('just a few words')).toBe(1)
  })
  it('rounds up', () => {
    const words = Array.from({ length: 250 }, () => 'word').join(' ')
    expect(computeReadingMinutes(words)).toBe(2)
  })
})
