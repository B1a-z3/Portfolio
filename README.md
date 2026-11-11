# Nihal Malavalli Lokesh – Portfolio

A static, single-page portfolio. No build step and no dependencies.

## Files

| File | Purpose |
|---|---|
| `index.html` | All page content and layout |
| `style.css` | Page basics, the accent color, hover effects |
| `script.js` | Binary rain, scroll animations, hero text effects, card tilt, spotlight |
| `profile.jpg` | Profile photo |

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

## Deploy on GitHub Pages

1. Create a repository named `B1a-z3.github.io` (or any repo name).
2. Upload these four files to the repository root.
3. In **Settings → Pages**, set the source to the `main` branch, root folder.
4. The site goes live at `https://b1a-z3.github.io/` (or `https://b1a-z3.github.io/Portfolio/`).

## Customize

- **Accent color:** change `--accent` at the top of `style.css`. The rain, buttons and highlights follow it.
- **Text and links:** edit `index.html` directly.
- **To do:** replace `[POOLED RMSE]` in the research project card, and point the "Code on GitHub" links at the individual repositories.
