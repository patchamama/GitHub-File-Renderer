import { resolveAssetUrl } from './asset-resolver'
import { parseGithubUrl } from './github-url-parser'

const NAV_INJECTION = `
<script>
(function() {
  document.addEventListener('click', function(e) {
    var el = e.target.closest('a[data-github-nav]');
    if (!el) return;
    e.preventDefault();
    window.parent.postMessage({ type: 'GITHUB_NAV', url: el.getAttribute('data-github-raw') }, '*');
  });
})();
</script>
`

function rewriteSrcset(srcset: string, repoBase: string, filePath: string): string {
  return srcset
    .split(',')
    .map((part) => {
      const [url, ...rest] = part.trim().split(/\s+/)
      const resolved = resolveAssetUrl(url, repoBase, filePath)
      return [resolved, ...rest].join(' ')
    })
    .join(', ')
}

function rewriteStyleContent(css: string, repoBase: string, filePath: string): string {
  return css.replace(/url\(['"]?([^'")\s]+)['"]?\)/g, (_, url: string) => {
    const resolved = resolveAssetUrl(url, repoBase, filePath)
    return `url("${resolved}")`
  })
}

/**
 * Rewrites all relative asset URLs in raw HTML to absolute raw GitHub URLs.
 * Also injects navigation intercept script for in-repo links.
 */
export function rewriteHtml(
  rawHtml: string,
  repoBase: string,
  currentFilePath: string,
): string {
  const doc = new DOMParser().parseFromString(rawHtml, 'text/html')

  // Rewrite src attributes
  doc.querySelectorAll('[src]').forEach((el) => {
    const src = el.getAttribute('src')
    if (src) el.setAttribute('src', resolveAssetUrl(src, repoBase, currentFilePath))
  })

  // Rewrite srcset
  doc.querySelectorAll('[srcset]').forEach((el) => {
    const srcset = el.getAttribute('srcset')
    if (srcset) el.setAttribute('srcset', rewriteSrcset(srcset, repoBase, currentFilePath))
  })

  // Rewrite link href (stylesheets, favicons)
  doc.querySelectorAll('link[href]').forEach((el) => {
    const href = el.getAttribute('href')
    if (href) el.setAttribute('href', resolveAssetUrl(href, repoBase, currentFilePath))
  })

  // Rewrite inline styles url()
  doc.querySelectorAll('style').forEach((el) => {
    el.textContent = rewriteStyleContent(el.textContent ?? '', repoBase, currentFilePath)
  })

  // Rewrite inline style attributes
  doc.querySelectorAll('[style]').forEach((el) => {
    const style = el.getAttribute('style')
    if (style) el.setAttribute('style', rewriteStyleContent(style, repoBase, currentFilePath))
  })

  // Rewrite anchor hrefs - detect in-repo links
  doc.querySelectorAll('a[href]').forEach((el) => {
    const href = el.getAttribute('href')
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return
    }

    // Already absolute — check if it's a GitHub URL we can navigate
    if (/^https?:\/\//.test(href)) {
      const parsed = parseGithubUrl(href)
      if (parsed) {
        el.setAttribute('data-github-nav', 'true')
        el.setAttribute('data-github-raw', parsed.rawUrl)
        el.setAttribute('href', '#')
      }
      return
    }

    // Relative path — resolve and treat as in-repo navigation
    const resolved = resolveAssetUrl(href, repoBase, currentFilePath)
    // Only navigate to known text-based files
    const ext = href.split('?')[0].split('.').pop()?.toLowerCase() ?? ''
    const navExts = ['html', 'htm', 'md', 'markdown', 'css', 'xml', 'txt']
    if (navExts.includes(ext)) {
      el.setAttribute('data-github-nav', 'true')
      el.setAttribute('data-github-raw', resolved)
      el.setAttribute('href', '#')
    } else {
      // Asset link — open externally
      el.setAttribute('href', resolved)
      el.setAttribute('target', '_blank')
      el.setAttribute('rel', 'noopener noreferrer')
    }
  })

  // Inject nav script before </body>
  const script = doc.createElement('div')
  script.innerHTML = NAV_INJECTION
  doc.body.appendChild(script.firstChild!)

  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML
}
