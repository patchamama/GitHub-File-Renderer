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
    return `<div class="code-block">${langLabel}<pre><code class="hljs ${language ?? ''}">${highlighted}</code></pre></div>`
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
