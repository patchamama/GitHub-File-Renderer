# GitHub File Renderer

A static web application that renders GitHub repository files directly in the browser — no backend required. Paste any GitHub URL pointing to an HTML, Markdown, CSS, XML or plain text file and get a fully rendered preview with all dependencies resolved.

**Live demo**: https://patchamama.github.io/GitHub-File-Renderer/

---

## Why

GitHub's file viewer shows raw source or a basic preview. This tool renders files **as they were meant to be seen**:

- HTML files are rendered with their CSS and JavaScript fully loaded
- Markdown files are rendered with images and working links
- Navigation between files in the same repository works transparently

---

## How it works

1. You paste a GitHub URL (blob or raw format)
2. The app resolves it to a `raw.githubusercontent.com` URL
3. For HTML files:
   - The HTML is fetched and parsed
   - All relative `<link>` (CSS) and `<script>` references are detected
   - Each dependency is fetched individually and **inlined** into the document (required because GitHub's raw server sends `Content-Type: text/plain` and a restrictive CSP that prevents the browser from loading external resources)
   - Image and video `src` attributes are rewritten to absolute raw URLs
   - Internal links to other files in the same repo are intercepted and trigger a new render cycle
4. For Markdown files: rendered via `marked` with images and links resolved to the correct raw URLs
5. The final document is injected into a sandboxed `<iframe>`

---

## Supported URL formats

```
# GitHub blob URL
https://github.com/owner/repo/blob/branch/path/to/file.html

# Raw URL (refs/heads style)
https://raw.githubusercontent.com/owner/repo/refs/heads/branch/path/to/file.html

# Raw URL (direct)
https://raw.githubusercontent.com/owner/repo/branch/path/to/file.html
```

---

## Examples

| File | URL |
|------|-----|
| HTML with CSS + JS | `https://github.com/patchamama/Hapkido-Taekwondo-Trainingsvideos/blob/main/index.html` |
| Markdown with image links | `https://github.com/patchamama/Hapkido-Taekwondo-Trainingsvideos/blob/main/README.md` |

---

## Supported file types

| Extension | Rendering |
|-----------|-----------|
| `.html`, `.htm` | Full render with inlined CSS/JS, asset resolution, in-repo link navigation |
| `.md`, `.markdown` | Rendered via `marked`, images and links resolved |
| `.css` | Displayed as plain text |
| `.xml` | Displayed as plain text |
| Everything else | Displayed as plain text |

---

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS + @tailwindcss/typography
- TanStack Query (React Query) for fetching and caching
- `marked` for Markdown rendering
- GitHub Actions for deployment to GitHub Pages

---

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:5173/github_wraper_to_deploy/`

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

---

## Deployment

The app is deployed automatically to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`.

To deploy your own fork:

1. Push to GitHub
2. Go to **Settings → Pages → Source** and select **GitHub Actions**
3. The next push to `main` will trigger the deployment

---

## Known limitations

- **Private repositories**: not supported — only public repos are accessible via `raw.githubusercontent.com`
- **Binary files**: images referenced in HTML are loaded via absolute URL (they work); binary files opened directly show as plain text
- **Very large files**: the entire file content is fetched client-side; extremely large HTML files may be slow to process
- **CSS `@import`**: CSS files fetched and inlined do not recursively resolve their own `@import` statements yet

---

## TODO

- [ ] Recursive `@import` resolution inside fetched CSS files
- [ ] Support for files inside GitHub Gists
- [ ] Syntax highlighting for plain text / code files (CSS, XML, JS, etc.)
- [ ] Dark/light mode toggle
- [ ] Copy shareable link button
- [ ] Support for branch/tag selector when only owner/repo/file is given
- [ ] Handle HTML files that load CSS via JavaScript (dynamic injection)
- [ ] Navigation breadcrumb showing current file path within the repo

---

## License

MIT
