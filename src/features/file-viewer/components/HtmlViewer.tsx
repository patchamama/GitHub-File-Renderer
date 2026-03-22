import { useEffect, useRef, useState } from 'react'
import { collectAssetUrls, rewriteHtmlWithInlinedAssets } from '../../../shared/lib/html-rewriter'
import { LoadingState } from './LoadingState'
import type { ParsedGithubUrl } from '../../../shared/types/github'

interface Props {
  content: string
  parsed: ParsedGithubUrl
  onNavigate: (rawUrl: string) => void
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) return ''
  return res.text()
}

async function buildInlinedHtml(
  content: string,
  parsed: ParsedGithubUrl,
): Promise<string> {
  const { cssUrls, jsUrls } = collectAssetUrls(content, parsed.repoBase, parsed.filePath)

  const [cssResults, jsResults] = await Promise.all([
    Promise.all(cssUrls.map((url) => fetchText(url).then((text) => ({ url, text })))),
    Promise.all(jsUrls.map((url) => fetchText(url).then((text) => ({ url, text })))),
  ])

  const cssMap = new Map(cssResults.map(({ url, text }) => [url, text]))
  const jsMap = new Map(jsResults.map(({ url, text }) => [url, text]))

  return rewriteHtmlWithInlinedAssets(
    content,
    parsed.repoBase,
    parsed.filePath,
    cssMap,
    jsMap,
  )
}

export function HtmlViewer({ content, parsed, onNavigate }: Props) {
  const [srcDoc, setSrcDoc] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setSrcDoc(null)
    buildInlinedHtml(content, parsed).then(setSrcDoc)
  }, [content, parsed])

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'GITHUB_NAV' && typeof e.data.url === 'string') {
        onNavigate(e.data.url)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onNavigate])

  if (!srcDoc) return <LoadingState />

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      className="w-full border-none"
      style={{ height: 'calc(100vh - 120px)', minHeight: '400px' }}
      title="GitHub file preview"
    />
  )
}
