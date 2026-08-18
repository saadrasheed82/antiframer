'use client'

import { useActionState, useState, useMemo } from 'react'
import { savePostAction } from './PostEditorActions'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import type { PostWithTags } from '@/lib/blog/types'

const input: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 4,
  font: 'inherit',
  width: '100%',
}
const label: React.CSSProperties = { display: 'grid', gap: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }

function deriveSlugPreview(title: string): string {
  return title
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

export function PostEditor({ post }: { post?: PostWithTags }) {
  const [state, formAction, pending] = useActionState(savePostAction, null)
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [content, setContent] = useState(post?.content_md ?? '')
  const [tags, setTags] = useState((post?.tags ?? []).map(t => t.slug).join(', '))

  const effectiveSlug = useMemo(() => slug || deriveSlugPreview(title), [slug, title])

  return (
    <form action={formAction} style={{ display: 'grid', gap: 20 }}>
      {state && 'error' in state && state.error && (
        <p style={{ color: 'var(--red)', margin: 0, padding: 12, border: '1px solid var(--red)', borderRadius: 4 }}>{state.error}</p>
      )}

      {post && <input type="hidden" name="existing_slug" value={post.slug} />}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <label style={label}>
          Title
          <input name="title" value={title} onChange={e => setTitle(e.target.value)} required style={input} />
        </label>
        <label style={label}>
          Slug {slug === '' && <em style={{ color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>(auto: {effectiveSlug || '—'})</em>}
          <input name="slug" value={slug} onChange={e => setSlug(e.target.value)} pattern="[a-z0-9\-]+" style={input} />
        </label>
      </div>

      <label style={label}>
        Excerpt
        <textarea name="excerpt" rows={2} defaultValue={post?.excerpt ?? ''} style={{ ...input, resize: 'vertical' }} />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <label style={label}>
          Cover image URL (https)
          <input name="cover_image_url" type="url" defaultValue={post?.cover_image_url ?? ''} style={input} />
        </label>
        <label style={label}>
          Tags (comma-separated kebab-case)
          <input name="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="react, hooks, tutorial" style={input} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, minHeight: 500 }}>
        <label style={{ ...label, display: 'flex', flexDirection: 'column' }}>
          Content (markdown)
          <textarea
            name="content_md"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            style={{ ...input, flex: 1, fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: 13, resize: 'none', minHeight: 500 }}
          />
        </label>
        <div style={{ border: '1px solid var(--border)', borderRadius: 4, padding: 20, overflow: 'auto', background: '#fafafa' }}>
          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>Preview</span>
          <div style={{ marginTop: 12 }}>
            <MarkdownRenderer source={content} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <select name="status" defaultValue={post?.status === 'published' ? 'published' : 'draft'} style={input}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button
          type="submit"
          disabled={pending}
          style={{ padding: '14px 24px', background: 'var(--red)', color: '#fff', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 12, opacity: pending ? 0.5 : 1, border: 'none', cursor: pending ? 'default' : 'pointer' }}
        >
          {pending ? 'Saving…' : post ? 'Save changes' : 'Create post'}
        </button>
      </div>
    </form>
  )
}
