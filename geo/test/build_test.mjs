import * as esbuild from 'esbuild'
const variant = process.argv[2] || 'EscapeSite.loader.tsx'
const alias = { framer: './framer-stub.js' }
// server build (CommonJS, React external)
await esbuild.build({ entryPoints: ['../' + variant], bundle: true, format: 'cjs', platform: 'node', outfile: 'loader.server.cjs', alias, external: ['react', 'react/jsx-runtime', 'framer-motion'], jsx: 'automatic', logLevel: 'error' })
// expose unpack for the unit test
import fs from 'fs'
let src = fs.readFileSync('../' + variant, 'utf8') + '\nexport const __unpack = unpack\nexport const __pageHtml = pageHtml\n'
fs.writeFileSync('loader.withtest.tsx', src)
await esbuild.build({ entryPoints: ['loader.withtest.tsx'], bundle: true, format: 'cjs', platform: 'node', outfile: 'loader.unit.cjs', alias, external: ['react', 'react/jsx-runtime', 'framer-motion'], jsx: 'automatic', logLevel: 'error' })
// browser build: hydrates server HTML the way Framer does
fs.writeFileSync('client.entry.jsx', `
import * as React from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import EscapeSite from '../${variant}'
const props = window.__props || {}
const el = document.getElementById('root')
window.__errors = []
const onErr = (e) => window.__errors.push(String(e && e.message || e))
if (window.__hydrate) hydrateRoot(el, <React.Suspense fallback={null}><EscapeSite {...props} /></React.Suspense>, { onRecoverableError: onErr })
else createRoot(el).render(<EscapeSite {...props} />)
`)
await esbuild.build({ entryPoints: ['client.entry.jsx'], bundle: true, format: 'iife', platform: 'browser', outfile: 'client.js', alias, jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, minify: false, logLevel: 'error' })
console.log('built', variant)
