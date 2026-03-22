/**
 * Resolves a relative asset path to an absolute raw GitHub URL.
 * @param relativePath - The src/href value found in the HTML/CSS
 * @param repoBase - e.g. https://raw.githubusercontent.com/owner/repo/branch
 * @param currentFilePath - e.g. "subdir/index.html"
 */
export function resolveAssetUrl(
  relativePath: string,
  repoBase: string,
  currentFilePath: string,
): string {
  // Already absolute
  if (/^https?:\/\//.test(relativePath) || relativePath.startsWith('//')) {
    return relativePath
  }
  // Data URIs
  if (relativePath.startsWith('data:')) {
    return relativePath
  }

  const currentDir = currentFilePath.includes('/')
    ? currentFilePath.substring(0, currentFilePath.lastIndexOf('/'))
    : ''

  const base = currentDir
    ? `${repoBase}/${currentDir}/`
    : `${repoBase}/`

  try {
    return new URL(relativePath, base).href
  } catch {
    return `${repoBase}/${relativePath}`
  }
}
