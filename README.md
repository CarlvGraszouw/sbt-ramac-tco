# RAMAC TCO — G-Matrix proposal for SBT

Standalone interactive **Total Cost of Ownership (TCO)** calculator for RAMAC™ **AT1L** and **AT2** asset trackers.

- **Live site file:** `index.html` (single file, no build step)
- **Duplicate:** `ramac_tco_model.html` matches `index.html` for local naming preference

## Host on GitHub Pages (client URL)

1. **Create a new repository** on GitHub (e.g. `sbt-ramac-tco` — name is up to you; can be **public** or **private** with GitHub Pro/Team for private Pages on some plans).

2. **Push this folder** (from your machine):

   ```bash
   cd "path/to/SBT_Cost Of Ownership"
   git init
   git add index.html ramac_tco_model.html README.md
   git commit -m "Add RAMAC TCO calculator for SBT client review"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:** repo **Settings → Pages → Build and deployment → Source:** **Deploy from a branch**, Branch **main**, folder **/ (root)** → Save.

4. **Client URL** (after a minute or two):

   `https://YOUR_USERNAME.github.io/YOUR_REPO/`

   The page loads `index.html` automatically. Share that link for review; clients can use the calculator in the browser or print to PDF.

### Optional: custom domain

Add your domain under **Settings → Pages → Custom domain**, and add a `CNAME` file in the repo if required by your DNS provider.

## Local use

Open `index.html` in any modern browser (double-click or drag into Chrome/Edge/Firefox).
