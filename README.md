# Monash Uni AI Design Jam Landing Page

Static single-page landing site for AI Design Jam 2026.

## Current Behavior

- Full-screen hero banner uses BG.png as the background image.
- Theme and date are static text in the main heading area.
- Main brief content is loaded from AI-Design-Jam-2026-brief.md and rendered client-side.
- A left-side section menu is generated from markdown H2 headings.
- Clicking a menu item shows one content panel at a time.
- A persistent Registration tab is injected from HTML (not markdown).
- In Registration, users must check a consent box before continuing.
- The registration button opens the configured registration URL in a new browser tab.
- Bottom project banner displays title, ethics ID, and copyright.

## Project Structure

- index.html: page shell, hero, static heading/date, footer, and registration template content.
- AI-Design-Jam-2026-brief.md: source markdown for all non-registration sections.
- BG.png: hero background image.
- css/base.css: base reset and global element defaults.
- css/theme.css: typography scale, color tokens, and responsive type sizing.
- css/layout.css: page layout, hero sizing/placement, spacing, and footer layout.
- css/markdown.css: markdown split layout, menu behavior, table styles, and registration card styles.
- js/marked.min.js: bundled markdown parser.
- js/markdown-loader.js: markdown parsing, section model building, tab rendering, and registration consent logic.

## Run Locally

No build step is required.

Run a local static server from the project root:

```bash
cd /Users/sjkro1/Sites/AI-Jam-Landing-Page
python3 -m http.server 8081
```

Then open http://localhost:8081.

Note: opening index.html via file:// is not recommended because markdown is loaded with fetch.

## Editing Guide

### 1) Main Brief Content

- Edit AI-Design-Jam-2026-brief.md.
- Use H2 headings (##) for top-level sections; each H2 becomes a menu tab.
- Use H3/H4 and body markdown inside each section as needed.

### 2) Hero, Theme, Date, and Footer

- Edit index.html.
- Hero title is inside the intro heading.
- Theme/date text is in the section head.
- Footer banner text is in the bottom-banner block.

### 3) Registration Content (HTML-managed)

- Edit the template block in index.html with id registration-content-template.
- Update explanatory statement links directly in that template.
- Set the registration destination on the button via data-registration-url.
- Registration stays available as its own tab regardless of markdown content.

### 4) Styling

- Global/page layout: css/layout.css
- Typography/colors: css/theme.css
- Markdown/menu/registration component styles: css/markdown.css

### 5) Interaction Logic

- Section parsing and tab UI: js/markdown-loader.js
- Registration consent gate and button behavior: js/markdown-loader.js

## Markdown Parsing Notes

- The first markdown H1 (#) is removed before rendering.
- If markdown contains a section titled Registration, it is ignored in favor of the HTML registration template.
- Tables are automatically wrapped for horizontal scrolling on smaller screens.
