// Builds the readable (no-JavaScript) text of every page from the server-rendered live site.
// in : extract_bundle.js.out.json (smoke.cjs output: { pageKey: html })
// out: pages.json  { pages: { key: "<h1>…" }, nav: "<a…>", foot: "<a…>" }
// Run: node smoke.cjs extract_bundle.js && node extract.cjs
const fs = require('fs')
const { JSDOM } = require('jsdom')
const src = JSON.parse(fs.readFileSync(process.argv[2] || 'extract_bundle.js.out.json', 'utf8'))

// The site's own route names -> the public paths that exist as Framer pages.
const PUBLIC = { '/': '/', '/home': '/', '/marketplace': '/community', '/app-testing': '/beta-test', '/app-demo': '/demo-app' }
const mapHref = (h) => {
    if (!h) return ''
    if (/^(https?:|mailto:|tel:)/.test(h)) return h
    if (h.startsWith('#')) return ''
    const [p, frag] = h.split('#')
    return (PUBLIC[p] || p) + (frag ? '#' + frag : '')
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escAttr = (s) => esc(s).replace(/"/g, '&quot;')
const clean = (s) => s.replace(/\s+/g, ' ').trim()

const SKIP = new Set(['style', 'script', 'svg', 'video', 'audio', 'source', 'img', 'picture', 'canvas', 'iframe', 'input', 'textarea', 'select', 'option', 'label', 'noscript', 'hr', 'form', 'button'])
const HEAD = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
const BLOCKISH = 'h1,h2,h3,h4,h5,h6,p,ul,ol,li,blockquote,section,article,table,form,div.esc-p,dl,dt,dd,figure,figcaption'
const INLINE = new Set(['span', 'strong', 'em', 'b', 'i', 's', 'small', 'sup', 'sub', 'code', 'abbr', 'time', 'a', 'u', 'mark', 'q', 'cite'])

const tagOf = (n) => n.tagName.toLowerCase()
function hidden(el) {
    if (el.getAttribute('aria-hidden') === 'true') return true
    if (el.getAttribute('role') === 'img') return true
    if (el.hasAttribute('hidden')) return true
    const st = el.getAttribute('style') || ''
    return /display:\s*none|visibility:\s*hidden/.test(st)
}
const skip = (el, inHeading) => hidden(el) || tagOf(el) === 'nav' || (SKIP.has(tagOf(el)) && !(inHeading && tagOf(el) === 'button'))

// join two inline pieces, adding a space only where two words would otherwise run together
function glue(a, b) {
    if (!a) return b
    if (!b) return a
    const last = a.replace(/<[^>]+>$/g, '').slice(-1), first = b.replace(/^<[^>]+>/g, '').charAt(0)
    if (/\s/.test(a.slice(-1)) || /\s/.test(b.charAt(0))) return a + b
    if (/[A-Za-z0-9.,;:!?)\]%”’"']/.test(last) && /[A-Za-z0-9$“‘(\[]/.test(first)) return a + ' ' + b
    return a + b
}

// inline content of an element: text and links
function inline(el, opts = {}) {
    let out = ''
    for (const c of el.childNodes) {
        if (c.nodeType === 3) { out += esc(c.textContent.replace(/\s+/g, ' ')); continue }
        if (c.nodeType !== 1) continue
        const t = tagOf(c)
        if (t === 'br') { out += ' '; continue }
        if (skip(c, opts.heading)) continue
        const label = c.getAttribute('aria-label')
        if (t === 'a') {
            const href = mapHref(c.getAttribute('href'))
            let txt = clean(inline(c, { ...opts, noLinks: true }))
            if (!txt && label) txt = esc(clean(label.replace(/\s*\(opens in a new tab\)/, '')))
            if (!txt) continue
            out = glue(out, href && !opts.noLinks ? `<a href="${escAttr(href)}">${txt}</a>` : txt)
            continue
        }
        if (label && !c.querySelector('a') && t !== 'section' && t !== 'nav') { out = glue(out, esc(clean(label))); continue }
        out = glue(out, inline(c, opts))
    }
    return out
}
// the parts of a list item (number, title, text) joined with a middle dot
function pieces(el) {
    const out = []
    let cur = ''
    const push = () => { const t = clean(cur); cur = ''; if (t) out.push(t) }
    for (const c of el.childNodes) {
        if (c.nodeType === 3) { cur += esc(c.textContent.replace(/\s+/g, ' ')); continue }
        if (c.nodeType !== 1 || skip(c)) continue
        const t = tagOf(c)
        if (INLINE.has(t) && !c.querySelector('div,p,h1,h2,h3,h4')) {
            // a run of inline elements with no text between them are separate parts (number + label)
            const x = clean(inline({ childNodes: [c] }))
            if (cur.trim() === '' || /\s$/.test(cur) || !x) cur = glue(cur, x); else cur = glue(cur, x)
            if (t === 'span' && !el.textContent.replace(c.textContent, '').trim()) { }
            continue
        }
        push(); out.push(...pieces(c))
    }
    push()
    return out
}
// a leaf <div> made only of element children reads as separate items: join them with a middle dot
function leafText(el) {
    const kids = [...el.childNodes].filter((c) => c.nodeType === 1 || (c.nodeType === 3 && c.textContent.trim()))
    const allEls = kids.length > 1 && kids.every((c) => c.nodeType === 1)
    if (!allEls) return clean(inline(el))
    return kids.filter((c) => !skip(c) && !(tagOf(c) === 'a' && (c.getAttribute('href') || '').startsWith('#'))).map((c) => clean(inline({ childNodes: [c] }))).filter(Boolean).join(' · ')
}

function build(root) {
    const blocks = []
    let run = []
    const flush = () => { const t = clean(run.join(' · ')); run = []; if (t) blocks.push(['p', t]) }
    const walk = (el) => {
        for (const c of el.childNodes) {
            if (c.nodeType === 3) { const t = esc(clean(c.textContent)); if (t) run.push(t); continue }
            if (c.nodeType !== 1) continue
            const t = tagOf(c)
            if (skip(c)) continue
            if (HEAD.has(t)) { flush(); const x = clean(inline(c, { heading: true, noLinks: true })); if (x) blocks.push([t, x]); continue }
            if (t === 'ul' || t === 'ol') {
                flush()
                const items = [...c.children].filter((li) => tagOf(li) === 'li' && !skip(li)).map((li) => (li.querySelector('div,p,h1,h2,h3,h4') ? pieces(li).join(' · ') : clean(inline(li)))).filter(Boolean)
                if (items.length) blocks.push([t, items])
                continue
            }
            if (t === 'p' || t === 'blockquote' || t === 'li' || t === 'figcaption' || t === 'dt' || t === 'dd' || (t === 'div' && c.classList.contains('esc-p'))) {
                flush(); const x = clean(inline(c)); if (x) blocks.push(['p', x]); continue
            }
            const isLeaf = !c.querySelector(BLOCKISH)
            if (isLeaf) {
                if (t === 'a' && (c.getAttribute('href') || '').startsWith('#')) continue
                if (INLINE.has(t)) { const x = clean(inline({ childNodes: [c] })); if (x) run.push(x); continue }
                // rows: a box whose children are boxes reads as one line per child
                const rows = [...c.children].filter((k) => !skip(k) && !INLINE.has(tagOf(k)))
                if (rows.length > 1) { flush(); walk(c); flush(); continue }
                flush(); const x = leafText(c); if (x) blocks.push(['p', x]); continue
            }
            flush(); walk(c); flush()
        }
    }
    walk(root); flush()
    // tidy: drop bare punctuation and immediate repeats
    const tidy = []
    for (const b of blocks) {
        const key = JSON.stringify(b)
        if (b[0] === 'p' && !/[A-Za-z0-9]/.test(b[1].replace(/<[^>]+>/g, ''))) continue
        if (tidy.length && JSON.stringify(tidy[tidy.length - 1]) === key) continue
        tidy.push(b)
    }
    return tidy
}
const toHtml = (blocks) => blocks.map(([t, x]) => (t === 'ul' || t === 'ol') ? `<${t}>${x.map((i) => `<li>${i}</li>`).join('')}</${t}>` : `<${t}>${x}</${t}>`).join('')
const toText = (blocks) => blocks.map(([t, x]) => {
    const md = (s) => s.replace(/<a href="([^"]*)">(.*?)<\/a>/g, '[$2]($1)').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    if (t === 'ul' || t === 'ol') return x.map((i) => '  - ' + md(i)).join('\n')
    if (HEAD.has(t)) return '\n' + '#'.repeat(+t[1]) + ' ' + md(x)
    return md(x)
}).join('\n')

const pages = {}, text = {}
for (const [key, html] of Object.entries(src)) {
    const d = new JSDOM('<body>' + html + '</body>').window.document
    const main = d.querySelector('main')
    const blocks = build(main)
    pages[key] = blocks
    text[key] = toText(blocks)
}
// site links: nav and footer, read from the home page
const d = new JSDOM('<body>' + src.home + '</body>').window.document
const links = (sel) => {
    const seen = new Set(), out = []
    d.querySelectorAll(sel).forEach((a) => {
        const href = mapHref(a.getAttribute('href'))
        let txt = clean(inline(a, { noLinks: true })) || esc(clean((a.getAttribute('aria-label') || '').replace(/\s*\(opens in a new tab\)/, '')))
        txt = txt.replace(/\s*\(opens in a new tab\)/, '')
        if (!href || !txt || seen.has(href)) return
        seen.add(href); out.push([href, txt])
    })
    return out
}
const nav = links('nav a'), foot = links('footer a')
fs.writeFileSync('pages.json', JSON.stringify({ pages, nav, foot }))
for (const k of Object.keys(text)) fs.writeFileSync(`text_${k}.txt`, text[k] + '\n')
console.log(Object.entries(pages).map(([k, b]) => `${k.padEnd(14)} blocks ${String(b.length).padStart(3)}  html ${String(toHtml(b).length).padStart(6)}`).join('\n'))
console.log('nav', JSON.stringify(nav)); console.log('foot', JSON.stringify(foot))
module.exports = { toHtml }
