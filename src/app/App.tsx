import { useState, useEffect, useCallback } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UrlInputForm } from '../features/url-input/components/UrlInputForm'
import { FileViewer } from '../features/file-viewer/components/FileViewer'
import { parseGithubUrl } from '../shared/lib/github-url-parser'

declare const __APP_VERSION__: string

const queryClient = new QueryClient()

function AppInner() {
  const [currentRawUrl, setCurrentRawUrl] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('url')
  })
  const [history, setHistory] = useState<string[]>([])

  const parsed = currentRawUrl ? parseGithubUrl(currentRawUrl) : null

  function updateUrl(rawUrl: string) {
    const params = new URLSearchParams({ url: rawUrl })
    window.history.pushState({}, '', `?${params.toString()}`)
    setCurrentRawUrl(rawUrl)
    setHistory((prev) => [...prev, rawUrl])
  }

  function handleSubmit(inputUrl: string) {
    const p = parseGithubUrl(inputUrl)
    if (p) updateUrl(p.rawUrl)
  }

  const handleNavigate = useCallback((rawUrl: string) => {
    updateUrl(rawUrl)
  }, [])

  function handleBack() {
    if (history.length < 2) return
    const prev = history[history.length - 2]
    setHistory((h) => h.slice(0, -1))
    const params = new URLSearchParams({ url: prev })
    window.history.pushState({}, '', `?${params.toString()}`)
    setCurrentRawUrl(prev)
  }

  useEffect(() => {
    function onPopState() {
      const params = new URLSearchParams(window.location.search)
      const url = params.get('url')
      setCurrentRawUrl(url)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 shrink-0">
            {history.length > 1 && (
              <button
                onClick={handleBack}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                title="Back"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                GitHub File Renderer
              </h1>
              <span className="text-xs text-gray-400 dark:text-gray-500">v{__APP_VERSION__}</span>
            </div>
          </div>
          <div className="flex-1">
            <UrlInputForm
              initialUrl={currentRawUrl ?? ''}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
        {parsed && (
          <div className="max-w-screen-xl mx-auto mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
              {parsed.owner}/{parsed.repo} · {parsed.branch} · {parsed.filePath}
            </p>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 max-w-screen-xl w-full mx-auto">
        {!parsed ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center text-gray-500 dark:text-gray-400">
            <svg className="h-12 w-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-lg font-medium mb-1">Enter a GitHub file URL to render it</p>
            <p className="text-sm">Supports HTML, Markdown, CSS, XML and plain text files</p>
          </div>
        ) : (
          <FileViewer parsed={parsed} onNavigate={handleNavigate} />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}
