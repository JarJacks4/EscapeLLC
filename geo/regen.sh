#!/bin/sh
# Rebuilds the page text inside the Framer loader from the site source, then runs the tests.
# usage: sh regen.sh <site source .tsx that the live bundle was built from>
#   needs: npm install (esbuild react react-dom framer-motion jsdom playwright)
set -e
node prep.cjs "$1"
node build.mjs extract_src.tsx && mv escape-site.js extract_bundle.js
node smoke.cjs extract_bundle.js
node extract.cjs
node make_loader.cjs
node make_loader.cjs --lite
cd test
node build_test.mjs EscapeSite.loader.tsx
node unit.cjs
node ssr.cjs
LIVE_BUNDLE=../extract_bundle.js node browser.cjs
echo "Done. Paste EscapeSite.loader.tsx into the EscapeSite code file in Framer and publish."
