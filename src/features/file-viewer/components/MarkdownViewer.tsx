import { useEffect, useRef } from 'react'
import { renderMarkdown } from '../../../shared/lib/markdown-renderer'
import type { ParsedGithubUrl } from '../../../shared/types/github'

interface Props {
  content: string
  parsed: ParsedGithubUrl
  onNavigate: (rawUrl: string) => void
}

export function MarkdownViewer({ content, parsed, onNavigate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const html = renderMarkdown(content, parsed.repoBase, parsed.filePath)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('a[data-github-nav]')
      if (!target) return
      e.preventDefault()
      const raw = target.getAttribute('data-github-raw')
      if (raw) onNavigate(raw)
    }

    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [onNavigate])

  return (
    <div
      ref={containerRef}
      className="prose dark:prose-invert max-w-none px-4 py-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
