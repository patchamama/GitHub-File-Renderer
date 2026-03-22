interface Props {
  message: string
}

export function ErrorState({ message }: Props) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
      <svg className="h-5 w-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-9.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75-1.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  )
}
