import type { Metadata } from 'next'
import type { PostWithTags } from './types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const SITE_NAME = 'Anti Framer'
const DEFAULT_AUTHOR = 'Saad Rasheed'

export function generatePostMetadata(post: PostWithTags): Metadata {
  const url = `${SITE_URL}/blog/${post.slug}`
  const description = post.excerpt ?? post.content_md.replace(/[#*_\n]/g, ' ').slice(0, 160).trim()
  return {
    title: `${post.title} — ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  }
}

export function blogPostingJsonLd(post: PostWithTags) {
  const url = `${SITE_URL}/blog/${post.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image_url ?? undefined,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author_name || DEFAULT_AUTHOR,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }
}
