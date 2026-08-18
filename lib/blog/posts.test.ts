import { describe, it, expect, beforeAll } from 'vitest'

const runIntegration =
  !!process.env.SUPABASE_PROJECT_ID &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('PENDING')

describe.skipIf(!runIntegration)('posts integration', () => {
  let posts: typeof import('./posts')

  beforeAll(async () => {
    posts = await import('./posts')
  })

  it('create → get → list → update → archive round-trip', async () => {
    const created = await posts.createPost({
      title: 'Test post',
      content_md: '# Test\n\nbody',
      status: 'published',
      tags: ['test-tag'],
    })
    expect(created.slug).toBe('test-post')

    const fetched = await posts.getPublishedBySlug('test-post')
    expect(fetched?.title).toBe('Test post')
    expect(fetched?.tags.map(t => t.slug)).toEqual(['test-tag'])

    const { posts: list, total } = await posts.listPublished({ tag: 'test-tag' })
    expect(total).toBeGreaterThanOrEqual(1)
    expect(list.some(p => p.slug === 'test-post')).toBe(true)

    const updated = await posts.updatePost('test-post', { title: 'Renamed' })
    expect(updated?.title).toBe('Renamed')

    const archived = await posts.archivePost('test-post')
    expect(archived).toBe(true)

    const gone = await posts.getPublishedBySlug('test-post')
    expect(gone).toBeNull()
  }, 30_000)

  it('throws SlugConflictError on duplicate slug', async () => {
    await posts.createPost({ title: 'Conflict A', slug: 'conflict-a', content_md: 'body', status: 'draft' })
    await expect(
      posts.createPost({ title: 'Conflict B', slug: 'conflict-a', content_md: 'body', status: 'draft' })
    ).rejects.toThrow(posts.SlugConflictError)
    await posts.archivePost('conflict-a')
  }, 30_000)
})

// Unit tests for pure logic that doesn't hit Supabase.
describe('posts unit', () => {
  it('SlugConflictError carries the slug in its message', async () => {
    const { SlugConflictError } = await import('./posts')
    const err = new SlugConflictError('foo-bar')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('SlugConflictError')
    expect(err.message).toContain('foo-bar')
  })

  it('toPostWithTags flattens post_tags join rows and drops nulls', async () => {
    const { __test } = await import('./posts')
    const row = {
      id: 'p1',
      slug: 'hello-world',
      title: 'Hello World',
      excerpt: null,
      content_md: '# hi',
      cover_image_url: null,
      status: 'published' as const,
      author_name: 'Saad Rasheed',
      published_at: '2026-08-17T00:00:00Z',
      reading_minutes: 1,
      created_at: '2026-08-17T00:00:00Z',
      updated_at: '2026-08-17T00:00:00Z',
      post_tags: [
        { tag: { id: 't1', slug: 'a', name: 'a' } },
        { tag: null },
        { tag: { id: 't2', slug: 'b', name: 'b' } },
      ],
    }
    const out = __test.toPostWithTags(row)
    expect(out.tags.map(t => t.slug)).toEqual(['a', 'b'])
    expect(out.slug).toBe('hello-world')
    expect('post_tags' in out).toBe(false)
  })

  it('toPostWithTags handles null post_tags', async () => {
    const { __test } = await import('./posts')
    const row = {
      id: 'p1',
      slug: 'x',
      title: 'X',
      excerpt: null,
      content_md: 'body',
      cover_image_url: null,
      status: 'draft' as const,
      author_name: 'Saad Rasheed',
      published_at: null,
      reading_minutes: 1,
      created_at: '2026-08-17T00:00:00Z',
      updated_at: '2026-08-17T00:00:00Z',
      post_tags: null,
    }
    const out = __test.toPostWithTags(row)
    expect(out.tags).toEqual([])
  })
})
