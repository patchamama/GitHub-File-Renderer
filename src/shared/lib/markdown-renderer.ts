import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import java from 'highlight.js/lib/languages/java'
import php from 'highlight.js/lib/languages/php'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import sql from 'highlight.js/lib/languages/sql'
import rust from 'highlight.js/lib/languages/rust'
import go from 'highlight.js/lib/languages/go'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import ruby from 'highlight.js/lib/languages/ruby'
import yaml from 'highlight.js/lib/languages/yaml'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import plaintext from 'highlight.js/lib/languages/plaintext'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('java', java)
hljs.registerLanguage('php', php)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('rs', rust)
hljs.registerLanguage('go', go)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c', cpp)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('cs', csharp)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('rb', ruby)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('dockerfile', dockerfile)
hljs.registerLanguage('plaintext', plaintext)
import { resolveAssetUrl } from './asset-resolver'
import { parseGithubUrl } from './github-url-parser'

/**
 * Generates a heading ID following GitHub's algorithm:
 * lowercase, strip punctuation except hyphens, replace spaces with hyphens.
 * Preserves accented characters (á, é, ñ, etc.) so Spanish anchors work.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    // Strip HTML tags (headings can contain inline elements from marked)
    .replace(/<[^>]+>/g, '')
    // Remove characters that are not letters, digits, spaces or hyphens
    // \p{L} matches any Unicode letter (covers á, é, ñ, ü, etc.)
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
}

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

  renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
    const language = lang && hljs.getLanguage(lang) ? lang : null
    const highlighted = language
      ? hljs.highlight(text, { language }).value
      : hljs.highlightAuto(text).value
    const langLabel = lang ? `<span class="hljs-lang-label">${lang}</span>` : ''
    // base64-encode raw text to safely embed in a data attribute
    const encoded = btoa(unescape(encodeURIComponent(text)))
    const copyBtn = `<button class="copy-code-btn" data-copy-btn="true" data-code="${encoded}" aria-label="Copy code" title="Copy code">
      <svg class="copy-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <svg class="check-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </button>`
    return `<div class="code-block">${langLabel}${copyBtn}<pre><code class="hljs ${language ?? ''}">${highlighted}</code></pre></div>`
  }

  renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
    const id = slugify(text)
    // text is raw — parse inline markdown so `code`, **bold**, etc. render correctly
    const rendered = marked.parseInline(text, { renderer }) as string
    return `<h${depth} id="${id}">${rendered}</h${depth}>\n`
  }

  renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
    const titleAttr = title ? ` title="${title}"` : ''

    // Internal anchor link — keep as-is so the browser scrolls within the page
    if (href.startsWith('#')) {
      return `<a href="${href}"${titleAttr}>${text}</a>`
    }

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
