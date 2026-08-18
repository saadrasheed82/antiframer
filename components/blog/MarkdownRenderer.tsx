import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import type { Components } from 'react-markdown'

const components: Components = {
  a: ({ href, children, ...rest }) => {
    const external = href && (href.startsWith('http://') || href.startsWith('https://'))
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    )
  },
}

export function MarkdownRenderer({ source }: { source: string }) {
  return (
    <article className="blog-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }], rehypeHighlight]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </article>
  )
}
