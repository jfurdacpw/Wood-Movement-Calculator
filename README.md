# Wood movement calculator

Static calculator that matches the Excel workbook logic: **movement = coefficient × board width (in.) × moisture variance × 100** for quarter- and flat-sawn coefficients per species.

## GitHub Pages

1. Push this repository to GitHub.
2. In the repo on GitHub: **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your default branch (e.g. `main`) and **/ (root)** so `index.html` is served from the site root.

For a **project site**, the app will be at:

`https://<your-username>.github.io/Wood-Movement-Calculator/`

All asset links use **relative** paths (`./styles.css`, `./species.json`) so they work under that URL.

## Embed in Notion

1. Publish the site using the steps above and confirm the URL loads in a browser.
2. In Notion, add an **Embed** block and paste the GitHub Pages URL.
3. If the preview does not update after a deploy, use the embed menu **⋯ → Reload**.

The page is styled for **Notion dark mode** by default (dark background and type). Notion does not tell embedded pages which theme the workspace uses; this keeps the embed visually consistent in dark workspaces.

## Local preview

From the repo root:

```bash
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/` (a local server is required so `fetch("./species.json")` works).

## Source

Coefficients and formula mirror the original spreadsheet; methodology is described in [Calculating for wood movement](https://www.finewoodworking.com/2013/08/29/calculating-for-wood-movement) (Fine Woodworking).
