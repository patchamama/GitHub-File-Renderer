import { useGithubFile } from '../hooks/useGithubFile'
import { HtmlViewer } from './HtmlViewer'
import { MarkdownViewer } from './MarkdownViewer'
import { PlainTextViewer } from './PlainTextViewer'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import type { ParsedGithubUrl } from '../../../shared/types/github'

interface Props {
  parsed: ParsedGithubUrl
  onNavigate: (rawUrl: string) => void
}

export function FileViewer({ parsed, onNavigate }: Props) {
  const { data, isLoading, error } = useGithubFile(parsed.rawUrl)

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={(error as Error).message} />
  if (!data) return null

  if (parsed.fileType === 'html') {
    return <HtmlViewer content={data} parsed={parsed} onNavigate={onNavigate} />
  }

  if (parsed.fileType === 'markdown') {
    return <MarkdownViewer content={data} parsed={parsed} onNavigate={onNavigate} />
  }

  return <PlainTextViewer content={data} fileType={parsed.fileType} />
}
