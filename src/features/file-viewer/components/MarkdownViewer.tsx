import { useEffect, useRef } from 'react'
import { renderMarkdown } from '../../../shared/lib/markdown-renderer'
import { useSettingsStore, fontSizeMap, readingWidthMap, fontFamilyMap, inlineCodeFontMap } from '../../../shared/store/settingsStore'
import type { ParsedGithubUrl } from '../../../shared/types/github'
import 'highlight.js/styles/github-dark-dimmed.css'

interface Props {
  content: string
  parsed: ParsedGithubUrl
  onNavigate: (rawUrl: string) => void
}

export function MarkdownViewer({ content, parsed, onNavigate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { fontSize, fontFamily, readingWidth, inlineCodeBg, inlineCodeFont } = useSettingsStore()
  const html = renderMarkdown(content, parsed.repoBase, parsed.filePath)

  // In-repo link navigation
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

  // Copy code button
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    async function handleCopy(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest('[data-copy-btn]') as HTMLElement | null
      if (!btn) return
      const encoded = btn.getAttribute('data-code') ?? ''
      const text = decodeURIComponent(escape(atob(encoded)))
      try {
        await navigator.clipboard.writeText(text)
        btn.classList.add('copied')
        setTimeout(() => btn.classList.remove('copied'), 2000)
      } catch {
        // clipboard not available
      }
    }

    container.addEventListener('click', handleCopy)
    return () => container.removeEventListener('click', handleCopy)
  }, [])

  const proseClass = [
    fontSizeMap[fontSize],
    'dark:prose-invert',
    readingWidthMap[readingWidth],
    'mx-auto px-4 py-6',
  ].join(' ')

  return (
    <div
      ref={containerRef}
      className={proseClass}
      style={{
        '--prose-font': fontFamilyMap[fontFamily],
        '--inline-code-bg': inlineCodeBg,
        '--inline-code-font': inlineCodeFontMap[inlineCodeFont],
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
