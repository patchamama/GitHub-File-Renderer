interface Props {
  content: string
  fileType: string
}

export function PlainTextViewer({ content, fileType }: Props) {
  return (
    <pre className="w-full overflow-auto p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm font-mono leading-relaxed rounded-lg border border-gray-200 dark:border-gray-700">
      <code className={`language-${fileType}`}>{content}</code>
    </pre>
  )
}
