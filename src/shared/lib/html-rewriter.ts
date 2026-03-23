import { resolveAssetUrl } from './asset-resolver'
import { parseGithubUrl } from './github-url-parser'


function rewriteStyleContent(css: string, repoBase: string, filePath: string): string {
  return css.replace(/url\(['"]?([^'")\s]+)['"]?\)/g, (_, url: string) => {
    const resolved = resolveAssetUrl(url, repoBase, filePath)
    return `url("${resolved}")`
  })
}

/**
 * Parses the HTML and collects all external CSS and JS URLs that need to be inlined.
 * Returns the list so the caller (HtmlViewer) can fetch them and call inlineAssets().
 */
export function collectAssetUrls(
  rawHtml: string,
  repoBase: string,
  currentFilePath: string,
): { cssUrls: string[]; jsUrls: string[] } {
  const doc = new DOMParser().parseFromString(rawHtml, 'text/html')

  const cssUrls: string[] = []
  const jsUrls: string[] = []

  doc.querySelectorAll('link[rel="stylesheet"][href]').forEach((el) => {
    const href = el.getAttribute('href')!
    if (!href.startsWith('data:') && !/^https?:\/\//.test(href)) {
      cssUrls.push(resolveAssetUrl(href, repoBase, currentFilePath))
    } else if (/^https?:\/\//.test(href)) {
      // Keep only same raw.githubusercontent.com assets
      if (href.includes('raw.githubusercontent.com') || href.includes('github.com')) {
        cssUrls.push(resolveAssetUrl(href, repoBase, currentFilePath))
      }
    }
  })

  doc.querySelectorAll('script[src]').forEach((el) => {
    const src = el.getAttribute('src')!
    if (!src.startsWith('data:') && !/^https?:\/\//.test(src)) {
      jsUrls.push(resolveAssetUrl(src, repoBase, currentFilePath))
    } else if (/^https?:\/\//.test(src)) {
      if (src.includes('raw.githubusercontent.com') || src.includes('github.com')) {
        jsUrls.push(resolveAssetUrl(src, repoBase, currentFilePath))
      }
    }
  })

  return { cssUrls, jsUrls }
}

/**
 * Rewrites the HTML with all assets inlined:
 * - CSS <link> tags replaced with <style> containing the fetched content
 * - <script src> replaced with inline <script> blocks
 * - Image src rewritten to absolute URLs (they load fine via CORS)
 * - Anchor hrefs intercepted for in-repo navigation
 */
export function rewriteHtmlWithInlinedAssets(
  rawHtml: string,
  repoBase: string,
  currentFilePath: string,
  cssMap: Map<string, string>,
  jsMap: Map<string, string>,
): string {
  const doc = new DOMParser().parseFromString(rawHtml, 'text/html')

  // Inline CSS: replace <link rel="stylesheet"> with <style>
  doc.querySelectorAll('link[rel="stylesheet"][href]').forEach((el) => {
    const href = el.getAttribute('href')!
    const resolved = resolveAssetUrl(href, repoBase, currentFilePath)
    const css = cssMap.get(resolved)
    if (css !== undefined) {
      const style = doc.createElement('style')
      // Also rewrite url() inside the fetched CSS
      style.textContent = rewriteStyleContent(css, repoBase, currentFilePath)
      el.replaceWith(style)
    } else {
      // Fallback: rewrite href to absolute (won't load but at least correct)
      el.setAttribute('href', resolved)
    }
  })

  // Inline JS: replace <script src> with inline <script>
  doc.querySelectorAll('script[src]').forEach((el) => {
    const src = el.getAttribute('src')!
    const resolved = resolveAssetUrl(src, repoBase, currentFilePath)
    const js = jsMap.get(resolved)
    if (js !== undefined) {
      const script = doc.createElement('script')
      script.textContent = js
      // Copy other attributes (type, defer, etc.) except src
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name !== 'src') script.setAttribute(attr.name, attr.value)
      })
      el.replaceWith(script)
    } else {
      el.setAttribute('src', resolved)
    }
  })

  // Rewrite srcset
  doc.querySelectorAll('[srcset]').forEach((el) => {
    const srcset = el.getAttribute('srcset')!
    const rewritten = srcset
      .split(',')
      .map((part) => {
        const [url, ...rest] = part.trim().split(/\s+/)
        return [resolveAssetUrl(url, repoBase, currentFilePath), ...rest].join(' ')
      })
      .join(', ')
    el.setAttribute('srcset', rewritten)
  })

  // Rewrite remaining src (images, video, audio, etc.)
  doc.querySelectorAll('[src]:not(script)').forEach((el) => {
    const src = el.getAttribute('src')
    if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
      el.setAttribute('src', resolveAssetUrl(src, repoBase, currentFilePath))
    }
  })

  // Rewrite remaining link href (favicons, etc.)
  doc.querySelectorAll('link[href]').forEach((el) => {
    const href = el.getAttribute('href')
    if (href && !href.startsWith('data:')) {
      el.setAttribute('href', resolveAssetUrl(href, repoBase, currentFilePath))
    }
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

  // Rewrite anchor hrefs — detect in-repo links
  doc.querySelectorAll('a[href]').forEach((el) => {
    const href = el.getAttribute('href')
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('javascript:') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return
    }

    if (/^https?:\/\//.test(href)) {
      const parsed = parseGithubUrl(href)
      if (parsed) {
        el.setAttribute('data-github-nav', 'true')
        el.setAttribute('data-github-raw', parsed.rawUrl)
        el.setAttribute('href', '#')
      }
      return
    }

    const resolved = resolveAssetUrl(href, repoBase, currentFilePath)
    const ext = href.split('?')[0].split('.').pop()?.toLowerCase() ?? ''
    const navExts = ['html', 'htm', 'md', 'markdown', 'xml', 'txt']
    if (navExts.includes(ext)) {
      el.setAttribute('data-github-nav', 'true')
      el.setAttribute('data-github-raw', resolved)
      el.setAttribute('href', '#')
    } else {
      el.setAttribute('href', resolved)
      el.setAttribute('target', '_blank')
      el.setAttribute('rel', 'noopener noreferrer')
    }
  })

  // Inject nav script — create the element directly to avoid TextNode firstChild bug
  const navScript = doc.createElement('script')
  navScript.textContent = `
(function() {
  document.addEventListener('click', function(e) {
    var el = e.target.closest('a[data-github-nav]');
    if (!el) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.parent.postMessage({ type: 'GITHUB_NAV', url: el.getAttribute('data-github-raw') }, '*');
  }, true);
})();
`
  doc.body.appendChild(navScript)

  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML
}
