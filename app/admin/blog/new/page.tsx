import { PostEditor } from '@/components/admin/PostEditor'

export const dynamic = 'force-dynamic'

export default function NewPostPage() {
  return (
    <main style={{ padding: '40px 28px', maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 30px', fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 800, letterSpacing: '-0.05em' }}>New post</h1>
      <PostEditor />
    </main>
  )
}
