import { useQuery } from '@tanstack/react-query'

async function fetchGithubFile(rawUrl: string): Promise<string> {
  const response = await fetch(rawUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`)
  }
  return response.text()
}

export function useGithubFile(rawUrl: string | null) {
  return useQuery({
    queryKey: ['github-file', rawUrl],
    queryFn: () => fetchGithubFile(rawUrl!),
    enabled: !!rawUrl,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
