import { useState, type FormEvent } from 'react'
import { parseGithubUrl } from '../../../shared/lib/github-url-parser'

interface Props {
  initialUrl?: string
  onSubmit: (url: string) => void
}

export function UrlInputForm({ initialUrl = '', onSubmit }: Props) {
  const [value, setValue] = useState(initialUrl)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Please enter a GitHub URL')
      return
    }
    const parsed = parseGithubUrl(trimmed)
    if (!parsed) {
      setError('Invalid GitHub URL. Paste a blob or raw link from github.com or raw.githubusercontent.com')
      return
    }
    setError(null)
    onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          placeholder="https://github.com/owner/repo/blob/main/file.html"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
          spellCheck={false}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
        >
          Render
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  )
}
