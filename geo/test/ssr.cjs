// Server render of the loader for every "Show page" value, the way Framer pre-renders a page (no window, no document).
const React = require('react'); const { renderToString } = require('react-dom/server')
const fs = require('fs')
const Loader = require('./loader.server.cjs').default
const { html } = JSON.parse(fs.readFileSync('../static_html.json', 'utf8'))
const firstH1 = (s) => (s.match(/<h1>(.*?)<\/h1>/) || [])[1]
let fail = 0
const keys = ["gate", "home", "lucille", "marketplace", "pricing", "innerverse", "beta", "demo", "privacy", "health", "terms", "safety", "deleteAccount", "cookies"]
const out = {}
for (const k of keys) {
  const h = renderToString(React.createElement(Loader, { startPage: k, gateFirst: true, pageTitles: true, bundleUrl: '' }))
  // Framer wraps a code component in a Suspense boundary, so the published HTML carries its markers
  out[k] = renderToString(React.createElement(React.Suspense, { fallback: null }, React.createElement(Loader, { startPage: k, gateFirst: true, pageTitles: true, bundleUrl: '' })))
  const want = firstH1(html[k === 'gate' ? 'home' : k]).replace(/[^\x00-\x7F]/gu, (c) => `&#${c.codePointAt(0)};`)
  const ok = h.includes('<h1>' + want + '</h1>') && h.includes('class="esc-pre-cover"') && h.includes('<nav aria-label="Escape pages">') && h.includes('<footer>') && /<noscript><style>/.test(h)
  if (!ok) fail++
  console.log((ok ? 'ok  ' : 'FAIL') + ' ' + k.padEnd(14) + String(h.length).padStart(6) + '  h1: ' + firstH1(h))
}
// Framer's router knows the page: a component left on "Home" still gets the right text
globalThis.__routePath = '/pricing'
let h = renderToString(React.createElement(Loader, { startPage: 'home', gateFirst: true, pageTitles: true, bundleUrl: '' }))
console.log('router /pricing, prop home ->', firstH1(h)); if (!/free for now/.test(h)) fail++
globalThis.__routePath = '/community'
h = renderToString(React.createElement(Loader, { startPage: 'home', gateFirst: true, pageTitles: true, bundleUrl: '' }))
console.log('router /community, prop home ->', firstH1(h)); if (!/Get rewarded/.test(h)) fail++
globalThis.__routePath = '/'
h = renderToString(React.createElement(Loader, { startPage: 'lucille', gateFirst: true, pageTitles: true, bundleUrl: '' }))
console.log('router /, prop lucille ->', firstH1(h)); if (!/Meet Lucille/.test(h)) fail++
globalThis.__routePath = '/some-blog-post'
h = renderToString(React.createElement(Loader, { startPage: 'terms', gateFirst: true, pageTitles: true, bundleUrl: '' }))
console.log('router unknown path, prop terms ->', firstH1(h)); if (!/Terms of Service/.test(h)) fail++
globalThis.__routePath = undefined; globalThis.__noRouter = true
h = renderToString(React.createElement(Loader, { startPage: 'safety', gateFirst: true, pageTitles: true, bundleUrl: '' }))
console.log('no router at all, prop safety ->', firstH1(h)); if (!/Safety/.test(h)) fail++
globalThis.__noRouter = false
// canvas: light placeholder, no page text
globalThis.__renderTarget = 'CANVAS'
h = renderToString(React.createElement(Loader, { startPage: 'home', gateFirst: true, pageTitles: true, bundleUrl: '' }))
console.log('canvas ->', h.length, 'bytes, has text:', /<h1>/.test(h)); if (/<h1>/.test(h)) fail++
globalThis.__renderTarget = undefined
fs.writeFileSync('ssr_out.json', JSON.stringify(out))
console.log(fail ? `${fail} FAILED` : 'all server-render checks passed'); process.exit(fail ? 1 : 0)
