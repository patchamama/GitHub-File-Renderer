export type FileType = 'html' | 'markdown' | 'css' | 'xml' | 'plain'

export interface ParsedGithubUrl {
  owner: string
  repo: string
  branch: string
  filePath: string
  rawUrl: string
  repoBase: string
  fileType: FileType
}
