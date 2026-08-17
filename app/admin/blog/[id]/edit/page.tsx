import { notFound } from 'next/navigation'
import { getBySlug } from '@/lib/blog/posts'
import { PostEditor } from '@/components/admin/PostEditor'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>  // actually a slug; dir name kept [id] for spec conformance
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params
  const post = await getBySlug(id)
  if (!post) notFound()

  return (
    <main style={{ padding: '40px 28px', maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 30px', fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 800, letterSpacing: '-0.05em' }}>Edit: {post.title}</h1>
      <PostEditor post={post} />
    </main>
  )
}
