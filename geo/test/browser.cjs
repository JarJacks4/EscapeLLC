// Browser test: the published HTML (server render) is hydrated the way Framer does it, then the real site bundle loads.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path')
const ssr = JSON.parse(fs.readFileSync('ssr_out.json', 'utf8'))
const client = fs.readFileSync('client.js', 'utf8')
const bundle = fs.readFileSync(process.env.LIVE_BUNDLE || '../extract_bundle.js', 'utf8')
const SHOTS = process.env.SHOTS || '.'
const page_html = (key, props) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Framer title</title><style>html body{background:rgb(255,253,242);margin:0}</style></head><body><div id="root">${ssr[key]}</div><script>window.__hydrate=true;window.__props=${JSON.stringify(props)}</script><script src="/client.js"></script></body></html>`
let fail = 0
const check = (name, ok, extra) => { console.log((ok ? 'ok   ' : 'FAIL ') + name + (extra ? '  ' + extra : '')); if (!ok) fail++ }

async function open(browser, { url, key, props, js = true, bundleMode = 'ok', delay = 0, viewport = { width: 1280, height: 800 } }) {
  const ctx = await browser.newContext({ javaScriptEnabled: js, viewport })
  const page = await ctx.newPage()
  const logs = []
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text().slice(0, 200)) })
  page.on('pageerror', (e) => logs.push('pageerror: ' + String(e).slice(0, 200)))
  await page.route('**/*', async (route) => {
    const u = new URL(route.request().url())
    if (u.hostname === 'test.local') {
      if (u.pathname === '/client.js') return route.fulfill({ contentType: 'application/javascript', body: client })
      return route.fulfill({ contentType: 'text/html', body: page_html(key, props) })
    }
    if (u.hostname === 'storage.googleapis.com' && u.pathname.endsWith('/escape-site.js')) {
      if (bundleMode === 'fail') return route.abort()
      if (delay) await new Promise((r) => setTimeout(r, delay))
      return route.fulfill({ contentType: 'application/javascript', body: bundle })
    }
    return route.abort()   // media, fonts, API: not needed here
  })
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  return { ctx, page, logs }
}
const state = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s)
  const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.height > 0 }
  return { pre: !!q('.esc-pre'), cover: vis(q('.esc-pre-cover')), note: vis(q('.esc-pre-note')), textLen: (q('.esc-pre-text') || { innerHTML: '' }).innerHTML.length, textVisible: vis(q('.esc-pre-text')), preH1: (q('.esc-pre-text h1') || {}).textContent || '',
    site: !!q('.esc-site'), gate: !!q('.esc-site-gate'), siteH1: (q('.esc-site h1') || {}).textContent || '', title: document.title, errors: (window.__errors || []), links: document.querySelectorAll('.esc-pre-text a[href]').length }
})

;(async () => {
  const browser = await chromium.launch()
  // A. home, JavaScript on, bundle arrives after 1.2 s
  { const { ctx, page, logs } = await open(browser, { url: 'http://test.local/', key: 'home', props: { startPage: 'home', gateFirst: true, pageTitles: true }, delay: 1200 })
    await page.waitForTimeout(500)
    let s = await state(page)
    check('A1 while loading: navy cover shows, text is in the page, nothing replaced', s.pre && s.cover && s.textLen > 3000 && s.preH1 === 'Your Everyday Companion' && !s.site, JSON.stringify({ textLen: s.textLen, links: s.links }))
    check('A2 hydration reported no errors', s.errors.length === 0 && !logs.some((l) => /hydrat|did not match|Minified React error/i.test(l)), logs.concat(s.errors).join(' | ').slice(0, 300))
    await page.screenshot({ path: path.join(SHOTS, 'a_loading.png') })
    await page.waitForSelector('.esc-site', { timeout: 8000 })
    await page.waitForTimeout(600)
    s = await state(page)
    check('A3 after the bundle: live site with the orb gate, text block gone', s.site && s.gate && !s.pre, JSON.stringify({ title: s.title }))
    await ctx.close() }
  // B. /community with the component left on its defaults (Show page = Home, gate on)
  { const { ctx, page, logs } = await open(browser, { url: 'http://test.local/community', key: 'home', props: { startPage: 'home', gateFirst: true, pageTitles: true } })
    await page.waitForSelector('.esc-site', { timeout: 8000 }); await page.waitForTimeout(500)
    const s = await state(page)
    check('B  /community with default settings opens Marketplace, not the gate', s.site && !s.gate && /Get rewarded/.test(s.siteH1), JSON.stringify({ h1: s.siteH1, title: s.title }))
    await ctx.close() }
  // C. each real path shows its own page
  for (const [url, key, re] of [['/pricing', 'pricing', /free for now/], ['/beta-test', 'beta', /Join the Escape beta/], ['/demo-app', 'demo', /See what Escape does/], ['/terms', 'terms', /Terms of Service/], ['/delete-account', 'deleteAccount', /Delete your account/], ['/privacy-policy', 'privacy', /Privacy Policy/], ['/lucille-ai', 'lucille', /Meet Lucille/], ['/innerverse', 'innerverse', /Innerverse/], ['/safety', 'safety', /Safety/], ['/cookie-policy', 'cookies', /Cookie Policy/], ['/consumer-health-data', 'health', /Consumer Health Data/]]) {
    const { ctx, page, logs } = await open(browser, { url: 'http://test.local' + url, key, props: { startPage: key, gateFirst: true, pageTitles: true } })
    await page.waitForSelector('.esc-site', { timeout: 8000 }); await page.waitForTimeout(400)
    const s = await state(page)
    check(`C  ${url.padEnd(22)} -> ${s.siteH1.slice(0, 40)}`, s.site && !s.gate && re.test(s.siteH1) && s.errors.length === 0, s.errors.join('|').slice(0, 200))
    await ctx.close() }
  // D. hash links still work (the app opens escapeapp.ai/?v=…#/privacy-policy)
  { const { ctx, page } = await open(browser, { url: 'http://test.local/?v=20261104#/privacy-policy', key: 'home', props: { startPage: 'home', gateFirst: true, pageTitles: true } })
    await page.waitForSelector('.esc-site', { timeout: 8000 }); await page.waitForTimeout(400)
    const s = await state(page)
    check('D  /?v=…#/privacy-policy (the link the app uses) opens the Privacy Policy', s.site && /Privacy Policy/.test(s.siteH1), s.siteH1)
    await ctx.close() }
  // E. the bundle cannot be loaded
  { const { ctx, page } = await open(browser, { url: 'http://test.local/pricing', key: 'pricing', props: { startPage: 'pricing', gateFirst: true, pageTitles: true }, bundleMode: 'fail' })
    await page.waitForSelector('.esc-pre-note', { timeout: 8000 })
    const s = await state(page)
    check('E  bundle blocked: note + readable text, no cover', s.note && !s.cover && s.textVisible && /free for now/.test(s.preH1) && s.textLen > 2000, JSON.stringify({ textLen: s.textLen }))
    await page.screenshot({ path: path.join(SHOTS, 'e_bundle_failed.png') })
    await ctx.close() }
  // F. JavaScript off (what a crawler or a script blocker gets)
  for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const { ctx, page } = await open(browser, { url: 'http://test.local/', key: 'home', props: {}, js: false, viewport: vp })
    await page.waitForTimeout(300)
    // no page scripts run here, so read the page from outside
    const cover = await page.locator('.esc-pre-cover').isVisible().catch(() => false)
    const h1 = await page.locator('.esc-pre-text h1').first().textContent()
    const box = await page.locator('.esc-pre-text h1').first().boundingBox()
    const links = await page.locator('.esc-pre-text a[href]').count()
    const sw = await page.locator('html').evaluate((e) => e.scrollWidth).catch(() => -1)
    check(`F  JavaScript off at ${vp.width}px: text at the top, cover hidden`, !cover && h1 === 'Your Everyday Companion' && box && box.y < 200 && links > 20, JSON.stringify({ cover, y: box && Math.round(box.y), links, scrollWidth: sw }))
    await page.screenshot({ path: path.join(SHOTS, `f_nojs_${vp.width}.png`) })
    await ctx.close() }
  await browser.close()
  console.log(fail ? `${fail} FAILED` : 'all browser checks passed'); process.exit(fail ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(2) })
