# Creative AI Workshop Static Page

Simple static implementation of the Creative AI Workshop page.

## Structure

- `index.html`: semantic page content
- `AI-Design-Jam-2026-brief.md`: source markdown for the main page content
- `css/base.css`: reset and base defaults
- `css/theme.css`: typography, color tokens, and component look
- `css/layout.css`: container, spacing, and responsive behavior
- `css/markdown.css`: markdown-specific rendering styles (tables, lists, headings)
- `js/marked.min.js`: local markdown parser bundle
- `js/markdown-loader.js`: fetches and renders markdown into the main content area

## Run Locally

No build step is required.

1. Open `index.html` directly in your browser, or
2. Serve the folder with any static server (recommended for local parity):

```bash
cd /Users/sjkro1/Sites/AI-Jam-Landing-Page
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Content Editing

1. Edit `AI-Design-Jam-2026-brief.md`.
2. Save the file.
3. Refresh the browser.

The hero title and date are managed in `index.html`.
The rest of the main page content is rendered from markdown.

## Notes

- Scope is single-page only.
- The page uses an internal section menu generated from markdown H2 headings.
- Clicking a menu title shows one section at a time in the content panel.
- The page is static and self-contained.
- JavaScript is used only to render local markdown content into the page body.
