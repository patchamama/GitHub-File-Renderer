import { useEffect, useRef } from 'react'
import { rewriteHtml } from '../../../shared/lib/html-rewriter'
import type { ParsedGithubUrl } from '../../../shared/types/github'

interface Props {
  content: string
  parsed: ParsedGithubUrl
  onNavigate: (rawUrl: string) => void
}

export function HtmlViewer({ content, parsed, onNavigate }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const rewritten = rewriteHtml(content, parsed.repoBase, parsed.filePath)

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'GITHUB_NAV' && typeof e.data.url === 'string') {
        onNavigate(e.data.url)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onNavigate])

  return (
    <iframe
      ref={iframeRef}
      srcDoc={rewritten}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      className="w-full border-none"
      style={{ height: 'calc(100vh - 120px)', minHeight: '400px' }}
      title="GitHub file preview"
    />
  )
}
