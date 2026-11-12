// Generates EscapeSite.loader.tsx (the one Framer code file) with the readable text of every page packed inside.
// Run after extract.cjs:  node make_loader.cjs
const fs = require('fs'), zlib = require('zlib')
const { pages, nav, foot } = JSON.parse(fs.readFileSync('pages.json', 'utf8'))
const live = fs.readFileSync('extract_src.tsx', 'utf8')

const HEAD = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
const toHtml = (blocks) => blocks.map(([t, x]) => (t === 'ul' || t === 'ol') ? `<${t}>${x.map((i) => `<li>${i}</li>`).join('')}</${t}>` : `<${t}>${x}</${t}>`).join('')
const escH = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// The demo page is an interactive player, so its chapters are not in the server-rendered markup: read them from the source.
const chapters = [...live.matchAll(/id: "\w+", n: (\d), title: "([^"]+)", icon: "[^"]+", dur: \d+,\s*body: "([^"]+)"/g)].map((m) => [m[2], m[3]])
if (chapters.length !== 5) throw new Error('demo chapters: expected 5, got ' + chapters.length)
{
    const d = pages.demo, at = d.findIndex(([t]) => t === 'h1') + 2
    d.splice(at, 0, ['h2', 'What the demo shows'], ['ol', chapters.map(([title, body]) => `${escH(title)} · ${escH(body)}`)])
}

// site links, once: the pages first, then legal, then everything else
const label = (t) => (t === 'ESCAPE™' ? 'Home' : t.replace(/^Innerverse.*$/, 'Innerverse').replace(/^App testing$/i, 'App testing'))
const seen = new Set(), all = []
for (const [href, txt] of [...nav, ...foot]) { if (!seen.has(href)) { seen.add(href); all.push([href, label(txt)]) } }
if (!seen.has('/delete-account')) all.push(['/delete-account', 'Delete your account'])
const isLegal = (h) => /^\/(privacy-policy|consumer-health-data|terms|safety|cookie-policy|delete-account)$/.test(h)
const site = all.filter(([h]) => h.startsWith('/') && !isLegal(h)), legal = all.filter(([h]) => isLegal(h)), ext = all.filter(([h]) => !h.startsWith('/'))
const a = ([h, t]) => `<a href="${h.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">${t}</a>`
const NAV = `<nav aria-label="Escape pages">${site.map(a).join(' · ')}</nav>`
const FOOT = `<footer><p>${legal.map(a).join(' · ')}</p><p>${ext.map(a).join(' · ')}</p><p>Escape is a self-care app from Escape Enterprises LLC. It is not therapy or medical care.</p></footer>`

// ASCII only (so bytes map 1:1 to characters), one line per page ("key<TAB>html"), then raw deflate, then base64
const LITE = process.argv.includes('--lite')
const LEGAL = new Set(['privacy', 'health', 'terms', 'safety', 'deleteAccount', 'cookies'])
const ascii = (s) => s.replace(/[^\x00-\x7F]/gu, (c) => `&#${c.codePointAt(0)};`)
const html = {}
for (const [k, blocks] of Object.entries(pages)) {
    let b = blocks
    if (LITE && LEGAL.has(k)) { const cut = b.findIndex(([t]) => t === 'h2'); b = [...b.slice(0, cut < 0 ? b.length : cut), ['p', 'The full text of this page loads with the site.']] }
    html[k] = toHtml(b)
    if (/[\n\t]/.test(html[k])) throw new Error('newline or tab in ' + k)
}
const joined = Object.entries(html).map(([k, v]) => k + '\t' + ascii(v)).join('\n')
const packed = zlib.deflateRawSync(Buffer.from(joined, 'latin1'), { level: 9 }).toString('base64')
if (!LITE) fs.writeFileSync('static_html.json', JSON.stringify({ html, NAV, FOOT }, null, 1))

const tpl = fs.readFileSync('loader.template.tsx', 'utf8')
const lines = packed.match(/.{1,160}/g).map((l) => `    "${l}"`).join(' +\n')
const out = tpl
    .replace('"__PAGES__"', '\n' + lines)
    .replace('"__NAV__"', JSON.stringify(ascii(NAV)))
    .replace('"__FOOT__"', JSON.stringify(ascii(FOOT)))
    .replace('__BUILT__', new Date().toISOString().slice(0, 10) + (LITE ? ' (lite: legal pages carry their title and summary only)' : ''))
if (/__PAGES__|__NAV__|__FOOT__|__BUILT__/.test(out)) throw new Error('template placeholder left')
if (/[^\x00-\x7F]/.test(out)) throw new Error('loader has non-ASCII characters')
const name = LITE ? 'EscapeSite.loader.lite.tsx' : 'EscapeSite.loader.tsx'
fs.writeFileSync(name, out)
const raw = Object.values(html).reduce((n, s) => n + s.length, 0)
console.log(`${name}: pages ${Object.keys(html).length}  text ${raw} bytes  packed ${packed.length} bytes  file ${out.length} bytes`)
