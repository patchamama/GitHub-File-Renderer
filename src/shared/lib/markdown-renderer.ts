import { marked } from 'marked'
import { resolveAssetUrl } from './asset-resolver'
import { parseGithubUrl } from './github-url-parser'

export function renderMarkdown(
  raw: string,
  repoBase: string,
  currentFilePath: string,
): string {
  const renderer = new marked.Renderer()

  renderer.image = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
    const resolved = resolveAssetUrl(href, repoBase, currentFilePath)
    const titleAttr = title ? ` title="${title}"` : ''
    return `<img src="${resolved}" alt="${text}"${titleAttr} style="max-width:100%" />`
  }

  renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
    const titleAttr = title ? ` title="${title}"` : ''
    if (/^https?:\/\//.test(href)) {
      const parsed = parseGithubUrl(href)
      if (parsed) {
        return `<a href="#" data-github-nav="true" data-github-raw="${parsed.rawUrl}"${titleAttr}>${text}</a>`
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
    }
    const resolved = resolveAssetUrl(href, repoBase, currentFilePath)
    const ext = href.split('?')[0].split('.').pop()?.toLowerCase() ?? ''
    const navExts = ['html', 'htm', 'md', 'markdown']
    if (navExts.includes(ext)) {
      return `<a href="#" data-github-nav="true" data-github-raw="${resolved}"${titleAttr}>${text}</a>`
    }
    return `<a href="${resolved}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
  }

  const result = marked(raw, { renderer }) as string
  return result
}
