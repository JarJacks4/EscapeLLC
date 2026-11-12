import * as esbuild from 'esbuild'
import fs from 'fs'
const src = process.argv[2] || 'EscapeSite.tsx'
let code = (await esbuild.transform(fs.readFileSync(src,'utf8'), {loader:'tsx', jsx:'automatic', format:'esm', target:'es2019'})).code
const imports = []
code = code.replace(/^import\s+([\s\S]*?)\s+from\s+["']([^"']+)["'];?\s*$/gm, (m, what, from) => {
  const v = {react:'React', framer:'Framer', 'framer-motion':'Motion', 'react/jsx-runtime':'JSX'}[from]
  if (!v) throw new Error('unknown import '+from)
  what = what.trim()
  if (what.startsWith('* as ')) { const n = what.slice(5).trim(); return n===v?'':`var ${n}=${v};` }
  return `var ${what.replace(/\s+as\s+/g, ': ')}=${v};`
})
if (/^import /m.test(code)) throw new Error('import left')
const ex = code.match(/export\s*\{\s*(\w+)\s+as\s+default\s*\};?/) 
if (ex) code = code.replace(ex[0], '') + `\nreturn {default:${ex[1]}};`
else { code = code.replace(/export default function (\w+)/, (m,n)=>{ globalThis.__n=n; return 'function '+n }); code += `\nreturn {default:${globalThis.__n}};` }
if (/\bexport\b/.test(code.replace(/["'`][^"'`]*["'`]/g,''))) console.warn('export keyword still present?')
const wrapped = `window.__escapeSiteFactory=function(React,Framer,Motion,JSX){${code}\n};`
const min = (await esbuild.transform(wrapped, {minify:true, target:'es2019'})).code
fs.writeFileSync('escape-site.js', '/* Escape website bundle. Built from EscapeLLC/code/*.tsx. Loaded by EscapeSite.tsx in Framer. */\n' + min)
console.log('ok', min.length)
