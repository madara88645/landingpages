# NeurIQ Landing

This folder contains the NeurIQ landing page.

- Open `index.html` in a browser to view locally.
- Assets referenced are expected under `assets/` relative to this folder.

To publish:
1. Create a private GitHub repo (e.g. `neurIQ-landing`) and push this folder.
2. Use Vercel/Netlify or GitHub Pages to deploy.

Commands to create repo and push (with GitHub CLI):

```bash
# from this folder
gh repo create <your-org-or-username>/neurIQ-landing --private --source=. --remote=origin
git branch -M main
git push -u origin main
```
