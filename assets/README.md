Assets for `index3.html`

Place your images in this `assets/` folder using the exact filenames below so the page loads correctly.

Required filenames and recommended sizes:

- `profile-pic.png` — square profile image (recommended 400×400, PNG or JPG).
- `medium-banner.jpg` — banner for the Medium card (recommended 1600×400, JPG, high quality but optimized).
- `comp1.PNG` — screenshot for Compiler project (recommended 1280×720 or 1600×900, PNG/JPG).
- `dashboard.jpg` — screenshot for NeurIQ dashboard (recommended 1280×720, JPG).

Notes:
- Filenames must match exactly (case-sensitive on some servers).
- Keep images optimized for web (use compression, serve under ~300–500 KB when possible).
- The page includes `onerror` fallbacks that will show remote placeholder images if any local image is missing.

How to preview locally:

1. Open `index3.html` in your browser directly, or
2. Use a simple static server, e.g., with Python 3:

   python -m http.server 8000

Then visit http://localhost:8000/index3.html
