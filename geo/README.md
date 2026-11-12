# Page text in the Framer loader

The site is drawn by JavaScript, so on its own the published HTML has no text. `EscapeSite.loader.tsx`
(the one code file in Framer) therefore carries the text of every page: headings, paragraphs, lists and
links. Framer pre-renders it into the HTML, so search engines and AI crawlers that do not run JavaScript
can read each page. Visitors see the navy loading screen and then the site, as before.

- `EscapeSite.loader.tsx`: the file to paste into Framer (about 39 KB, all 13 pages).
- `EscapeSite.loader.lite.tsx`: the same with the legal pages cut to title and summary (about 27 KB).
  Use it only if Framer refuses to save the full file.
- `EscapeSite.loader.v1.tsx`: the loader that was live before November 12, 2026.

## When the wording of the site changes

1. `npm install` in this folder (once).
2. `sh regen.sh <the .tsx the live bundle was built from>`.
   It server-renders every page, pulls the text out, packs it into the loader and runs the tests
   (unpacking against zlib, server render of every page, and a browser run with JavaScript on, off,
   and with the bundle blocked).
3. Copy `EscapeSite.loader.tsx` to the repo root, paste it into the `EscapeSite` code file in Framer, publish.

The text is a copy made at build time. If the bundle is updated and this step is skipped, visitors still
see the new site, but crawlers read the older wording until the loader is regenerated.

## How the page is chosen

- In the published HTML: Framer's router path when it is available, otherwise the component's "Show page" setting.
- In the browser: the address. `/community` opens Marketplace, `/beta-test` App testing, `/demo-app` App demo,
  whatever the setting says. Only the home page opens with the orb gate.
