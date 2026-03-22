import type { ParsedGithubUrl, FileType } from '../types/github'

const GITHUB_BLOB_RE =
  /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/
const RAW_REFS_RE =
  /^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/refs\/heads\/([^/]+)\/(.+)$/
const RAW_DIRECT_RE =
  /^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/

function detectFileType(filePath: string): FileType {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'html' || ext === 'htm') return 'html'
  if (ext === 'md' || ext === 'markdown') return 'markdown'
  if (ext === 'css') return 'css'
  if (ext === 'xml') return 'xml'
  return 'plain'
}

export function parseGithubUrl(url: string): ParsedGithubUrl | null {
  let owner: string, repo: string, branch: string, filePath: string

  let m = GITHUB_BLOB_RE.exec(url)
  if (m) {
    ;[, owner, repo, branch, filePath] = m
  } else {
    m = RAW_REFS_RE.exec(url)
    if (m) {
      ;[, owner, repo, branch, filePath] = m
    } else {
      m = RAW_DIRECT_RE.exec(url)
      if (m) {
        ;[, owner, repo, branch, filePath] = m
      } else {
        return null
      }
    }
  }

  const repoBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`
  const rawUrl = `${repoBase}/${filePath}`
  const fileType = detectFileType(filePath)

  return { owner, repo, branch, filePath, rawUrl, repoBase, fileType }
}
