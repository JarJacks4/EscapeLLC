// Step 1: make an extraction copy of the site source (every FAQ answer open, so all answers are in the markup).
// usage: node prep.cjs <site source .tsx that the live bundle was built from>
const fs = require('fs')
const src = process.argv[2]
if (!src) { console.error('usage: node prep.cjs <EscapeSite source .tsx>'); process.exit(1) }
let s = fs.readFileSync(src, 'utf8')
const a = '                const isOpen = open === i\n'
if (s.split(a).length !== 2) throw new Error('FAQ line not found exactly once: the Faq component changed, update prep.cjs')
fs.writeFileSync('live.tsx', s)
fs.writeFileSync('extract_src.tsx', s.replace(a, '                const isOpen = true\n'))
console.log('extract_src.tsx written from', src)
