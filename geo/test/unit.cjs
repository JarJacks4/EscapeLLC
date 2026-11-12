const zlib = require('zlib'), fs = require('fs'), crypto = require('crypto')
const m = require('./loader.unit.cjs')
const unpack = m.__unpack, pageHtml = m.__pageHtml
let fail = 0, n = 0
const check = (name, ok, extra) => { n++; if (!ok) { fail++; console.log('FAIL', name, extra || '') } }
// 1. every page's text comes back exactly
const { html, NAV, FOOT } = JSON.parse(fs.readFileSync('../static_html.json', 'utf8'))
const ascii = (s) => s.replace(/[^\x00-\x7F]/gu, (c) => `&#${c.codePointAt(0)};`)
for (const [k, v] of Object.entries(html)) {
  const want = '<main>' + ascii(v) + '</main>' + ascii(NAV) + ascii(FOOT)
  check('page ' + k, pageHtml(k) === want, `got ${pageHtml(k).length} want ${want.length}`)
}
check('unknown key falls back to home', pageHtml('nope') === pageHtml('home'))
// 2. inflate against zlib: stored, fixed and dynamic blocks, many sizes
const rnd = (len, alphabet) => { let s = ''; const b = crypto.randomBytes(len); for (let i = 0; i < len; i++) s += alphabet[b[i] % alphabet.length]; return s }
const alph = ['ab', 'abcdefghij <>/="', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:<>/&#"=', Array.from({ length: 128 }, (_, i) => String.fromCharCode(i)).join('')]
for (const len of [0, 1, 2, 3, 7, 64, 255, 256, 257, 1000, 4095, 4096, 4097, 9000, 33000, 70000, 140000]) {
  for (const a of alph) {
    const txt = rnd(len, a) + (len > 3000 ? rnd(200, a).repeat(Math.ceil(len / 2000)) : '')
    for (const opt of [{ level: 0 }, { level: 1 }, { level: 6 }, { level: 9 }, { level: 9, strategy: zlib.constants.Z_FIXED }, { level: 9, strategy: zlib.constants.Z_HUFFMAN_ONLY }, { level: 9, strategy: zlib.constants.Z_RLE }]) {
      const b64 = zlib.deflateRawSync(Buffer.from(txt, 'latin1'), opt).toString('base64')
      let got; try { got = unpack(b64) } catch (e) { got = 'THREW ' + e.message }
      check(`len ${len} alph ${a.length} ${JSON.stringify(opt)}`, got === txt)
    }
  }
}
// base64 with line breaks and padding
{ const txt = 'hello <b>world</b> '.repeat(50); const b64 = zlib.deflateRawSync(Buffer.from(txt)).toString('base64').replace(/(.{40})/g, '$1\n'); check('b64 with newlines', unpack(b64) === txt) }
// 3. damaged input must throw (the loader catches and renders no text), never hang
for (const bad of ['', 'AAAA', '!!!!', zlib.deflateRawSync(Buffer.from('x'.repeat(5000))).toString('base64').slice(0, 20), crypto.randomBytes(300).toString('base64')]) {
  const t0 = Date.now(); let threw = false, out = ''
  try { out = unpack(bad) } catch (e) { threw = true }
  check('bad input handled quickly: ' + bad.slice(0, 12), Date.now() - t0 < 500)
}
// timing
{ const src = fs.readFileSync('../EscapeSite.loader.tsx', 'utf8'); const blk = src.match(/const PACKED = \n([\s\S]*?)\nconst NAV/)[1]; const b64 = [...blk.matchAll(/"([^"]*)"/g)].map((x) => x[1]).join(''); const t0 = process.hrtime.bigint(); for (let i = 0; i < 20; i++) unpack(b64); console.log('unpack all pages:', (Number(process.hrtime.bigint() - t0) / 20e6).toFixed(2), 'ms each,', unpack(b64).length, 'chars, packed', b64.length) }
console.log(`${n - fail}/${n} checks passed`)
process.exit(fail ? 1 : 0)
