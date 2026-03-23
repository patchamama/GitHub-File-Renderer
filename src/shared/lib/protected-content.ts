export interface ProtectedContent {
  passwordHash: string
  innerHtml: string
}

/**
 * Detects the SHA-256 password-protection pattern:
 *   const correctPasswordHash = '...';
 *   const protectedContent = `...`;
 *
 * Returns the hash and inner HTML if found, null otherwise.
 */
export function detectProtectedContent(html: string): ProtectedContent | null {
  const hashMatch = /const\s+correctPasswordHash\s*=\s*['"]([a-f0-9]{64})['"]/i.exec(html)
  if (!hashMatch) return null

  // Extract the template literal between the first backtick after `protectedContent =` and its closing backtick
  const contentStart = html.indexOf('const protectedContent = `')
  if (contentStart === -1) return null

  const backtickStart = html.indexOf('`', contentStart + 'const protectedContent = '.length)
  if (backtickStart === -1) return null

  // Find the closing backtick — must not be escaped
  let i = backtickStart + 1
  while (i < html.length) {
    if (html[i] === '`' && html[i - 1] !== '\\') break
    i++
  }
  if (i >= html.length) return null

  const innerHtml = html.slice(backtickStart + 1, i)
    // Unescape \` and \\ that JS template literals use
    .replace(/\\`/g, '`')
    .replace(/\\\\/g, '\\')
    // The original file uses <\/script> inside the template literal to avoid breaking the outer script
    .replace(/<\\\/script>/gi, '</script>')

  return { passwordHash: hashMatch[1], innerHtml }
}

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
