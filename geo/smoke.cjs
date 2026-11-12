const React = require('react'), JSX = require('react/jsx-runtime'), Motion = require('framer-motion')
const { renderToString } = require('react-dom/server')
const file = process.argv[2]
const ControlType = new Proxy({}, { get: (_, k) => String(k) })
const Framer = { ControlType, RenderTarget: { current: () => 'PREVIEW', canvas: 'CANVAS', preview: 'PREVIEW' }, addPropertyControls: () => {} }
global.window = undefined
const code = require('fs').readFileSync(file, 'utf8')
const w = { location: { hash: '', pathname: '/' }, matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){} }), navigator: {} }; new Function('window', code)(w)
const Site = w.__escapeSiteFactory(React, Framer, Motion, JSX).default
const pages = ["home","lucille","marketplace","pricing","innerverse","beta","demo","privacy","health","terms","safety","deleteAccount","cookies"]
const out = {}
for (const pg of pages) {
  try { const h = renderToString(React.createElement(Site, { startPage: pg, gateFirst: false, pageTitles: true })); out[pg] = h; console.log(pg.padEnd(14), 'ok', h.length) }
  catch (e) { console.log(pg.padEnd(14), 'FAIL', e.message.slice(0, 160)) }
}
require('fs').writeFileSync(file + '.out.json', JSON.stringify(out))
