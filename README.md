# Trot's Den

Personal blog by **Kamil Golis** — a mix of tech and life, built with [Eleventy](https://www.11ty.dev/) and a custom Neo-Brutalism CSS design system.

🌐 **Live site:** [kamilgolis.github.io](https://kamilgolis.github.io)

---

## About

This blog covers topics related to Salesforce technology (Apex, LWC) and personal experiences. Posts are written in Markdown and rendered as a fully static site deployed to GitHub Pages.

The visual design is intentionally raw and structural — high contrast, bold borders, hard drop-shadows, and system fonts. No CSS frameworks.

---

## Tech Stack

| Tool | Version |
|---|---|
| [Eleventy](https://www.11ty.dev/) | 3.x |
| [Pagefind](https://pagefind.app/) | 1.x |
| [Prism.js](https://prismjs.com/) (via eleventy-plugin-syntaxhighlight) | 5.x |
| [markdown-it](https://markdown-it.github.io/) | 14.x |
| [eleventy-plugin-icons](https://github.com/uncenter/eleventy-plugin-icons) | 4.x |
| Node.js | 22.x |

Icons are sourced from [Lucide](https://lucide.dev/), [MDI](https://pictogrammers.com/library/mdi/), [Simple Icons](https://simpleicons.org/), and [Feather Icons](https://feathericons.com/).

HTML output is minified via `html-minifier-terser`.

---

## Project Structure

```
src/
├── _data/          # site.json — global config (title, author, menus, social links, etc.)
├── _includes/
│   ├── components/ # Nunjucks partials, brutalism.css, brutalism.js
│   └── layouts/    # Page layout templates (.njk)
├── pages/          # Static pages (index, tags, etc.)
├── posts/          # Markdown blog posts (subdirectories supported)
└── public/         # Static assets (images, fonts, icons)
_utilities/         # Eleventy filters and plugins (dates, TOC, icons, etc.)
```

---

## Local Development

```bash
npm install
npm start       # dev server at http://localhost:8080
npm run build   # production build to _site/
```

---

## Configuration

All site-wide settings live in `src/_data/site.json`:

- **title / author / url** — basic metadata
- **menuItems** — sidebar navigation links or dialog triggers
- **toolbarItems** — top toolbar buttons (search, RSS)
- **socialItems** — footer social links with icon identifiers
- **giscus** — comment system config (set `enabled: true` and fill in repo details to activate)
- **hero / features** — homepage content blocks

---

## License

This project is under the [MIT License](LICENSE).
