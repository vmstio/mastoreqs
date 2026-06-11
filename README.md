# mastoreqs.com

Community maintained support matrix of recent Mastodon releases and their underlying
dependencies. Built with [Astro Starlight](https://starlight.astro.build).

## How it works

All support data lives in a single source of truth: [`src/data/requirements.json`](src/data/requirements.json).
The interactive matrices and the lifecycle table are rendered from that file, so updating a
support status is a one-line edit in the JSON — no table markup to maintain.

- `src/data/requirements.json` — Mastodon versions, per-component support matrices, and the
  release lifecycle. Each cell is `"yes"` (supported), `"warn"` (deprecated, use with
  caution), `"no"` (unsupported), or `null` (not applicable / blank).
- `src/data/requirements.ts` — typed loader and helpers for the JSON.
- `src/components/SupportMatrix.astro` — renders a component's matrix as an interactive grid
  (click a Mastodon version to focus its column; hover to highlight a row). Each grid also
  includes a "Plan an upgrade" advisor: pick a current Mastodon, a target, and your current
  component version, and it explains what to do. The advisor reads the rendered grid, so it
  always matches the data — there's nothing extra to keep in sync.
- `src/components/LifecycleTable.astro` — renders the release lifecycle table.
- `src/content/docs/` — the page content (MDX), which drops in the components above.

### Adding or updating a version

Edit `src/data/requirements.json`. To add a new Mastodon release, add it to
`mastodonVersions` and prepend a matching entry to every row's `support` array (and to
`lifecycle`). To change a component version's status, edit the relevant `support` array.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
```

## Build

```bash
npm run build    # outputs static site to ./dist
npm run preview  # serve the production build locally
```

The contents of `./dist` are static HTML and can be deployed to any static host.

## License

[MIT License](https://opensource.org/licenses/MIT)
