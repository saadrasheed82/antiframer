export type PostStatus = 'draft' | 'published' | 'archived'

export interface Tag {
  id: string
  slug: string
  name: string
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content_md: string
  cover_image_url: string | null
  status: PostStatus
  author_name: string
  published_at: string | null   // ISO timestamptz
  reading_minutes: number | null
  created_at: string
  updated_at: string
}

export interface PostWithTags extends Post {
  tags: Tag[]
}
