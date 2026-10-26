// Escape: the entire website in ONE Framer code component.
//
// Paste this whole file into Framer → Assets → Code → New code file (name it "EscapeSite"),
// drop EscapeSite on an empty page, set Width to Fill (100%) and Height to Fit. That's it:
// orb gate, nav, Home, Lucille AI (Talk to Lucille), Community, Pricing, Innerverse,
// App testing (beta flow), App demo, Privacy, Terms, Cookies and the footer.
//
// Responsive: every section sizes to its own container (container queries), tested at
// 390 / 768 / 1440 px. Pages are hash routes: /#/home, /#/lucille-ai, /#/app-testing …
// Built from the separate components in EscapeLLC/code (generated, edit those and rebuild).

import * as React from "react"
import { ControlType, RenderTarget, addPropertyControls } from "framer"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

// ═══════════════ EscapeKit (shared) ═══════════════
// Escape — shared kit for the Framer site (tokens, mood store, orb, primitives).
//
// Same system as the Escape v6 app:
//   * Gilda Display (display) + Work Sans (UI)
//   * six moods with the app's own hues and TouchDesigner Mood Orb loops (Firebase Storage)
//   * night is the default tone; the sun/moon toggle switches to day (like the Home orb)
//   * text passes WCAG 2.2 AA on every surface; never pure #000 / #FFF fields
//   * motion: 520 ms, ease (0.25, 0.6, 0.25, 1), 1.8 % rise, honours prefers-reduced-motion
//
// Every Escape component imports from this file. It is a module, not a canvas component.
// The chosen mood + tone live in one small store (localStorage "escape.site.v1"), and are
// mirrored to CSS variables on <html>, so Framer-native layers can use them too:
//   var(--esc-accent)  var(--esc-ink)  var(--esc-bg)  var(--esc-glowA)  var(--esc-glowB) …


// ───────────────────────── moods ─────────────────────────

type MoodId = "calm" | "energized" | "focused" | "restless" | "tired" | "low"
type Tone = "dark" | "light"

interface Mood {
    id: MoodId
    label: string
    line: string
    hue: string // the orb / chip colour (v6MoodHue)
    accentDark: string // ≥ 3:1 on night fields
    accentLight: string // ≥ 4.5:1 on day fields (also used for link text there)
    base: [string, string, string] // the app's mood gradient (dark, contrast-fitted)
    glowA: string
    glowB: string
    loop: string // orb loop id in Firebase Storage
}

const MOODS: Mood[] = [
    { id: "calm", label: "Calm", line: "Soft and settled", hue: "#8E7CD9", accentDark: "#B9A3F0", accentLight: "#5B47B8",
      base: ["#2A2366", "#3D3190", "#1A1648"], glowA: "rgba(185,163,240,.60)", glowB: "rgba(142,124,217,.55)", loop: "escape_calm_e50_t15_v3" },
    { id: "energized", label: "Energized", line: "Bright, ready to move", hue: "#F08A1D", accentDark: "#FFE2BF", accentLight: "#A44B05",
      base: ["#8A4510", "#6B3005", "#3A1402"], glowA: "rgba(255,196,120,.55)", glowB: "rgba(239,119,2,.60)", loop: "escape_focus_e85_t50_v3" },
    { id: "focused", label: "Focused", line: "Clear and locked in", hue: "#4FA3FF", accentDark: "#9CC2FF", accentLight: "#1F5FC4",
      base: ["#164395", "#0E2C6E", "#071A4A"], glowA: "rgba(120,170,255,.45)", glowB: "rgba(57,81,159,.70)", loop: "escape_picks_e50_t15_v3" },
    { id: "restless", label: "Restless", line: "Buzzing, can't settle", hue: "#E0589A", accentDark: "#F5B26B", accentLight: "#B23A76",
      base: ["#4A2172", "#2B1240", "#1A0B2C"], glowA: "rgba(240,138,29,.45)", glowB: "rgba(142,124,217,.60)", loop: "escape_focus_e50_t85_v3" },
    { id: "tired", label: "Tired", line: "Running on low", hue: "#D9A066", accentDark: "#F0A55A", accentLight: "#8A5A1E",
      base: ["#101E43", "#0A1230", "#05081A"], glowA: "rgba(156,79,7,.30)", glowB: "rgba(33,44,90,.80)", loop: "escape_calm_e15_t50_v3" },
    { id: "low", label: "Low", line: "Heavy, a little grey", hue: "#7D8BB5", accentDark: "#C9D1EE", accentLight: "#4A5884",
      base: ["#3A4675", "#232C55", "#141A33"], glowA: "rgba(169,179,214,.40)", glowB: "rgba(57,81,159,.50)", loop: "escape_calm_e15_t85_v3" },
]

const NEUTRAL_LOOP = "escape_picks_e50_t50_v3"
const moodById = (id?: MoodId | null) => MOODS.find((m) => m.id === id) || null

const ORB_STORAGE =
    "https://firebasestorage.googleapis.com/v0/b/escape-self-care-505618.firebasestorage.app/o/visuals%2Fv3%2F"
const orbVideo = (loop: string) => `${ORB_STORAGE}${loop}_720_h264.mp4?alt=media`
const orbPoster = (loop: string) => `${ORB_STORAGE}${loop}_poster.webp?alt=media`

/** The seven energy centers (Energy Scan). One opens every 1,000 lifetime coins. */
const CENTERS = [
    { name: "Grounding", color: "#E5484D" },
    { name: "Creativity", color: "#EF7702" },
    { name: "Power", color: "#F5C542" },
    { name: "Connection", color: "#39D9C1" },
    { name: "Expression", color: "#4CF6F6" },
    { name: "Intuition", color: "#8E7CD9" },
    { name: "Purpose", color: "#B9A3F0" },
]

/** Real coin rules from the Escape API (escape_api/core.py COIN_RULES). Keep in sync. */
const COIN_RULES = [
    { what: "Mood check-in", coins: 5, cap: "up to 3 a day" },
    { what: "Finish a Mind, Reset or Body session", coins: 10, cap: "up to 6 a day" },
    { what: "First session of the day bonus", coins: 15, cap: "once a day" },
    { what: "Journal entry", coins: 15, cap: "up to 3 a day" },
    { what: "Complete a step in your plan", coins: 10, cap: "up to 6 a day" },
    { what: "Gratitude note", coins: 10, cap: "once a day" },
    { what: "Daily Energy Scan", coins: 10, cap: "once a day" },
]

// ───────────────────────── Lucille API (public website endpoints) ─────────────────────────

/** The Lucille API on Cloud Run. Only the no-login /v1/public/* routes are called from the site. */
const API_BASE = "https://lucille-861854898360.us-central1.run.app"

/** POST to a public endpoint with a timeout. Never throws: { ok, status, data }. */
async function postPublic(path: string, body: unknown, timeoutMs = 15000): Promise<{ ok: boolean; status: number; data: any }> {
    const base = (typeof window !== "undefined" && (window as any).__escapeApiBase) || API_BASE
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null
    const t = ctl ? setTimeout(() => ctl.abort(), timeoutMs) : null
    try {
        const r = await fetch(`${base}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctl?.signal })
        let data: any = null
        try { data = await r.json() } catch {}
        return { ok: r.ok, status: r.status, data }
    } catch {
        return { ok: false, status: 0, data: null }
    } finally {
        if (t) clearTimeout(t)
    }
}

// ───────────────────────── outside links (from escapeapp.ai) ─────────────────────────

const LINKS = {
    kickstarter: "https://www.kickstarter.com/projects/escapeai/1005851183?ref=3ews8f&token=e5c676ed",
    discord: "https://discord.gg/WnASA2SfA",
    influencers: "https://escape-influencer.web.app/",
    creators: "https://escape-creators.web.app/",
    maze: "https://t.maze.co/513528542",
    betaForm: "https://forms.gle/yLFiaTAdeg37AhJC6",
    tiktok: "https://www.tiktok.com/@escapeapp",
    instagram: "https://www.instagram.com/escapeappai",
    linkedin: "https://www.linkedin.com/company/escapeappai/",
}

// ───────────────────────── routes ─────────────────────────

const ROUTES = {
    gate: "/",
    home: "/home",
    lucille: "/lucille-ai",
    community: "/community",
    pricing: "/pricing",
    innerverse: "/innerverse",
    beta: "/app-testing",
    demo: "/app-demo",
    privacy: "/privacy-policy",
    terms: "/terms",
    cookies: "/cookie-policy",
}

/** The orb gate: each mood tints the site and opens the part of it that fits that feeling. */
const MOOD_PATHS: Record<MoodId, { title: string; line: string; href: string }> = {
    calm: { title: "Slow down", line: "Start with the whole of Escape", href: ROUTES.home },
    focused: { title: "Talk it through", line: "Meet Lucille, your companion", href: ROUTES.lucille },
    energized: { title: "Grow and earn", line: "Coins, levels and the community", href: ROUTES.community },
    restless: { title: "See it move", line: "Watch the app in action", href: ROUTES.demo },
    tired: { title: "Drift somewhere", line: "Preview the 3D Innerverse", href: ROUTES.innerverse },
    low: { title: "Start gently", line: "One small step, at your pace", href: ROUTES.home },
}

/** Go to a page. On the Framer site this is a normal navigation; the standalone HTML preview
 *  installs window.__escapeNavigate so the same components work inside one file. */
function navigate(href: string) {
    if (!isBrowser) return
    const f = (window as any).__escapeNavigate
    if (typeof f === "function") f(href)
    else window.location.href = href
}

// ───────────────────────── store ─────────────────────────

interface EscState { mood: MoodId | null; tone: Tone }
const KEY = "escape.site.v1"
const isBrowser = typeof window !== "undefined"

function load(): EscState {
    const fallback: EscState = { mood: null, tone: "dark" }
    if (!isBrowser) return fallback
    try {
        const raw = window.localStorage.getItem(KEY)
        if (raw) {
            const p = JSON.parse(raw)
            return { mood: moodById(p.mood) ? p.mood : null, tone: p.tone === "light" ? "light" : "dark" }
        }
    } catch {}
    return fallback
}

let state: EscState = load()
const subs = new Set<() => void>()

function commit(next: EscState) {
    state = next
    try { window.localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
    applyVars()
    subs.forEach((f) => f())
}

const escape = {
    get: () => state,
    setMood: (mood: MoodId | null) => commit({ ...state, mood }),
    setTone: (tone: Tone) => commit({ ...state, tone }),
    toggleTone: () => commit({ ...state, tone: state.tone === "dark" ? "light" : "dark" }),
}

const SERVER_STATE: EscState = { mood: null, tone: "dark" }
function useEscape(): EscState {
    return React.useSyncExternalStore(
        (f) => { subs.add(f); return () => { subs.delete(f) } },
        () => state,
        () => SERVER_STATE
    )
}

// ───────────────────────── tokens → CSS variables ─────────────────────────

function tokens(s: EscState) {
    const m = moodById(s.mood)
    const light = s.tone === "light"
    if (light) {
        return {
            "--esc-bg": "#F6F8FF",
            "--esc-bg2": "#DCE5FB",
            "--esc-bg3": "#B4C7F5",
            "--esc-ink": "#0B1230",
            "--esc-muted": "rgba(11,18,48,.85)",
            "--esc-faint": "rgba(11,18,48,.72)",
            "--esc-accent": m ? m.accentLight : "#3A5BD9",
            "--esc-gold": "#9A4A06",
            "--esc-glass1": "rgba(255,255,255,.78)",
            "--esc-glass2": "rgba(255,255,255,.52)",
            "--esc-border": "rgba(255,255,255,.95)",
            "--esc-line": "rgba(11,18,48,.10)",
            "--esc-shadow": "0 18px 50px -24px rgba(31,55,168,.35)",
            "--esc-glowA": m ? m.glowA.replace(/[\d.]+\)$/, ".45)") : "rgba(255,255,255,.95)",
            "--esc-glowB": m ? m.glowB.replace(/[\d.]+\)$/, ".40)") : "rgba(86,120,232,.55)",
            "--esc-onAccent": "#F6F8FF",
            "--esc-nav": "rgba(246,248,255,.72)",
        }
    }
    return {
        "--esc-bg": "#0B1230",
        "--esc-bg2": "#101E43",
        "--esc-bg3": "#0B1230",
        "--esc-ink": "#E6EAF4",
        "--esc-muted": "rgba(230,234,244,.85)",
        "--esc-faint": "rgba(230,234,244,.74)",
        "--esc-accent": m ? m.accentDark : "#B9A3F0",
        "--esc-gold": "#F5C26B",
        "--esc-glass1": "rgba(255,255,255,.085)",
        "--esc-glass2": "rgba(255,255,255,.035)",
        "--esc-border": "rgba(230,234,244,.16)",
        "--esc-line": "rgba(230,234,244,.10)",
        "--esc-shadow": "0 24px 60px -30px rgba(0,0,0,.65)",
        "--esc-glowA": m ? m.glowA : "rgba(142,124,217,.32)",
        "--esc-glowB": m ? m.glowB : "rgba(57,81,159,.45)",
        "--esc-onAccent": "#0B1230",
        "--esc-nav": "rgba(16,30,67,.62)",
    }
}

function applyVars() {
    if (!isBrowser) return
    const root = document.documentElement
    const t = tokens(state) as Record<string, string>
    for (const k in t) root.style.setProperty(k, t[k])
    root.dataset.escTone = state.tone
    root.dataset.escMood = state.mood || "none"
    root.style.colorScheme = state.tone
}

// ───────────────────────── global CSS + fonts ─────────────────────────

const EASE = "cubic-bezier(.25,.6,.25,1)"
const ease = [0.25, 0.6, 0.25, 1] as const
/** Slower, softer curve for arrivals and reveals (serene). */
const easeSoft = [0.22, 0.61, 0.36, 1] as const

const CSS = `
:root{--esc-ease:${EASE};--esc-ease-soft:cubic-bezier(.22,.61,.36,1)}
.esc{font-family:"Work Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--esc-ink);-webkit-font-smoothing:antialiased;line-height:1.5;font-size:16px;box-sizing:border-box;position:relative;width:100%;container-type:inline-size;transition:color .52s var(--esc-ease)}
.esc *,.esc *::before,.esc *::after{box-sizing:border-box}
.esc-page{background:var(--esc-bg);overflow-x:clip;transition:background-color .52s var(--esc-ease)}
.esc-d{font-family:"Gilda Display",Georgia,serif;font-weight:400;letter-spacing:-.01em;line-height:1.08;margin:0;text-wrap:balance}
.esc-h1{font-size:clamp(44px,5.8cqi,84px)}
.esc-h2{font-size:clamp(34px,4.6cqi,60px)}
.esc-h3{font-size:clamp(22px,2cqi,28px);line-height:1.2}
.esc-gold{color:var(--esc-gold);font-style:italic}
.esc-lede{font-size:clamp(17px,1.45cqi,20px);color:var(--esc-muted);line-height:1.6;margin:0;text-wrap:pretty;max-width:62ch}
.esc-p{color:var(--esc-muted);margin:0;line-height:1.6;text-wrap:pretty}
.esc-small{font-size:14px;color:var(--esc-faint)}
.esc-over{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--esc-faint);font-weight:500}
.esc-wrap{max-width:1200px;margin:0 auto;padding:0 clamp(20px,5cqi,48px);position:relative}
.esc-sec{padding:clamp(56px,7cqi,104px) 0;position:relative}
.esc-center{text-align:center;margin-left:auto;margin-right:auto}
.esc-stack{display:flex;flex-direction:column}
.esc-row{display:flex;flex-wrap:wrap;align-items:center}
.esc-grid{display:grid;gap:clamp(14px,1.6cqi,22px)}
.g2{grid-template-columns:repeat(2,minmax(0,1fr))}
.g3{grid-template-columns:repeat(3,minmax(0,1fr))}
.g4{grid-template-columns:repeat(4,minmax(0,1fr))}
@container (max-width:980px){.g4{grid-template-columns:repeat(2,minmax(0,1fr))}.g3{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container (max-width:640px){.g2,.g3,.g4{grid-template-columns:minmax(0,1fr)}}
.esc-glass{position:relative;background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2));border:1px solid var(--esc-border);border-radius:28px;box-shadow:var(--esc-shadow);-webkit-backdrop-filter:blur(18px) saturate(1.15);backdrop-filter:blur(18px) saturate(1.15);transition:transform .52s var(--esc-ease),border-color .52s var(--esc-ease),background .52s var(--esc-ease)}
.esc-glow::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:linear-gradient(140deg,var(--esc-accent),transparent 38%,transparent 62%,var(--esc-glowB));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.55;transition:opacity .52s var(--esc-ease);pointer-events:none}
.esc-glow::after{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(120% 80% at 0% 0%,var(--esc-glowA),transparent 55%);opacity:.0;transition:opacity .52s var(--esc-ease);pointer-events:none}
.esc-lift:hover{transform:translateY(-3px)}
.esc-lift:hover.esc-glow::before{opacity:1}
.esc-lift:hover.esc-glow::after{opacity:.35}
.esc-card{padding:clamp(22px,2.4cqi,32px)}
.esc-btn{appearance:none;border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:52px;padding:0 26px;border-radius:999px;font:500 16px/1 "Work Sans",system-ui,sans-serif;text-decoration:none;white-space:nowrap;transition:transform .38s var(--esc-ease),box-shadow .38s var(--esc-ease),background .38s var(--esc-ease)}
.esc-btn:active{transform:scale(.98)}
.esc-btn-p{color:var(--esc-onAccent);background:linear-gradient(135deg,var(--esc-accent),color-mix(in oklab,var(--esc-accent) 62%,#39519F));box-shadow:0 10px 34px -10px var(--esc-accent),inset 0 1px 0 rgba(255,255,255,.35)}
.esc-btn-p:hover{box-shadow:0 14px 44px -8px var(--esc-accent),inset 0 1px 0 rgba(255,255,255,.45);transform:translateY(-1px)}
.esc-btn-g{color:var(--esc-ink);background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2));border:1px solid var(--esc-border);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.esc-btn-g:hover{border-color:var(--esc-accent)}
.esc-btn-sm{min-height:44px;padding:0 18px;font-size:15px}
.esc a:focus-visible,.esc button:focus-visible,.esc [tabindex]:focus-visible{outline:3px solid var(--esc-accent);outline-offset:3px;border-radius:14px}
.esc-chip{display:inline-flex;align-items:center;gap:8px;min-height:34px;padding:0 14px;border-radius:999px;font-size:13px;font-weight:500;color:var(--esc-muted);background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2));border:1px solid var(--esc-border)}
.esc-dot{width:8px;height:8px;border-radius:50%;background:var(--esc-gold);box-shadow:0 0 12px var(--esc-gold)}
.esc-soon{display:inline-flex;align-items:center;min-height:26px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:500;color:var(--esc-gold);border:1px solid color-mix(in oklab,var(--esc-gold) 55%,transparent)}
.esc-icon{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;color:var(--esc-accent);background:color-mix(in oklab,var(--esc-accent) 14%,transparent);border:1px solid color-mix(in oklab,var(--esc-accent) 30%,transparent)}
.esc-hr{height:1px;background:var(--esc-line);border:0;margin:0}
.esc-link{color:var(--esc-accent);text-decoration:none;font-weight:500;display:inline-flex;align-items:center;gap:6px}
.esc-link:hover{text-decoration:underline;text-underline-offset:4px}
.esc-noise{position:absolute;inset:0;pointer-events:none;opacity:.05;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.esc-blob{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;will-change:transform}
@keyframes esc-drift{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(4%,-3%,0) scale(1.08)}}
@keyframes esc-drift2{0%,100%{transform:translate3d(0,0,0) scale(1.05)}50%{transform:translate3d(-5%,4%,0) scale(.96)}}
@keyframes esc-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
@keyframes esc-ring{0%{transform:scale(.92);opacity:.55}100%{transform:scale(1.5);opacity:0}}
@keyframes esc-serene{from{opacity:0;filter:blur(10px);transform:translateY(12px)}to{opacity:1;filter:none;transform:none}}
@keyframes esc-pagein{from{opacity:0}to{opacity:1}}
@keyframes esc-drift-slow{0%,100%{transform:scale(1.06) translate3d(0,0,0)}50%{transform:scale(1.1) translate3d(-1.2%,-.8%,0)}}
.esc-page{animation:esc-pagein 1.1s var(--esc-ease-soft) both}
.esc-serene>*{opacity:0;animation:esc-serene 1.5s var(--esc-ease-soft) forwards}
.esc-serene>*:nth-child(1){animation-delay:.2s}.esc-serene>*:nth-child(2){animation-delay:.42s}.esc-serene>*:nth-child(3){animation-delay:.64s}.esc-serene>*:nth-child(4){animation-delay:.86s}.esc-serene>*:nth-child(5){animation-delay:1.08s}.esc-serene>*:nth-child(6){animation-delay:1.3s}.esc-serene>*:nth-child(7){animation-delay:1.52s}.esc-serene>*:nth-child(8){animation-delay:1.74s}
@keyframes esc-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.esc-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (prefers-reduced-motion:reduce){.esc *,.esc *::before,.esc *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
`

const FONTS = "https://fonts.googleapis.com/css2?family=Gilda+Display&family=Work+Sans:wght@300;400;500;600&display=swap"

/** Call once at the top of every Escape component: fonts, CSS and the live mood/tone variables. */
function useEscapeSetup() {
    const s = useEscape()
    React.useEffect(() => {
        if (!isBrowser) return
        if (!document.getElementById("esc-fonts")) {
            const pre = document.createElement("link")
            pre.rel = "preconnect"; pre.href = "https://fonts.gstatic.com"; pre.crossOrigin = ""
            const l = document.createElement("link")
            l.id = "esc-fonts"; l.rel = "stylesheet"; l.href = FONTS
            document.head.append(pre, l)
        }
        if (!document.getElementById("esc-css")) {
            const st = document.createElement("style")
            st.id = "esc-css"; st.textContent = CSS
            document.head.appendChild(st)
        }
        applyVars()
    }, [])
    return s
}

/** Inline style with the current tokens — so a component looks right on first paint, before
 *  the <html> variables land (Framer canvas, static export). */
function useTokenStyle(): React.CSSProperties {
    const s = useEscapeSetup()
    return tokens(s) as React.CSSProperties
}

/** The CSS above as a <style> tag, for the first server-rendered paint. */
function EscapeStyle() {
    return <style dangerouslySetInnerHTML={{ __html: CSS }} />
}

// ───────────────────────── primitives ─────────────────────────

/** Rise-and-fade on scroll (the app's 1.8 % rise, 520 ms). */
function Reveal(props: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties; as?: "div" | "li" | "section" }) {
    const reduce = useReducedMotion()
    const Comp: any = (motion as any)[props.as || "div"]
    return (
        <Comp
            className={props.className}
            style={props.style}
            initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } } as any}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 1.0, ease: easeSoft, delay: (props.delay || 0) * 1.6 }}
        >
            {props.children}
        </Comp>
    )
}

function Eyebrow(props: { children: React.ReactNode; dot?: boolean }) {
    return (
        <span className="esc-chip">
            {props.dot !== false && <span className="esc-dot" aria-hidden />}
            {props.children}
        </span>
    )
}

function Button(props: { href?: string; children: React.ReactNode; variant?: "primary" | "ghost"; small?: boolean; onClick?: () => void; arrow?: boolean; icon?: React.ReactNode; ariaLabel?: string; newTab?: boolean }) {
    const cls = `esc-btn ${props.variant === "ghost" ? "esc-btn-g" : "esc-btn-p"} ${props.small ? "esc-btn-sm" : ""}`
    const inner = (
        <>
            {props.icon}
            <span>{props.children}</span>
            {props.arrow && <Icon name="arrow" size={18} />}
        </>
    )
    if (props.href)
        return (
            <a className={cls} href={props.href} onClick={props.onClick} aria-label={props.ariaLabel}
               target={props.newTab ? "_blank" : undefined} rel={props.newTab ? "noopener noreferrer" : undefined}>
                {inner}
            </a>
        )
    return <button type="button" className={cls} onClick={props.onClick} aria-label={props.ariaLabel}>{inner}</button>
}

function SectionHead(props: { eyebrow?: string; title: React.ReactNode; lede?: React.ReactNode; center?: boolean; max?: number }) {
    return (
        <Reveal className={`esc-stack ${props.center ? "esc-center" : ""}`} style={{ gap: 18, alignItems: props.center ? "center" : "flex-start", maxWidth: props.max || 760, marginBottom: "clamp(36px,4.5cqi,56px)" }}>
            {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
            <h2 className="esc-d esc-h2">{props.title}</h2>
            {props.lede && <p className="esc-lede" style={{ marginLeft: props.center ? "auto" : 0, marginRight: props.center ? "auto" : 0 }}>{props.lede}</p>}
        </Reveal>
    )
}

function Card(props: { children: React.ReactNode; className?: string; style?: React.CSSProperties; delay?: number; glow?: boolean }) {
    return (
        <Reveal delay={props.delay} className={`esc-glass esc-card esc-lift ${props.glow !== false ? "esc-glow" : ""} ${props.className || ""}`} style={props.style}>
            {props.children}
        </Reveal>
    )
}

function Feature(props: { icon: IconName; title: string; body: string; soon?: boolean; delay?: number; children?: React.ReactNode }) {
    return (
        <Card delay={props.delay} className="esc-stack" style={{ gap: 14, minHeight: 220 }}>
            <div className="esc-row" style={{ justifyContent: "space-between" }}>
                <span className="esc-icon"><Icon name={props.icon} /></span>
                {props.soon && <span className="esc-soon">Coming soon</span>}
            </div>
            <h3 className="esc-d esc-h3" style={{ marginTop: 10 }}>{props.title}</h3>
            <p className="esc-p">{props.body}</p>
            {props.children}
        </Card>
    )
}

/** Soft mood aurora behind a section — the app's ambient gradient, drifting slowly. */
function Backdrop(props: { intensity?: number; top?: boolean }) {
    const k = props.intensity ?? 1
    return (
        <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", WebkitMaskImage: props.top ? "linear-gradient(#000 70%, transparent)" : "linear-gradient(transparent, #000 22%, #000 78%, transparent)", maskImage: props.top ? "linear-gradient(#000 70%, transparent)" : "linear-gradient(transparent, #000 22%, #000 78%, transparent)" }}>
            <div className="esc-blob" style={{ width: "62%", aspectRatio: "1", left: "-14%", top: props.top ? "-28%" : "-10%", background: "var(--esc-glowB)", opacity: 0.55 * k, animation: "esc-drift 22s var(--esc-ease) infinite" }} />
            <div className="esc-blob" style={{ width: "48%", aspectRatio: "1", right: "-12%", top: "18%", background: "var(--esc-glowA)", opacity: 0.38 * k, animation: "esc-drift2 26s var(--esc-ease) infinite" }} />
            <div className="esc-noise" />
        </div>
    )
}

// ───────────────────────── the Mood Orb ─────────────────────────

/**
 * The real TouchDesigner orb, framed exactly like V6MoodOrb in the app:
 *  * clipped to a circle with a hairline border, the loop centred on the sphere (the sphere sits
 *    ~5.5 % above the middle of the 720×1280 loops, so the crop is shifted to it)
 *  * re-coloured with the mood's hue using a `color` blend, which keeps the orb's light and
 *    texture and swaps only its hue, so each of the six moods reads as its own orb
 *  * a two-layer glow in the same hue (tight halo + wide bloom)
 *  * colour, glow and loop cross-fade (600 ms) when the mood changes; breathes on a 3 s pulse
 */
function Orb(props: { mood?: MoodId | null; size?: number | string; live?: boolean; eager?: boolean; glow?: boolean; breathe?: boolean; rings?: boolean; label?: string; style?: React.CSSProperties; tint?: string | null; warm?: boolean; hero?: boolean }) {
    const m = moodById(props.mood)
    const loop = m ? m.loop : NEUTRAL_LOOP
    const hue = props.tint !== undefined ? props.tint : m ? m.hue : null
    const reduce = useReducedMotion()
    const size = props.size ?? 220
    const ref = React.useRef<HTMLDivElement>(null)
    const [px, setPx] = React.useState(typeof size === "number" ? size : 120)
    React.useEffect(() => {
        if (typeof size === "number") { setPx(size); return }
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([e]) => setPx(e.contentRect.width || 120))
        ro.observe(el)
        return () => ro.disconnect()
    }, [size])
    const glowOn = props.glow !== false
    const g = hue || "#8E7CD9"
    const strong = !!props.rings || (props.glow === true)
    const shadow = glowOn
        ? `0 0 ${Math.min(px * 0.25, 60)}px ${px * 0.02}px ${hexA(g, strong ? 0.7 : 0.35)}`
        : "none"
    return (
        <div ref={ref} role="img" data-esc-hero={props.hero ? "" : undefined} aria-label={props.label || (m ? `${m.label} mood orb` : "Escape mood orb")}
            style={{ position: "relative", width: size, aspectRatio: "1", flex: "none", ...props.style }}>
            {glowOn && (
                <div aria-hidden style={{ position: "absolute", inset: strong ? "-55%" : "-30%", borderRadius: "50%", pointerEvents: "none",
                    background: `radial-gradient(closest-side, ${hexA(g, strong ? 0.42 : 0.2)}, ${hexA(g, 0)} 100%)`, transition: "background .6s var(--esc-ease)" }} />
            )}
            {props.rings && !reduce && [0, 1].map((i) => (
                <span key={i} aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${g}`, transition: "border-color .6s", animation: `esc-ring 3.6s ${i * 1.8}s var(--esc-ease) infinite` }} />
            ))}
            <div style={{ position: "absolute", inset: 0, animation: props.breathe === false || reduce ? undefined : "esc-breathe 3s var(--esc-ease) infinite" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", isolation: "isolate", background: "#0D1132",
                    border: "1px solid rgba(255,255,255,.28)", boxShadow: shadow, transition: "box-shadow .6s var(--esc-ease)" }}>
                    <AnimatePresence initial={false}>
                        <motion.div key={loop} style={{ position: "absolute", inset: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease }}>
                            <OrbMedia loop={loop} live={!!props.live && !reduce} warm={props.warm} eager={props.eager} />
                        </motion.div>
                    </AnimatePresence>
                    {/* the app's ColorFilter(hue, BlendMode.color) */}
                    <div aria-hidden style={{ position: "absolute", inset: 0, background: hue || "transparent", mixBlendMode: "color", opacity: hue ? 1 : 0, transition: "background-color .6s var(--esc-ease), opacity .6s var(--esc-ease)" }} />
                </div>
            </div>
        </div>
    )
}

function hexA(hex: string, a: number) {
    const h = hex.replace("#", "")
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16)
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/** Where the sphere sits in each loop (centre x/y as a fraction of the frame, diameter as a
 *  fraction of its width), measured from the TouchDesigner renders. Used to fit every sphere to
 *  90 % of its circle, dead centre. */
const ORB_GEO: Record<string, [number, number, number]> = {
    escape_calm_e50_t15_v3: [0.5026, 0.4484, 0.6476],
    escape_focus_e85_t50_v3: [0.464, 0.465, 0.62],
    escape_picks_e50_t15_v3: [0.5021, 0.4426, 0.5514],
    escape_focus_e50_t85_v3: [0.465, 0.463, 0.63],
    escape_calm_e15_t50_v3: [0.4972, 0.4363, 0.5764],
    escape_calm_e15_t85_v3: [0.4979, 0.4367, 0.5861],
    escape_picks_e50_t50_v3: [0.5021, 0.4426, 0.5681],
    offline_calm: [0.4972, 0.4448, 0.6685],
    offline_focus: [0.4861, 0.4453, 0.6426],
    offline_picks: [0.5009, 0.4432, 0.5759],
}
const ORB_FIT = 0.9

/**
 * H.264 fallback loops (the app's own offline loops, ~700 KB each, play in every browser).
 * Firebase currently holds only HEVC copies of the mood loops, which some browsers can't play.
 * They live in MEDIA_BASE/orbs/ (upload: see README), or set window.__escapeOrbFallback.
 */
/** Public media for the website (the same public bucket the app uses), folder web/. */
const MEDIA_BASE = "https://storage.googleapis.com/escape-self-care-505618-escape-media/web/"
let ORB_FALLBACK_BASE = MEDIA_BASE + "orbs/"
/** Flip to true once the H.264 copies (…_720_h264.mp4) are uploaded to Firebase Storage. */
const ORB_HAS_H264 = true
const fallbackBase = () => (isBrowser && (window as any).__escapeOrbFallback) || ORB_FALLBACK_BASE

function fitStyle(key: string): React.CSSProperties {
    const [cx, cy, d] = ORB_GEO[key] || [0.5, 0.443, 0.6]
    const w = (ORB_FIT / d) * 100 // % of the circle
    const h = w * (16 / 9)
    return { position: "absolute", width: `${w}%`, height: `${h}%`, left: `${50 - cx * w}%`, top: `${50 - cy * h}%`, maxWidth: "none", objectFit: "fill" }
}

function OrbMedia({ loop, live, eager, warm }: { loop: string; live: boolean; eager?: boolean; warm?: boolean }) {
    const v = React.useRef<HTMLVideoElement>(null)
    const [ready, setReady] = React.useState(false)
    const [vkey, setVkey] = React.useState(loop)
    const [mounted, setMounted] = React.useState(live || !!warm)
    React.useEffect(() => { if (live) setMounted(true) }, [live])
    React.useEffect(() => {
        const el = v.current
        if (!el) return
        if (live) el.play().catch(() => {})
        else el.pause()
    }, [live, mounted])
    const grid = loop.split("_")[1] // calm | focus | picks
    const fb = fallbackBase()
    return (
        <>
            <img src={orbPoster(loop)} alt="" draggable={false} style={fitStyle(loop)} loading={eager ? "eager" : "lazy"} decoding="async" />
            {mounted && (
                <video
                    ref={v}
                    muted loop playsInline autoPlay={live} preload="auto"
                    onLoadedData={(e) => { setVkey(e.currentTarget.currentSrc.includes("_offline") ? `offline_${grid}` : loop); setReady(true) }}
                    style={{ ...fitStyle(vkey), opacity: ready ? 1 : 0, transition: "opacity .6s" }}
                >
                    {ORB_HAS_H264 && <source src={orbVideo(loop)} type="video/mp4" />}
                    <source src={`${ORB_STORAGE}${loop}_720_hevc.mp4?alt=media`} type={'video/mp4; codecs="hvc1"'} />
                    {fb && <source src={`${fb}escape_${grid}_e50_t50_v3_540_offline.mp4`} type="video/mp4" />}
                    {fb && <source src={`${fb}escape_${grid}_e50_t50_v3_540_offline.webm`} type="video/webm" />}
                </video>
            )}
        </>
    )
}

// ───────────────────────── cross-page hero orb ─────────────────────────

const FLIGHT_KEY = "escape.flight.v1"
/** Remember where the orb is on screen right before leaving a page (the gate calls this). */
function launchOrb(el: Element | null, mood: MoodId | null) {
    if (!el || !isBrowser) return
    const r = el.getBoundingClientRect()
    try { sessionStorage.setItem(FLIGHT_KEY, JSON.stringify({ mood, x: r.left, y: r.top, s: r.width, at: Date.now() })) } catch {}
}

/**
 * Lands the orb on the next page: it appears exactly where it left the last page and glides into
 * this page's hero orb ([data-esc-hero]) or the nav orb, then hands over seamlessly. Rendered by
 * SiteNav, so it runs on every page.
 */
function FlightOrb() {
    const reduce = useReducedMotion()
    const [f, setF] = React.useState<null | { mood: MoodId | null; x: number; y: number; s: number; tx: number; ty: number; ts: number }>(null)
    const target = React.useRef<HTMLElement | null>(null)
    React.useEffect(() => {
        let raw: string | null = null
        try { raw = sessionStorage.getItem(FLIGHT_KEY); sessionStorage.removeItem(FLIGHT_KEY) } catch {}
        if (!raw || reduce) return
        const j = JSON.parse(raw)
        if (Date.now() - j.at > 6000) return
        const t = window.setTimeout(() => {
            const el = (document.querySelector("[data-esc-hero]") || document.querySelector(".nav-orb")) as HTMLElement | null
            if (!el) return
            const r = el.getBoundingClientRect()
            const visible = r.top < window.innerHeight && r.bottom > 0
            const tr = visible ? r : ((document.querySelector(".nav-orb") as HTMLElement) || el).getBoundingClientRect()
            target.current = visible ? el : (document.querySelector(".nav-orb") as HTMLElement)
            if (target.current) { target.current.style.transition = "opacity .5s"; target.current.style.opacity = "0" }
            setF({ mood: j.mood, x: j.x, y: j.y, s: j.s, tx: tr.left, ty: tr.top, ts: tr.width })
        }, 60)
        return () => window.clearTimeout(t)
    }, [])
    if (!f) return null
    return (
        <motion.div aria-hidden style={{ position: "fixed", left: 0, top: 0, width: f.s, height: f.s, zIndex: 60, pointerEvents: "none" }}
            initial={{ x: f.x, y: f.y, scale: 1, opacity: 1 }}
            animate={{ x: f.tx + (f.ts - f.s) / 2, y: f.ty + (f.ts - f.s) / 2, scale: f.ts / f.s, opacity: [1, 1, 1, 0] }}
            transition={{ duration: 1.5, ease: easeSoft, opacity: { duration: 1.9, times: [0, 0.6, 0.8, 1] } }}
            onAnimationComplete={() => { if (target.current) target.current.style.opacity = ""; setF(null) }}>
            <Orb mood={f.mood} size={f.s} live glow />
        </motion.div>
    )
}

// ───────────────────────── splash wordmark (the app's Lottie) ─────────────────────────

const LOGO_LOTTIE: any = {"nm":"Main Scene","ddd":0,"h":512,"w":512,"meta":{"g":"@lottiefiles/creator 1.59.0"},"layers":[{"ty":0,"nm":"Nested Scene 1","sr":1,"st":0,"op":150,"ip":0,"hd":false,"ddd":0,"bm":0,"hasMask":false,"ao":0,"ks":{"a":{"a":0,"k":[421,115]},"s":{"a":0,"k":[60.56295482874591,58.16360459077765]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[256.00000383502,256]},"r":{"a":0,"k":0},"sa":{"a":0,"k":0},"o":{"a":0,"k":100}},"w":842,"h":230,"refId":"precomp_Shape Layer - SVG_arpYER7ofs_b5c83f58-6600-4af6-bba0-e3bb15f87918","ind":1}],"v":"5.7.0","fr":30,"op":150,"ip":0,"assets":[{"nm":"Nested Scene 1","id":"precomp_Shape Layer - SVG_arpYER7ofs_b5c83f58-6600-4af6-bba0-e3bb15f87918","layers":[{"ty":4,"nm":"Shape Layer 1","sr":1,"st":0,"op":150,"ip":0,"hd":false,"ddd":0,"bm":0,"hasMask":false,"ao":0,"ks":{"a":{"a":0,"k":[420.94,114.97]},"s":{"a":0,"k":[100,100]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[420.94,114.97]},"r":{"a":0,"k":0},"sa":{"a":0,"k":0},"o":{"a":1,"k":[{"o":{"x":0.167,"y":0.167},"i":{"x":0.833,"y":0.833},"s":[0],"t":2},{"o":{"x":0.167,"y":0.167},"i":{"x":0.833,"y":0.833},"s":[0],"t":28},{"o":{"x":0.167,"y":0.167},"i":{"x":0.833,"y":0.833},"s":[30],"t":59},{"s":[100],"t":98}]}},"shapes":[{"ty":"gr","bm":0,"hd":false,"nm":"Group 1","np":2,"it":[{"ty":"sh","bm":0,"hd":false,"nm":"Path 1","d":1,"ks":{"a":0,"k":{"c":true,"i":[[0,0],[0,0],[0,14.49],[0,0],[6.64,2.22],[0,0],[0,0],[0,0],[0,0],[22.53,0],[0,0],[0,0],[0,0],[-3.21,10.47],[0,0],[0,0],[0,0],[24.54,0],[0,0],[0,0],[-6.44,0],[0,0],[-7.64,20.51],[0,0],[0,0],[0,0]],"o":[[0,0],[6.64,-2.21],[0,0],[0,-14.49],[0,0],[0,0],[0,0],[0,0],[-8.04,-19.71],[0,0],[0,0],[0,0],[24.54,0],[0,0],[0,0],[0,0],[-3.22,-10.46],[0,0],[0,0],[0,6.44],[0,0],[20.32,0],[0,0],[0,0],[0,0],[0,0]],"v":[[679.38,185.19],[679.38,182.37],[687.43,159.63],[687.43,69.9],[679.38,47.16],[679.38,44.34],[775.95,44.34],[778.16,72.71],[775.54,73.31],[732.29,47.56],[708.75,47.56],[708.75,107.92],[728.06,107.92],[762.86,92.62],[765.68,92.62],[765.68,126.43],[762.86,126.43],[728.06,111.14],[708.75,111.14],[708.75,171.89],[718.81,181.95],[738.12,181.95],[779.96,155.4],[782.58,155.8],[781.17,185.18],[679.37,185.18]]}}},{"ty":"fl","bm":0,"hd":false,"nm":"Fill","c":{"a":0,"k":[0.1098,0.149,0.2706]},"r":1,"o":{"a":0,"k":100}},{"ty":"tr","a":{"a":0,"k":[730.975,114.76499999999999]},"s":{"a":0,"k":[100,100]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[730.975,114.76499999999999]},"r":{"a":0,"k":0},"sa":{"a":0,"k":0},"o":{"a":0,"k":100}}]},{"ty":"gr","bm":0,"hd":false,"nm":"Group 2","np":3,"it":[{"ty":"sh","bm":0,"hd":false,"nm":"Path 2","d":1,"ks":{"a":0,"k":{"c":true,"i":[[0,0],[0,14.49],[0,0],[6.64,2.22],[0,0],[0,0],[0,-16.29],[41.24,0],[0,0],[0,0],[-6.63,-2.22],[0,0],[0,0],[0,0]],"o":[[6.64,-2.21],[0,0],[0,-14.49],[0,0],[0,0],[45.87,0],[0,25.15],[0,0],[0,0],[0,14.49],[0,0],[0,0],[0,0],[0,0]],"v":[[568.72,182.37],[576.77,159.63],[576.77,69.9],[568.72,47.16],[568.72,44.34],[610.97,44.34],[667.3,83.37],[607.95,129.84],[598.09,129.84],[598.09,159.61],[606.13,182.35],[606.13,185.17],[568.71,185.17],[568.71,182.35]]}}},{"ty":"sh","bm":0,"hd":false,"nm":"Path 3","d":1,"ks":{"a":0,"k":{"c":true,"i":[[0,0],[31.79,0],[1.41,-0.2],[0,0],[0,0],[0,22.74]],"o":[[0,-17.3],[-2,0],[0,0],[0,0],[26.36,0],[0,0]],"v":[[644.57,88.61],[604.33,47.57],[598.09,47.97],[598.09,126.63],[606.94,126.63],[644.56,88.6]]}}},{"ty":"fl","bm":0,"hd":false,"nm":"Fill","c":{"a":0,"k":[0.1098,0.149,0.2706]},"r":1,"o":{"a":0,"k":100}},{"ty":"tr","a":{"a":0,"k":[618.005,114.755]},"s":{"a":0,"k":[100,100]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[618.005,114.755]},"r":{"a":0,"k":0},"sa":{"a":0,"k":0},"o":{"a":0,"k":100}}]},{"ty":"gr","bm":0,"hd":false,"nm":"Group 3","np":3,"it":[{"ty":"sh","bm":0,"hd":false,"nm":"Path 4","d":1,"ks":{"a":0,"k":{"c":true,"i":[[0,0],[-5.43,13.48],[0,0],[1.81,3.63],[0,0],[0,0],[0,0],[-4.63,-2.21],[0,0],[0,0],[0,0],[5.63,13.27],[0,0],[0,0],[0,0],[-6.83,-1.61],[0,0],[0,0],[0,0]],"o":[[6.03,-2.21],[0,0],[1.61,-4.03],[0,0],[0,0],[0,0],[5.63,13.27],[0,0],[0,0],[0,0],[6.64,-2.21],[0,0],[0,0],[0,0],[-5.43,13.48],[0,0],[0,0],[0,0],[0,0]],"v":[[425.67,182.37],[442.57,161.44],[480.19,68.1],[479.79,57.23],[477.18,51.6],[496.89,42.75],[546.79,161.66],[562.28,182.38],[562.28,185.2],[525.66,185.2],[525.66,182.38],[523.85,161.66],[511.78,132.69],[458.06,132.69],[446.39,161.46],[449,182.39],[449,185.21],[425.66,185.21],[425.66,182.39]]}}},{"ty":"sh","bm":0,"hd":false,"nm":"Path 5","d":1,"ks":{"a":0,"k":{"c":true,"i":[[0,0],[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0],[0,0]],"v":[[510.37,129.46],[484.42,67.29],[459.27,129.46],[510.37,129.46]]}}},{"ty":"fl","bm":0,"hd":false,"nm":"Fill","c":{"a":0,"k":[0.1098,0.149,0.2706]},"r":1,"o":{"a":0,"k":100}},{"ty":"tr","a":{"a":0,"k":[493.9700263157894,113.97999999999999]},"s":{"a":0,"k":[100,100]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[493.9700263157894,113.97999999999999]},"r":{"a":0,"k":0},"sa":{"a":0,"k":0},"o":{"a":0,"k":100}}]},{"ty":"gr","bm":0,"hd":false,"nm":"Group 4","np":2,"it":[{"ty":"sh","bm":0,"hd":false,"nm":"Path 6","d":1,"ks":{"a":0,"k":{"c":true,"i":[[0,0],[-49.29,0],[-10.46,-7.03],[0,0],[0,0],[20.73,0],[0,-40.04],[-39.23,0],[-7.24,20.92],[0,0],[0,0],[24.55,0],[0,45.07]],"o":[[0,-40.63],[14.89,0],[0,0],[0,0],[-8.25,-20.72],[-32.19,0],[0,40.04],[22.54,0],[0,0],[0,0],[-10.66,4.83],[-48.08,0],[0,0]],"v":[[291.68,117.18],[373.16,42.95],[419.23,52.8],[420.03,79.36],[417.62,79.96],[367.92,46.77],[313,108.13],[375.17,182.97],[420.44,148.36],[423.05,148.76],[419.83,177.53],[369.33,187.18],[291.67,117.17]]}}},{"ty":"fl","bm":0,"hd":false,"nm":"Fill","c":{"a":0,"k":[0.1098,0.149,0.2706]},"r":1,"o":{"a":0,"k":100}},{"ty":"tr","a":{"a":0,"k":[357.36,115.065]},"s":{"a":0,"k":[100,100]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[357.36,115.065]},"r":{"a":0,"k":0},"sa":{"a":0,"k":0},"o":{"a":0,"k":100}}]},{"ty":"gr","bm":0,"hd":false,"nm":"Group 5","np":2,"it":[{"ty":"sh","bm":0,"hd":false,"nm":"Path 7","d":1,"ks":{"a":0,"k":{"c":true,"i":[[0,0],[0,0],[0,0],[-26.76,0],[0,16.5],[16.1,6.45],[0,23.34],[-31.59,0],[-10.47,-5.24],[0,0],[0,0],[19.51,0],[0,-15.89],[-16.1,-6.43],[0,-24.14],[23.14,0],[10.27,7.64]],"o":[[0,0],[0,0],[8.45,22.94],[13.88,0],[0,-19.72],[-20.72,-8.65],[0,-24.95],[14.89,0],[0,0],[0,0],[-8.25,-20.72],[-16.09,0],[0,17.91],[20.52,7.86],[0,27.56],[-20.72,0],[0,0]],"v":[[177.4,172.92],[176.59,142.74],[179.21,142.34],[232.32,182.98],[259.08,157.63],[217.03,122.21],[179,83.38],[230.71,42.94],[269.34,51.39],[270.14,77.54],[267.93,78.35],[223.07,46.36],[194.3,71.71],[230.72,103.29],[275.58,144.34],[227.09,187.19],[177.39,172.91]]}}},{"ty":"fl","bm":0,"hd":false,"nm":"Fill","c":{"a":0,"k":[0.1098,0.149,0.2706]},"r":1,"o":{"a":0,"k":100}},{"ty":"tr","a":{"a":0,"k":[226.085,115.065]},"s":{"a":0,"k":[100,100]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[226.085,115.065]},"r":{"a":0,"k":0},"sa":{"a":0,"k":0},"o":{"a":0,"k":100}}]},{"ty":"gr","bm":0,"hd":false,"nm":"Group 6","np":2,"it":[{"ty":"sh","bm":0,"hd":false,"nm":"Path 8","d":1,"ks":{"a":0,"k":{"c":true,"i":[[0,0],[0,0],[0,14.49],[0,0],[6.64,2.22],[0,0],[0,0],[0,0],[0,0],[22.53,0],[0,0],[0,0],[0,0],[-3.21,10.47],[0,0],[0,0],[0,0],[24.54,0],[0,0],[0,0],[-6.44,0],[0,0],[-7.64,20.51],[0,0],[0,0],[0,0]],"o":[[0,0],[6.64,-2.21],[0,0],[0,-14.49],[0,0],[0,0],[0,0],[0,0],[-8.04,-19.71],[0,0],[0,0],[0,0],[24.54,0],[0,0],[0,0],[0,0],[-3.22,-10.46],[0,0],[0,0],[0,6.44],[0,0],[20.32,0],[0,0],[0,0],[0,0],[0,0]],"v":[[59.3,185.19],[59.3,182.37],[67.35,159.63],[67.35,69.9],[59.3,47.16],[59.3,44.34],[155.87,44.34],[158.08,72.71],[155.46,73.31],[112.21,47.56],[88.67,47.56],[88.67,107.92],[107.98,107.92],[142.78,92.62],[145.6,92.62],[145.6,126.43],[142.78,126.43],[107.98,111.14],[88.67,111.14],[88.67,171.89],[98.73,181.95],[118.04,181.95],[159.88,155.4],[162.5,155.8],[161.09,185.18],[59.3,185.18]]}}},{"ty":"fl","bm":0,"hd":false,"nm":"Fill","c":{"a":0,"k":[0.1098,0.149,0.2706]},"r":1,"o":{"a":0,"k":100}},{"ty":"tr","a":{"a":0,"k":[110.9,114.76499999999999]},"s":{"a":0,"k":[100,100]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[110.9,114.76499999999999]},"r":{"a":0,"k":0},"sa":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ind":1}]}]}
const LOGO_INK = "[0.1098,0.149,0.2706]"

function hexToLottie(hex: string) {
    const h = hex.replace("#", "")
    const n = (i: number) => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(4)
    return `[${n(0)},${n(2)},${n(4)}]`
}

/** ESCAPE wordmark — the exact Lottie from the app splash (5 s fade-in), recoloured. */
function Wordmark(props: { color?: string; width?: number | string; play?: boolean; label?: boolean }) {
    const ref = React.useRef<HTMLDivElement>(null)
    const [failed, setFailed] = React.useState(false)
    const reduce = useReducedMotion()
    React.useEffect(() => {
        if (!ref.current) return
        let anim: any
        let dead = false
        // @ts-ignore — URL import, resolved by Framer / the browser
        import("https://esm.sh/lottie-web@5.12.2/build/player/lottie_light.js")
            .then((mod: any) => {
                if (dead || !ref.current) return
                const lottie = mod.default || mod
                const data = JSON.parse(JSON.stringify(LOGO_LOTTIE).split(LOGO_INK).join(hexToLottie(props.color || "#E6EAF4")))
                anim = lottie.loadAnimation({ container: ref.current, renderer: "svg", loop: false, autoplay: false, animationData: data, rendererSettings: { preserveAspectRatio: "xMidYMid meet" } })
                if (reduce || props.play === false) anim.goToAndStop(149, true)
                else anim.play()
            })
            .catch(() => setFailed(true))
        return () => { dead = true; anim && anim.destroy() }
    }, [props.color, props.play, reduce])
    return (
        <div style={{ position: "relative", width: props.width ?? 240, aspectRatio: "842 / 230", overflow: "hidden" }} aria-label={props.label === false ? undefined : "Escape"} role={props.label === false ? undefined : "img"}>
            {/* the Lottie canvas is 512² with the wordmark centred; crop to the mark */}
            <div ref={ref} aria-hidden style={{ position: "absolute", left: "-5.7%", right: "-5.7%", top: "-152%", bottom: "-152%" }} />
            {failed && (
                <span className="esc-d" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: "calc(1em * 2.4)", letterSpacing: ".04em", color: props.color }}>ESCAPE</span>
            )}
        </div>
    )
}

/** First frame of the app splash, tiny, so the hero is never blank before the video loads. */
const SPLASH_POSTER = "data:image/webp;base64,UklGRrQQAABXRUJQVlA4IKgQAACQbwCdASq0AEABPt1iqk6opaOpq1RbsTAbiUAZ8xAa+CI2PMpHCmHK9tB77czGsrhxUqd2PRwsfDMF+pK0a97Ysi/cLxIBENIMzcw+fKsvrAFA08hGRQyHRGxk2tuJtzwqKc8PgmbnGANfprVe75GkBdb4JsK2HmIl2UJSMl6fKMN69Y2QV0axisZgfar3lqpXje+oFkKq9Lvz9Hgc9V+ooGoXVAOyP5qd9+q1vPkmjgXnk42CHNC/TO4pin9k7p6CzDVGfo7BK99X8PkvSccgcacHfp7IOCoQu9mVMWJwjFDwiOPPIFlC6vqXdxo3sMZrgv4TZOTtl1pdsrth4MDqRs4u6a+xyafo6t0erb2lH15rLN2vHYRWbdvJHEjkdUlzVlkyHkrF6ISFajCyQgX/mrONn3TBs5QjUk7PoKuu3aGM2+Fvoq6HEtRtXPnSTJI8mNCyHw3dzAKE8h2H+VK7Do3PDbH9DKOXMHPinFNcvpalQ/PExqYval6SSpLIdiTne4iFTnxFs0GukWWn0bkmK3aXyDXqsnu3LLvnJ4mNn9noxFUdyTurxFcL/d590kOVO0d0QAfkKUfDZvgWFVmxKQRUQAS2jnrGOkbcJCO1LLdH2euY2vigi30nQDnQKn++FZafwaU0z52IiJhE3nOANQ57eFGcWxejSurRWXbTrpgi8HZpfr2dYOLDOJ9qV+nLMATyWML32gxokiotzpRX1cm4XfTjvmM/PDhZpA0L4+5fmV2MQ1nmEats95Q8P0qyBrI6k5N1r/fvsCY3Ta+QveFiAcQd16GDXPBIql6PhWxe5Pae5eTSk3yxHBkoNKoPzRAG+N85bOFynL5Rw2QU6j4Clehz1fbwy9aWoJb62VWt6BUm7Hzba2CsaJTuy919iB+iExtMW02lbXEZDq2SuFKCmp3jzDOj7VxPkOnLUvUUy2jMOo6ZfcIpmCa+7mF+7tA6RSZFA0OJywyWzxZb+4////vfSYMUld1yWsNJHtFadKovdaoj8ww31ex+tsqia7rN9FcszD1orJZQLVMod6HuAD8llxgVR3xj5NtwvqvzxpwmQvPSbfOgX6HDUNwKlpTz6SNT8rYFp/cOmV3mV7a/I3YdjMvBQpiJfnitlytYtoFdSwxfeVXTzLTTfwZ6aLMsYY3345DqVZbnPV5aMj9GxEPycwi/FygCCAlQUyivSS1oAP71m+fT3JYWf3UKXiSZh5T7qtF40KT+EkrQrc9zPATTHUXyYArk5r8R2K2uPmiGcFO3vGiDwPbNgNPE8tjWrknBMzxNdPEWQQFyZGiQxFF1nk66Ns/dzA96niaRwsNJU9vP9lKWzdB3e+TloDW2yALtefa8fpQ6C342L40diBME9/K0XnS5qiFODab9sz4IitGNIwLql9tmCnmJI6zYxmOAo8ndkTorOYhaEif8MDRFBSmp6Ah0PIayExfkS/fQ7Gi/7RWWjUiGwZCUjk14PtGGChRpfy+hKp+ewb3Vo6baFROGYQ0uyj1KStwaHjFf0PEfTE1LhTmCJpVNW/b7Sz2GiOkzFn7dXIqouWtOf4FERopPEA3z9VFY/FdE9HcCB2kzY0RUXOq/gRRq9gXmDZMCyWrEPL160z+aE5L1OT0SyzHFPSQQmmUcz7pEB7aL/CXxLylA0ekidx8wQ0VxTUr8DvQBrw7SHV9WwfMYRusHgiOMXcCjoaIg6rRlsOWSxqeaXWAVFYcmWSmYJhsi4eXHwA+7+0YmczayBRcwLRT8LfienlGjRG4n3ubLPzrem3iELxpfniaffDCnKR+FmTYlByriMZpTbVOQQGmxOdU7zTFnXWNZxpEeitgrtZefkE6EC2Dp+0MzqLiWrgt25Cp/l/LdIh/vDlAKHRaSbm7CdV34hn0n4kjc3zNIGAy8nNL5Q8kORviKQID1oGnBrYz/xgDrqVZ3hDufMOO0FXD45n1/gbP+kBhyDW5IbvsShZgQeGRPvKyRz8cAwQ2mw9bT9zKGZOPmffqjvPpKV1PZJbnaf1cSk+0p4nqJyvy8sfJ+pu/veyfvpfCACNu5KLHnIY7T5JLBjn86CkajfML0YMSZawNiqKBKgpQjNa4Co/oCtE5LQCU0EC5Qzg4Aw3RzqHUGl4RL07vAo71uRkXr5biOnDxlD8M+2w2RNJiW49OaK2Lb2mwaBfUn8BasTa15YivUMc4+IKRz/EiteKvc9QmXgXjowjPWOFjAaKg5y1Y7yyBSeqcMhHnu6tHXjjq1czDgvOkJviPrKHz013qFYYM612zFKGo4XiidJB+N6QYYxS4fFaS4UFbhbViesAFdID5tyEB0sQSVspsQBbPMS/R4GxyW32m4k1134fkLlMR5zVoNL0hMPD6er8sMsCprsdawAl5ousVzgswyALnGN+4+hT/Wi+wXJBWUXi2q/kLPIP2pQcGqpUGYl7/MyQWqCgvaCRBvaHRWE7zd6J7Rbr1A0d2hzKc8YjoymxIB6MWjKpZJJxL0rLGrw5robUC+ZgY7S1xOpqKb/rBicIDqLkdVeSAIIivE1XQTBE04xlSkQ7wCeKfwYWTVo0SPHVlUlK+uoNYbsTpwogwfIbslYQzEfFFk5RwDuVrFz7sEm5cqWSJYZqV8gLq9wfrKHIOijpmzKrDOTkqw2BzfRow4yhukeFDQKuio4D4FlsQQviMabNomKMPYgubFZPBxh5Kx0Vf5CNClZPEO3c6e3XemsI4EzcLh7YSxFOwnbiu9zmFRU68a6QYdQRngP4z94pDu4tSiRK6my/DQRreqV8NJFmfIeQEWSePqYMIDqinAOdA/RfZM4g67Ndwxq6IRALdo9TUJZC1H41ekuBYJyzL9lGWQAwnWPTzPorezQ1kx6stukk3DUKRE4LMmZd58RJnHCHdKg8bIOpZAetTlDHmCQ9SGzQbB7k+uww1DDqs4e0JYCm3LKNo6CG+xzL9E+bRcHBGRCG7pzVu3up62mG3LHRWELULWrsEhexIMjVWFD3X1VtpGZeZNgvA9W4XsPg/COl3snu+gi2aXPJvZtyGoN5IgHQmKdUaV2QdeIVB96nPtioN1hhY7QQCqOwLUZ53rzx7m2UsJjOJU6M1dEWhL/g83EnM3CIsEVdIq1k7Mg2zwoRUEBl3nZiyCjyxHtxt0UGQ5fkb3kgreKFBkMSzx9HGzF1NgkNJ4jx4+DSrXD0ApBirAeD5bDJPcFdcPITnFqCJcwPxadw+SbxAidKin5mp5+Gzwg9Ule+XbocdndDMXBC7xToEgt7z90yiUGg/rjiFnJQiW4KtwVjKz4OOmjnVpbUBfcJudAhPrKg/+dIhrwg2ADTnKTwjR9PExHePFr9/Q3ZCN+DqR5U8GEfQzekVIOrDaxCMvQ0TFsw8Y21iKwRwsnv8dZg3vSz62GXr+Ma2lmvpJlD5/lLNlXB6iaxVDexO0iGaz5fi3mDqi3kW94Zf1j1x3/sdI2tnBOHCAva+Vb9TfMi61QMjqSP29e/hxdp8VAhmBipA6lcjZb3z+JDwpVSjEiaDA5TgBM+y8OzByA/Y5rTcitj2v2jLQw+iCIs8a6Wzxbw6Da0xRm7RGInEJtGKWIB3XxtulT+lzapHKxw4geRHTVnB4iXnuN5MpYT3yStK8R4W8TK6jM7HDhEPfob1Y3NIrd1GVEQa+tC+gqPHAY82zMKYiKILU/yZkWSZEgYhvE1ATypzDXP+TwYDNK9NEi6+Rg/7eNnSyD/V/q41+l27FElxYDwW8buDuGLssUQDpIK62/0BNNZOfgiBq9sV6nv1xm0cGkeh8e+FIlZMyB3Z6ygDIm32tf+18RJyTDIogNzDIuJ6s9QCtfBif4HegX8MHFOJ+PnsoKw4R/LKp9ewS4jia87MQK8Bp0cj9CcJbXOqC/Prh9cXIURjfh+3nL4+Ydgxz0cO1LorOzpYTJ7UVnWDZEWKN6PpH03+o9YMOLIiQBiBAnR7vw3K9VnTcRZaGuWVfTNWr0Vb5DWgYb4vqB5SjE2s05ggCJJglqfR13HSUhXcNwuxEk5YUnYLFcstI8v0UEodQ1ZzaW4L39uC4yXm+uqDmuir25zasNzcCUXmnRcvTNXMCTSxYekHaIV2Vm6ln+4FuTVZM4C4yLNcqzx7TCN0kI/PVm07r3grBMBXv//YwuAzwj06zzaLOgXD7FVnDqKNo84qmdn82KdT0vwb4RY8xrY8TZ0D84jNaWjMhV9yJKzqK69DLZTFZXrTTcQ8P0k0dtCO0DdRcpUj/H30T77kfW4273tWLbBjyciw3SwWr/Eqy3V0U1s7vsa2aD9viBHCOPJhuMBlaqy9Vq0S0LrBk1XoGFb63+ZfPo/nThLs0NNp39pwnLHvdgfxCadd9FI+knaH16oH0bnAefjzdN0BfG6Z1etdDPt26Im60s+xA0x9HBUEgAGw5aOngOKsF1FxIOpgvRjdvzmMaNMxSaokAsqLAl8f/JDsZmrD4i5dQOUOFf6AAATxTDMp4JSbhn3xrBNw0VyZuTmy0Ya1B71VEDpw8shjFixfFo5QD6Jzh3HlOlR3gXqRS8oMY6ZuKggsPb0QJ+ufifiOA4JB3LK5VRnNjQKgtSOaT6XwdcS54uqtxWNmmMPRgDaKfQKQmAtWbXSKMcAAQGBPKWF62KiH+6PNy9yUr3l/D8h7usmj1uFwW9q6zL2hDRDL2G3xw1ze3I8p93yxFXrPZM758AFrD8+r37FVhiWB2Eir5m/6qvnpajvt/NhIyczkCYLw0WnpxwKrdYud7CYUUFa7AAoZyiBYvPa8ie2BXXR6yxaVAtK9sZ72ksX0jwz4KADDy6EAKqyJEmabiiqfGDJQETb67zuPmvO7bTh/Ia2myW+gOzKe6xmQg+OeNrMsal3m+qYaPabKfFAgaAshYMkN8VjrJe4cjGxfXnOE3aYOZS75Xs1n9j6n7KL+D6JXfVQVcvZhZ+Zri7Bf88JmybWCOhhthL18rPjltS/0SYOgqElvCqT4ii31FjkaL+UailCvHNUrnK+3Lq/Yc2yh/oFwAJ54DzWIpot0a7Y1/9CEd0vDq0uCxluAUI8cMjHwOtI0dmVr/+tcVi7GsZYC/wSZ4+5tkOmgBIp/eP4VsdaTtM9rRBZnrxtn2PHLTXDDU8H5NWrwtpmAj/fHRAwSRaT85aIYz6vaRYjCaCeamYHu+0kxKppNr/pQGxt2iJRWhUGLOuCULmmHVnXBY7HIVQNYsQ52f5v1owhftxYv5G/MFFKqrd+sBv2LUkF49Hgl8fYVT5+bJT8+ABe6Du4zZyQKnQF5OsXTIeIRCKcL26azYA6UIYB4SC4s9ayzsCHQ4iLzHEDGxPQj2r9/wp4wbjyuYEFOykz3eteqryKIzf7NI96/vMi/u5n0ESUBMpYnNtkmsjaCbKQ+S7D5fJ1YkwrSiwa+VJkHhv3pIV/o1flC6dCHDQJAlBOEjrNetuH5ner/090xZJhLn1EhEjyF/1FQBjeIYWGi5ggHlUlw0pg83tA675/YiNrxrlPNRy9Cz2KffrlJvIsTnI62Hc0fkFBMgccoxo6hUE7V56g2XbLuUljS6gZGmFA/crTgK3Dg8cH4FIUyQ8fVfhaiFqK4vbXUdfJrSRwmNZTHs/TKsi7K+CYUaOvW+LLzbpQnTIfiNM7fnhxZQN70Fh5XOQN3y33foA0JJmO6QOXgUqdkl9RSombx9C2AA"

// ───────────────────────── FAQ ─────────────────────────

function Faq(props: { items: { q: string; a: React.ReactNode }[] }) {
    const [open, setOpen] = React.useState<number | null>(0)
    const id = React.useId()
    return (
        <div className="esc-stack" style={{ gap: 12, maxWidth: 860, margin: "0 auto" }}>
            {props.items.map((it, i) => {
                const isOpen = open === i
                return (
                    <Reveal key={i} delay={i * 0.04} className="esc-glass" style={{ borderRadius: 22 }}>
                        <h3 style={{ margin: 0 }}>
                            <button
                                type="button"
                                aria-expanded={isOpen}
                                aria-controls={`${id}-${i}`}
                                onClick={() => setOpen(isOpen ? null : i)}
                                style={{ all: "unset", cursor: "pointer", boxSizing: "border-box", width: "100%", minHeight: 64, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, font: '500 17px/1.4 "Work Sans",system-ui,sans-serif', color: "var(--esc-ink)" }}
                            >
                                {it.q}
                                <span aria-hidden style={{ transform: `rotate(${isOpen ? 45 : 0}deg)`, transition: "transform .38s var(--esc-ease)", color: "var(--esc-accent)", flex: "none" }}><Icon name="plus" size={20} /></span>
                            </button>
                        </h3>
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div id={`${id}-${i}`} role="region" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.38, ease }} style={{ overflow: "hidden" }}>
                                    <div className="esc-p" style={{ padding: "0 24px 22px" }}>{it.a}</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Reveal>
                )
            })}
        </div>
    )
}

// ───────────────────────── store badges ─────────────────────────

function StoreBadges(props: { appStoreUrl?: string; playUrl?: string }) {
    const badge = (store: "apple" | "play", url?: string) => {
        const inner = (
            <>
                <Icon name={store} size={22} />
                <span className="esc-stack" style={{ lineHeight: 1.15, textAlign: "left" }}>
                    <span style={{ fontSize: 11, color: "var(--esc-faint)" }}>{url ? (store === "apple" ? "Download on the" : "Get it on") : "Coming soon to"}</span>
                    <span style={{ fontSize: 16, fontWeight: 500 }}>{store === "apple" ? "App Store" : "Google Play"}</span>
                </span>
            </>
        )
        const style: React.CSSProperties = { minHeight: 56, padding: "0 20px", borderRadius: 16, gap: 12, display: "inline-flex", alignItems: "center", color: "var(--esc-ink)", textDecoration: "none" }
        return url ? (
            <a className="esc-glass" href={url} target="_blank" rel="noopener noreferrer" style={style}>{inner}</a>
        ) : (
            <span className="esc-glass" style={{ ...style, opacity: 0.9 }} aria-label={`${store === "apple" ? "App Store" : "Google Play"}: coming soon`}>{inner}</span>
        )
    }
    return <div className="esc-row" style={{ gap: 12 }}>{badge("apple", props.appStoreUrl)}{badge("play", props.playUrl)}</div>
}

// ───────────────────────── icons (1.6 px strokes, currentColor) ─────────────────────────

type IconName =
    | "spark" | "wave" | "chart" | "move" | "cube" | "shield" | "coin" | "users" | "play" | "check" | "arrow"
    | "sun" | "moon" | "lock" | "heart" | "leaf" | "mic" | "calendar" | "star" | "plus" | "menu" | "close"
    | "book" | "compass" | "trash" | "globe" | "apple" | "play-store" | "play" | "bell" | "chat" | "flask" | "gift" | "orb"

const P: Record<string, React.ReactNode> = {
    spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />,
    wave: <path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0" />,
    chart: <path d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6" />,
    move: <><circle cx="12" cy="5" r="2" /><path d="M12 7v6l-4 7M12 13l4 7M6 10l6-1 6 1" /></>,
    cube: <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12L4 7.5M12 12v9" />,
    shield: <path d="M12 3l7 3v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6zM9 12l2 2 4-4" />,
    coin: <><circle cx="12" cy="12" r="8" /><path d="M12 8v8M9.5 10h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3h4" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 010 6M18 14c2 .8 3 2.8 3 6" /></>,
    play: <path d="M8 5.5v13l10-6.5z" />,
    check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20 14.5A8 8 0 119.5 4a6.5 6.5 0 0010.5 10.5z" />,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2.5" /><path d="M8 10V7a4 4 0 018 0v3" /></>,
    heart: <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />,
    leaf: <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l8-8" />,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
    star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    menu: <path d="M4 7h16M4 12h16M4 17h10" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    book: <path d="M5 4h9a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h9" />,
    compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>,
    trash: <path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" />,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>,
    apple: <path d="M16 3c0 1.7-1.3 3.2-3 3.3 0-1.7 1.4-3.2 3-3.3zM19.5 16.5c-.8 1.8-2 3.9-3.6 3.9-1.4 0-1.8-.9-3.5-.9s-2.2.9-3.5.9c-1.6 0-3-2.3-3.8-4.1C3.6 12.6 4.6 8 8.3 8c1.4 0 2.4.9 3.5.9 1 0 2.3-1 3.9-.9 1.2.1 2.6.6 3.4 1.9-3 1.8-2.5 5.6.4 6.6z" />,
    "play-store": <path d="M5 3.5l10 8.5-10 8.5zM15 12l3.5-3 2 1.4c.9.6.9 1.6 0 2.2L18.5 15z" />,
    bell: <path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15zM10 20a2 2 0 004 0" />,
    chat: <path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v8a2.5 2.5 0 01-2.5 2.5H10l-4.5 3.5V17h0A2.5 2.5 0 014 14.5z" />,
    flask: <path d="M9 3h6M10 3v6l-5 9a2 2 0 001.8 3h10.4A2 2 0 0019 18l-5-9V3M7.5 14h9" />,
    gift: <><rect x="4" y="9" width="16" height="11" rx="2" /><path d="M3 9h18M12 9v11M12 9S10 4 7.5 5.5 9 9 12 9zM12 9s2-5 4.5-3.5S15 9 12 9z" /></>,
    orb: <><circle cx="12" cy="12" r="8" /><path d="M7 10c2-2 8-2 10 2M8 15c2 1.5 6 1.5 8-1" /></>,
}

function Icon({ name, size = 22, stroke = 1.6, style }: { name: IconName | "apple"; size?: number; stroke?: number; style?: React.CSSProperties }) {
    const filled = name === "play" || name === "apple" || name === "play-store"
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flex: "none", ...style }}>
            {name === "play" ? P.play : P[name === "apple" ? "apple" : name]}
        </svg>
    )
}

/** Wrapper every page/section component uses: tokens inline, global CSS, page background. */
function Page(props: { children: React.ReactNode; className?: string; style?: React.CSSProperties; bare?: boolean }) {
    const t = useTokenStyle()
    return (
        <div className={`esc ${props.bare ? "" : "esc-page"} ${props.className || ""}`} style={{ ...t, ...props.style }}>
            <EscapeStyle />
            {props.children}
        </div>
    )
}

/** Gentle full-width call to action used at the end of most pages. */
function ClosingCta(props: { eyebrow?: string; title: React.ReactNode; lede: string; primary: { label: string; href: string }; secondary?: { label: string; href: string }; badges?: boolean; appStoreUrl?: string; playUrl?: string }) {
    const s = useEscape()
    return (
        <section className="esc-sec">
            <div className="esc-wrap">
                <Reveal className="esc-glass esc-glow" style={{ borderRadius: 36, padding: "clamp(40px,6cqi,80px) clamp(24px,5cqi,72px)", overflow: "hidden", textAlign: "center" }}>
                    <Backdrop intensity={0.9} />
                    <div className="esc-stack" style={{ alignItems: "center", gap: 22, position: "relative" }}>
                        <Orb mood={s.mood} size={120} live rings />
                        {props.eyebrow && <span className="esc-over">{props.eyebrow}</span>}
                        <h2 className="esc-d esc-h2" style={{ maxWidth: 760 }}>{props.title}</h2>
                        <p className="esc-lede" style={{ margin: "0 auto" }}>{props.lede}</p>
                        <div className="esc-row" style={{ gap: 12, justifyContent: "center", marginTop: 6 }}>
                            <Button href={props.primary.href} arrow>{props.primary.label}</Button>
                            {props.secondary && <Button href={props.secondary.href} variant="ghost">{props.secondary.label}</Button>}
                        </div>
                        {props.badges && <div style={{ marginTop: 10 }}><StoreBadges appStoreUrl={props.appStoreUrl} playUrl={props.playUrl} /></div>}
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

const DISCLAIMER =
    "Escape is a self-care and wellbeing app. It is not a medical device and does not diagnose, treat or replace professional care. If you are in crisis in the US, call or text 988; elsewhere, contact your local emergency number."

// ═══════════════ PathGate ═══════════════
const __PathGate = (() => {
    // Escape — the Orb Gate ("/"): a two-question entry journey. Fill × Fill (or Fill × 100vh), no nav/footer.
    //
    // UX reasoning (why it changed):
    //  * One question at a time. Step 1 only asks how you feel; the orbs carry feeling words only,
    //    never page names, so the choice is purely emotional (lower cognitive load, Hick's law).
    //  * Validate first (affect labelling): after you pick, Lucille reflects the feeling back in one
    //    line before suggesting anything. Feeling heard lowers arousal and builds trust.
    //  * Then make the destination explicit: "What would help right now?" with three options, each
    //    labelled with exactly where it goes ("Opens · Lucille AI page") and how long it takes.
    //    One is marked Suggested (a default reduces decision effort) but all three are equal size.
    //  * Give value before asking for anything: for restless / tired / low, the first option is a
    //    30-second breath with the orb, right here. The product proves itself on the first screen.
    //  * Always an exit: "Skip to the full site" is visible on every step; "Pick a different
    //    feeling" goes back. Progress shows 1 · 2 · 3 so people know how short this is.
    //  * After arrival, a banner on the landing page says why you're there and how to change it
    //    (visibility of system status), so the tinted site never feels like a mystery.




    // ───────────────────────── journey content ─────────────────────────

    type Option =
        | { kind: "breathe"; title: string; body: string; time: string; icon: IconName }
        | { kind: "page"; title: string; body: string; time: string; icon: IconName; href: string; page: string }

    const P = {
        home: { href: ROUTES.home, page: "Home" },
        lucille: { href: ROUTES.lucille, page: "Lucille AI" },
        community: { href: ROUTES.community, page: "Community & rewards" },
        pricing: { href: ROUTES.pricing, page: "Pricing" },
        innerverse: { href: ROUTES.innerverse, page: "Innerverse" },
        beta: { href: ROUTES.beta, page: "App Testing" },
        demo: { href: ROUTES.demo, page: "App Demo" },
    }
    const breathe = (title = "Breathe with the orb first"): Option => ({ kind: "breathe", title, body: "Three slow breaths, guided by the orb. No sign-up, nothing to read.", time: "30 sec", icon: "leaf" })

    const JOURNEY: Record<MoodId, { reflect: string; after: string; options: Option[] }> = {
        calm: {
            reflect: "Lovely. Let's keep that going.",
            after: "Here's where you could start:",
            options: [
                { kind: "page", ...P.home, title: "See everything Escape does", body: "The full tour: Lucille, sessions, Soundscapes and your journey.", time: "3 min read", icon: "compass" },
                { kind: "page", ...P.demo, title: "Watch the app in action", body: "Four short chapters with captions.", time: "3 min video", icon: "play" },
                { kind: "page", ...P.beta, title: "Get early access", body: "Join the beta and help shape Escape.", time: "1 min form", icon: "flask" },
            ],
        },
        energized: {
            reflect: "Good energy. Let's put it somewhere good.",
            after: "Here's what might suit you:",
            options: [
                { kind: "page", ...P.community, title: "Earn coins and level up", body: "How self-care earns coins and opens your seven energy centers.", time: "2 min read", icon: "coin" },
                { kind: "page", ...P.beta, title: "Get early access", body: "Be one of the first to try it.", time: "1 min form", icon: "flask" },
                { kind: "page", ...P.pricing, title: "See plans & pricing", body: "One pass, everything included, 7 days free.", time: "1 min read", icon: "star" },
            ],
        },
        focused: {
            reflect: "Clear head. A good moment to look around.",
            after: "Here's where you could start:",
            options: [
                { kind: "page", ...P.lucille, title: "Meet Lucille, the AI companion", body: "What she does, how she listens, and her voice.", time: "2 min read", icon: "chat" },
                { kind: "page", ...P.home, title: "See everything Escape does", body: "The full tour of the app.", time: "3 min read", icon: "compass" },
                { kind: "page", ...P.pricing, title: "Compare plans", body: "Monthly or yearly, and what's included.", time: "1 min read", icon: "star" },
            ],
        },
        restless: {
            reflect: "Buzzing is okay. Let's give it somewhere to land.",
            after: "What would help right now?",
            options: [
                breathe("Take three slow breaths first"),
                { kind: "page", ...P.demo, title: "Watch the 3-minute demo", body: "See how Escape helps on days like this.", time: "3 min video", icon: "play" },
                { kind: "page", ...P.home, title: "Just look around", body: "The full site, at your own pace.", time: "3 min read", icon: "compass" },
            ],
        },
        tired: {
            reflect: "Running low. We'll keep this gentle.",
            after: "What would help right now?",
            options: [
                breathe(),
                { kind: "page", ...P.innerverse, title: "Preview the calm 3D worlds", body: "Forests, oceans and starlight, coming to Escape.", time: "2 min browse", icon: "cube" },
                { kind: "page", ...P.home, title: "Read about Escape", body: "The full tour, whenever you're ready.", time: "3 min read", icon: "book" },
            ],
        },
        low: {
            reflect: "Thank you for being honest. Heavy days count too.",
            after: "What would help right now?",
            options: [
                breathe(),
                { kind: "page", ...P.lucille, title: "Meet Lucille, someone to talk to", body: "A companion who listens first and never rushes you.", time: "2 min read", icon: "heart" },
                { kind: "page", ...P.home, title: "Start at the beginning", body: "The full tour, one small step at a time.", time: "3 min read", icon: "compass" },
            ],
        },
    }

    // ───────────────────────── journey memory (for the landing banner) ─────────────────────────

    interface Journey { mood: MoodId; href: string; page: string; title: string; at: number }
    const JKEY = "escape.journey.v1"
    const journey = {
        save(j: Journey) { try { sessionStorage.setItem(JKEY, JSON.stringify(j)) } catch {} },
        load(): Journey | null { try { const r = sessionStorage.getItem(JKEY); return r ? JSON.parse(r) : null } catch { return null } },
        clear() { try { sessionStorage.removeItem(JKEY) } catch {} },
    }

    // ───────────────────────── component ─────────────────────────

    type Step = "feel" | "help" | "breathe" | "check" | "go"

    interface Props { skipHref: string; betaHref: string; showCrisisLine: boolean; bgVideo: string; bgVideoWebm: string; bgPoster: any; bgBlur: number; moodOverlay: number }

    const src = (v: any) => (typeof v === "string" ? v : v?.src) || ""

    /**
     */
    function PathGate(p: Props) {
        const reduce = useReducedMotion()
        const [step, setStep] = React.useState<Step>("feel")
        const [mood, setMood] = React.useState<MoodId | null>(null)
        const [hover, setHover] = React.useState<MoodId | null>(null)
        const [breathed, setBreathed] = React.useState<"" | "better" | "same">("")
        const [dest, setDest] = React.useState<Option | null>(null)
        const [remembered, setRemembered] = React.useState<MoodId | null>(null)
        const headRef = React.useRef<HTMLHeadingElement>(null)
        const goRef = React.useRef<HTMLDivElement>(null)
        React.useEffect(() => setRemembered(escape.get().mood), [])
        React.useEffect(() => { if (step !== "feel") headRef.current?.focus() }, [step])

        const shown = step === "feel" ? hover : mood
        const m = moodById(shown)
        const j = mood ? JOURNEY[mood] : null
        const options = j ? (breathed ? j.options.filter((o) => o.kind !== "breathe") : j.options) : []

        const pickMood = (id: MoodId) => { setMood(id); setHover(null); setBreathed(""); escape.setMood(id); setStep("help") }
        const pick = (o: Option) => {
            if (o.kind === "breathe") { setStep("breathe"); return }
            setDest(o); setStep("go")
            journey.save({ mood: mood!, href: o.href, page: o.page, title: o.title, at: Date.now() })
            const go = () => { launchOrb(goRef.current, mood); navigate(o.href) }
            reduce ? go() : window.setTimeout(go, 1700)
        }

        const field = m
            ? `radial-gradient(38% 52% at 68% 48%, ${m.glowA}, transparent 72%), radial-gradient(120% 90% at 50% 45%, ${m.base[1]} 0%, ${m.base[0]} 38%, ${m.base[2]} 78%, #05081A 100%)`
            : "radial-gradient(120% 90% at 50% 45%, #18224A 0%, #101E43 40%, #0B1230 75%, #05081A 100%)"
        const stepNo = step === "feel" ? 1 : step === "go" ? 3 : 2

        return (
            <Page bare style={{ minHeight: "100svh" }}>
                <style>{CSS}</style>
                <div className="g2">
                    {/* the app's splash, blurred far back: atmosphere, never competing with the orbs */}
                    <motion.div className="g2-bg" aria-hidden initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.4, ease: easeSoft }}>
                        <video muted autoPlay loop playsInline preload="auto" poster={src(p.bgPoster) || SPLASH_POSTER} style={{ filter: `blur(${p.bgBlur}px) saturate(1.25) brightness(.88)` }}>
                            {src(p.bgVideoWebm) && <source src={src(p.bgVideoWebm)} type="video/webm" />}
                            {src(p.bgVideo) && <source src={src(p.bgVideo)} type="video/mp4" />}
                        </video>
                    </motion.div>
                    <AnimatePresence initial={false}>
                        <motion.div key={shown || "none"} aria-hidden className="g2-field" style={{ background: field }} initial={{ opacity: 0 }} animate={{ opacity: m ? p.moodOverlay : 0.6 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: easeSoft }} />
                    </AnimatePresence>
                    <div className="g2-vignette" aria-hidden />
                    <AnimatePresence>{step === "go" && !reduce && <motion.div className="g2-veil" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7, ease: easeSoft }} />}</AnimatePresence>
                    <div className="esc-noise" aria-hidden />

                    <header className="g2-top">
                        <span className="esc-d g2-mark" aria-label="Escape">ESCAPE<sup>™</sup></span>
                        <ol className="g2-steps" aria-label={`Step ${stepNo} of 3`}>
                            {["How you feel", "What would help", "Go"].map((t, i) => (
                                <li key={t} className={i + 1 === stepNo ? "on" : i + 1 < stepNo ? "done" : ""} aria-current={i + 1 === stepNo ? "step" : undefined}>
                                    <span className="g2-dot">{i + 1 < stepNo ? <Icon name="check" size={12} /> : i + 1}</span><span className="g2-steplabel">{t}</span>
                                </li>
                            ))}
                        </ol>
                        <a className="esc-link g2-skip" href={p.skipHref} onClick={() => journey.clear()}>Skip to the full site <Icon name="arrow" size={16} /></a>
                    </header>

                    <AnimatePresence mode="popLayout" initial={false}>
                        {/* ── step 1: feeling only ── */}
                        {step === "feel" && (
                            <motion.main key="feel" className="g2-main g2-feel" initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.4, ease: easeSoft } }} transition={{ duration: 0.9, ease: easeSoft }}>
                                <div className="g2-copy">
                                    {remembered && (
                                        <button type="button" className="esc-chip g2-again" onClick={() => pickMood(remembered)}>
                                            <span className="esc-dot" aria-hidden style={{ background: moodById(remembered)!.hue, boxShadow: `0 0 12px ${moodById(remembered)!.hue}` }} />
                                            Still feeling {moodById(remembered)!.label.toLowerCase()}? Continue
                                        </button>
                                    )}
                                    <h1 className="esc-d g2-h1">How are you arriving today?</h1>
                                    <p className="g2-sub">Pick the feeling that's closest. We'll suggest a good place to start, and you can always see everything.</p>
                                    <p className="g2-hint" aria-live="polite">{m ? <><strong style={{ color: m.accentDark, fontWeight: 500 }}>{m.label}</strong> · {m.line}</> : " "}</p>
                                </div>
                                <div className="g2-ring" role="group" aria-label="How are you feeling?">
                                    <div className="g2-core"><Orb mood={hover} size="100%" live rings /></div>
                                    {MOODS.map((mo, i) => {
                                        const a = (-90 + i * 60) * (Math.PI / 180)
                                        const on = hover === mo.id
                                        return (
                                            <motion.button key={mo.id} type="button" className={`g2-mood ${on ? "on" : ""}`}
                                                style={{ "--x": `${50 + 41 * Math.cos(a)}%`, "--y": `${50 + 41 * Math.sin(a)}%`, "--hue": mo.hue } as any}
                                                onMouseEnter={() => setHover(mo.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(mo.id)} onBlur={() => setHover(null)}
                                                onClick={() => pickMood(mo.id)} aria-label={`${mo.label}: ${mo.line}`}
                                                initial={reduce ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: easeSoft, delay: 0.5 + i * 0.12 }}>
                                                <motion.span className="g2-orb" layoutId={`orb-${mo.id}`} transition={{ duration: 1.1, ease: easeSoft }}><span className="g2-orb-in"><Orb mood={mo.id} size="100%" glow={on} breathe={on} live={on} warm /></span></motion.span>
                                                <span className="g2-label">{mo.label}</span>
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </motion.main>
                        )}

                        {/* ── step 2: reflect, then explicit options ── */}
                        {step === "help" && j && m && (
                            <motion.main key={`help-${breathed}`} className="g2-main g2-help" initial={{ opacity: 0, y: 10, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.4, ease: easeSoft } }} transition={{ duration: 0.9, ease: easeSoft }}>
                                <div className="g2-reflect">
                                    <motion.div className="g2-orb-md" layoutId={`orb-${mood}`} transition={{ duration: 1.1, ease: easeSoft }}><Orb mood={mood} size="100%" live rings /></motion.div>
                                    <span className="esc-chip" style={{ alignSelf: "flex-start" }}><span className="esc-dot" aria-hidden style={{ background: m.hue, boxShadow: `0 0 12px ${m.hue}` }} />You chose {m.label}</span>
                                    <h1 className="esc-d g2-h2" tabIndex={-1} ref={headRef}>
                                        {breathed === "better" ? "Glad that helped." : breathed === "same" ? "That's okay. It doesn't have to work every time." : j.reflect}
                                    </h1>
                                    <p className="g2-sub" style={{ margin: 0 }}>{breathed ? "Where would you like to go next?" : j.after}</p>
                                    {p.showCrisisLine && mood === "low" && (
                                        <p className="g2-care"><Icon name="heart" size={16} /><span>If you're struggling right now, you don't have to do it alone. In the US, call or text <strong>988</strong> any time.</span></p>
                                    )}
                                </div>
                                <ul className="g2-options" aria-label="Where to start">
                                    {options.map((o, i) => (
                                        <motion.li key={o.title} initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, ease: easeSoft, delay: 0.2 + i * 0.12 }}>
                                            <button type="button" className={`g2-opt ${i === 0 ? "sug" : ""}`} onClick={() => pick(o)} style={{ "--hue": m.hue } as any}>
                                                <span className="g2-opt-icon"><Icon name={o.icon} /></span>
                                                <span className="g2-opt-body">
                                                    <span className="g2-opt-title">{o.title}{i === 0 && <span className="g2-sug">Suggested</span>}</span>
                                                    <span className="g2-opt-text">{o.body}</span>
                                                    <span className="g2-opt-meta">
                                                        <span className="g2-dest">{o.kind === "breathe" ? <><Icon name="orb" size={14} />Stays on this screen</> : <><Icon name="arrow" size={14} />Opens · {o.page} page</>}</span>
                                                        <span>{o.time}</span>
                                                    </span>
                                                </span>
                                                <span className="g2-opt-go" aria-hidden><Icon name="arrow" size={20} /></span>
                                            </button>
                                        </motion.li>
                                    ))}
                                </ul>
                                <div className="g2-back">
                                    <button type="button" className="esc-link g2-linkbtn" onClick={() => setStep("feel")}><Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> Pick a different feeling</button>
                                </div>
                            </motion.main>
                        )}

                        {/* ── step 2b: the 30-second breath ── */}
                        {step === "breathe" && (
                            <Breathe key="breathe" mood={mood} headRef={headRef} onDone={() => setStep("check")} onSkip={() => { setBreathed("same"); setStep("help") }} />
                        )}
                        {step === "check" && (
                            <motion.main key="check" className="g2-main g2-center" initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.4, ease: easeSoft } }} transition={{ duration: 0.9, ease: easeSoft }}>
                                <motion.div className="g2-orb-md" style={{ margin: "0 auto" }} layoutId={`orb-${mood}`} transition={{ duration: 1.1, ease: easeSoft }}><Orb mood={mood} size="100%" live /></motion.div>
                                <h1 className="esc-d g2-h2" tabIndex={-1} ref={headRef}>How do you feel now?</h1>
                                <div className="esc-row" style={{ gap: 12, justifyContent: "center" }}>
                                    <button type="button" className="esc-btn esc-btn-p" onClick={() => { setBreathed("better"); setStep("help") }}>A little calmer</button>
                                    <button type="button" className="esc-btn esc-btn-g" onClick={() => { setBreathed("same"); setStep("help") }}>About the same</button>
                                </div>
                                <p className="g2-sub" style={{ margin: "4px auto 0" }}>That's what a moment in Escape feels like. There are hundreds more inside.</p>
                            </motion.main>
                        )}

                        {/* ── step 3: go ── */}
                        {step === "go" && dest && dest.kind === "page" && (
                            <motion.main key="go" className="g2-main g2-center g2-go" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                                <motion.div ref={goRef} className="g2-orb-lg" layoutId={`orb-${mood}`} transition={{ duration: 1.1, ease: easeSoft }}>
                                    <Orb mood={mood} size="100%" live glow />
                                </motion.div>
                                <motion.div className="esc-stack" style={{ alignItems: "center", gap: 6 }} initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: [0, 1, 1, 0], filter: "blur(0px)" }} transition={{ duration: 1.6, times: [0, 0.3, 0.7, 1], ease: easeSoft }}>
                                    <p className="esc-over" aria-live="polite" style={{ margin: 0, color: "rgba(230,234,244,.8)" }}>Taking you to</p>
                                    <h1 className="esc-d g2-h2">{dest.page}</h1>
                                </motion.div>
                            </motion.main>
                        )}
                    </AnimatePresence>

                    <footer className="g2-foot">
                        <span className="esc-small">Your feeling only shapes this visit. It stays on this device.</span>
                        <a className="esc-link" href={p.betaHref}>Joining the beta? <Icon name="arrow" size={16} /></a>
                    </footer>
                </div>
            </Page>
        )
    }

    // ───────────────────────── breathing ─────────────────────────

    const PHASES = [{ t: "Breathe in", s: 4 }, { t: "Hold", s: 1.5 }, { t: "And out, slowly", s: 5.5 }]

    function Breathe({ mood, onDone, onSkip, headRef }: { mood: MoodId | null; onDone: () => void; onSkip: () => void; headRef: React.RefObject<HTMLHeadingElement> }) {
        const reduce = useReducedMotion()
        const [round, setRound] = React.useState(0)
        const [phase, setPhase] = React.useState(0)
        React.useEffect(() => {
            const ms = PHASES[phase].s * 1000
            const id = window.setTimeout(() => {
                if (phase < PHASES.length - 1) setPhase(phase + 1)
                else if (round < 2) { setRound(round + 1); setPhase(0) }
                else onDone()
            }, ms)
            return () => window.clearTimeout(id)
        }, [phase, round])
        const scale = phase === 0 ? 1.35 : phase === 1 ? 1.35 : 0.85
        return (
            <motion.main className="g2-main g2-center" initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.4, ease: easeSoft } }} transition={{ duration: 0.9, ease: easeSoft }}>
                <motion.div className="g2-breath" layoutId={`orb-${mood}`} transition={{ duration: 1.1, ease: easeSoft }}>
                    <motion.div style={{ width: "100%", height: "100%" }} animate={reduce ? {} : { scale }} transition={{ duration: PHASES[phase].s, ease: "easeInOut" }}>
                        <Orb mood={mood} size="100%" live breathe={false} />
                    </motion.div>
                </motion.div>
                <h1 className="esc-d g2-h2" tabIndex={-1} ref={headRef} aria-live="polite">{PHASES[phase].t}</h1>
                <p className="g2-sub" style={{ margin: "0 auto" }}>Breath {round + 1} of 3 · follow the orb</p>
                <button type="button" className="esc-link g2-linkbtn" onClick={onSkip}>Skip</button>
            </motion.main>
        )
    }

    const CSS = `
    .g2{position:relative;min-height:100svh;width:100%;overflow:clip;display:flex;flex-direction:column;color:#E6EAF4;isolation:isolate}
    .g2-bg{position:absolute;inset:-6%;z-index:-3;overflow:hidden;background:#0B1230}
    .g2-bg video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 30%;animation:esc-drift-slow 32s var(--esc-ease-soft) infinite}
    .g2-field{position:absolute;inset:0;z-index:-2}
    .g2-vignette{position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(90deg,rgba(11,18,48,.62) 0%,rgba(11,18,48,.38) 38%,rgba(11,18,48,0) 62%),linear-gradient(0deg,rgba(5,8,26,.55) 0%,rgba(5,8,26,0) 22%),linear-gradient(180deg,rgba(5,8,26,.45) 0%,rgba(5,8,26,0) 16%),radial-gradient(120% 100% at 50% 50%,transparent 45%,rgba(5,8,26,.45) 100%)}
    @container (max-width:900px){.g2-vignette{background:linear-gradient(180deg,rgba(11,18,48,.6) 0%,rgba(11,18,48,.3) 45%,rgba(5,8,26,.55) 100%)}}
    .g2-veil{position:fixed;inset:0;z-index:30;background:#0B1230;pointer-events:none}
    .g2 .esc-noise{z-index:-1}
    .g2 .esc-link{color:#E6EAF4;min-height:44px}
    .g2-top,.g2-foot{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px clamp(20px,4cqi,48px);flex-wrap:wrap}
    .g2-mark{font-size:22px;letter-spacing:.14em}
    .g2-mark sup{font-size:.45em;letter-spacing:0;margin-left:2px}
    .g2-steps{list-style:none;margin:0;padding:0;display:flex;gap:6px;align-items:center}
    .g2-steps li{display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(230,234,244,.6);padding:6px 12px 6px 6px;border-radius:99px}
    .g2-steps li.on{color:#E6EAF4;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(230,234,244,.16)}
    .g2-dot{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:12px;border:1px solid rgba(230,234,244,.3)}
    .g2-steps li.on .g2-dot{background:#E6EAF4;color:#0B1230;border-color:#E6EAF4}
    .g2-steps li.done .g2-dot{background:rgba(230,234,244,.18);border-color:transparent}
    .g2-main{flex:1;padding-bottom:24px!important;width:100%;max-width:1360px;margin:0 auto;padding:0 clamp(20px,5cqi,72px)}
    .g2-feel{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:clamp(24px,4cqi,64px);align-items:center}
    .g2-copy{display:flex;flex-direction:column;align-items:flex-start}
    .g2-again{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 16px;border-radius:99px;margin-bottom:18px;cursor:pointer;font-size:14px;color:#E6EAF4;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(230,234,244,.2)}
    .g2-again:hover{background:rgba(255,255,255,.14)}
    .g2-h1{font-size:clamp(42px,5.4cqi,78px)}
    .g2-h2{font-size:clamp(32px,3.6cqi,52px);outline:none}
    .g2-sub{margin:18px 0 0;font-size:clamp(17px,1.4cqi,20px);line-height:1.55;color:rgba(230,234,244,.85);max-width:40ch}
    .g2-hint{margin:22px 0 0;min-height:1.6em;font-size:16px;color:rgba(230,234,244,.8)}
    .g2-ring{position:relative;width:min(100%,640px);aspect-ratio:1;justify-self:center}
    .g2-core{position:absolute;left:50%;top:50%;width:40%;aspect-ratio:1;translate:-50% -50%}
    .g2-mood{all:unset;box-sizing:border-box;position:absolute;left:var(--x);top:var(--y);translate:-50% -50%;width:20%;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;border-radius:20px;padding:6px}
    .g2-orb{display:block;width:76%;aspect-ratio:1}
    .g2-orb-in{display:block;width:100%;height:100%;transition:transform .7s var(--esc-ease-soft),filter .7s var(--esc-ease-soft);filter:saturate(.9) brightness(.95)}
    .g2-mood:hover .g2-orb-in,.g2-mood.on .g2-orb-in,.g2-mood:focus-visible .g2-orb-in{transform:scale(1.16);filter:none}
    .g2-label{font:500 16px/1.2 "Work Sans",system-ui,sans-serif}
    .g2-mood.on .g2-label{color:var(--hue);filter:brightness(1.4)}
    .g2-mood:focus-visible{outline:3px solid var(--hue);outline-offset:2px}
    .g2-help{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(24px,5cqi,80px);align-items:center}
    .g2-reflect{display:flex;flex-direction:column;gap:18px}
    .g2-orb-md{width:clamp(120px,14cqi,180px);aspect-ratio:1}
    .g2-care{display:flex;gap:10px;align-items:flex-start;margin:4px 0 0;padding:14px 16px;border-radius:16px;font-size:15px;line-height:1.5;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1px rgba(230,234,244,.16);max-width:46ch}
    .g2-care svg{margin-top:2px;color:#F5B26B;flex:none}
    .g2-options{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:14px}
    .g2-opt{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:flex;gap:18px;align-items:center;padding:20px 22px;border-radius:24px;background:linear-gradient(160deg,rgba(255,255,255,.10),rgba(255,255,255,.04));box-shadow:inset 0 0 0 1px rgba(230,234,244,.16);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);transition:transform .38s var(--esc-ease),box-shadow .38s var(--esc-ease),background .38s}
    .g2-opt:hover{transform:translateY(-2px);box-shadow:inset 0 0 0 1px var(--hue),0 18px 50px -24px var(--hue)}
    .g2-opt.sug{box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--hue) 70%,transparent)}
    .g2-opt:focus-visible{outline:3px solid var(--hue);outline-offset:3px}
    .g2-opt-icon{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;flex:none;color:#E6EAF4;background:color-mix(in oklab,var(--hue) 35%,transparent)}
    .g2-opt-body{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}
    .g2-opt-title{font:500 18px/1.3 "Work Sans",system-ui,sans-serif;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
    .g2-sug{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:3px 9px;border-radius:99px;background:#E6EAF4;color:#0B1230}
    .g2-opt-text{font-size:15px;line-height:1.45;color:rgba(230,234,244,.82)}
    .g2-opt-meta{display:flex;gap:14px;flex-wrap:wrap;margin-top:6px;font-size:13px;color:rgba(230,234,244,.74)}
    .g2-dest{display:inline-flex;gap:6px;align-items:center;color:#E6EAF4;font-weight:500}
    .g2-opt-go{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.08);transition:background .3s}
    .g2-opt:hover .g2-opt-go{background:var(--hue);color:#0B1230}
    .g2-back{grid-column:1/-1}
    .g2-linkbtn{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;min-height:44px;color:#E6EAF4;font-weight:500}
    .g2-linkbtn:hover{text-decoration:underline;text-underline-offset:4px}
    .g2-linkbtn:focus-visible{outline:3px solid #E6EAF4;outline-offset:3px;border-radius:8px}
    .g2-center{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center}
    .g2-breath{width:min(300px,60vw);aspect-ratio:1;margin-bottom:12px}
    .g2-orb-lg{width:clamp(160px,18cqi,240px);aspect-ratio:1}
    .g2-go{position:relative;z-index:40}
    @container (max-width:980px){.g2-steplabel{display:none}.g2-steps li{padding:4px}}
    @container (max-width:900px){
     .g2-feel,.g2-help{grid-template-columns:minmax(0,1fr)}
     .g2-feel{text-align:center}.g2-copy{align-items:center}.g2-sub{margin-left:auto;margin-right:auto}
     .g2-reflect{align-items:center;text-align:center}.g2-reflect .esc-chip{align-self:center!important}.g2-care{text-align:left}
    }
    @container (max-width:560px){
     .g2-top{padding:14px 16px}.g2-mark{font-size:18px}.g2-skip{order:3;width:100%;justify-content:center}
     .g2-ring{aspect-ratio:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 6px;padding-top:min(56vw,260px)}
     .g2-core{top:0;translate:-50% 0;width:min(52vw,240px)}
     .g2-mood{position:relative;left:auto;top:auto;translate:none;width:auto}
     .g2-orb{width:64px}
     .g2-opt{padding:16px;gap:14px}.g2-opt-icon{width:44px;height:44px}.g2-opt-go{display:none}
     .g2-foot{justify-content:center;text-align:center}
    }
    `

    PathGate.defaultProps = { skipHref: ROUTES.home, betaHref: ROUTES.beta, showCrisisLine: true, bgVideo: MEDIA_BASE + "escape_splash.mp4", bgVideoWebm: MEDIA_BASE + "escape_splash.webm", bgPoster: MEDIA_BASE + "escape_splash_poster.webp", bgBlur: 18, moodOverlay: 0.82 }
    addPropertyControls(PathGate, {
        skipHref: { type: ControlType.Link, title: "Skip link" },
        betaHref: { type: ControlType.Link, title: "Beta link" },
        showCrisisLine: { type: ControlType.Boolean, title: "988 line on Low" },
        bgVideo: { type: ControlType.File, title: "Background video", allowedFileTypes: ["mp4", "mov"] },
        bgVideoWebm: { type: ControlType.File, title: "Background WebM", allowedFileTypes: ["webm"] },
        bgPoster: { type: ControlType.Image, title: "Background poster" },
        bgBlur: { type: ControlType.Number, title: "Background blur", min: 0, max: 80, step: 2, unit: "px" },
        moodOverlay: { type: ControlType.Number, title: "Mood colour strength", min: 0.4, max: 1, step: 0.02 },
    })
    return { default: PathGate, JOURNEY, journey }
})()

// ═══════════════ JourneyBanner ═══════════════
const __JourneyBanner = (() => {
    const { journey } = __PathGate
    // Escape — arrival banner. Sits under the nav on every page; shows only on the page the gate
    // sent you to. It closes the loop: why you're here, what else exists, how to change it.





    const MAP = [
        { href: ROUTES.home, page: "Home", line: "Everything Escape does" },
        { href: ROUTES.lucille, page: "Lucille AI", line: "Your AI companion" },
        { href: ROUTES.community, page: "Community", line: "Coins, levels, creators" },
        { href: ROUTES.pricing, page: "Pricing", line: "One pass, 7 days free" },
        { href: ROUTES.demo, page: "App Demo", line: "3-minute video" },
        { href: ROUTES.innerverse, page: "Innerverse", line: "3D worlds, coming soon" },
        { href: ROUTES.beta, page: "App Testing", line: "Get early access" },
    ]

    const here = () => {
        if (typeof window === "undefined") return ""
        const h = window.location.hash
        return h.startsWith("#/") ? h.slice(1).split("#")[0] : window.location.pathname
    }

    /**
     */
    function JourneyBanner() {
        const [j, setJ] = React.useState<any>(null)
        const [open, setOpen] = React.useState(false)
        const [gone, setGone] = React.useState(false)
        React.useEffect(() => {
            const f = () => { const s = journey.load(); setJ(s && s.href === here() ? s : null); setOpen(false) }
            f(); window.addEventListener("hashchange", f); window.addEventListener("popstate", f)
            return () => { window.removeEventListener("hashchange", f); window.removeEventListener("popstate", f) }
        }, [])
        const m = moodById(j?.mood)
        if (!j || !m) return null
        const close = () => { setGone(true); journey.clear() }
        return (
            <Page bare style={{ background: "transparent" }}>
                <style>{CSS}</style>
                <AnimatePresence>
                    {!gone && (
                        <motion.aside className="jb" aria-label="Why you're on this page" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5, ease, delay: 0.4 }}>
                            <div className="jb-bar esc-glass">
                                <Orb mood={j.mood} size={40} glow={false} live />
                                <p className="jb-text">
                                    You're feeling <strong style={{ color: "var(--esc-accent)" }}>{m.label.toLowerCase()}</strong>, so we started you here: <strong>{j.page}</strong>.
                                </p>
                                <div className="jb-actions">
                                    <button type="button" className="jb-btn" aria-expanded={open} aria-controls="jb-map" onClick={() => setOpen(!open)}>
                                        <Icon name="compass" size={16} />{open ? "Hide pages" : "See all pages"}
                                    </button>
                                    <a className="jb-btn" href={ROUTES.gate}><Icon name="orb" size={16} />Change feeling</a>
                                    <button type="button" className="jb-x" aria-label="Dismiss" onClick={close}><Icon name="close" size={18} /></button>
                                </div>
                            </div>
                            <AnimatePresence>
                                {open && (
                                    <motion.nav id="jb-map" className="jb-map esc-glass" aria-label="All pages" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.38, ease }}>
                                        <ul>
                                            {MAP.map((x) => (
                                                <li key={x.href}>
                                                    <a href={x.href} aria-current={x.href === j.href ? "page" : undefined} className={x.href === j.href ? "on" : ""}>
                                                        <span className="jb-page">{x.page}{x.href === j.href && <span className="jb-you">You're here</span>}</span>
                                                        <span className="jb-line">{x.line}</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.nav>
                                )}
                            </AnimatePresence>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </Page>
        )
    }

    const CSS = `
    .jb{max-width:1240px;width:calc(100% - 24px);margin:8px auto 0}
    .jb-bar{display:flex;align-items:center;gap:14px;padding:8px 8px 8px 10px;border-radius:999px;background:var(--esc-nav)}
    .jb-text{margin:0;flex:1;font-size:15px;line-height:1.4;color:var(--esc-muted)}
    .jb-text strong{color:var(--esc-ink);font-weight:500}
    .jb-actions{display:flex;gap:6px;align-items:center}
    .jb-btn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 14px;border-radius:99px;font-size:14px;font-weight:500;color:var(--esc-ink);background:var(--esc-glass1);box-shadow:inset 0 0 0 1px var(--esc-border);white-space:nowrap}
    .jb-btn:hover{box-shadow:inset 0 0 0 1px var(--esc-accent)}
    .jb-x{all:unset;cursor:pointer;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:var(--esc-faint)}
    .jb-x:hover{color:var(--esc-ink)}
    .jb-btn:focus-visible,.jb-x:focus-visible,.jb-map a:focus-visible{outline:3px solid var(--esc-accent);outline-offset:2px}
    .jb-map{margin-top:8px;border-radius:24px;overflow:hidden;background:var(--esc-nav)}
    .jb-map ul{list-style:none;margin:0;padding:10px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
    .jb-map a{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border-radius:16px;text-decoration:none;color:var(--esc-ink)}
    .jb-map a:hover{background:var(--esc-glass1)}
    .jb-map a.on{background:color-mix(in oklab,var(--esc-accent) 18%,transparent)}
    .jb-page{font-weight:500;display:flex;gap:8px;align-items:center}
    .jb-you{font-size:11px;padding:2px 8px;border-radius:99px;background:var(--esc-accent);color:var(--esc-onAccent)}
    .jb-line{font-size:13px;color:var(--esc-faint)}
    @container (max-width:900px){.jb-bar{border-radius:24px;flex-wrap:wrap;padding:12px}.jb-text{flex-basis:calc(100% - 60px)}.jb-actions{width:100%}.jb-btn{flex:1;justify-content:center}.jb-map ul{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `

    addPropertyControls(JourneyBanner, {})
    return { default: JourneyBanner }
})()

// ═══════════════ SiteNav ═══════════════
const __SiteNav = (() => {
    const JourneyBanner = __JourneyBanner.default
    // Escape — site navigation (floating glass bar).
    //
    // Left: wordmark. Middle: pages. Right: your mood orb (back to the gate to change it), the
    // sun/moon tone toggle (same idea as the Home orb in the app) and the main call to action.
    // Under 900 px it collapses to a menu sheet.
    //
    // In Framer: put it in each page (or a shared layout) at the top, Fill width, and set the
    // layer's Position to Sticky (top 0) or Fixed so it floats over the page.





    type PageKey = "home" | "lucille" | "community" | "pricing" | "innerverse" | "beta" | "demo" | "legal" | "none"

    interface Props {
        current: PageKey
        ctaLabel: string
        ctaHref: string
        homeHref: string
        lucilleHref: string
        communityHref: string
        pricingHref: string
        innerverseHref: string
        betaHref: string
        gateHref: string
    }

    /**
     */
    function SiteNav(p: Props) {
        const s = useEscape()
        const [open, setOpen] = React.useState(false)
        const [scrolled, setScrolled] = React.useState(false)
        const m = moodById(s.mood)
        React.useEffect(() => {
            const f = () => setScrolled(window.scrollY > 12)
            f(); window.addEventListener("scroll", f, { passive: true })
            return () => window.removeEventListener("scroll", f)
        }, [])
        React.useEffect(() => {
            if (!open) return
            const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
            window.addEventListener("keydown", k)
            return () => window.removeEventListener("keydown", k)
        }, [open])

        const links: { key: PageKey; label: string; href: string; soon?: boolean }[] = [
            { key: "home", label: "Home", href: p.homeHref },
            { key: "lucille", label: "Lucille AI", href: p.lucilleHref },
            { key: "community", label: "Community", href: p.communityHref },
            { key: "pricing", label: "Pricing", href: p.pricingHref },
            { key: "innerverse", label: "Innerverse", href: p.innerverseHref, soon: true },
            { key: "beta", label: "App Testing", href: p.betaHref },
        ]
        const light = s.tone === "light"

        return (
            <Page bare style={{ background: "transparent" }}>
                <style>{NAV_CSS}</style>
                <FlightOrb />
                <nav className={`nav ${scrolled ? "scrolled" : ""}`} aria-label="Main">
                    <a className="nav-mark esc-d" href={p.homeHref} aria-label="Escape home">ESCAPE<sup>™</sup></a>
                    <ul className="nav-links">
                        {links.map((l) => (
                            <li key={l.key}>
                                <a href={l.href} aria-current={p.current === l.key ? "page" : undefined} className={p.current === l.key ? "on" : ""}>
                                    {l.label}{l.soon && <span className="nav-soon">Soon</span>}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="nav-right">
                        <a className="nav-orb" href={p.gateHref} aria-label={m ? `Your mood: ${m.label}. Change it` : "Choose your mood"} title={m ? `${m.label} · change` : "Choose your mood"}>
                            <Orb mood={s.mood} size={34} glow={false} live />
                        </a>
                        <button type="button" className="nav-tone" onClick={() => escape.toggleTone()} aria-pressed={light} aria-label={light ? "Switch to night" : "Switch to day"}>
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span key={s.tone} initial={{ rotate: -40, opacity: 0, scale: 0.7 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 40, opacity: 0, scale: 0.7 }} transition={{ duration: 0.38, ease }} style={{ display: "grid" }}>
                                    <Icon name={light ? "sun" : "moon"} size={20} />
                                </motion.span>
                            </AnimatePresence>
                        </button>
                        <span className="nav-cta"><Button href={p.ctaHref} small>{p.ctaLabel}</Button></span>
                        <button type="button" className="nav-burger" aria-expanded={open} aria-controls="esc-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
                            <Icon name={open ? "close" : "menu"} size={22} />
                        </button>
                    </div>
                </nav>
                <JourneyBanner />
                <AnimatePresence>
                    {open && (
                        <motion.div id="esc-menu" className="nav-sheet esc-glass" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.32, ease }}>
                            <ul>
                                {links.map((l) => (
                                    <li key={l.key}>
                                        <a href={l.href} aria-current={p.current === l.key ? "page" : undefined} onClick={() => setOpen(false)}>
                                            {l.label}{l.soon && <span className="nav-soon">Soon</span>}
                                            <Icon name="arrow" size={18} />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <a className="nav-sheet-mood" href={p.gateHref}>
                                <Orb mood={s.mood} size={40} glow={false} live />
                                <span>{m ? <>Feeling <strong>{m.label.toLowerCase()}</strong>. Change it</> : "Choose your mood"}</span>
                            </a>
                            <Button href={p.ctaHref}>{p.ctaLabel}</Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Page>
        )
    }

    const NAV_CSS = `
    .nav{display:flex;align-items:center;gap:20px;max-width:1240px;margin:12px auto 0;width:calc(100% - 24px);min-height:64px;padding:8px 10px 8px 22px;border-radius:999px;border:1px solid transparent;transition:background .52s var(--esc-ease),border-color .52s var(--esc-ease),box-shadow .52s var(--esc-ease)}
    .nav.scrolled,.nav:focus-within{background:var(--esc-nav);border-color:var(--esc-border);box-shadow:var(--esc-shadow);-webkit-backdrop-filter:blur(20px) saturate(1.2);backdrop-filter:blur(20px) saturate(1.2)}
    .nav-mark{font-size:20px;letter-spacing:.14em;color:var(--esc-ink);text-decoration:none;min-height:44px;display:inline-flex;align-items:center}
    .nav-mark sup{font-size:.45em;letter-spacing:0;margin-left:2px}
    .nav-links{list-style:none;display:flex;gap:4px;margin:0 auto;padding:0}
    .nav-links a{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border-radius:999px;color:var(--esc-muted);text-decoration:none;font-size:15px;font-weight:500;transition:color .3s,background .3s}
    .nav-links a:hover{color:var(--esc-ink);background:var(--esc-glass2)}
    .nav-links a.on{color:var(--esc-ink);background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2));box-shadow:inset 0 0 0 1px var(--esc-border)}
    .nav-soon{font-size:11px;color:var(--esc-gold);border:1px solid color-mix(in oklab,var(--esc-gold) 50%,transparent);border-radius:999px;padding:1px 7px}
    .nav-right{display:flex;align-items:center;gap:8px;margin-left:auto}
    .nav-orb,.nav-tone,.nav-burger{all:unset;box-sizing:border-box;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:var(--esc-ink);border:1px solid var(--esc-border);background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2));transition:border-color .3s}
    .nav-orb:hover,.nav-tone:hover,.nav-burger:hover{border-color:var(--esc-accent)}
    .nav-burger{display:none}
    .nav-sheet{position:absolute;left:12px;right:12px;top:84px;z-index:50;padding:16px;border-radius:28px;display:flex;flex-direction:column;gap:14px;background:var(--esc-nav)}
    .nav-sheet ul{list-style:none;margin:0;padding:0}
    .nav-sheet li a{display:flex;align-items:center;gap:8px;min-height:54px;padding:0 10px;color:var(--esc-ink);text-decoration:none;font-size:18px;border-bottom:1px solid var(--esc-line)}
    .nav-sheet li a svg{margin-left:auto;color:var(--esc-faint)}
    .nav-sheet li a[aria-current="page"]{color:var(--esc-accent)}
    .nav-sheet-mood{display:flex;align-items:center;gap:12px;color:var(--esc-muted);text-decoration:none;min-height:54px;padding:0 6px}
    .nav-sheet .esc-btn{width:100%}
    @container (max-width:1060px){.nav-links a{padding:0 10px;font-size:14px}}
    @container (max-width:900px){.nav-links,.nav-cta{display:none}.nav-burger{display:grid}.nav{padding-left:18px}}
    `

    SiteNav.defaultProps = {
        current: "home",
        ctaLabel: "Get early access",
        ctaHref: ROUTES.beta,
        homeHref: ROUTES.home,
        lucilleHref: ROUTES.lucille,
        communityHref: ROUTES.community,
        pricingHref: ROUTES.pricing,
        innerverseHref: ROUTES.innerverse,
        betaHref: ROUTES.beta,
        gateHref: ROUTES.gate,
    }

    addPropertyControls(SiteNav, {
        current: {
            type: ControlType.Enum, title: "Current page",
            options: ["home", "lucille", "community", "pricing", "innerverse", "beta", "demo", "legal", "none"],
            optionTitles: ["Home", "Lucille AI", "Community", "Pricing", "Innerverse", "App Testing", "App Demo", "Legal", "None"],
        },
        ctaLabel: { type: ControlType.String, title: "Button" },
        ctaHref: { type: ControlType.Link, title: "Button link" },
        homeHref: { type: ControlType.Link, title: "Home" },
        lucilleHref: { type: ControlType.Link, title: "Lucille AI" },
        communityHref: { type: ControlType.Link, title: "Community" },
        pricingHref: { type: ControlType.Link, title: "Pricing" },
        innerverseHref: { type: ControlType.Link, title: "Innerverse" },
        betaHref: { type: ControlType.Link, title: "App Testing" },
        gateHref: { type: ControlType.Link, title: "Orb gate" },
    })
    return { default: SiteNav }
})()

// ═══════════════ SiteFooter ═══════════════
const __SiteFooter = (() => {
    // Escape — site footer. Fill width, auto height, at the bottom of every page.



    interface Props {
        tagline: string
        accessTitle: string
        accessBody: string
        accessLabel: string
        accessHref: string
        appStoreUrl: string
        playUrl: string
        contactEmail: string
        instagramUrl: string
        tiktokUrl: string
        linkedinUrl: string
    }

    /**
     */
    function SiteFooter(p: Props) {
        const cols = [
            { title: "Product", links: [["Lucille AI", ROUTES.lucille], ["Pricing", ROUTES.pricing], ["App demo", ROUTES.demo], ["Innerverse · soon", ROUTES.innerverse], ["Kickstarter", LINKS.kickstarter]] },
            { title: "Community", links: [["Coins & rewards", ROUTES.community], ["Creator studio", LINKS.creators], ["Influencer program", LINKS.influencers], ["Beta Discord", LINKS.discord], ["App testing", ROUTES.beta]] },
            { title: "Company", links: [["Privacy Policy", ROUTES.privacy], ["Terms of Service", ROUTES.terms], ["Cookie Policy", ROUTES.cookies], ["Contact", `mailto:${p.contactEmail}`]] },
        ]
        return (
            <Page>
                <style>{FOOT_CSS}</style>
                <footer className="foot">
                    <Backdrop intensity={0.5} />
                    <div className="esc-wrap foot-in">
                        <div className="foot-brand">
                            <a href={ROUTES.home} className="esc-d foot-mark" aria-label="Escape home">ESCAPE<sup>™</sup></a>
                            <p className="esc-p" style={{ maxWidth: 340 }}>{p.tagline}</p>
                            <StoreBadges appStoreUrl={p.appStoreUrl || undefined} playUrl={p.playUrl || undefined} />
                            <div className="esc-row" style={{ gap: 18 }}>
                                {p.instagramUrl && <a className="esc-link" href={p.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>}
                                {p.tiktokUrl && <a className="esc-link" href={p.tiktokUrl} target="_blank" rel="noopener noreferrer">TikTok</a>}
                                {p.linkedinUrl && <a className="esc-link" href={p.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                            </div>
                        </div>
                        {cols.map((c) => (
                            <nav key={c.title} aria-label={c.title} className="foot-col">
                                <h2 className="esc-over" style={{ margin: "0 0 14px" }}>{c.title}</h2>
                                <ul>{c.links.map(([l, h]) => { const ext = /^https?:/.test(h); return <li key={l}><a href={h} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined}>{l}{ext && <span className="esc-sr"> (opens in a new tab)</span>}</a></li> })}</ul>
                            </nav>
                        ))}
                        <div className="esc-glass foot-access">
                            <h2 className="esc-d" style={{ fontSize: 24, margin: 0 }}>{p.accessTitle}</h2>
                            <p className="esc-p" style={{ fontSize: 15 }}>{p.accessBody}</p>
                            <Button href={p.accessHref} small arrow>{p.accessLabel}</Button>
                        </div>
                    </div>
                    <div className="esc-wrap foot-legal">
                        <hr className="esc-hr" />
                        <div className="foot-row">
                            <span className="esc-small">© {new Date().getFullYear()} Escape Enterprises LLC. All rights reserved.</span>
                            <span className="esc-small foot-disc">{DISCLAIMER}</span>
                        </div>
                    </div>
                </footer>
            </Page>
        )
    }

    const FOOT_CSS = `
    .foot{position:relative;padding:clamp(56px,7cqi,88px) 0 28px;border-top:1px solid var(--esc-line)}
    .foot-in{display:grid;grid-template-columns:1.4fr repeat(3,1fr) 1.3fr;gap:clamp(24px,3cqi,40px);align-items:start}
    .foot-brand{display:flex;flex-direction:column;gap:18px}
    .foot-mark{font-size:26px;letter-spacing:.14em;color:var(--esc-ink);text-decoration:none}
    .foot-mark sup{font-size:.45em;letter-spacing:0;margin-left:2px}
    .foot-col ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
    .foot-col a{color:var(--esc-muted);text-decoration:none;font-size:15px;min-height:36px;display:inline-flex;align-items:center}
    .foot-col a:hover{color:var(--esc-ink);text-decoration:underline;text-underline-offset:4px}
    .foot-access{border-radius:24px;padding:22px;display:flex;flex-direction:column;gap:12px;align-items:flex-start}
    .foot-legal{margin-top:clamp(40px,5cqi,64px);display:flex;flex-direction:column;gap:20px}
    .foot-row{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}
    .foot-disc{max-width:640px}
    @container (max-width:1100px){.foot-in{grid-template-columns:1fr 1fr 1fr}.foot-brand{grid-column:1/-1}.foot-access{grid-column:1/-1}}
    @container (max-width:600px){.foot-in{grid-template-columns:1fr 1fr}}
    `

    SiteFooter.defaultProps = {
        tagline: "Self-care that meets you where you are. Guided by Lucille, shaped by how you feel.",
        accessTitle: "Early access",
        accessBody: "Support the journey and be first in when Escape opens on iOS and Android.",
        accessLabel: "Get access",
        accessHref: ROUTES.beta,
        appStoreUrl: "",
        playUrl: "",
        contactEmail: "privacy@escapeapp.ai",
        instagramUrl: LINKS.instagram,
        tiktokUrl: LINKS.tiktok,
        linkedinUrl: LINKS.linkedin,
    }

    addPropertyControls(SiteFooter, {
        tagline: { type: ControlType.String, title: "Tagline", displayTextArea: true },
        accessTitle: { type: ControlType.String, title: "Access title" },
        accessBody: { type: ControlType.String, title: "Access text", displayTextArea: true },
        accessLabel: { type: ControlType.String, title: "Access button" },
        accessHref: { type: ControlType.Link, title: "Access link" },
        appStoreUrl: { type: ControlType.Link, title: "App Store URL" },
        playUrl: { type: ControlType.Link, title: "Google Play URL" },
        contactEmail: { type: ControlType.String, title: "Contact email" },
        instagramUrl: { type: ControlType.Link, title: "Instagram" },
        tiktokUrl: { type: ControlType.Link, title: "TikTok" },
        linkedinUrl: { type: ControlType.Link, title: "LinkedIn" },
    })
    return { default: SiteFooter }
})()

// ═══════════════ LucilleTaste ═══════════════
const __LucilleTaste = (() => {
    // Escape — "Say something to Lucille": one real reply from Lucille on the website.
    //
    // Calls POST /v1/public/taste on the Lucille API (with voice: true, so a reply can come with
    // Lucille reading it in her own voice; the "Hear Lucille" button appears only when it does) (no account; 280 characters in, a few sentences
    // out; per-visitor and daily limits on the server; nothing is stored). Crisis messages are
    // answered by the app's safety screen with 988, never by the model. If the API is unreachable,
    // it falls back to a gentle built-in reply so the card never looks broken.
    //
    // Use it inside LucillePage (it is already there) or drop it anywhere: Fill width, Fit height.




    type Phase = "idle" | "thinking" | "reply" | "limit"

    const STARTERS = ["Long day. My head won't stop.", "I can't fall asleep lately.", "Honestly, I feel pretty good today."]
    const OFFLINE_REPLY = "I'm glad you said something. Let's take one slow breath together: in for four, out for six. When you're ready, I'll be right here in the Escape app."

    interface Props { ctaLabel: string; ctaHref: string; placeholder: string; compact: boolean }

    /**
     */
    function LucilleTaste(p: Props) {
        return <Page bare style={{ background: "transparent" }}><TasteCard {...p} /></Page>
    }

    function TasteCard(p: Partial<Props>) {
        const s = useEscape()
        const m = moodById(s.mood)
        const reduce = useReducedMotion()
        const [text, setText] = React.useState("")
        const [sent, setSent] = React.useState("")
        const [phase, setPhase] = React.useState<Phase>("idle")
        const [reply, setReply] = React.useState("")
        const [shown, setShown] = React.useState(0)
        const [crisis, setCrisis] = React.useState(false)
        const [remaining, setRemaining] = React.useState<number | null>(null)
        const [audio, setAudio] = React.useState<string | null>(null)
        const [speaking, setSpeaking] = React.useState(false)
        const player = React.useRef<HTMLAudioElement | null>(null)
        React.useEffect(() => () => { player.current?.pause() }, [])
        const inputRef = React.useRef<HTMLTextAreaElement>(null)
        const words = reply.split(" ")

        // reveal the reply a few words at a time, like Lucille speaking
        React.useEffect(() => {
            if (phase !== "reply") return
            if (reduce) { setShown(words.length); return }
            setShown(0)
            let i = 0
            const id = window.setInterval(() => { i += 1; setShown(i); if (i >= words.length) window.clearInterval(id) }, 55)
            return () => window.clearInterval(id)
        }, [phase, reply])

        const send = async (msg?: string) => {
            const message = (msg ?? text).trim()
            if (!message || phase === "thinking") return
            setSent(message); setText(""); setPhase("thinking"); setCrisis(false); setAudio(null); player.current?.pause(); setSpeaking(false)
            const started = Date.now()
            const res = await postPublic("/v1/public/taste", { message: message.slice(0, 280), mood: s.mood || undefined, voice: true }, 25000)
            const wait = Math.max(0, 900 - (Date.now() - started)) // let the orb "think" a beat
            await new Promise((r) => setTimeout(r, wait))
            const d = res.data || {}
            if (res.ok && d.reply) {
                setReply(d.reply); setRemaining(typeof d.remaining === "number" ? d.remaining : null)
                setCrisis(d.source === "crisis")
                setAudio(typeof d.audio === "string" ? d.audio : null)
                setPhase(d.source === "limit" ? "limit" : "reply")
            } else {
                setReply(OFFLINE_REPLY); setRemaining(null); setPhase("reply")
            }
        }
        const hear = () => {
            if (!audio) return
            if (speaking) { player.current?.pause(); setSpeaking(false); return }
            const a = player.current && player.current.src === audio ? player.current : new Audio(audio)
            player.current = a
            a.onended = () => setSpeaking(false)
            a.currentTime = 0
            a.play().then(() => setSpeaking(true)).catch(() => setSpeaking(false))
        }
        const again = () => { player.current?.pause(); setSpeaking(false); setAudio(null); setPhase("idle"); setReply(""); setSent(""); setTimeout(() => inputRef.current?.focus(), 50) }
        const left = 280 - text.length

        return (
            <div className="lt esc-glass" style={{ "--hue": m ? m.hue : "#8E7CD9" } as any}>
                <style>{CSS}</style>
                <div className="lt-head">
                    <Orb mood={s.mood} size={44} live glow={phase === "thinking" || speaking} rings={phase === "thinking" || speaking} breathe />
                    <div className="esc-stack" style={{ gap: 2 }}>
                        <strong style={{ fontWeight: 500 }}>Lucille</strong>
                        <span className="esc-small" aria-live="polite">{phase === "thinking" ? "Thinking…" : speaking ? "Speaking…" : phase === "idle" ? "Say something, she'll answer" : "AI companion"}</span>
                    </div>
                </div>

                <div className="lt-body" aria-live="polite">
                    <AnimatePresence initial={false}>
                        {phase === "idle" && (
                            <motion.div key="idle" className="lt-starters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: easeSoft }}>
                                {STARTERS.map((st) => (
                                    <button key={st} type="button" className="lt-chip" onClick={() => send(st)}>{st}</button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {sent && <motion.p className="bub me" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: easeSoft }}>{sent}</motion.p>}
                    {phase === "thinking" && (
                        <motion.p className="bub lu lt-dots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} aria-label="Lucille is thinking"><span /><span /><span /></motion.p>
                    )}
                    {(phase === "reply" || phase === "limit") && (
                        <motion.p className="bub lu" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeSoft }}>
                            {words.slice(0, shown).join(" ")}
                            {shown < words.length && <span className="lt-caret" aria-hidden />}
                        </motion.p>
                    )}
                    {audio && !crisis && shown >= words.length && (
                        <motion.button type="button" className={`lt-hear ${speaking ? "on" : ""}`} onClick={hear} aria-pressed={speaking} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeSoft }}>
                            <span className="lt-hear-ic" aria-hidden>{speaking ? <span className="lt-bars"><i /><i /><i /><i /></span> : <Icon name="play" size={12} />}</span>
                            {speaking ? "Pause" : "Hear Lucille say it"}
                        </motion.button>
                    )}
                    {crisis && shown >= words.length && (
                        <a className="lt-crisis" href="tel:988"><Icon name="heart" size={16} /> Call or text 988 (US) · free, 24/7</a>
                    )}
                </div>

                {phase === "idle" || phase === "thinking" ? (
                    <form className="lt-form" onSubmit={(e) => { e.preventDefault(); send() }}>
                        <label className="esc-sr" htmlFor="lt-input">Your message to Lucille</label>
                        <textarea id="lt-input" ref={inputRef} rows={2} maxLength={280} value={text} disabled={phase === "thinking"}
                            placeholder={p.placeholder || "Tell Lucille how you're doing…"}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }} />
                        <div className="lt-row">
                            <span className="esc-small" aria-hidden>{left < 60 ? `${left} left` : "One message · not saved"}</span>
                            <button type="submit" className="lt-send" disabled={!text.trim() || phase === "thinking"} aria-label="Send to Lucille"><Icon name="arrow" size={18} /></button>
                        </div>
                    </form>
                ) : (
                    <motion.div className="lt-after" initial={{ opacity: 0 }} animate={{ opacity: shown >= words.length ? 1 : 0 }} transition={{ duration: 0.6, ease: easeSoft }}>
                        <p className="esc-small" style={{ margin: 0 }}>{phase === "limit" ? "That's today's preview." : "Want to keep talking? Lucille remembers you in the app."}</p>
                        <div className="esc-row" style={{ gap: 8 }}>
                            <Button href={p.ctaHref || ROUTES.beta} small arrow>{p.ctaLabel || "Get early access"}</Button>
                            {phase !== "limit" && remaining !== 0 && <button type="button" className="lt-again" onClick={again}>Say something else</button>}
                        </div>
                    </motion.div>
                )}
                <p className="lt-note">Lucille is an AI, not a therapist. Messages aren't saved. In crisis? Call or text 988.</p>
            </div>
        )
    }

    const CSS = `
    .lt{border-radius:28px;padding:18px;display:flex;flex-direction:column;gap:14px;width:100%;max-width:460px;background:var(--esc-nav)}
    .lt-head{display:flex;align-items:center;gap:12px}
    .lt-body{display:flex;flex-direction:column;gap:8px;min-height:96px}
    .lt .bub{margin:0;max-width:92%;padding:11px 15px;border-radius:18px;font-size:15px;line-height:1.5}
    .lt .bub.me{align-self:flex-end;background:color-mix(in oklab,var(--hue) 28%,transparent);border-bottom-right-radius:6px;color:var(--esc-ink)}
    .lt .bub.lu{align-self:flex-start;background:var(--esc-glass1);border:1px solid var(--esc-border);border-bottom-left-radius:6px;color:var(--esc-ink)}
    .lt-starters{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
    .lt-chip{all:unset;box-sizing:border-box;cursor:pointer;min-height:40px;padding:8px 14px;border-radius:14px;font-size:14px;color:var(--esc-muted);border:1px dashed var(--esc-border);transition:border-color .3s,color .3s}
    .lt-chip:hover{color:var(--esc-ink);border-color:var(--hue)}
    .lt-chip:focus-visible,.lt-again:focus-visible,.lt-send:focus-visible{outline:3px solid var(--esc-accent);outline-offset:2px}
    .lt-dots{display:inline-flex;gap:5px;align-items:center;min-height:22px}
    .lt-dots span{width:7px;height:7px;border-radius:50%;background:var(--esc-muted);animation:lt-dot 1.2s var(--esc-ease) infinite}
    .lt-dots span:nth-child(2){animation-delay:.18s}.lt-dots span:nth-child(3){animation-delay:.36s}
    @keyframes lt-dot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
    .lt-caret{display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-2px;background:var(--esc-accent);animation:lt-blink 1s steps(2) infinite}
    @keyframes lt-blink{to{opacity:0}}
    .lt-hear{all:unset;box-sizing:border-box;cursor:pointer;align-self:flex-start;display:inline-flex;align-items:center;gap:10px;min-height:40px;padding:0 14px 0 6px;border-radius:999px;font-size:14px;font-weight:500;color:var(--esc-ink);background:var(--esc-glass1);border:1px solid var(--esc-border);transition:border-color .3s}
    .lt-hear:hover,.lt-hear.on{border-color:var(--hue)}
    .lt-hear:focus-visible{outline:3px solid var(--esc-accent);outline-offset:2px}
    .lt-hear-ic{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:var(--esc-onAccent);background:var(--esc-accent)}
    .lt-bars{display:flex;gap:2px;align-items:center;height:12px}
    .lt-bars i{width:2px;height:100%;background:currentColor;border-radius:2px;animation:lt-bar .9s var(--esc-ease) infinite alternate}
    .lt-bars i:nth-child(2){animation-delay:.15s}.lt-bars i:nth-child(3){animation-delay:.3s}.lt-bars i:nth-child(4){animation-delay:.45s}
    @keyframes lt-bar{from{transform:scaleY(.3)}to{transform:scaleY(1)}}
    .lt-crisis{display:inline-flex;gap:8px;align-items:center;min-height:40px;padding:0 14px;border-radius:14px;font-weight:500;color:#0B1230;background:#F5C26B;text-decoration:none;align-self:flex-start}
    .lt-form{display:flex;flex-direction:column;gap:6px;border-radius:20px;padding:10px 10px 8px 14px;background:var(--esc-glass2);border:1px solid var(--esc-border);transition:border-color .3s}
    .lt-form:focus-within{border-color:var(--hue)}
    .lt-form textarea{all:unset;box-sizing:border-box;width:100%;resize:none;font:400 16px/1.45 "Work Sans",system-ui,sans-serif;color:var(--esc-ink);min-height:46px}
    .lt-form textarea::placeholder{color:var(--esc-faint)}
    .lt-row{display:flex;justify-content:space-between;align-items:center;gap:10px}
    .lt-send{all:unset;cursor:pointer;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:var(--esc-onAccent);background:var(--esc-accent);transition:opacity .3s,transform .3s}
    .lt-send:disabled{opacity:.4;cursor:default}
    .lt-send:not(:disabled):hover{transform:translateX(2px)}
    .lt-after{display:flex;flex-direction:column;gap:10px}
    .lt-again{all:unset;cursor:pointer;min-height:44px;padding:0 14px;border-radius:999px;font-size:14px;font-weight:500;color:var(--esc-ink);border:1px solid var(--esc-border)}
    .lt-note{margin:0;font-size:12px;line-height:1.45;color:var(--esc-faint)}
    `

    LucilleTaste.defaultProps = { ctaLabel: "Get early access", ctaHref: ROUTES.beta, placeholder: "Tell Lucille how you're doing…", compact: false }
    addPropertyControls(LucilleTaste, {
        ctaLabel: { type: ControlType.String, title: "Button" },
        ctaHref: { type: ControlType.Link, title: "Button link" },
        placeholder: { type: ControlType.String, title: "Placeholder" },
    })
    return { default: LucilleTaste, TasteCard }
})()

// ═══════════════ HomePage ═══════════════
const __HomePage = (() => {
    // Escape — Home page body (between SiteNav and SiteFooter). Fill width, auto height.
    //
    // The hero keeps the app's splash animation exactly: the same face loop, the same white→royal
    // glow at the bottom, the same ESCAPE Lottie, and the same fade timings as
    // SplashScreenVersion5 (page 600 ms, image 1610 ms, glow 1490 ms, column 1730 ms, text 2400 ms).
    // Upload media/escape_splash.mp4 to "Splash video", media/escape_splash.webm to "Splash WebM"
    // (plays where H.264 can't) and the poster to "Splash poster".




    const src = (v: any) => (typeof v === "string" ? v : v?.src) || ""

    interface Props {
        splashVideo: string
        splashVideoWebm: string
        splashPoster: any
        primaryLabel: string
        primaryHref: string
        demoHref: string
        founderQuote: string
        founderName: string
        founderRole: string
        appStoreUrl: string
        playUrl: string
    }

    /**
     */
    function HomePage(p: Props) {
        return (
            <Page>
                <style>{HOME_CSS}</style>
                <Hero {...p} />
                <Founder quote={p.founderQuote} name={p.founderName} role={p.founderRole} />
                <Bento />
                <TryIt />
                <HowItWorks />
                <Journey />
                <Privacy />
                <CommunityTeaser />
                <ClosingCta
                    eyebrow="A self-care revolution within"
                    title={<>Ready when <span className="esc-gold">you</span> are.</>}
                    lede="Join the early access list and be first in when Escape opens on iOS and Android."
                    primary={{ label: p.primaryLabel, href: p.primaryHref }}
                    secondary={{ label: "See pricing", href: ROUTES.pricing }}
                    badges appStoreUrl={p.appStoreUrl || undefined} playUrl={p.playUrl || undefined}
                />
            </Page>
        )
    }

    // ───────────────────────── hero (the app splash) ─────────────────────────

    function Hero(p: Props) {
        const reduce = useReducedMotion()
        const fade = (ms: number, delay = 0, curve: any = [0.42, 0, 1, 1]) =>
            reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: ms / 1000, ease: curve, delay } }
        const video = src(p.splashVideo)
        const webm = src(p.splashVideoWebm)
        const poster = src(p.splashPoster) || SPLASH_POSTER
        return (
            <motion.section className="hero" {...fade(600)}>
                <Backdrop top />
                <div className="esc-wrap hero-in">
                    <div className="hero-copy esc-serene">
                        <Eyebrow>AI self-care companion · Powered by Lucille</Eyebrow>
                        <h1 className="esc-d esc-h1">Your Everyday Escape</h1>
                        <p className="esc-d esc-gold hero-tag">Not a way out — a way in.</p>
                        <p className="esc-lede">A self-care app and immersive experience for reflection, presence and personal expression, at your own pace. Check in, talk with Lucille, and get a day that fits how you actually feel.</p>
                        <div className="esc-row" style={{ gap: 12, marginTop: 8 }}>
                            <Button href={p.primaryHref} arrow>{p.primaryLabel}</Button>
                            <Button href={p.demoHref} variant="ghost" icon={<span className="hero-play"><Icon name="play" size={12} /></span>}>Watch the app demo</Button>
                        </div>
                        <ul className="hero-trust">
                            <li><Icon name="shield" size={18} /> Private by design</li>
                            <li><Icon name="lock" size={18} /> Your data is never sold</li>
                            <li><Icon name="star" size={18} /> Free 7-day trial</li>
                        </ul>
                    </div>

                    <div className="hero-visual" aria-label="Escape splash: a figure made of soft blue light, with the Escape wordmark" role="img">
                        <motion.div className="hero-arch" {...(reduce ? {} : { initial: { opacity: 0, filter: "blur(14px)", scale: 1.02 }, animate: { opacity: 1, filter: "blur(0px)", scale: 1 }, transition: { duration: 1.61, ease: [0.42, 0, 0.58, 1] } })}>
                            {video ? (
                                <video poster={poster} muted autoPlay loop playsInline preload="auto">
                                    {webm && <source src={webm} type="video/webm" />}
                                    <source src={video} type="video/mp4" />
                                </video>
                            ) : (
                                <img src={poster} alt="" />
                            )}
                            <motion.div className="hero-glow" aria-hidden {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 0.7 }, transition: { duration: 1.49, ease: [0.42, 0, 1, 1] } })} />
                            <div className="hero-word">
                                <Wordmark color="#1C2645" width="100%" label={false} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>
        )
    }

    // ───────────────────────── founder note ─────────────────────────

    function Founder(props: { quote: string; name: string; role: string }) {
        return (
            <section className="esc-sec" style={{ paddingTop: 0, paddingBottom: 0 }}>
                <div className="esc-wrap">
                    <Reveal className="esc-glass founder">
                        <span className="esc-over">Founder note</span>
                        <blockquote className="esc-d">“{props.quote}”</blockquote>
                        <span className="esc-p"><strong style={{ color: "var(--esc-ink)", fontWeight: 500 }}>{props.name}</strong> · {props.role}</span>
                    </Reveal>
                </div>
            </section>
        )
    }

    // ───────────────────────── bento: what's inside ─────────────────────────

    function Bento() {
        const s = useEscape()
        return (
            <section className="esc-sec">
                <Backdrop intensity={0.55} />
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Welcome to Escape" title="Self-care, made for you" lede="Thoughtful tools that meet you where you are, guided by an AI companion that listens first." />
                    <div className="bento">
                        <Card className="b-lucille esc-stack" style={{ gap: 16 }}>
                            <div className="esc-row" style={{ gap: 16 }}>
                                <Orb mood={s.mood} size={88} live rings />
                                <div>
                                    <span className="esc-over">Your companion</span>
                                    <h3 className="esc-d esc-h3" style={{ marginTop: 6 }}>Lucille AI</h3>
                                </div>
                            </div>
                            <p className="esc-p">Talk or type. Lucille remembers what matters to you, reads the moment, and suggests something small that fits it: a breath, a sound, a stretch, a note to yourself.</p>
                            <div className="bubbles" aria-label="Example conversation">
                                <span className="bub me">Long day. My head won't stop.</span>
                                <span className="bub lu">That sounds heavy. Want two minutes of slow breathing, or should we just talk it through?</span>
                            </div>
                            <a className="esc-link" href={ROUTES.lucille} style={{ marginTop: "auto" }}>Meet Lucille <Icon name="arrow" size={16} /></a>
                        </Card>
                        <Feature icon="orb" title="Mood check-ins" body="Six honest moods, one tap. Your orb, your colours and your day shift with how you feel." delay={0.05} />
                        <Feature icon="wave" title="Soundscapes" body="Living soundscapes that follow your mood and the weather outside, with a calmer night mode for sleep." delay={0.1} />
                        <Feature icon="move" title="Mind, Reset & Body" body="Guided breathing, short resets, and yoga, pilates and tai chi sessions sized to your energy." delay={0.15} />
                        <Feature icon="calendar" title="Plans & journal" body="A daily plan built with Lucille, a journal that reflects back gently, and letters to your future self." delay={0.2} />
                        <Card className="b-scan esc-stack" style={{ gap: 14 }} delay={0.25}>
                            <div className="esc-row" style={{ justifyContent: "space-between" }}>
                                <span className="esc-icon"><Icon name="spark" /></span>
                                <span className="esc-chip" style={{ minHeight: 28 }}>Unlocks at 1,000 coins</span>
                            </div>
                            <h3 className="esc-d esc-h3" style={{ marginTop: 10 }}>Energy Scan</h3>
                            <p className="esc-p">A daily read of seven energy centers, drawn from your check-ins, sessions and journal. It shows where you're balanced and what to try next.</p>
                            <div className="centers" aria-label="The seven energy centers">
                                {CENTERS.map((c) => <span key={c.name} title={c.name} style={{ background: c.color, boxShadow: `0 0 14px ${c.color}` }} />)}
                            </div>
                        </Card>
                        <Feature icon="cube" title="3D Innerverse" body="An evolving 3D sanctuary shaped by your inner state, for deep stillness and creativity." soon delay={0.3} />
                    </div>
                </div>
            </section>
        )
    }

    // ───────────────────────── try it: the check-in (tints the site) ─────────────────────────

    const PICKS: Record<MoodId, { pick: string; why: string }> = {
        calm: { pick: "A 5-minute body scan", why: "Keep the calm you've got and let it settle in." },
        energized: { pick: "A 10-minute yoga flow", why: "Spend the energy on something that feels good." },
        focused: { pick: "A focus soundscape", why: "Protect the clear headspace while it lasts." },
        restless: { pick: "Box breathing, 4 rounds", why: "Give the buzzing somewhere slow to land." },
        tired: { pick: "Deep-sleep breathing", why: "Rest counts. Let the evening wind down." },
        low: { pick: "A short walk with Lucille", why: "Gentle, small, and you don't have to talk." },
    }

    function TryIt() {
        const s = useEscape()
        const m = moodById(s.mood)
        const [hov, setHov] = React.useState<MoodId | null>(null)
        return (
            <section className="esc-sec">
                <div className="esc-wrap tryit">
                    <div>
                        <SectionHead eyebrow="Try it" title={<>How are you, <span className="esc-gold">really</span>?</>} lede="This is the check-in from the app. Pick a mood and watch the site change with you, the same way Escape does." />
                        <div className="moods" role="radiogroup" aria-label="Your mood">
                            {MOODS.map((mood) => {
                                const on = s.mood === mood.id
                                return (
                                    <button key={mood.id} type="button" role="radio" aria-checked={on} className={`mood ${on ? "on" : ""}`} style={{ "--hue": mood.hue } as any} onClick={() => escape.setMood(on ? null : mood.id)} onMouseEnter={() => setHov(mood.id)} onMouseLeave={() => setHov(null)} onFocus={() => setHov(mood.id)} onBlur={() => setHov(null)}>
                                        <span className="mood-orb"><Orb mood={mood.id} size="100%" glow={on} breathe={on} live={on || hov === mood.id} warm /></span>
                                        <span className="esc-stack" style={{ alignItems: "flex-start" }}>
                                            <span style={{ fontWeight: 500 }}>{mood.label}</span>
                                            <span className="esc-small">{mood.line}</span>
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <Reveal className="esc-glass esc-glow tryit-card" delay={0.1}>
                        <Orb mood={s.mood} size="min(320px, 70%)" live rings />
                        <div aria-live="polite" className="esc-stack" style={{ gap: 8, alignItems: "center", textAlign: "center" }}>
                            <span className="esc-over">{m ? `Feeling ${m.label.toLowerCase()}` : "Waiting for you"}</span>
                            <h3 className="esc-d esc-h3">{m ? PICKS[m.id].pick : "Choose a mood to see today's pick"}</h3>
                            <p className="esc-p">{m ? PICKS[m.id].why : "Lucille suggests one small thing that fits. No streak guilt, no pressure."}</p>
                        </div>
                    </Reveal>
                </div>
            </section>
        )
    }

    // ───────────────────────── how it works ─────────────────────────

    const STEPS = [
        { n: "01", title: "Check in", body: "Tell Escape how you're arriving: a mood, a word, or a few lines to Lucille.", mood: "low" as MoodId },
        { n: "02", title: "Understand", body: "Lucille listens without judging and connects today with what you've shared before.", mood: "focused" as MoodId },
        { n: "03", title: "Personalize", body: "Your day fills in: a breathwork, a soundscape, a movement session, a reflective prompt.", mood: "calm" as MoodId },
        { n: "04", title: "Adapt", body: "Over weeks, Escape learns your rhythms and your Energy Scan shows how you're growing.", mood: "energized" as MoodId },
    ]

    function HowItWorks() {
        const [step, setStep] = React.useState(0)
        const refs = React.useRef<(HTMLLIElement | null)[]>([])
        React.useEffect(() => {
            if (typeof IntersectionObserver === "undefined") return
            const io = new IntersectionObserver(
                (es) => es.forEach((e) => e.isIntersecting && setStep(Number((e.target as HTMLElement).dataset.i))),
                { rootMargin: "-40% 0px -40% 0px" }
            )
            refs.current.forEach((el) => el && io.observe(el))
            return () => io.disconnect()
        }, [])
        return (
            <section className="esc-sec">
                <Backdrop intensity={0.6} />
                <div className="esc-wrap how">
                    <div className="how-sticky">
                        <SectionHead eyebrow="How Lucille works" title="Shaped by emotional science and human care" lede="Not to treat. Not to judge. Just to gently personalize your self-care." />
                        <div className="how-orb" aria-hidden><Orb mood={STEPS[step].mood} size="100%" live /></div>
                    </div>
                    <ol className="how-steps">
                        {STEPS.map((st, i) => (
                            <li key={st.n} ref={(el) => { refs.current[i] = el }} data-i={i}>
                                <Reveal className={`esc-glass how-step ${i === step ? "on" : ""}`} delay={i * 0.05}>
                                    <span className="how-n esc-d">{st.n}</span>
                                    <div className="esc-stack" style={{ gap: 8 }}>
                                        <h3 className="esc-d esc-h3">{st.title}</h3>
                                        <p className="esc-p">{st.body}</p>
                                    </div>
                                </Reveal>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        )
    }

    // ───────────────────────── journey: coins → energy centers ─────────────────────────

    function Journey() {
        return (
            <section className="esc-sec">
                <Backdrop intensity={0.55} />
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Your journey" title="Every small act of care counts" lede="Escape coins reward showing up, never streak panic. Every 1,000 lifetime coins opens the next energy center." />
                    <div className="esc-grid g2" style={{ alignItems: "start" }}>
                        <Card className="esc-stack" style={{ gap: 18 }}>
                            <h3 className="esc-d esc-h3">Seven centers, one at a time</h3>
                            <ol className="ladder">
                                {CENTERS.map((c, i) => (
                                    <li key={c.name}>
                                        <span className="ladder-dot" style={{ background: c.color, boxShadow: `0 0 16px ${c.color}` }} />
                                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                                        <span className="esc-small" style={{ marginLeft: "auto" }}>{((i + 1) * 1000).toLocaleString("en-US")} coins</span>
                                    </li>
                                ))}
                            </ol>
                        </Card>
                        <Card className="esc-stack" style={{ gap: 18 }} delay={0.08}>
                            <h3 className="esc-d esc-h3">How coins are earned</h3>
                            <table className="coins">
                                <caption className="esc-sr">Coins per activity</caption>
                                <tbody>
                                    {COIN_RULES.map((r) => (
                                        <tr key={r.what}>
                                            <th scope="row">{r.what}<span className="esc-small">{r.cap}</span></th>
                                            <td><span className="coin">+{r.coins}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="esc-small">Daily limits keep it fair. Spend coins in the Marketplace on themes, avatar items and more.</p>
                        </Card>
                    </div>
                </div>
            </section>
        )
    }

    // ───────────────────────── privacy ─────────────────────────

    function Privacy() {
        const items = [
            { icon: "lock" as const, title: "Never sold", body: "We don't sell or rent your data, and there are no ads inside Escape." },
            { icon: "shield" as const, title: "Encrypted", body: "Everything travels over encrypted connections and is stored with access controls." },
            { icon: "trash" as const, title: "Yours to delete", body: "Delete your account and its data from Settings in the app, at any time." },
            { icon: "bell" as const, title: "Quiet by default", body: "A few calm reminders you choose. Nothing that guilts you into opening the app." },
        ]
        return (
            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead eyebrow="Private by design" title="Built for calm, privacy and presence" lede="A self-care app should feel safe. These are promises we design around, not footnotes." />
                    <div className="esc-grid g4">
                        {items.map((it, i) => (
                            <Card key={it.title} className="esc-stack" style={{ gap: 12 }} delay={i * 0.05}>
                                <span className="esc-icon"><Icon name={it.icon} /></span>
                                <h3 className="esc-d" style={{ fontSize: 22, margin: "8px 0 0" }}>{it.title}</h3>
                                <p className="esc-p" style={{ fontSize: 15 }}>{it.body}</p>
                            </Card>
                        ))}
                    </div>
                    <Reveal style={{ marginTop: 20 }}><a className="esc-link" href={ROUTES.privacy}>Read the privacy policy <Icon name="arrow" size={16} /></a></Reveal>
                </div>
            </section>
        )
    }

    // ───────────────────────── community teaser ─────────────────────────

    function CommunityTeaser() {
        return (
            <section className="esc-sec">
                <Backdrop intensity={0.55} />
                <div className="esc-wrap">
                    <SectionHead eyebrow="Grow together" title="Community & creators" lede="Co-create the future of mindful technology with people who care about the same things." />
                    <div className="esc-grid g2">
                        <Card className="esc-stack" style={{ gap: 14 }}>
                            <span className="esc-icon"><Icon name="gift" /></span>
                            <h3 className="esc-d esc-h3" style={{ marginTop: 8 }}>Coins & Marketplace</h3>
                            <p className="esc-p">Earn for real self-care, then spend it on themes, avatar items and new soundscapes. Partner rewards are on the way.</p>
                            <a className="esc-link" href={ROUTES.community}>How rewards work <Icon name="arrow" size={16} /></a>
                        </Card>
                        <Card className="esc-stack" style={{ gap: 14 }} delay={0.08}>
                            <span className="esc-icon"><Icon name="users" /></span>
                            <h3 className="esc-d esc-h3" style={{ marginTop: 8 }}>Creators & ambassadors</h3>
                            <p className="esc-p">Share your practice, inspire others honestly, and help shape what Escape becomes.</p>
                            <a className="esc-link" href={`${ROUTES.community}#creators`}>Apply to the program <Icon name="arrow" size={16} /></a>
                        </Card>
                    </div>
                </div>
            </section>
        )
    }

    const HOME_CSS = `
    .hero{position:relative;padding:clamp(120px,12cqi,168px) 0 clamp(64px,8cqi,112px)}
    .hero-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:clamp(32px,5cqi,80px);align-items:center}
    .hero-copy{display:flex;flex-direction:column;align-items:flex-start;gap:20px}
    .hero-tag{font-size:clamp(24px,2.6cqi,34px);margin:-4px 0 0}
    .hero-play{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:color-mix(in oklab,var(--esc-gold) 22%,transparent);color:var(--esc-gold)}
    .hero-trust{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:10px 22px;color:var(--esc-faint);font-size:14px}
    .hero-trust li{display:inline-flex;align-items:center;gap:8px}
    .hero-trust svg{color:var(--esc-accent)}
    .hero-visual{justify-self:center;width:min(100%,440px)}
    .hero-arch{position:relative;aspect-ratio:9/16;max-height:78vh;margin:0 auto;border-radius:999px 999px 44px 44px;overflow:hidden;background:#EDF1F7;box-shadow:0 40px 120px -40px color-mix(in oklab,var(--esc-accent) 70%,transparent),0 0 0 1px var(--esc-border)}
    .hero-arch video,.hero-arch img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:esc-drift-slow 26s var(--esc-ease-soft) infinite}
    .hero-glow{position:absolute;left:-10%;right:-10%;bottom:0;height:38%;background:linear-gradient(#fff,#39519F);opacity:.7;filter:blur(18px);-webkit-mask-image:linear-gradient(transparent,#000 28%);mask-image:linear-gradient(transparent,#000 28%)}
    .hero-word{position:absolute;left:12%;right:12%;bottom:9%}
    .founder{border-radius:32px;padding:clamp(28px,4cqi,48px);display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center}
    .founder blockquote{margin:0;font-size:clamp(28px,3.4cqi,44px);line-height:1.15;color:var(--esc-ink)}
    .bento{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(14px,1.6cqi,22px)}
    .b-lucille{grid-row:span 2}
    .b-scan{grid-column:span 2}
    .bubbles{display:flex;flex-direction:column;gap:8px;margin-top:4px}
    .bub{max-width:88%;padding:12px 16px;border-radius:18px;font-size:15px;line-height:1.45}
    .bub.me{align-self:flex-end;background:color-mix(in oklab,var(--esc-accent) 22%,transparent);border-bottom-right-radius:6px}
    .bub.lu{align-self:flex-start;background:var(--esc-glass1);border:1px solid var(--esc-border);border-bottom-left-radius:6px}
    .centers{display:flex;gap:12px;margin-top:auto;padding-top:6px}
    .centers span{width:18px;height:18px;border-radius:50%}
    @container (max-width:980px){.bento{grid-template-columns:repeat(2,minmax(0,1fr))}.b-lucille{grid-row:auto;grid-column:span 2}}
    @container (max-width:640px){.bento{grid-template-columns:minmax(0,1fr)}.b-lucille,.b-scan{grid-column:auto}}
    .tryit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,4cqi,64px);align-items:center}
    .moods{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .mood{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:12px;min-height:64px;padding:8px 14px 8px 8px;border-radius:20px;cursor:pointer;border:1px solid var(--esc-border);background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2));color:var(--esc-ink);transition:border-color .38s var(--esc-ease),transform .38s var(--esc-ease)}
    .mood:hover{transform:translateY(-2px)}
    .mood.on{border-color:var(--hue);box-shadow:0 0 0 1px var(--hue),0 12px 40px -18px var(--hue)}
    .mood:focus-visible{outline:3px solid var(--hue);outline-offset:3px}
    .mood-orb{width:48px;height:48px;flex:none}
    .tryit-card{border-radius:36px;padding:clamp(28px,4cqi,48px);display:flex;flex-direction:column;align-items:center;gap:20px;min-height:520px;justify-content:center}
    @container (max-width:900px){.tryit{grid-template-columns:minmax(0,1fr)}.tryit-card{min-height:0}}
    .how{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,5cqi,80px);align-items:start}
    .how-sticky{position:sticky;top:110px}
    .how-orb{width:min(340px,80%);aspect-ratio:1}
    .how-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:16px}
    .how-steps li{min-height:clamp(180px,22vh,260px);display:flex;align-items:center}
    .how-steps li>div{width:100%}
    .how-step{display:flex;gap:22px;padding:clamp(22px,3cqi,32px);border-radius:28px;transition:border-color .52s var(--esc-ease),box-shadow .52s var(--esc-ease)}
    .how-step.on{border-color:var(--esc-accent);box-shadow:0 18px 60px -28px var(--esc-accent)}
    .how-n{font-size:40px;color:var(--esc-accent);line-height:1;flex:none;width:58px}
    @container (max-width:900px){.how{grid-template-columns:minmax(0,1fr)}.how-sticky{position:static}.how-orb{display:none}.how-steps li{min-height:0}}
    .ladder{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
    .ladder li{display:flex;align-items:center;gap:14px;min-height:48px;border-bottom:1px solid var(--esc-line)}
    .ladder li:last-child{border-bottom:0}
    .ladder-dot{width:14px;height:14px;border-radius:50%;flex:none}
    .coins{width:100%;border-collapse:collapse}
    .coins th{text-align:left;font-weight:500;padding:10px 0;border-bottom:1px solid var(--esc-line);display:flex;flex-direction:column;gap:2px}
    .coins td{text-align:right;border-bottom:1px solid var(--esc-line);vertical-align:middle}
    .coins tr:last-child th,.coins tr:last-child td{border-bottom:0}
    .coin{display:inline-flex;align-items:center;min-height:30px;padding:0 12px;border-radius:999px;font-weight:600;font-size:14px;color:var(--esc-gold);background:color-mix(in oklab,var(--esc-gold) 14%,transparent)}
    @container (max-width:900px){.hero-in{grid-template-columns:minmax(0,1fr)}.hero-visual{order:-1;width:min(76%,340px)}.hero{padding-top:104px}}
    `

    HomePage.defaultProps = {
        splashVideo: MEDIA_BASE + "escape_splash.mp4",
        splashVideoWebm: MEDIA_BASE + "escape_splash.webm",
        splashPoster: MEDIA_BASE + "escape_splash_poster.webp",
        primaryLabel: "Start your journey",
        primaryHref: ROUTES.beta,
        demoHref: ROUTES.demo,
        founderQuote: "Not a way out — a way in.",
        founderName: "Jared Jackson",
        founderRole: "Co-founder & CTO, Escape",
        appStoreUrl: "",
        playUrl: "",
    }

    addPropertyControls(HomePage, {
        splashVideo: { type: ControlType.File, title: "Splash video", allowedFileTypes: ["mp4", "webm", "mov"] },
        splashVideoWebm: { type: ControlType.File, title: "Splash WebM", allowedFileTypes: ["webm"] },
        splashPoster: { type: ControlType.Image, title: "Splash poster" },
        primaryLabel: { type: ControlType.String, title: "Main button" },
        primaryHref: { type: ControlType.Link, title: "Main link" },
        demoHref: { type: ControlType.Link, title: "Demo link" },
        founderQuote: { type: ControlType.String, title: "Founder quote", displayTextArea: true },
        founderName: { type: ControlType.String, title: "Founder" },
        founderRole: { type: ControlType.String, title: "Founder role" },
        appStoreUrl: { type: ControlType.Link, title: "App Store URL" },
        playUrl: { type: ControlType.Link, title: "Google Play URL" },
    })
    return { default: HomePage }
})()

// ═══════════════ LucillePage ═══════════════
const __LucillePage = (() => {
    const { TasteCard } = __LucilleTaste
    // Escape — Lucille AI page body. Fill width, auto height.





    interface Props { primaryLabel: string; primaryHref: string }

    /**
     */
    function LucillePage(p: Props) {
        return (
            <Page>
                <style>{LU_CSS}</style>
                <Hero {...p} />
                <Capabilities />
                <WhyLucille />
                <Voice />
                <Safety />
                <section className="esc-sec">
                    <div className="esc-wrap">
                        <SectionHead center eyebrow="Questions" title="About Lucille" />
                        <Faq items={[
                            { q: "Is Lucille a therapist?", a: "No. Lucille is a self-care companion. She can help you reflect, slow down and build small habits, but she doesn't diagnose or treat anything and isn't a substitute for a professional. If you're in crisis, contact local emergency services (in the US, call or text 988)." },
                            { q: "Does she remember what I tell her?", a: "Lucille keeps the context that makes her helpful (your check-ins, goals and recent conversations) so you don't have to repeat yourself. You can delete your account and its data from Settings in the app at any time." },
                            { q: "Can I talk to her out loud?", a: "Yes. You can type or use voice. Her voice is warm with a slightly synthetic finish on purpose, so it's always clear you're talking with an AI." },
                            { q: "Is Lucille included in my plan?", a: <>Lucille is part of the Escape Journey Pass, along with everything else in the app. See <a className="esc-link" href={ROUTES.pricing}>pricing</a>.</> },
                        ]} />
                    </div>
                </section>
                <ClosingCta eyebrow="Coming to iOS & Android" title={<>The future of self-care is <span className="esc-gold">personal</span>.</>} lede="Explore calmer, more personal reflection with a companion that adapts to you." primary={{ label: p.primaryLabel, href: p.primaryHref }} secondary={{ label: "View pricing", href: ROUTES.pricing }} />
            </Page>
        )
    }

    function Hero(p: Props) {
        const s = useEscape()
        const reduce = useReducedMotion()
        const m = moodById(s.mood)
        return (
            <section className="esc-sec lu-hero">
                <Backdrop top />
                <div className="esc-wrap lu-hero-in">
                    <motion.div className="esc-stack esc-serene" style={{ gap: 20, alignItems: "flex-start" }}>
                        <Eyebrow>Your wellness companion</Eyebrow>
                        <h1 className="esc-d esc-h1">Meet Lucille</h1>
                        <p className="esc-d esc-gold" style={{ fontSize: "clamp(24px,2.6cqi,34px)", margin: "-4px 0 0" }}>A companion who listens first.</p>
                        <p className="esc-lede">Lucille is the heart of Escape: an AI companion that notices how you're arriving, remembers what matters to you, and suggests one small, kind next step. Talk or type, any time of day.</p>
                        <div className="esc-row" style={{ gap: 12 }}>
                            <Button href={p.primaryHref} arrow>{p.primaryLabel}</Button>
                            <Button href={ROUTES.pricing} variant="ghost">View pricing</Button>
                        </div>
                        <ul className="lu-pills">
                            {["Text & voice", "Remembers what matters", "Daily brief", "Plans with you"].map((t) => <li key={t} className="esc-chip"><Icon name="check" size={16} style={{ color: "var(--esc-accent)" }} />{t}</li>)}
                        </ul>
                    </motion.div>
                    <div className="lu-visual">
                        <Orb mood={s.mood} size="min(420px, 86%)" live rings hero label="Lucille, speaking" />
                        <div className="lu-chat"><TasteCard ctaHref={p.primaryHref} ctaLabel={p.primaryLabel} /></div>
                    </div>
                </div>
            </section>
        )
    }

    function Capabilities() {
        return (
            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Holistic intelligence" title="Everything Lucille can do with you" lede="AI, personalization and immersive audio, brought together around how you feel today." />
                    <div className="esc-grid g3">
                        <Feature icon="chat" title="Conversation" body="Empathy-first conversation by text or voice. She asks before she advises and never rushes you." />
                        <Feature icon="spark" title="Daily drop & brief" body="One gentle pick each morning, shaped by your mood, your goals and what's worked for you before." delay={0.05} />
                        <Feature icon="calendar" title="Plans with you" body="Build a self-care plan together. Lucille breaks it into small daily steps and checks in kindly." delay={0.1} />
                        <Feature icon="wave" title="Soundscapes" body="Ask for a sound to match the moment. Audio shifts with your mood, the time and the weather." delay={0.15} />
                        <Feature icon="chart" title="Mood insights" body="Clear, compassionate patterns over time, and an Energy Scan that shows where you're growing." delay={0.2} />
                        <Feature icon="compass" title="Innerverse navigator" body="In the 3D Innerverse, Lucille becomes your guide through worlds shaped by your inner state." soon delay={0.25} />
                    </div>
                </div>
            </section>
        )
    }

    function WhyLucille() {
        const rows = [
            ["Static scripts and the same playlist for everyone", "Responds to how you feel right now, and learns your rhythms"],
            ["Feeds engineered for attention and comparison", "No feed to scroll. Just you, at your pace"],
            ["Chatbots built for productivity, not presence", "Built to listen first, with care and gentle boundaries"],
        ]
        return (
            <section className="esc-sec">
                <Backdrop intensity={0.5} />
                <div className="esc-wrap">
                    <SectionHead eyebrow="Why Lucille" title="Self-care shouldn't feel generic" lede="Between daily stress, quiet burnout and endless feeds, you deserve technology that understands you." />
                    <Reveal className="esc-glass lu-compare">
                        <div className="lu-compare-head"><span className="esc-over">Most wellness apps</span><span className="esc-over" style={{ color: "var(--esc-accent)" }}>Lucille</span></div>
                        {rows.map(([a, b]) => (
                            <div key={a} className="lu-compare-row">
                                <span className="esc-p"><Icon name="close" size={18} style={{ color: "var(--esc-faint)" }} />{a}</span>
                                <span style={{ color: "var(--esc-ink)" }}><Icon name="check" size={18} style={{ color: "var(--esc-accent)" }} />{b}</span>
                            </div>
                        ))}
                    </Reveal>
                </div>
            </section>
        )
    }

    function Voice() {
        const reduce = useReducedMotion()
        return (
            <section className="esc-sec">
                <div className="esc-wrap lu-voice">
                    <div>
                        <SectionHead eyebrow="Her voice" title={<>Warm, and <span className="esc-gold">honestly</span> an AI</>} lede="Lucille's voice has a soft, slightly synthetic finish by design. It's comforting to listen to, and you always know who you're talking with." />
                        <Button href={ROUTES.demo} variant="ghost" icon={<Icon name="play" size={14} />}>Hear her in the demo</Button>
                    </div>
                    <Reveal className="esc-glass lu-wave" delay={0.1}>
                        <div className="bars" aria-hidden>
                            {Array.from({ length: 36 }).map((_, i) => (
                                <span key={i} style={{ animationDelay: `${(i % 9) * 0.11}s`, height: `${30 + 60 * Math.abs(Math.sin(i * 0.7))}%`, animationPlayState: reduce ? "paused" : "running" }} />
                            ))}
                        </div>
                        <div className="esc-row" style={{ gap: 12 }}>
                            <span className="esc-icon"><Icon name="mic" /></span>
                            <span className="esc-stack"><strong style={{ fontWeight: 500 }}>Voice conversation</strong><span className="esc-small">Hands-free, any time</span></span>
                        </div>
                    </Reveal>
                </div>
            </section>
        )
    }

    function Safety() {
        return (
            <section className="esc-sec" style={{ paddingTop: 0 }}>
                <div className="esc-wrap">
                    <Card className="lu-safety">
                        <span className="esc-icon"><Icon name="heart" /></span>
                        <div className="esc-stack" style={{ gap: 8 }}>
                            <h3 className="esc-d esc-h3">A companion, not a clinician</h3>
                            <p className="esc-p">Lucille is designed for everyday self-care and reflection. She doesn't diagnose or treat, and she'll point you to real people when it matters. If you're in crisis in the US, call or text <strong style={{ color: "var(--esc-ink)" }}>988</strong>; elsewhere, contact your local emergency number.</p>
                        </div>
                    </Card>
                </div>
            </section>
        )
    }

    const LU_CSS = `
    .esc-sec.lu-hero{padding-top:clamp(120px,12cqi,168px)}
    .lu-hero-in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(32px,5cqi,72px);align-items:center}
    .lu-pills{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:8px}
    .lu-visual{position:relative;display:flex;flex-direction:column;align-items:center;gap:clamp(20px,3cqi,32px)}
    .lu-visual>[role=img]{width:min(300px,62%)!important}
    .lu-chat{position:relative;z-index:1;width:min(440px,100%)}
    .bub{max-width:90%;padding:11px 15px;border-radius:18px;font-size:15px;line-height:1.45}
    .bub.me{align-self:flex-end;background:color-mix(in oklab,var(--esc-accent) 24%,transparent);border-bottom-right-radius:6px}
    .bub.lu{align-self:flex-start;background:var(--esc-glass1);border:1px solid var(--esc-border);border-bottom-left-radius:6px}
    .lu-compare{border-radius:28px;padding:clamp(20px,3cqi,36px)}
    .lu-compare-head,.lu-compare-row{display:grid;grid-template-columns:1fr 1fr;gap:24px}
    .lu-compare-head{padding-bottom:14px;border-bottom:1px solid var(--esc-line)}
    .lu-compare-row{padding:18px 0;border-bottom:1px solid var(--esc-line)}
    .lu-compare-row:last-child{border-bottom:0}
    .lu-compare-row span{display:flex;gap:10px;align-items:flex-start;line-height:1.5}
    .lu-compare-row svg{margin-top:2px}
    .lu-voice{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,4cqi,64px);align-items:center}
    .lu-wave{border-radius:32px;padding:clamp(24px,3cqi,36px);display:flex;flex-direction:column;gap:22px}
    .bars{height:140px;display:flex;align-items:center;gap:5px}
    .bars span{flex:1;border-radius:99px;background:linear-gradient(var(--esc-accent),var(--esc-glowB));animation:lu-bar 1.4s var(--esc-ease) infinite alternate;transform-origin:center}
    @keyframes lu-bar{from{transform:scaleY(.35)}to{transform:scaleY(1)}}
    .lu-safety{display:flex;gap:20px;align-items:flex-start;border-radius:28px}
    @container (max-width:900px){.lu-hero-in,.lu-voice{grid-template-columns:minmax(0,1fr)}.lu-visual>[role=img]{width:min(260px,64%)!important}.lu-chat{width:100%}.lu-compare-head,.lu-compare-row{grid-template-columns:1fr}.lu-compare-head span:first-child{display:none}.lu-compare-row span:first-child{font-size:14px}}
    `

    LucillePage.defaultProps = { primaryLabel: "Get early access", primaryHref: ROUTES.beta }
    addPropertyControls(LucillePage, {
        primaryLabel: { type: ControlType.String, title: "Main button" },
        primaryHref: { type: ControlType.Link, title: "Main link" },
    })
    return { default: LucillePage }
})()

// ═══════════════ CommunityPage ═══════════════
const __CommunityPage = (() => {
    // Escape — Community & rewards page body. Fill width, auto height.
    // Coin values come from the live API rules (COIN_RULES in EscapeKit). Partner rewards and the
    // mindful feed are marked "coming soon" until they ship.





    interface Props { applyHref: string; ambassadorHref: string; primaryHref: string }

    /**
     */
    function CommunityPage(p: Props) {
        return (
            <Page>
                <style>{CO_CSS}</style>
                <Hero primaryHref={p.primaryHref} />
                <Earn />
                <Journey />
                <Marketplace />
                <Creators applyHref={p.applyHref} ambassadorHref={p.ambassadorHref} />
                <Values />
                <section className="esc-sec">
                    <div className="esc-wrap">
                        <SectionHead center eyebrow="Questions" title="Coins & community" />
                        <Faq items={[
                            { q: "Do coins cost money?", a: "No. Coins are earned only by taking care of yourself in the app. They can't be bought, and they have no cash value." },
                            { q: "Why are there daily limits?", a: "So coins reward real self-care rather than tapping. Each activity has a small daily cap, shown above." },
                            { q: "What happens at 1,000 coins?", a: "Your Energy Scan opens with the first center, Grounding. Every 1,000 lifetime coins after that opens the next of the seven centers. Spending coins never takes a level away." },
                            { q: "Who can join the creators program?", a: "Anyone who shares mindfulness, movement or wellbeing content honestly and kindly. Apply below and we'll be in touch." },
                        ]} />
                    </div>
                </section>
                <ClosingCta eyebrow="Escape community & creators" title={<>Ready to start your <span className="esc-gold">rewarding</span> journey?</>} lede="Join early, earn from day one, and help shape what Escape becomes." primary={{ label: "Get early access", href: p.primaryHref }} secondary={{ label: "Support on Kickstarter", href: LINKS.kickstarter }} />
            </Page>
        )
    }

    function Hero({ primaryHref }: { primaryHref: string }) {
        const s = useEscape()
        const reduce = useReducedMotion()
        const toasts = [
            { t: "Box breathing complete", c: 10, x: "0%", y: "10%" },
            { t: "Journal entry", c: 15, x: "58%", y: "2%" },
            { t: "First session today", c: 15, x: "50%", y: "78%" },
            { t: "Mood check-in", c: 5, x: "2%", y: "66%" },
        ]
        return (
            <section className="esc-sec co-hero">
                <Backdrop top />
                <div className="esc-wrap co-hero-in">
                    <motion.div className="esc-stack esc-serene" style={{ gap: 20, alignItems: "flex-start" }}>
                        <Eyebrow>Escape community</Eyebrow>
                        <h1 className="esc-d esc-h1">Get rewarded for showing up <span className="esc-gold">for yourself</span></h1>
                        <p className="esc-lede">Every check-in, session and journal entry earns Escape coins. Coins open your energy centers, unlock the Marketplace, and connect you with people building calmer habits too.</p>
                        <div className="esc-row" style={{ gap: 12 }}>
                            <Button href={primaryHref} arrow>Start earning coins</Button>
                            <Button href="#creators" variant="ghost">Creators program</Button>
                        </div>
                    </motion.div>
                    <div className="co-visual" aria-hidden>
                        <Orb mood={s.mood} size="56%" live rings hero style={{ position: "absolute", left: "22%", top: "22%" }} />
                        {toasts.map((t, i) => (
                            <motion.div key={t.t} className="esc-glass co-toast" style={{ left: t.x, top: t.y }}
                                initial={reduce ? false : { opacity: 0, y: 12 }} animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, -6, 0] }}
                                transition={reduce ? {} : { opacity: { duration: 0.6, delay: 0.5 + i * 0.35 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 } }}>
                                <span className="esc-icon" style={{ width: 36, height: 36, borderRadius: 11 }}><Icon name="coin" size={18} /></span>
                                <span className="esc-stack"><span style={{ fontSize: 14, fontWeight: 500 }}>{t.t}</span><span className="co-plus">+{t.c} coins</span></span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    function Earn() {
        return (
            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="How you earn" title="Earn coins, unlock rewards" lede="Every mindful moment counts. These are the real values in the app." />
                    <div className="esc-grid g4">
                        {COIN_RULES.map((r, i) => (
                            <Card key={r.what} className="esc-stack" style={{ gap: 10 }} delay={i * 0.04}>
                                <span className="co-big esc-d">+{r.coins}</span>
                                <strong style={{ fontWeight: 500 }}>{r.what}</strong>
                                <span className="esc-small">{r.cap}</span>
                            </Card>
                        ))}
                        <Card className="esc-stack co-earn-note" style={{ gap: 10 }} delay={0.3}>
                            <span className="esc-icon"><Icon name="wave" /></span>
                            <strong style={{ fontWeight: 500 }}>Listening counts too</strong>
                            <span className="esc-small">+1 coin for every 5 minutes in Soundscapes.</span>
                        </Card>
                    </div>
                </div>
            </section>
        )
    }

    function Journey() {
        return (
            <section className="esc-sec">
                <Backdrop intensity={0.6} />
                <div className="esc-wrap">
                    <SectionHead eyebrow="Identity & progression" title="Earn. Express. Evolve." lede="Every 1,000 lifetime coins opens the next energy center, and your Energy Scan starts reading it each day." />
                    <Reveal className="esc-glass co-track">
                        <div className="co-line" aria-hidden />
                        <ol>
                            {CENTERS.map((c, i) => (
                                <li key={c.name}>
                                    <span className="co-node" style={{ background: c.color, boxShadow: `0 0 0 6px color-mix(in oklab, ${c.color} 20%, transparent), 0 0 26px ${c.color}` }} />
                                    <span style={{ fontWeight: 500 }}>{c.name}</span>
                                    <span className="esc-small">Level {i + 1} · {((i + 1) * 1000).toLocaleString("en-US")}</span>
                                </li>
                            ))}
                        </ol>
                    </Reveal>
                </div>
            </section>
        )
    }

    function Marketplace() {
        return (
            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead eyebrow="Marketplace" title="Spend what you've earned" lede="Redeem coins for things that make Escape feel like yours." />
                    <div className="esc-grid g4">
                        <Feature icon="star" title="Themes" body="New looks for your app and your mood orb." />
                        <Feature icon="users" title="Avatar items" body="Outfits, auras and details for your avatar." delay={0.05} />
                        <Feature icon="wave" title="Soundscapes" body="Unlock new sound worlds and layers." delay={0.1} />
                        <Feature icon="gift" title="Partner rewards" body="Real-world perks from wellbeing brands we trust." soon delay={0.15} />
                    </div>
                </div>
            </section>
        )
    }

    function Creators({ applyHref, ambassadorHref }: { applyHref: string; ambassadorHref: string }) {
        return (
            <section className="esc-sec" id="creators">
                <Backdrop intensity={0.5} />
                <div className="esc-wrap">
                    <SectionHead eyebrow="Verified creator studio" title="Mindful creators" lede="A creator community sharing genuine practices: breathwork, yoga, movement, reflection. Real people, real routines." />
                    <div className="esc-grid g2">
                        <Card className="esc-stack" style={{ gap: 14 }}>
                            <span className="esc-chip" style={{ alignSelf: "flex-start" }}>Creator studio</span>
                            <h3 className="esc-d esc-h3">Creators</h3>
                            <p className="esc-p">Make mindful content with Escape, host challenges in your community, and get early access to new features and Lucille builds.</p>
                            <ul className="co-list">
                                <li><Icon name="check" size={18} />Founding creator badge</li>
                                <li><Icon name="check" size={18} />Early feature access</li>
                                <li><Icon name="check" size={18} />A direct line to the Escape team</li>
                            </ul>
                            <div style={{ marginTop: "auto" }}><Button href={ambassadorHref} arrow small newTab>Join the creator studio</Button></div>
                        </Card>
                        <Card className="esc-stack" style={{ gap: 14 }} delay={0.08}>
                            <span className="esc-chip" style={{ alignSelf: "flex-start" }}>Influencer program</span>
                            <h3 className="esc-d esc-h3">Influencers</h3>
                            <p className="esc-p">Share your mindfulness journey and inspire people authentically. We'll support your content and feature it in Escape.</p>
                            <ul className="co-list">
                                <li><Icon name="check" size={18} />Breathwork, yoga & movement shorts</li>
                                <li><Icon name="check" size={18} />Featured in the app</li>
                                <li><Icon name="check" size={18} />Partnership opportunities</li>
                            </ul>
                            <div style={{ marginTop: "auto" }}><Button href={applyHref} arrow small newTab>Apply to the influencer program</Button></div>
                        </Card>
                    </div>
                </div>
            </section>
        )
    }

    function Values() {
        return (
            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Mindful feed · coming soon" title="A community that feels good to be in" lede="What we're building toward, and holding ourselves to." />
                    <div className="esc-grid g3">
                        <Feature icon="heart" title="Kindness first" body="Encouragement over critique. Clear community guidelines and fast moderation." />
                        <Feature icon="leaf" title="Calm by design" body="No infinite pressure to keep scrolling. Short, useful, then back to your day." delay={0.05} />
                        <Feature icon="shield" title="You're in control" body="Choose what you share and who sees it. Private by default." delay={0.1} />
                    </div>
                </div>
            </section>
        )
    }

    const CO_CSS = `
    .esc-sec.co-hero{padding-top:clamp(120px,12cqi,168px)}
    .co-hero-in{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:clamp(32px,5cqi,72px);align-items:center}
    .co-visual{position:relative;aspect-ratio:1;width:100%;max-width:520px;justify-self:center}
    .co-toast{position:absolute;display:flex;gap:12px;align-items:center;padding:12px 16px 12px 12px;border-radius:18px;white-space:nowrap;max-width:50%}
    .co-plus{font-size:13px;color:var(--esc-gold);font-weight:600}
    .co-big{font-size:46px;line-height:1;color:var(--esc-gold)}
    .co-earn-note{background:linear-gradient(160deg,color-mix(in oklab,var(--esc-accent) 14%,transparent),var(--esc-glass2))}
    .co-track{position:relative;border-radius:32px;padding:clamp(28px,4cqi,48px) clamp(16px,3cqi,40px)}
    .co-track ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;position:relative}
    .co-track li{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
    .co-node{width:22px;height:22px;border-radius:50%;margin-bottom:6px}
    .co-line{position:absolute;left:calc(clamp(16px,3cqi,40px) + 7%);right:calc(clamp(16px,3cqi,40px) + 7%);top:calc(clamp(28px,4cqi,48px) + 11px);height:2px;background:linear-gradient(90deg,#E5484D,#EF7702,#F5C542,#39D9C1,#4CF6F6,#8E7CD9,#B9A3F0);opacity:.6}
    .co-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;color:var(--esc-muted)}
    .co-list li{display:flex;gap:10px;align-items:center}
    .co-list svg{color:var(--esc-accent)}
    @container (max-width:900px){.co-hero-in{grid-template-columns:minmax(0,1fr)}.co-track ol{grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.co-track li{flex-direction:row;text-align:left;flex-wrap:wrap;gap:4px 10px}.co-node{margin:0}.co-line{display:none}.co-toast{transform:scale(.88);transform-origin:left top;max-width:none}.co-visual .co-toast:nth-child(3),.co-visual .co-toast:nth-child(4){display:none}}
    `

    CommunityPage.defaultProps = { applyHref: LINKS.influencers, ambassadorHref: LINKS.creators, primaryHref: ROUTES.beta }
    addPropertyControls(CommunityPage, {
        applyHref: { type: ControlType.Link, title: "Influencer program" },
        ambassadorHref: { type: ControlType.Link, title: "Creator studio" },
        primaryHref: { type: ControlType.Link, title: "Main link" },
    })
    return { default: CommunityPage }
})()

// ═══════════════ PricingPage ═══════════════
const __PricingPage = (() => {
    // Escape — Pricing page body. Fill width, auto height.
    // Prices are props so they can match App Store Connect / Google Play exactly.




    interface Props {
        monthlyPrice: string
        yearlyPrice: string
        yearlyPerMonth: string
        yearlySave: string
        trialDays: number
        ctaLabel: string
        ctaHref: string
    }

    const INCLUDED = [
        "Lucille AI companion, text & voice",
        "Mind, Reset & Body sessions",
        "Yoga, pilates & tai chi",
        "Adaptive Soundscapes",
        "Mood check-ins & insights",
        "Daily plans & journal",
        "Energy Scan & Escape coins",
        "New sessions as they're released",
    ]

    /**
     */
    function PricingPage(p: Props) {
        const reduce = useReducedMotion()
        const [plan, setPlan] = React.useState<"monthly" | "yearly">("yearly")
        const plans = [
            { id: "monthly" as const, name: "Journey Pass · Monthly", price: p.monthlyPrice, per: "/ month", note: "Flexible month-to-month", quote: "Less than a daily coffee." },
            { id: "yearly" as const, name: "Journey Pass · Yearly", price: p.yearlyPrice, per: "/ year", note: `Just ${p.yearlyPerMonth} / month, billed yearly`, quote: "Invest once. Breathe all year.", badge: p.yearlySave },
        ]
        return (
            <Page>
                <style>{PR_CSS}</style>
                <section className="esc-sec pr-hero">
                    <Backdrop top />
                    <div className="esc-wrap">
                        <motion.div className="esc-stack esc-center esc-serene" style={{ gap: 18, alignItems: "center", maxWidth: 780, marginBottom: 48 }}>
                            <Eyebrow>Free {p.trialDays}-day trial</Eyebrow>
                            <h1 className="esc-d esc-h1">One pass. <span className="esc-gold">All of Escape.</span></h1>
                            <p className="esc-lede" style={{ margin: "0 auto" }}>The Escape Journey Pass unlocks everything: Lucille, every session, Soundscapes, plans, insights and your Energy Scan. Try it free, cancel any time.</p>
                            <div className="pr-toggle" role="radiogroup" aria-label="Billing period">
                                {plans.map((pl) => (
                                    <button key={pl.id} type="button" role="radio" aria-checked={plan === pl.id} className={plan === pl.id ? "on" : ""} onClick={() => setPlan(pl.id)}>
                                        {pl.id === "monthly" ? "Monthly" : "Yearly"}{pl.badge && <span className="pr-save">{pl.badge}</span>}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                        <div className="pr-cards">
                            {plans.map((pl, i) => {
                                const on = plan === pl.id
                                return (
                                    <Reveal key={pl.id} delay={i * 0.08} className={`esc-glass esc-glow pr-card ${on ? "on" : ""}`}>
                                        <div className="esc-row" style={{ justifyContent: "space-between", gap: 10 }}>
                                            <span className="esc-over">{pl.name}</span>
                                            {pl.badge ? <span className="pr-best">Best value</span> : <span className="esc-chip" style={{ minHeight: 28 }}>Most flexible</span>}
                                        </div>
                                        <div className="pr-price"><span className="esc-d">{pl.price}</span><span className="esc-p">{pl.per}</span></div>
                                        <p className="esc-p" style={{ marginTop: -6 }}>{pl.note}</p>
                                        <p className="esc-d esc-gold" style={{ fontSize: 22, margin: 0 }}>“{pl.quote}”</p>
                                        <Button href={p.ctaHref} variant={on ? "primary" : "ghost"} onClick={() => setPlan(pl.id)}>{p.ctaLabel}</Button>
                                        <span className="esc-small" style={{ textAlign: "center" }}>{p.trialDays} days free, then {pl.price}{pl.per}. Cancel anytime.</span>
                                        <hr className="esc-hr" />
                                        <span style={{ fontWeight: 500 }}>Everything included:</span>
                                        <ul className="pr-list">{INCLUDED.map((x) => <li key={x}><Icon name="check" size={18} />{x}</li>)}</ul>
                                    </Reveal>
                                )
                            })}
                        </div>
                        <p className="esc-small esc-center" style={{ textAlign: "center", marginTop: 22, maxWidth: 680 }}>Prices in USD. Subscriptions are billed through the App Store or Google Play and renew automatically until cancelled in your store account settings. Local prices may vary.</p>
                    </div>
                </section>

                <section className="esc-sec">
                    <div className="esc-wrap">
                        <SectionHead center eyebrow="Full ecosystem access" title="Everything you need for your everyday escape" />
                        <div className="esc-grid g4">
                            <Feature icon="chat" title="Lucille" body="A companion that adapts to how you feel, by text or voice." />
                            <Feature icon="move" title="Sessions" body="Breathing, resets, yoga, pilates and tai chi, sized to your energy." delay={0.05} />
                            <Feature icon="wave" title="Soundscapes" body="Living audio that follows your mood, the time and the weather." delay={0.1} />
                            <Feature icon="spark" title="Energy Scan" body="Seven centers, opening as your coins grow, read fresh each day." delay={0.15} />
                        </div>
                    </div>
                </section>

                <section className="esc-sec">
                    <div className="esc-wrap">
                        <SectionHead center eyebrow="Questions & answers" title="Frequently asked questions" />
                        <Faq items={[
                            { q: `What happens after my ${p.trialDays}-day free trial?`, a: `You get full access during the trial. If you don't cancel at least 24 hours before it ends, your chosen plan starts and is charged through the App Store or Google Play.` },
                            { q: "Can I cancel any time?", a: "Yes. Manage or cancel from your App Store or Google Play subscription settings. You keep access until the end of the period you've paid for." },
                            { q: "Can I switch between monthly and yearly?", a: "Yes, from your store subscription settings. The change applies at your next renewal." },
                            { q: "Is my data secure?", a: <>Your data travels encrypted, is never sold, and you can delete your account from Settings at any time. Read the <a className="esc-link" href={ROUTES.privacy}>privacy policy</a>.</> },
                        ]} />
                    </div>
                </section>
                <ClosingCta eyebrow="A self-care revolution within" title={<>Ready to transform your <span className="esc-gold">self-care</span>?</>} lede="Start free, take your time, and keep only what helps." primary={{ label: p.ctaLabel, href: p.ctaHref }} secondary={{ label: "Explore Lucille", href: ROUTES.lucille }} />
            </Page>
        )
    }

    const PR_CSS = `
    .esc-sec.pr-hero{padding-top:clamp(120px,12cqi,168px)}
    .pr-toggle{display:inline-flex;padding:5px;border-radius:999px;border:1px solid var(--esc-border);background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2));margin-top:8px}
    .pr-toggle button{all:unset;cursor:pointer;min-height:44px;padding:0 20px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;font-weight:500;color:var(--esc-muted);transition:background .38s var(--esc-ease),color .38s}
    .pr-toggle button.on{background:var(--esc-accent);color:var(--esc-onAccent)}
    .pr-toggle button:focus-visible{outline:3px solid var(--esc-accent);outline-offset:2px}
    .pr-save{font-size:12px;padding:2px 8px;border-radius:99px;background:color-mix(in oklab,var(--esc-gold) 22%,transparent);color:var(--esc-gold)}
    .pr-toggle button.on .pr-save{background:rgba(11,18,48,.18);color:inherit}
    .pr-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;max-width:960px;margin:0 auto}
    .pr-card{border-radius:32px;padding:clamp(24px,3cqi,36px);display:flex;flex-direction:column;gap:16px;opacity:.86}
    .pr-card.on{opacity:1;transform:translateY(-4px);border-color:var(--esc-accent);box-shadow:0 30px 80px -36px var(--esc-accent)}
    .pr-card .esc-btn{width:100%}
    .pr-best{font-size:12px;font-weight:600;padding:5px 12px;border-radius:99px;color:var(--esc-onAccent);background:var(--esc-gold)}
    .pr-price{display:flex;align-items:baseline;gap:8px}
    .pr-price .esc-d{font-size:clamp(48px,5cqi,64px);line-height:1}
    .pr-list{list-style:none;margin:0;padding:0;display:grid;gap:10px;color:var(--esc-muted)}
    .pr-list li{display:flex;gap:10px;align-items:flex-start}
    .pr-list svg{color:var(--esc-accent);margin-top:2px}
    @container (max-width:760px){.pr-cards{grid-template-columns:minmax(0,1fr)}}
    `

    PricingPage.defaultProps = {
        monthlyPrice: "$9.99",
        yearlyPrice: "$47.95",
        yearlyPerMonth: "$4.00",
        yearlySave: "Save 60%",
        trialDays: 7,
        ctaLabel: "Start your free trial",
        ctaHref: ROUTES.beta,
    }
    addPropertyControls(PricingPage, {
        monthlyPrice: { type: ControlType.String, title: "Monthly price" },
        yearlyPrice: { type: ControlType.String, title: "Yearly price" },
        yearlyPerMonth: { type: ControlType.String, title: "Yearly / month" },
        yearlySave: { type: ControlType.String, title: "Yearly badge" },
        trialDays: { type: ControlType.Number, title: "Trial days", min: 0, max: 30, step: 1 },
        ctaLabel: { type: ControlType.String, title: "Button" },
        ctaHref: { type: ControlType.Link, title: "Button link" },
    })
    return { default: PricingPage }
})()

// ═══════════════ InnerversePage ═══════════════
const __InnerversePage = (() => {
    // Escape — Innerverse (coming soon) page body. Fill width, auto height.
    // The world "postcards" are pure CSS gradients so there are no stock images to license; swap
    // in real renders later with the image props.




    const src = (v: any) => (typeof v === "string" ? v : v?.src) || ""

    interface Props { waitlistHref: string; santoriniImage: any; costaRicaImage: any }

    const REALMS = [
        { name: "Enchanted Forest", body: "Sun-dappled ancient redwoods and whispering foliage for grounding.", g: "linear-gradient(160deg,#1E5B3A,#0C2A1E 60%,#08160F)", glow: "#7ED6A1" },
        { name: "Ocean Depths", body: "Weightless bioluminescent currents that slow your breathing.", g: "linear-gradient(170deg,#0D4B78,#06213F 60%,#030E1F)", glow: "#4CF6F6" },
        { name: "Cosmic Realm", body: "Float among starlight and soft nebulae for expansive calm.", g: "radial-gradient(120% 90% at 70% 20%,#5B3AA8,#1A1648 50%,#05081A)", glow: "#B9A3F0" },
        { name: "Sacred Temple", body: "Mist-wrapped mountain courtyards and resonant singing bowls.", g: "linear-gradient(170deg,#8A5A2B,#3B2414 60%,#1A0F08)", glow: "#F5C26B" },
        { name: "Crystal Cavern", body: "Acoustic mineral chambers that echo harmonic frequencies.", g: "linear-gradient(160deg,#3D3190,#1F37A8 45%,#0B1230)", glow: "#9CC2FF" },
        { name: "Mountain Summit", body: "Crisp alpine dawn above a sea of clouds to awaken focus.", g: "linear-gradient(180deg,#F0A55A,#C85A7A 35%,#2A2366 75%,#0B1230)", glow: "#FFE2BF" },
    ]

    /**
     */
    function InnerversePage(p: Props) {
        const reduce = useReducedMotion()
        return (
            <Page>
                <style>{IV_CSS}</style>
                <section className="esc-sec iv-hero">
                    <div aria-hidden className="iv-stars" />
                    <Backdrop top />
                    <div className="esc-wrap esc-stack esc-center esc-serene" style={{ alignItems: "center", gap: 20, textAlign: "center" }}>
                        <motion.div>
                            <Orb mood="calm" size="min(300px, 60vw)" live rings hero label="The Innerverse" />
                        </motion.div>
                        <span className="esc-soon">Coming soon</span>
                        <h1 className="esc-d esc-h1">The Escape <span className="esc-gold">Innerverse</span></h1>
                        <p className="esc-lede" style={{ margin: "0 auto" }}>Where mindfulness meets movement: an immersive 3D sanctuary that reflects how you feel, with worlds to explore, an avatar that grows with you, and Lucille as your guide.</p>
                        <div className="esc-row" style={{ gap: 12, justifyContent: "center" }}>
                            <Button href={p.waitlistHref} arrow>Join the waitlist</Button>
                            <Button href="#worlds" variant="ghost">Explore the worlds</Button>
                        </div>
                    </div>
                </section>

                <section className="esc-sec" id="worlds">
                    <div className="esc-wrap">
                        <SectionHead eyebrow="Featured destinations · coming soon" title="Real-world sanctuaries, reimagined in 3D" lede="Spatial, acoustic recreations of places that calm people all over the world." />
                        <div className="esc-grid g2">
                            <Postcard title="Coastal Horizon" place="Santorini, Greece" body="Whitewashed cliffs and blue domes over the Aegean, with the sea breathing below." img={src(p.santoriniImage)} g="linear-gradient(180deg,#9CC2FF 0%,#E6EAF4 38%,#3A5BD9 62%,#0E2C6E 100%)" />
                            <Postcard title="Misty Rainforest" place="Cloudbridge, Costa Rica" body="Lush canopy and distant waterfalls. Unwind among the sounds of the cloud forest." img={src(p.costaRicaImage)} g="linear-gradient(180deg,#C9D1EE 0%,#5FA37A 34%,#1E5B3A 70%,#08160F 100%)" delay={0.08} />
                        </div>
                    </div>
                </section>

                <section className="esc-sec">
                    <Backdrop intensity={0.55} />
                    <div className="esc-wrap">
                        <SectionHead center eyebrow="Six immersive realms · coming soon" title="Journey through sacred spaces" lede="Each world supports a different part of your wellbeing." />
                        <div className="esc-grid g3">
                            {REALMS.map((r, i) => (
                                <Reveal key={r.name} delay={i * 0.05} className="esc-glass esc-lift iv-realm">
                                    <div className="iv-art" style={{ background: r.g }} aria-hidden>
                                        <span style={{ background: `radial-gradient(closest-side, ${r.glow}, transparent)` }} />
                                    </div>
                                    <div className="esc-stack" style={{ gap: 8, padding: "20px 22px 24px" }}>
                                        <div className="esc-row" style={{ justifyContent: "space-between", gap: 8 }}>
                                            <h3 className="esc-d" style={{ fontSize: 22, margin: 0 }}>{r.name}</h3>
                                            <span className="esc-soon">Premium</span>
                                        </div>
                                        <p className="esc-p" style={{ fontSize: 15 }}>{r.body}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="esc-sec">
                    <div className="esc-wrap iv-avatar">
                        <div>
                            <SectionHead eyebrow="Your digital self · coming soon" title="An avatar that grows with you" lede="Step into the Innerverse as a reflection of you, and watch your avatar evolve as you complete daily rituals." />
                            <div className="esc-stack" style={{ gap: 14 }}>
                                {[["Lifelike", "Expressive, calm presence that feels like a mirror, not a cartoon."], ["Yours", "Sanctuary attire, luminous auras and details from the Marketplace."], ["Growing", "New looks as your energy centers open."]].map(([t, b]) => (
                                    <div key={t} className="esc-row" style={{ gap: 14, alignItems: "flex-start", flexWrap: "nowrap" }}>
                                        <span className="esc-icon" style={{ width: 40, height: 40 }}><Icon name="check" size={18} /></span>
                                        <span className="esc-stack"><strong style={{ fontWeight: 500 }}>{t}</strong><span className="esc-p" style={{ fontSize: 15 }}>{b}</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Reveal className="esc-glass iv-preview" delay={0.1}>
                            <div className="iv-aura" aria-hidden><span /><span /><span /></div>
                            <div className="iv-avatar-orb"><Orb mood="calm" size="100%" live glow label="Avatar preview" /></div>
                            <span className="esc-small" style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center" }}>Avatar preview · coming soon</span>
                            <span className="esc-chip" style={{ position: "absolute", left: 18, top: 18 }}><span className="esc-dot" aria-hidden />Preview</span>
                        </Reveal>
                    </div>
                </section>

                <section className="esc-sec">
                    <div className="esc-wrap">
                        <SectionHead center eyebrow="Guided discovery · coming soon" title="Interactive journeys, guided by empathy" lede="Every path inside the Innerverse adapts to how you feel." />
                        <div className="esc-grid g2">
                            <Feature icon="compass" title="Quests" body="Gentle, private quests designed to open your next level: a breath at the summit, a reflection by the sea." soon />
                            <Feature icon="spark" title="Lucille, the navigator" body="Your companion becomes your guide, suggesting where to go based on how you're arriving." soon delay={0.08} />
                        </div>
                    </div>
                </section>

                <ClosingCta eyebrow="Coming soon · early waitlist" title={<>Join the <span className="esc-gold">wellness revolution</span></>} lede="Be first into the Innerverse when it opens." primary={{ label: "Join the waitlist", href: p.waitlistHref }} />
            </Page>
        )
    }

    function Postcard(p: { title: string; place: string; body: string; img: string; g: string; delay?: number }) {
        return (
            <Reveal delay={p.delay} className="esc-glass esc-lift iv-card">
                <div className="iv-scene" style={{ background: p.img ? `center/cover url(${p.img})` : p.g }} aria-hidden>
                    {!p.img && <><span className="iv-sun" /><span className="iv-hill a" /><span className="iv-hill b" /></>}
                    <span className="esc-soon" style={{ position: "absolute", left: 18, top: 18, background: "rgba(11,18,48,.55)", color: "#F5C26B" }}>Coming soon</span>
                </div>
                <div className="esc-stack" style={{ gap: 6, padding: "22px 24px 26px" }}>
                    <span className="esc-over">{p.place}</span>
                    <h3 className="esc-d esc-h3">{p.title}</h3>
                    <p className="esc-p">{p.body}</p>
                </div>
            </Reveal>
        )
    }

    const IV_CSS = `
    .esc-sec.iv-hero{padding-top:clamp(130px,13cqi,180px)}
    .iv-stars{position:absolute;inset:0;opacity:.5;background-image:radial-gradient(1px 1px at 12% 22%,#fff,transparent),radial-gradient(1px 1px at 72% 12%,#fff,transparent),radial-gradient(1.5px 1.5px at 38% 64%,#fff,transparent),radial-gradient(1px 1px at 88% 48%,#fff,transparent),radial-gradient(1px 1px at 22% 82%,#fff,transparent),radial-gradient(1.5px 1.5px at 58% 34%,#fff,transparent),radial-gradient(1px 1px at 6% 52%,#fff,transparent),radial-gradient(1px 1px at 94% 86%,#fff,transparent)}
    [data-esc-tone="light"] .iv-stars{display:none}
    .iv-card,.iv-realm{border-radius:28px;overflow:hidden;padding:0}
    .iv-scene{position:relative;aspect-ratio:16/9;overflow:hidden}
    .iv-sun{position:absolute;width:22%;aspect-ratio:1;border-radius:50%;left:62%;top:18%;background:radial-gradient(closest-side,#FFF6E6,rgba(255,246,230,0))}
    .iv-hill{position:absolute;left:-10%;right:-10%;border-radius:50% 50% 0 0}
    .iv-hill.a{bottom:-30%;height:60%;background:rgba(11,18,48,.35)}
    .iv-hill.b{bottom:-44%;height:66%;left:20%;background:rgba(11,18,48,.55)}
    .iv-art{position:relative;height:150px;overflow:hidden}
    .iv-art span{position:absolute;width:60%;aspect-ratio:1;left:20%;top:10%;opacity:.55;filter:blur(8px)}
    .iv-avatar{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,4cqi,64px);align-items:center}
    .iv-preview{position:relative;border-radius:36px;aspect-ratio:4/5;overflow:hidden;background:radial-gradient(80% 60% at 50% 35%,color-mix(in oklab,var(--esc-accent) 30%,transparent),transparent),linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2))}
    .iv-avatar-orb{position:absolute;left:50%;top:46%;width:46%;translate:-50% -50%}
    .iv-aura span{position:absolute;left:50%;top:46%;aspect-ratio:1;border-radius:50%;translate:-50% -50%;border:1px solid color-mix(in oklab,var(--esc-accent) 45%,transparent);animation:esc-breathe 6s var(--esc-ease) infinite}
    .iv-aura span:nth-child(1){width:62%}.iv-aura span:nth-child(2){width:80%;opacity:.6;animation-delay:.8s}.iv-aura span:nth-child(3){width:98%;opacity:.3;animation-delay:1.6s}
    @container (max-width:900px){.iv-avatar{grid-template-columns:minmax(0,1fr)}}
    `

    InnerversePage.defaultProps = { waitlistHref: ROUTES.beta, santoriniImage: "", costaRicaImage: "" }
    addPropertyControls(InnerversePage, {
        waitlistHref: { type: ControlType.Link, title: "Waitlist link" },
        santoriniImage: { type: ControlType.Image, title: "Santorini image" },
        costaRicaImage: { type: ControlType.Image, title: "Costa Rica image" },
    })
    return { default: InnerversePage }
})()

// ═══════════════ BetaPage ═══════════════
const __BetaPage = (() => {
    // Escape — App Testing / Beta Access page body. Fill width, Fit height.
    //
    // The flow (mirrors escapeapp.ai/beta-test, made into one guided journey):
    //   hero → why join → APPLY (4 short steps, on the page) → "You're on the list" with your place →
    //   what happens next → Discord + Maze → FAQ → support on Kickstarter.
    // Applications go to POST /v1/public/beta-apply on the Lucille API (stored for the team, one per
    // email). If the API can't be reached, the visitor is offered the Google Form instead.




    interface Props {
        testLength: string
        reviewTime: string
        discordUrl: string
        mazeUrl: string
        kickstarterUrl: string
        fallbackFormUrl: string
        privacyHref: string
    }

    /**
     */
    function BetaPage(p: Props) {
        const s = useEscape()
        const applyRef = React.useRef<HTMLDivElement>(null)
        const toApply = () => applyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        return (
            <Page>
                <style>{BE_CSS}</style>
                <section className="esc-sec be-hero">
                    <Backdrop top />
                    <div className="esc-wrap be-hero-in">
                        <div className="esc-stack esc-serene" style={{ gap: 20, alignItems: "flex-start" }}>
                            <span className="esc-chip"><span className="esc-dot" aria-hidden />Limited spots available</span>
                            <h1 className="esc-d esc-h1">Join the <span className="esc-gold">Escape beta</span></h1>
                            <p className="esc-lede">Help shape a calmer kind of self-care app. Get Lucille early, tell us what works, and get a founding tester badge plus one year of Premium on us.</p>
                            <div className="esc-row" style={{ gap: 12 }}>
                                <Button onClick={toApply} arrow>Apply in 2 minutes</Button>
                                <Button href={p.kickstarterUrl} variant="ghost" newTab>Support on Kickstarter</Button>
                            </div>
                            <ul className="be-trust">
                                <li><Icon name="check" size={18} />Free to join</li>
                                <li><Icon name="shield" size={18} />Your data is never sold</li>
                                <li><Icon name="calendar" size={18} />Reply within {p.reviewTime}</li>
                            </ul>
                        </div>
                        <div className="be-visual" aria-hidden>
                            <div className="be-phone esc-glass">
                                <div className="be-notch" />
                                <Orb mood={s.mood} size="64%" live rings hero />
                                <span className="esc-d" style={{ fontSize: 26 }}>Good evening</span>
                                <span className="esc-small">How are you arriving?</span>
                                <div className="be-rows">
                                    <span className="esc-glass be-row"><Icon name="spark" size={16} style={{ color: "var(--esc-gold)" }} />Today's pick · Box breathing</span>
                                    <span className="esc-glass be-row"><Icon name="chat" size={16} style={{ color: "var(--esc-accent)" }} />Lucille · "Want to slow down?"</span>
                                    <span className="esc-glass be-row"><Icon name="star" size={16} style={{ color: "var(--esc-gold)" }} />Beta tester badge</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="esc-sec">
                    <div className="esc-wrap">
                        <SectionHead center eyebrow="Why join" title="Why join the beta?" />
                        <div className="esc-grid g3">
                            <Feature icon="spark" title="Early access" body="Try Lucille, new sessions and features before anyone else." />
                            <Feature icon="chat" title="Direct influence" body="Your feedback goes straight to the team and shapes what ships." delay={0.05} />
                            <Feature icon="gift" title="Exclusive perks" body="One year of Premium on us and a founding tester badge in the app." delay={0.1} />
                        </div>
                    </div>
                </section>

                <section className="esc-sec" id="apply">
                    <Backdrop intensity={0.55} />
                    <div className="esc-wrap" ref={applyRef} style={{ scrollMarginTop: 100 }}>
                        <SectionHead center eyebrow="Apply" title="Apply for beta access" lede="Four quick steps. We read every application." />
                        <ApplyFlow {...p} />
                    </div>
                </section>

                <section className="esc-sec">
                    <div className="esc-wrap">
                        <SectionHead center eyebrow="What to expect" title="What happens after you apply" />
                        <ol className="be-steps">
                            {[
                                { icon: "check" as IconName, t: "We review", b: `Every application is read, and you'll hear back within ${p.reviewTime}.` },
                                { icon: "apple" as IconName, t: "You get access", b: "Your download link (TestFlight on iPhone, Google Play testing on Android), setup steps and a Discord invite." },
                                { icon: "calendar" as IconName, t: "You test", b: `Use Escape the way you normally would for about ${p.testLength}. Join a few short Maze studies if you like.` },
                                { icon: "gift" as IconName, t: "You're rewarded", b: "One year of Premium on us and your founding tester badge." },
                            ].map((st, i) => (
                                <Reveal key={st.t} as="li" delay={i * 0.06} className="esc-glass be-step">
                                    <span className="be-num esc-d">{i + 1}</span>
                                    <span className="esc-icon" style={{ width: 44, height: 44 }}><Icon name={st.icon} /></span>
                                    <strong style={{ fontWeight: 500, fontSize: 18 }}>{st.t}</strong>
                                    <span className="esc-p" style={{ fontSize: 15 }}>{st.b}</span>
                                </Reveal>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="esc-sec">
                    <div className="esc-wrap esc-grid g2">
                        <Card className="esc-stack" style={{ gap: 14 }}>
                            <span className="esc-icon"><Icon name="users" /></span>
                            <h3 className="esc-d esc-h3" style={{ marginTop: 6 }}>Connect on Discord</h3>
                            <p className="esc-p">Real-time feedback channels, weekly team AMAs, beta announcements and community challenges. Accepted testers get an invite automatically.</p>
                            <div style={{ marginTop: "auto" }}><Button href={p.discordUrl} variant="ghost" small newTab arrow>Join the Discord</Button></div>
                        </Card>
                        <Card className="esc-stack" style={{ gap: 14 }} delay={0.06}>
                            <span className="esc-icon"><Icon name="flask" /></span>
                            <h3 className="esc-d esc-h3" style={{ marginTop: 6 }}>UX research with Maze</h3>
                            <p className="esc-p">Short, optional studies (5–10 minutes): usability tests, feature surveys and design feedback, about once a month.</p>
                            <div style={{ marginTop: "auto" }}><Button href={p.mazeUrl} variant="ghost" small newTab arrow>About Maze studies</Button></div>
                        </Card>
                    </div>
                </section>

                <section className="esc-sec">
                    <div className="esc-wrap">
                        <SectionHead center eyebrow="Questions" title="Before you apply" />
                        <Faq items={[
                            { q: "How long does the beta last?", a: `About ${p.testLength}. We'll always tell you before a test round ends.` },
                            { q: "Which phones can I test on?", a: "Recent iPhones through TestFlight, and Android phones through the Google Play testing track." },
                            { q: "Is my data private?", a: <>Yes. Beta data is encrypted and handled under the same standards as the app, and it's never sold. See the <a className="esc-link" href={p.privacyHref}>privacy policy</a>.</> },
                            { q: "How often will you ask for feedback?", a: "About once a week, through Discord, a short Maze study or the in-app feedback button. All optional." },
                            { q: "Can I invite friends?", a: "Yes. After your first week you'll get three invite codes to share." },
                            { q: "Is Escape a replacement for therapy?", a: "No. Escape is a self-care app. It doesn't diagnose or treat. If you're in crisis in the US, call or text 988." },
                        ]} />
                    </div>
                </section>

                <section className="esc-sec" style={{ paddingTop: 0 }}>
                    <div className="esc-wrap">
                        <Reveal className="esc-glass esc-glow be-ks">
                            <div className="esc-stack" style={{ gap: 8 }}>
                                <span className="esc-over">Can't wait for a spot?</span>
                                <h2 className="esc-d" style={{ fontSize: "clamp(26px,3cqi,36px)", margin: 0 }}>Back Escape on Kickstarter</h2>
                                <p className="esc-p">Supporters get exclusive early access and help bring Lucille to everyone.</p>
                            </div>
                            <Button href={p.kickstarterUrl} newTab arrow>Support the campaign</Button>
                        </Reveal>
                    </div>
                </section>
            </Page>
        )
    }

    // ───────────────────────── the application ─────────────────────────

    const GOALS: { id: string; label: string }[] = [
        { id: "focus", label: "Find focus" }, { id: "slow_down", label: "Slow down" }, { id: "sleep", label: "Sleep better" },
        { id: "lighter", label: "Feel lighter" }, { id: "move", label: "Move my body" }, { id: "kind", label: "Be kind to myself" }, { id: "explore", label: "Just explore" },
    ]
    const SOURCES = ["TikTok", "Instagram", "A friend", "Kickstarter", "Discord", "LinkedIn", "Other"]
    const STEPS = ["You", "Your phone", "What you'd love", "Stay in touch"]

    interface Form { name: string; email: string; age: boolean; device: "" | "iphone" | "android" | "both"; deviceModel: string; goals: string[]; source: string; discord: boolean; maze: boolean; consent: boolean }
    const EMPTY: Form = { name: "", email: "", age: false, device: "", deviceModel: "", goals: [], source: "", discord: true, maze: false, consent: false }
    const DRAFT = "escape.beta.draft.v1"

    function ApplyFlow(p: Props) {
        const s = useEscape()
        const reduce = useReducedMotion()
        const [step, setStep] = React.useState(0)
        const [f, setF] = React.useState<Form>(EMPTY)
        const [errors, setErrors] = React.useState<Record<string, string>>({})
        const [busy, setBusy] = React.useState(false)
        const [done, setDone] = React.useState<null | { position?: number; duplicate?: boolean }>(null)
        const [failed, setFailed] = React.useState(false)
        const headRef = React.useRef<HTMLHeadingElement>(null)
        const first = React.useRef(true)

        React.useEffect(() => { try { const d = sessionStorage.getItem(DRAFT); if (d) setF({ ...EMPTY, ...JSON.parse(d) }) } catch {} }, [])
        React.useEffect(() => { try { sessionStorage.setItem(DRAFT, JSON.stringify(f)) } catch {} }, [f])
        React.useEffect(() => { if (first.current) { first.current = false; return } headRef.current?.focus() }, [step, done])

        const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })) }
        const validate = (i: number) => {
            const e: Record<string, string> = {}
            if (i === 0) {
                if (!f.name.trim()) e.name = "What should we call you?"
                if (!/^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(f.email.trim())) e.email = "Please enter a valid email."
                if (!f.age) e.age = "The beta is for people 18 and older."
            }
            if (i === 1 && !f.device) e.device = "Pick the phone you'll test on."
            if (i === 3 && !f.consent) e.consent = "We need your OK to email you about the beta."
            setErrors(e)
            return Object.keys(e).length === 0
        }
        const next = () => { if (validate(step)) setStep(Math.min(3, step + 1)) }
        const back = () => setStep(Math.max(0, step - 1))
        const submit = async () => {
            if (!validate(3)) return
            setBusy(true); setFailed(false)
            const res = await postPublic("/v1/public/beta-apply", {
                name: f.name.trim(), email: f.email.trim(), device: f.device, deviceModel: f.deviceModel.trim() || undefined,
                goals: f.goals, source: f.source || undefined, discord: f.discord, maze: f.maze, mood: s.mood || undefined,
                ageConfirmed: f.age, consent: f.consent,
            })
            setBusy(false)
            if (res.ok && res.data?.ok) { setDone({ position: res.data.position, duplicate: res.data.duplicate }); try { sessionStorage.removeItem(DRAFT) } catch {} }
            else if (res.status === 422 && res.data?.detail) setErrors({ form: typeof res.data.detail === "string" ? res.data.detail : "Please check your answers." })
            else setFailed(true)
        }

        const m = moodById(s.mood)
        const anim = reduce ? {} : { initial: { opacity: 0, x: 18, filter: "blur(6px)" }, animate: { opacity: 1, x: 0, filter: "blur(0px)" }, exit: { opacity: 0, x: -18, filter: "blur(6px)" }, transition: { duration: 0.5, ease: easeSoft } }

        if (done) {
            return (
                <motion.div className="esc-glass esc-glow ap ap-done" initial={reduce ? false : { opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: easeSoft }}>
                    <Orb mood={s.mood} size={120} live rings glow />
                    <span className="esc-over">{done.duplicate ? "Application updated" : "Application received"}</span>
                    <h3 className="esc-d ap-h" tabIndex={-1} ref={headRef}>You're on the list, {f.name.trim().split(" ")[0]}.</h3>
                    {done.position ? <p className="ap-pos">You're <strong>#{done.position}</strong> in line{done.duplicate ? ", same as before" : ""}.</p> : null}
                    <p className="esc-p" style={{ maxWidth: 520, margin: "0 auto" }}>We'll email <strong style={{ color: "var(--esc-ink)" }}>{f.email.trim()}</strong> within {p.reviewTime} with your download link and setup steps.</p>
                    <ol className="ap-next">
                        <li className="on"><span>1</span>Applied</li>
                        <li><span>2</span>Review · {p.reviewTime}</li>
                        <li><span>3</span>Download link + Discord</li>
                        <li><span>4</span>Test · ~{p.testLength}</li>
                    </ol>
                    <div className="esc-row" style={{ gap: 10, justifyContent: "center" }}>
                        <Button href={p.discordUrl} newTab arrow>Join the Discord now</Button>
                        <Button href={p.kickstarterUrl} variant="ghost" newTab>Support on Kickstarter</Button>
                    </div>
                </motion.div>
            )
        }

        return (
            <div className="esc-glass ap" style={{ "--hue": m ? m.hue : "#8E7CD9" } as any}>
                <div className="ap-progress" aria-hidden><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
                <ol className="ap-steps" aria-label={`Step ${step + 1} of 4`}>
                    {STEPS.map((t, i) => (
                        <li key={t} className={i === step ? "on" : i < step ? "done" : ""} aria-current={i === step ? "step" : undefined}>
                            <span className="ap-dot">{i < step ? <Icon name="check" size={12} /> : i + 1}</span><span className="ap-steplabel">{t}</span>
                        </li>
                    ))}
                </ol>
                <form onSubmit={(e) => { e.preventDefault(); step < 3 ? next() : submit() }} noValidate>
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.fieldset key={step} className="ap-fs" {...anim}>
                            {step === 0 && (<>
                                <legend><h3 className="esc-d ap-h" tabIndex={-1} ref={headRef}>First, a little about you</h3></legend>
                                <Field id="ap-name" label="Your name" error={errors.name}>
                                    <input id="ap-name" autoComplete="name" value={f.name} maxLength={80} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "ap-name-e" : undefined} />
                                </Field>
                                <Field id="ap-email" label="Email" hint="We'll only use it for the beta." error={errors.email}>
                                    <input id="ap-email" type="email" inputMode="email" autoComplete="email" value={f.email} maxLength={254} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "ap-email-e" : "ap-email-h"} />
                                </Field>
                                <Check id="ap-age" checked={f.age} onChange={(v) => set("age", v)} error={errors.age}>I'm 18 or older</Check>
                            </>)}
                            {step === 1 && (<>
                                <legend><h3 className="esc-d ap-h" tabIndex={-1} ref={headRef}>Which phone will you test on?</h3></legend>
                                <div className="ap-choices" role="radiogroup" aria-label="Your phone" aria-invalid={!!errors.device}>
                                    {([["iphone", "iPhone", "apple"], ["android", "Android", "play-store"], ["both", "Both", "check"]] as const).map(([id, label, icon]) => (
                                        <button key={id} type="button" role="radio" aria-checked={f.device === id} className={`ap-choice ${f.device === id ? "on" : ""}`} onClick={() => set("device", id)}>
                                            <Icon name={icon as IconName} size={24} /><span>{label}</span>
                                        </button>
                                    ))}
                                </div>
                                {errors.device && <p className="ap-err" role="alert">{errors.device}</p>}
                                <Field id="ap-model" label="Phone model (optional)" hint="e.g. iPhone 15, Pixel 8, Galaxy S24">
                                    <input id="ap-model" value={f.deviceModel} maxLength={60} onChange={(e) => set("deviceModel", e.target.value)} aria-describedby="ap-model-h" />
                                </Field>
                            </>)}
                            {step === 2 && (<>
                                <legend><h3 className="esc-d ap-h" tabIndex={-1} ref={headRef}>What would you love from Escape?</h3></legend>
                                <p className="esc-small" style={{ margin: "-4px 0 4px" }}>Pick any that fit. Optional.</p>
                                <div className="ap-chips" role="group" aria-label="What you'd love from Escape">
                                    {GOALS.map((g) => {
                                        const on = f.goals.includes(g.id)
                                        return <button key={g.id} type="button" aria-pressed={on} className={`ap-chip ${on ? "on" : ""}`} onClick={() => set("goals", on ? f.goals.filter((x) => x !== g.id) : [...f.goals, g.id])}>{on && <Icon name="check" size={14} />}{g.label}</button>
                                    })}
                                </div>
                                <Field id="ap-source" label="How did you hear about us? (optional)">
                                    <select id="ap-source" value={f.source} onChange={(e) => set("source", e.target.value)}>
                                        <option value="">Choose one</option>
                                        {SOURCES.map((x) => <option key={x} value={x}>{x}</option>)}
                                    </select>
                                </Field>
                            </>)}
                            {step === 3 && (<>
                                <legend><h3 className="esc-d ap-h" tabIndex={-1} ref={headRef}>How should we stay in touch?</h3></legend>
                                <Toggle checked={f.discord} onChange={(v) => set("discord", v)} title="Invite me to the Discord" sub="Feedback channels, AMAs and beta news." />
                                <Toggle checked={f.maze} onChange={(v) => set("maze", v)} title="I'm up for short Maze studies" sub="5–10 minutes, about once a month." />
                                <div className="ap-review">
                                    <span className="esc-over">Your application</span>
                                    <span>{f.name || "—"} · {f.email || "—"}</span>
                                    <span>{f.device ? { iphone: "iPhone", android: "Android", both: "iPhone + Android" }[f.device] : "—"}{f.deviceModel ? ` · ${f.deviceModel}` : ""}</span>
                                    {f.goals.length > 0 && <span>{f.goals.map((g) => GOALS.find((x) => x.id === g)?.label).join(", ")}</span>}
                                </div>
                                <Check id="ap-consent" checked={f.consent} onChange={(v) => set("consent", v)} error={errors.consent}>
                                    Escape may email me about the beta. I've read the <a className="esc-link" href={p.privacyHref} target="_blank" rel="noopener noreferrer">privacy policy</a>.
                                </Check>
                            </>)}
                        </motion.fieldset>
                    </AnimatePresence>
                    {errors.form && <p className="ap-err" role="alert">{errors.form}</p>}
                    {failed && (
                        <div className="ap-fail" role="alert">
                            <p className="esc-p" style={{ margin: 0 }}>We couldn't reach our servers just now. Your answers are kept. Try again, or apply through our form.</p>
                            <div className="esc-row" style={{ gap: 8 }}>
                                <button type="button" className="ap-btn ghost" onClick={submit}>Try again</button>
                                <a className="ap-btn ghost" href={p.fallbackFormUrl} target="_blank" rel="noopener noreferrer">Open the form</a>
                            </div>
                        </div>
                    )}
                    <div className="ap-nav">
                        {step > 0 ? <button type="button" className="ap-btn ghost" onClick={back}><Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} />Back</button> : <span />}
                        <button type="submit" className="ap-btn" disabled={busy}>{busy ? "Sending…" : step < 3 ? "Continue" : "Submit application"}{!busy && <Icon name="arrow" size={16} />}</button>
                    </div>
                </form>
            </div>
        )
    }

    function Field(props: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
        return (
            <div className={`ap-field ${props.error ? "bad" : ""}`}>
                <label htmlFor={props.id}>{props.label}</label>
                {props.children}
                {props.hint && !props.error && <span id={`${props.id}-h`} className="esc-small">{props.hint}</span>}
                {props.error && <span id={`${props.id}-e`} className="ap-err" role="alert">{props.error}</span>}
            </div>
        )
    }

    function Check(props: { id: string; checked: boolean; onChange: (v: boolean) => void; error?: string; children: React.ReactNode }) {
        return (
            <div className="ap-check-wrap">
                <label className={`ap-check ${props.error ? "bad" : ""}`} htmlFor={props.id}>
                    <input id={props.id} type="checkbox" checked={props.checked} onChange={(e) => props.onChange(e.target.checked)} aria-invalid={!!props.error} />
                    <span className="ap-box" aria-hidden><Icon name="check" size={14} /></span>
                    <span>{props.children}</span>
                </label>
                {props.error && <span className="ap-err" role="alert">{props.error}</span>}
            </div>
        )
    }

    function Toggle(props: { checked: boolean; onChange: (v: boolean) => void; title: string; sub: string }) {
        return (
            <button type="button" role="switch" aria-checked={props.checked} className={`ap-toggle ${props.checked ? "on" : ""}`} onClick={() => props.onChange(!props.checked)}>
                <span className="esc-stack" style={{ gap: 2, alignItems: "flex-start", textAlign: "left" }}><strong style={{ fontWeight: 500 }}>{props.title}</strong><span className="esc-small">{props.sub}</span></span>
                <span className="ap-sw" aria-hidden><span /></span>
            </button>
        )
    }

    const BE_CSS = `
    .esc-sec.be-hero{padding-top:clamp(120px,12cqi,168px)}
    .be-hero-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:clamp(32px,5cqi,72px);align-items:center}
    .be-trust{list-style:none;margin:4px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:10px 22px;color:var(--esc-faint);font-size:14px}
    .be-trust li{display:inline-flex;gap:8px;align-items:center}
    .be-trust svg{color:var(--esc-accent)}
    .be-visual{display:grid;place-items:center}
    .be-phone{width:min(320px,80%);aspect-ratio:9/19;border-radius:48px;padding:56px 22px 28px;display:flex;flex-direction:column;align-items:center;gap:10px;position:relative;background:linear-gradient(170deg,color-mix(in oklab,var(--esc-glowB) 60%,transparent),var(--esc-glass2))}
    .be-notch{position:absolute;top:16px;width:96px;height:26px;border-radius:99px;background:rgba(5,8,26,.85)}
    .be-rows{display:flex;flex-direction:column;gap:8px;width:100%;margin-top:14px}
    .be-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;font-size:13px;white-space:nowrap;overflow:hidden}
    .be-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;counter-reset:s}
    .be-step{position:relative;border-radius:24px;padding:22px;display:flex;flex-direction:column;gap:10px}
    .be-num{position:absolute;right:18px;top:12px;font-size:40px;color:color-mix(in oklab,var(--esc-accent) 40%,transparent)}
    .be-ks{border-radius:32px;padding:clamp(24px,4cqi,44px);display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
    .ap{max-width:720px;margin:0 auto;border-radius:32px;padding:clamp(20px,3.5cqi,40px);position:relative;overflow:hidden}
    .ap-progress{position:absolute;left:0;right:0;top:0;height:3px;background:var(--esc-line)}
    .ap-progress span{display:block;height:100%;background:linear-gradient(90deg,var(--esc-accent),var(--hue));transition:width .6s var(--esc-ease-soft)}
    .ap-steps{list-style:none;margin:6px 0 24px;padding:0;display:flex;gap:6px;flex-wrap:wrap}
    .ap-steps li{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--esc-faint);padding:5px 12px 5px 5px;border-radius:99px}
    .ap-steps li.on{color:var(--esc-ink);background:var(--esc-glass1);box-shadow:inset 0 0 0 1px var(--esc-border)}
    .ap-dot{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:12px;border:1px solid var(--esc-border)}
    .ap-steps li.on .ap-dot{background:var(--esc-accent);color:var(--esc-onAccent);border-color:transparent}
    .ap-steps li.done .ap-dot{background:var(--esc-glass1)}
    .ap-fs{border:0;margin:0;padding:0;min-width:0;display:flex;flex-direction:column;gap:18px}
    .ap-fs legend{padding:0;margin:0 0 4px}
    .ap-h{font-size:clamp(26px,2.6cqi,34px);outline:none;margin:0}
    .ap-field{display:flex;flex-direction:column;gap:6px}
    .ap-field label{font-weight:500;font-size:15px}
    .ap-field input,.ap-field select{appearance:none;box-sizing:border-box;width:100%;min-height:52px;padding:0 16px;border-radius:16px;font:400 16px "Work Sans",system-ui,sans-serif;color:var(--esc-ink);background:var(--esc-glass2);border:1px solid var(--esc-border);outline:none;transition:border-color .3s,box-shadow .3s}
    .ap-field select{background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),linear-gradient(135deg,currentColor 50%,transparent 50%);background-position:calc(100% - 22px) 50%,calc(100% - 16px) 50%;background-size:6px 6px;background-repeat:no-repeat;padding-right:40px}
    .ap-field select option{color:#0B1230}
    .ap-field input:focus,.ap-field select:focus{border-color:var(--esc-accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--esc-accent) 30%,transparent)}
    .ap-field.bad input{border-color:#FF8A80}
    .ap-err{color:#FFB4AB;font-size:14px;margin:0}
    [data-esc-tone="light"] .ap-err{color:#B3261E}
    .ap-check{display:flex;gap:12px;align-items:flex-start;cursor:pointer;line-height:1.5;min-height:44px}
    .ap-check input{position:absolute;opacity:0;width:1px;height:1px}
    .ap-box{flex:none;width:24px;height:24px;margin-top:1px;border-radius:8px;display:grid;place-items:center;color:transparent;border:1.5px solid var(--esc-border);background:var(--esc-glass2);transition:background .3s,border-color .3s,color .3s}
    .ap-check input:checked+.ap-box{background:var(--esc-accent);border-color:var(--esc-accent);color:var(--esc-onAccent)}
    .ap-check input:focus-visible+.ap-box{outline:3px solid var(--esc-accent);outline-offset:2px}
    .ap-check.bad .ap-box{border-color:#FF8A80}
    .ap-choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
    .ap-choice{all:unset;box-sizing:border-box;cursor:pointer;min-height:96px;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font-weight:500;color:var(--esc-ink);background:var(--esc-glass2);border:1px solid var(--esc-border);transition:border-color .3s,background .3s,transform .3s}
    .ap-choice:hover{transform:translateY(-2px)}
    .ap-choice.on{border-color:var(--esc-accent);background:color-mix(in oklab,var(--esc-accent) 16%,transparent);box-shadow:0 12px 40px -20px var(--esc-accent)}
    .ap-chips{display:flex;flex-wrap:wrap;gap:8px}
    .ap-chip{all:unset;box-sizing:border-box;cursor:pointer;min-height:44px;padding:0 16px;border-radius:999px;display:inline-flex;align-items:center;gap:6px;font-size:15px;color:var(--esc-muted);border:1px solid var(--esc-border);background:var(--esc-glass2);transition:all .3s}
    .ap-chip.on{color:var(--esc-onAccent);background:var(--esc-accent);border-color:var(--esc-accent)}
    .ap-toggle{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;min-height:64px;padding:12px 16px;border-radius:18px;border:1px solid var(--esc-border);background:var(--esc-glass2)}
    .ap-sw{flex:none;width:48px;height:28px;border-radius:99px;background:var(--esc-line);position:relative;transition:background .3s}
    .ap-sw span{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#E6EAF4;transition:transform .35s var(--esc-ease-soft)}
    .ap-toggle.on .ap-sw{background:var(--esc-accent)}
    .ap-toggle.on .ap-sw span{transform:translateX(20px)}
    .ap-choice:focus-visible,.ap-chip:focus-visible,.ap-toggle:focus-visible,.ap-btn:focus-visible{outline:3px solid var(--esc-accent);outline-offset:3px}
    .ap-review{display:flex;flex-direction:column;gap:4px;padding:14px 16px;border-radius:16px;background:var(--esc-glass2);border:1px dashed var(--esc-border);font-size:14px;color:var(--esc-muted)}
    .ap-nav{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:24px}
    .ap-btn{all:unset;box-sizing:border-box;cursor:pointer;min-height:52px;padding:0 24px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;font-weight:500;color:var(--esc-onAccent);background:linear-gradient(135deg,var(--esc-accent),color-mix(in oklab,var(--esc-accent) 62%,#39519F));box-shadow:0 10px 34px -12px var(--esc-accent)}
    .ap-btn.ghost{color:var(--esc-ink);background:var(--esc-glass2);border:1px solid var(--esc-border);box-shadow:none;text-decoration:none}
    .ap-btn:disabled{opacity:.6;cursor:default}
    .ap-fail{display:flex;flex-direction:column;gap:10px;margin-top:16px;padding:14px 16px;border-radius:16px;border:1px solid #F5C26B;background:color-mix(in oklab,#F5C26B 10%,transparent)}
    .ap-done{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center}
    .ap-pos{margin:0;font-size:20px}
    .ap-pos strong{color:var(--esc-gold);font-weight:600}
    .ap-next{list-style:none;margin:6px 0;padding:0;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
    .ap-next li{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 14px 0 6px;border-radius:99px;font-size:13px;color:var(--esc-muted);border:1px solid var(--esc-border)}
    .ap-next li span{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:12px;background:var(--esc-glass1)}
    .ap-next li.on{color:var(--esc-ink);border-color:var(--esc-accent)}
    .ap-next li.on span{background:var(--esc-accent);color:var(--esc-onAccent)}
    @container (max-width:980px){.be-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @container (max-width:900px){.be-hero-in{grid-template-columns:minmax(0,1fr)}}
    @container (max-width:560px){.be-steps{grid-template-columns:minmax(0,1fr)}.ap-steplabel{display:none}.ap-steps li{padding:4px}.ap-choices{grid-template-columns:minmax(0,1fr)}.ap-choice{min-height:60px;flex-direction:row}.ap-nav .ap-btn{flex:1;justify-content:center}.be-ks{flex-direction:column;align-items:flex-start}}
    `

    BetaPage.defaultProps = {
        testLength: "4 weeks",
        reviewTime: "48 hours",
        discordUrl: LINKS.discord,
        mazeUrl: LINKS.maze,
        kickstarterUrl: LINKS.kickstarter,
        fallbackFormUrl: LINKS.betaForm,
        privacyHref: ROUTES.privacy,
    }
    addPropertyControls(BetaPage, {
        testLength: { type: ControlType.String, title: "Test length" },
        reviewTime: { type: ControlType.String, title: "Review time" },
        discordUrl: { type: ControlType.Link, title: "Discord" },
        mazeUrl: { type: ControlType.Link, title: "Maze" },
        kickstarterUrl: { type: ControlType.Link, title: "Kickstarter" },
        fallbackFormUrl: { type: ControlType.Link, title: "Backup form" },
        privacyHref: { type: ControlType.Link, title: "Privacy link" },
    })
    return { default: BetaPage }
})()

// ═══════════════ DemoPage ═══════════════
const __DemoPage = (() => {
    // Escape — App Demo page body. Fill width, auto height.
    // The demo is the app's own screen recording (portrait), shown in a phone frame. Chapters jump
    // the player and follow it as it plays; edit their times and titles in Framer's panel.
    // Upload media/escape_demo.mp4 to "Demo video" and media/escape_demo_poster.webp to "Poster".




    const src = (v: any) => (typeof v === "string" ? v : v?.src) || ""

    interface Chapter { at: number; title: string; body: string }
    interface Props {
        demoVideo: string
        demoVideoWebm: string
        demoPoster: any
        captions: string
        chapters: Chapter[]
        waitlistHref: string
        crowdfundHref: string
    }

    const DEFAULT_CHAPTERS: Chapter[] = [
        { at: 0, title: "Your home, today", body: "A greeting, how you're feeling, a thought from Lucille and today's small plan." },
        { at: 10, title: "Explore sessions", body: "Breathing, meditation, sleep and focus sessions, picked for your mood." },
        { at: 29, title: "Mindful movement", body: "Yoga, pilates, tai chi and gentle exercise, with short routines." },
        { at: 40, title: "Mind & energy centers", body: "Guided sessions, grounding, nature sounds and the seven energy centers." },
        { at: 80, title: "Your profile & settings", body: "Coins, day and night themes, reminders, privacy and help." },
        { at: 140, title: "Check in & talk to Lucille", body: "The quick mood check-in, then voice or text with Lucille." },
    ]

    /**
     */
    function DemoPage(p: Props) {
        const s = useEscape()
        const reduce = useReducedMotion()
        const v = React.useRef<HTMLVideoElement>(null)
        const chapters = (p.chapters && p.chapters.length ? p.chapters : DEFAULT_CHAPTERS).slice().sort((a, b) => a.at - b.at)
        const [active, setActive] = React.useState(0)
        const [playing, setPlaying] = React.useState(false)
        const [t, setT] = React.useState(0)
        const [dur, setDur] = React.useState(0)
        const video = src(p.demoVideo)
        const webm = src(p.demoVideoWebm)
        const fmt = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`

        const jump = (i: number) => {
            setActive(i)
            const el = v.current
            if (!el) return
            el.currentTime = chapters[i].at
            el.play().catch(() => {})
        }
        const toggle = () => { const el = v.current; if (!el) return; el.paused ? el.play().catch(() => {}) : el.pause() }
        const onTime = () => {
            const now = v.current?.currentTime || 0
            setT(now)
            let i = 0
            chapters.forEach((c, k) => { if (now >= c.at) i = k })
            if (i !== active) setActive(i)
        }
        const end = (i: number) => (chapters[i + 1] ? chapters[i + 1].at : dur || chapters[i].at + 20)

        return (
            <Page>
                <style>{DE_CSS}</style>
                <section className="esc-sec de-hero">
                    <Backdrop top />
                    <div className="esc-wrap de-grid">
                        <div className="esc-stack esc-serene" style={{ gap: 18, alignItems: "flex-start" }}>
                            <Eyebrow>App demo</Eyebrow>
                            <h1 className="esc-d esc-h1">Discover the <span className="esc-gold">Escape</span> app</h1>
                            <p className="esc-lede">A real walk through the app, recorded on an iPhone. Press play, or jump to any chapter.</p>
                            <div className="esc-row" style={{ gap: 12 }}>
                                <Button href={p.waitlistHref} arrow>Apply for the beta</Button>
                                <Button href={ROUTES.pricing} variant="ghost">View pricing</Button>
                            </div>
                            <ol className="de-chapters" aria-label="Chapters">
                                {chapters.map((c, i) => {
                                    const on = i === active
                                    const pct = on && dur ? Math.min(100, Math.max(0, ((t - c.at) / (end(i) - c.at)) * 100)) : i < active ? 100 : 0
                                    return (
                                        <li key={c.title + i}>
                                            <button type="button" className={`de-ch ${on ? "on" : ""}`} onClick={() => jump(i)} aria-current={on ? "step" : undefined} disabled={!video} aria-label={`Chapter ${i + 1}: ${c.title}, at ${fmt(c.at)}`}>
                                                <span className="de-n esc-d">{String(i + 1).padStart(2, "0")}</span>
                                                <span className="esc-stack" style={{ gap: 3, flex: 1, minWidth: 0 }}>
                                                    <span className="de-title">{c.title}<span className="de-time">{fmt(c.at)}</span></span>
                                                    <AnimatePresence initial={false}>
                                                        {on && (
                                                            <motion.span className="de-body" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.6, ease: easeSoft }}>{c.body}</motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                    <span className="de-bar" aria-hidden><span style={{ width: `${pct}%` }} /></span>
                                                </span>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ol>
                        </div>

                        <motion.div className="de-phone-wrap" initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.6, ease: easeSoft, delay: 0.3 }}>
                            <div className="de-glow" aria-hidden />
                            <div className="de-phone">
                                <div className="de-island" aria-hidden />
                                {video ? (
                                    <>
                                        <video ref={v} poster={src(p.demoPoster) || undefined} playsInline preload="metadata" onTimeUpdate={onTime} onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)}
                                            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onClick={toggle} aria-label="Escape app demo">
                                            {webm && <source src={webm} type="video/webm" />}
                                            <source src={video} type="video/mp4" />
                                            {p.captions && <track kind="captions" src={p.captions} srcLang="en" label="English" default />}
                                        </video>
                                        <AnimatePresence>
                                            {!playing && (
                                                <motion.button type="button" className="de-play" onClick={toggle} aria-label={t > 0 ? "Resume demo" : "Play demo"} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 0.6, ease: easeSoft }}>
                                                    <Icon name="play" size={26} />
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <div className="de-empty"><Orb mood={s.mood} size={140} live rings /><span className="esc-small">Upload the demo video in Framer.</span></div>
                                )}
                            </div>
                            {video && <span className="de-now esc-chip" aria-live="polite"><span className="esc-dot" aria-hidden />{playing ? "Now" : "Chapter"} · {chapters[active].title}</span>}
                        </motion.div>
                    </div>
                </section>

                <section className="esc-sec" style={{ paddingTop: 0 }}>
                    <div className="esc-wrap">
                        <ul className="de-trust">
                            <li><Icon name="shield" size={18} />Private by design</li>
                            <li><Icon name="spark" size={18} />Powered by Lucille AI</li>
                            <li><Icon name="leaf" size={18} />Built for your pace</li>
                        </ul>
                    </div>
                </section>

                <ClosingCta eyebrow="Coming to iOS & Android" title={<>Be first to experience <span className="esc-gold">Escape</span></>} lede={p.crowdfundHref ? "Join the waitlist, or back Escape and get early access as a supporter." : "Join the waitlist and we'll let you know the moment it opens."} primary={{ label: "Join the waitlist", href: p.waitlistHref }} secondary={p.crowdfundHref ? { label: "Support Escape", href: p.crowdfundHref } : { label: "Join the beta", href: ROUTES.beta }} badges />
            </Page>
        )
    }

    const DE_CSS = `
    .esc-sec.de-hero{padding-top:clamp(120px,12cqi,160px)}
    .de-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:clamp(32px,5cqi,80px);align-items:center}
    .de-chapters{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:8px;width:100%;max-width:560px}
    .de-ch{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:flex;gap:16px;align-items:flex-start;padding:14px 18px;border-radius:20px;border:1px solid transparent;transition:background .6s var(--esc-ease-soft),border-color .6s var(--esc-ease-soft)}
    .de-ch:hover{background:var(--esc-glass2)}
    .de-ch.on{background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2));border-color:var(--esc-border)}
    .de-ch:disabled{cursor:default}
    .de-ch:focus-visible{outline:3px solid var(--esc-accent);outline-offset:3px}
    .de-n{font-size:22px;color:var(--esc-faint);width:30px;flex:none;line-height:1.3;transition:color .6s}
    .de-ch.on .de-n{color:var(--esc-accent)}
    .de-title{display:flex;justify-content:space-between;gap:12px;font-weight:500;color:var(--esc-ink)}
    .de-time{font-size:13px;color:var(--esc-faint);font-weight:400;font-variant-numeric:tabular-nums}
    .de-body{display:block;overflow:hidden;font-size:15px;line-height:1.5;color:var(--esc-muted)}
    .de-bar{display:block;height:2px;border-radius:2px;background:var(--esc-line);margin-top:8px;overflow:hidden}
    .de-bar span{display:block;height:100%;background:var(--esc-accent);transition:width .3s linear}
    .de-phone-wrap{position:relative;justify-self:center;display:flex;flex-direction:column;align-items:center;gap:18px}
    .de-glow{position:absolute;inset:8% -18%;border-radius:50%;background:radial-gradient(closest-side,var(--esc-glowB),transparent 70%);filter:blur(40px);opacity:.9;animation:esc-breathe 8s var(--esc-ease-soft) infinite}
    .de-phone{position:relative;width:min(340px,72vw);aspect-ratio:600/1036;border-radius:48px;padding:10px;background:linear-gradient(160deg,#2A3566,#0B1230);box-shadow:0 0 0 1px rgba(230,234,244,.18),0 50px 120px -40px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.18)}
    .de-phone video{display:block;width:100%;height:100%;object-fit:cover;border-radius:38px;background:#0B1230;cursor:pointer}
    .de-island{position:absolute;top:20px;left:50%;translate:-50% 0;width:92px;height:26px;border-radius:99px;background:#05081A;z-index:2;opacity:.92}
    .de-play{all:unset;cursor:pointer;position:absolute;left:50%;top:50%;translate:-50% -50%;width:76px;height:76px;border-radius:50%;display:grid;place-items:center;color:#0B1230;background:rgba(246,248,255,.9);box-shadow:0 20px 60px -20px rgba(0,0,0,.6);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
    .de-play svg{margin-left:4px}
    .de-play:focus-visible{outline:3px solid var(--esc-accent);outline-offset:4px}
    .de-empty{position:absolute;inset:10px;border-radius:38px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0B1230;text-align:center;padding:20px}
    .de-now{position:relative}
    .de-trust{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:10px 26px;color:var(--esc-faint);font-size:14px;justify-content:center}
    .de-trust li{display:inline-flex;gap:8px;align-items:center}
    .de-trust svg{color:var(--esc-accent)}
    @container (max-width:900px){.de-grid{grid-template-columns:minmax(0,1fr)}.de-phone-wrap{order:-1}.de-chapters{max-width:none}}
    `

    DemoPage.defaultProps = { demoVideo: MEDIA_BASE + "escape_demo.mp4", demoVideoWebm: "", demoPoster: MEDIA_BASE + "escape_demo_poster.webp", captions: "", chapters: DEFAULT_CHAPTERS, waitlistHref: ROUTES.beta, crowdfundHref: LINKS.kickstarter }
    addPropertyControls(DemoPage, {
        demoVideo: { type: ControlType.File, title: "Demo video", allowedFileTypes: ["mp4", "mov"] },
        demoVideoWebm: { type: ControlType.File, title: "Demo WebM", allowedFileTypes: ["webm"] },
        demoPoster: { type: ControlType.Image, title: "Poster" },
        captions: { type: ControlType.File, title: "Captions", allowedFileTypes: ["vtt"] },
        chapters: {
            type: ControlType.Array, title: "Chapters",
            control: { type: ControlType.Object, controls: { at: { type: ControlType.Number, title: "Start (s)", min: 0, step: 1 }, title: { type: ControlType.String, title: "Title" }, body: { type: ControlType.String, title: "Text", displayTextArea: true } } },
        },
        waitlistHref: { type: ControlType.Link, title: "Waitlist link" },
        crowdfundHref: { type: ControlType.Link, title: "Indiegogo link" },
    })
    return { default: DemoPage }
})()

// ═══════════════ LegalPage ═══════════════
const __LegalPage = (() => {
    // Escape — Legal pages (Privacy Policy, Terms of Service, Cookie Policy). Fill width, auto height.
    // One component, three pages: set "Document" on each page. The text below is a DRAFT written
    // from what the app actually does (permissions, processors, purchases). Have counsel review it
    // before publishing, then keep "Last updated" current.



    type Doc = "privacy" | "terms" | "cookies"
    interface Props { doc: Doc; lastUpdated: string; company: string; email: string; address: string }
    type Section = { id: string; title: string; body: React.ReactNode }

    /**
     */
    function LegalPage(p: Props) {
        const docs: Record<Doc, { title: string; href: string; promise?: string; sections: Section[] }> = {
            privacy: { title: "Privacy Policy", href: ROUTES.privacy, promise: "We collect only what Escape needs to work, we never sell your data, and you can delete your account and its data from Settings at any time.", sections: privacy(p) },
            terms: { title: "Terms of Service", href: ROUTES.terms, sections: terms(p) },
            cookies: { title: "Cookie Policy", href: ROUTES.cookies, sections: cookies(p) },
        }
        const d = docs[p.doc] || docs.privacy
        const [active, setActive] = React.useState(d.sections[0].id)
        React.useEffect(() => {
            if (typeof IntersectionObserver === "undefined") return
            const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-20% 0px -70% 0px" })
            d.sections.forEach((s) => { const el = document.getElementById(s.id); el && io.observe(el) })
            return () => io.disconnect()
        }, [p.doc])

        return (
            <Page>
                <style>{LG_CSS}</style>
                <section className="esc-sec lg-hero">
                    <Backdrop top intensity={0.7} />
                    <div className="esc-wrap esc-stack esc-serene" style={{ gap: 18, alignItems: "flex-start" }}>
                        <Eyebrow>Legal</Eyebrow>
                        <h1 className="esc-d esc-h1">{d.title}</h1>
                        <p className="esc-p">Last updated: {p.lastUpdated} · {p.company}</p>
                        <nav className="lg-tabs" aria-label="Legal documents">
                            {(Object.keys(docs) as Doc[]).map((k) => (
                                <a key={k} href={docs[k].href} aria-current={k === p.doc ? "page" : undefined} className={k === p.doc ? "on" : ""}>{docs[k].title}</a>
                            ))}
                        </nav>
                    </div>
                </section>
                <section className="esc-sec" style={{ paddingTop: 0 }}>
                    <div className="esc-wrap lg-body">
                        <nav className="lg-toc" aria-label="On this page">
                            <span className="esc-over">On this page</span>
                            <ol>
                                {d.sections.map((s, i) => (
                                    <li key={s.id}><a href={`#${s.id}`} className={active === s.id ? "on" : ""}><span>{i + 1}.</span>{s.title}</a></li>
                                ))}
                            </ol>
                        </nav>
                        <article className="lg-article">
                            {d.promise && (
                                <Reveal className="esc-glass lg-promise">
                                    <span className="esc-icon"><Icon name="shield" /></span>
                                    <p className="esc-p" style={{ color: "var(--esc-ink)" }}><strong style={{ fontWeight: 500 }}>Our core privacy promise.</strong> {d.promise}</p>
                                </Reveal>
                            )}
                            {d.sections.map((s, i) => (
                                <section key={s.id} id={s.id} className="lg-sec">
                                    <h2 className="esc-d"><span>{i + 1}.</span> {s.title}</h2>
                                    <div className="lg-text">{s.body}</div>
                                </section>
                            ))}
                            <div className="esc-glass lg-contact">
                                <div>
                                    <h2 className="esc-d" style={{ fontSize: 26, margin: "0 0 6px" }}>Questions about this policy?</h2>
                                    <p className="esc-p">Write to us for anything: data access, corrections, deletion or general questions.</p>
                                </div>
                                <div className="esc-stack" style={{ gap: 6 }}>
                                    <a className="esc-link" href={`mailto:${p.email}`}>{p.email}</a>
                                    <span className="esc-small">{p.address}</span>
                                </div>
                            </div>
                            <a className="esc-link" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }) }}>Back to top ↑</a>
                        </article>
                    </div>
                </section>
            </Page>
        )
    }

    // ───────────────────────── drafts ─────────────────────────

    const ul = (items: React.ReactNode[]) => <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>

    function privacy(p: Props): Section[] {
        return [
            { id: "intro", title: "Introduction", body: <><p>This policy explains how {p.company} ("Escape", "we") handles information when you use the Escape app and this website. Escape is a self-care and wellbeing app; it is not a medical device.</p></> },
            { id: "collect", title: "What we collect and why", body: <>
                <p>We collect the minimum needed to run Escape and personalize it for you:</p>
                {ul([
                    <><strong>Account:</strong> your name, email and sign-in method (Apple, Google or email), so you can sign in on your devices.</>,
                    <><strong>What you create:</strong> mood check-ins, journal entries, plans, sessions you complete, and your conversations with Lucille (text, and voice you choose to send). This is what makes Escape personal.</>,
                    <><strong>Coins and progress:</strong> coins, streaks and Energy Scan results.</>,
                    <><strong>Device and usage:</strong> app version, crash reports and performance data, and a push-notification token if you allow notifications.</>,
                    <><strong>Purchases:</strong> your subscription status from the App Store or Google Play (via our subscription provider). We never see your card details.</>,
                ])}
                <p>Optional, only if you allow it on your device:</p>
                {ul([
                    <><strong>Approximate location</strong> (about 1 km) to tune Soundscapes to your local weather and time of day.</>,
                    <><strong>Apple Health / Health Connect:</strong> reading heart rate, HRV, sleep and steps to tune sessions, and saving mood check-ins and mindful minutes. Health data is never sold or used for advertising.</>,
                    <><strong>Camera</strong> for the Mood Scan: the reading is used, not the photo or video.</>,
                    <><strong>Microphone and speech recognition</strong> when you talk with Lucille or dictate a journal entry.</>,
                    <><strong>Photos</strong> you choose for your profile or a journal entry.</>,
                ])}
            </> },
            { id: "use", title: "How we use information", body: <>{ul([
                "To provide Escape: your account, check-ins, sessions, Soundscapes, plans and journal.",
                "To let Lucille respond to you with context, and to suggest what may help today.",
                "To award coins, calculate your Energy Scan and send reminders you've chosen.",
                "To keep Escape secure, fix bugs and improve features (using aggregated or de-identified data where we can).",
            ])}<p>We do not use your wellbeing content for advertising, and there are no ads in Escape.</p></> },
            { id: "share", title: "How we share information", body: <><p>We do not sell or rent your personal information. We share it only with service providers who process it for us under contract, such as:</p>{ul([
                "Google Cloud and Firebase (hosting, database, sign-in, notifications, crash reports and analytics).",
                "AI model providers that generate Lucille's replies, voice and transcriptions.",
                "Our subscription provider and the App Store / Google Play for purchases.",
            ])}<p>We may also disclose information if required by law, or to protect someone's safety.</p></> },
            { id: "social", title: "Sharing you choose", body: <p>If you share a milestone, a soundscape mix or creator content, it's visible to the people you share it with. You control what you share.</p> },
            { id: "security", title: "Security and retention", body: <p>Data is encrypted in transit and protected with access controls. We keep your information while your account is active. When you delete your account in Settings, we delete your personal data from our active systems, except where we must keep limited records by law; backups roll off on a regular schedule.</p> },
            { id: "rights", title: "Your choices and rights", body: <>{ul([
                "Access, correct or export your data by emailing us.",
                "Delete your account and its data from Settings in the app, at any time.",
                "Turn off notifications, location, Health, camera or microphone access in your device settings.",
                "California residents: you have rights under the CCPA/CPRA, including to know, delete and correct. We do not sell or share personal information for cross-context advertising.",
                "If you're in the EEA or UK, you have rights under the GDPR, including to object and to complain to your data protection authority.",
            ])}</> },
            { id: "dnt", title: "Do Not Track", body: <p>This website doesn't track you across other sites, so it treats every visit the same whether or not your browser sends a Do Not Track or Global Privacy Control signal.</p> },
            { id: "children", title: "Children", body: <p>Escape isn't directed to children under 13, and we don't knowingly collect their information. If you believe a child has given us information, contact us and we'll delete it.</p> },
            { id: "changes", title: "Changes and governing law", body: <p>We'll update this page when our practices change and, for significant changes, tell you in the app. This policy is governed by the laws of the United States and the state where {p.company} is organized.</p> },
        ]
    }

    function terms(p: Props): Section[] {
        return [
            { id: "agree", title: "Agreement", body: <p>By using Escape you agree to these terms. If you don't agree, please don't use Escape.</p> },
            { id: "notmedical", title: "Not medical care", body: <p>Escape and Lucille provide self-care and wellbeing support only. They don't diagnose, treat or replace professional care. If you're in crisis in the US, call or text 988; elsewhere, contact your local emergency number.</p> },
            { id: "account", title: "Your account", body: <p>You're responsible for your account and for keeping your sign-in secure. You must be at least 13 (or the minimum age in your country) to use Escape.</p> },
            { id: "subs", title: "Subscriptions and trials", body: <p>The Escape Journey Pass is billed through the App Store or Google Play and renews automatically until you cancel in your store account settings, at least 24 hours before renewal. Free trials convert to a paid plan unless cancelled before they end. Refunds are handled by the store under its policies.</p> },
            { id: "coins", title: "Coins and rewards", body: <p>Escape coins are earned through activity in the app. They have no cash value, can't be bought, sold or transferred, and may be adjusted to prevent abuse. Marketplace items and partner rewards are subject to availability.</p> },
            { id: "content", title: "Your content", body: <p>You own what you create in Escape. You give us the permission needed to store and process it to run the service for you. Content you choose to share publicly must follow our community guidelines.</p> },
            { id: "ai", title: "AI features", body: <p>Lucille is an AI. Her responses can be wrong or incomplete; use your judgment and don't rely on them for medical, legal or financial decisions.</p> },
            { id: "acceptable", title: "Acceptable use", body: <p>Don't misuse Escape: no harassment, illegal content, attempts to break security, or scraping. We may suspend accounts that put others at risk.</p> },
            { id: "liability", title: "Disclaimers and liability", body: <p>Escape is provided "as is". To the extent the law allows, {p.company} isn't liable for indirect or consequential losses, and our total liability is limited to what you paid us in the past 12 months.</p> },
            { id: "changes", title: "Changes and contact", body: <p>We may update these terms and will tell you in the app about significant changes. Questions: {p.email}.</p> },
        ]
    }

    function cookies(p: Props): Section[] {
        return [
            { id: "what", title: "What this covers", body: <p>This explains what this website stores in your browser. The Escape app is covered by the Privacy Policy.</p> },
            { id: "essential", title: "Preferences we store", body: <p>When you choose a mood on the orb gate, or switch between day and night, we save that choice in your browser's local storage (key <code>escape.site.v1</code>) so the site remembers it. It never leaves your device and isn't used to identify you.</p> },
            { id: "analytics", title: "Analytics", body: <p>We use privacy-friendly, aggregate page analytics provided by our website host to understand which pages are useful. We don't use advertising cookies or cross-site trackers.</p> },
            { id: "embeds", title: "Fonts and media", body: <p>Fonts, the mood orb videos and other media load from Google services. Those requests include standard technical information such as your IP address.</p> },
            { id: "control", title: "Your control", body: <p>You can clear site data in your browser settings at any time, which resets your mood and tone choice. Questions: {p.email}.</p> },
        ]
    }

    const LG_CSS = `
    .esc-sec.lg-hero{padding-top:clamp(120px,12cqi,160px);padding-bottom:40px}
    .lg-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
    .lg-tabs a{min-height:44px;display:inline-flex;align-items:center;padding:0 18px;border-radius:999px;border:1px solid var(--esc-border);color:var(--esc-muted);text-decoration:none;font-weight:500;background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2))}
    .lg-tabs a.on{color:var(--esc-onAccent);background:var(--esc-accent);border-color:var(--esc-accent)}
    .lg-body{display:grid;grid-template-columns:260px minmax(0,1fr);gap:clamp(24px,4cqi,64px);align-items:start}
    .lg-toc{position:sticky;top:110px;display:flex;flex-direction:column;gap:12px}
    .lg-toc ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;border-left:1px solid var(--esc-line)}
    .lg-toc a{display:flex;gap:8px;min-height:38px;align-items:center;padding:0 14px;margin-left:-1px;border-left:2px solid transparent;color:var(--esc-faint);text-decoration:none;font-size:14px}
    .lg-toc a span{color:var(--esc-faint);width:20px}
    .lg-toc a.on{color:var(--esc-ink);border-left-color:var(--esc-accent)}
    .lg-article{display:flex;flex-direction:column;gap:clamp(28px,3cqi,40px);max-width:760px}
    .lg-promise{display:flex;gap:16px;align-items:flex-start;border-radius:24px;padding:22px}
    .lg-sec{scroll-margin-top:110px}
    .lg-sec h2{font-size:clamp(24px,2.2cqi,30px);margin:0 0 12px}
    .lg-sec h2 span{color:var(--esc-accent)}
    .lg-text{color:var(--esc-muted);line-height:1.7;display:flex;flex-direction:column;gap:12px}
    .lg-text p{margin:0}
    .lg-text ul{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:8px}
    .lg-text strong{color:var(--esc-ink);font-weight:500}
    .lg-text code{font-size:.9em;padding:2px 6px;border-radius:6px;background:var(--esc-glass1)}
    .lg-contact{border-radius:28px;padding:clamp(22px,3cqi,32px);display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
    @container (max-width:900px){.lg-body{grid-template-columns:minmax(0,1fr)}.lg-toc{position:static}}
    `

    LegalPage.defaultProps = {
        doc: "privacy",
        lastUpdated: "October 25, 2026",
        company: "Escape Enterprises LLC",
        email: "privacy@escapeapp.ai",
        address: "Escape Enterprises LLC · Attn: Privacy & Legal",
    }
    addPropertyControls(LegalPage, {
        doc: { type: ControlType.Enum, title: "Document", options: ["privacy", "terms", "cookies"], optionTitles: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
        lastUpdated: { type: ControlType.String, title: "Last updated" },
        company: { type: ControlType.String, title: "Company" },
        email: { type: ControlType.String, title: "Email" },
        address: { type: ControlType.String, title: "Mailing address", displayTextArea: true },
    })
    return { default: LegalPage }
})()

// ═══════════════ EscapeSite: the whole site in one component ═══════════════
const PathGate = __PathGate.default
const SiteNav = __SiteNav.default
const SiteFooter = __SiteFooter.default

type PageKey = "gate" | "home" | "lucille" | "community" | "pricing" | "innerverse" | "beta" | "demo" | "privacy" | "terms" | "cookies"
const SITE_PAGES: Record<string, { key: PageKey; body: any; nav: string; props?: any; title: string }> = {
    "/home": { key: "home", body: __HomePage.default, nav: "home", title: "Escape · Your Everyday Escape" },
    "/lucille-ai": { key: "lucille", body: __LucillePage.default, nav: "lucille", title: "Lucille AI · Escape" },
    "/community": { key: "community", body: __CommunityPage.default, nav: "community", title: "Community · Escape" },
    "/pricing": { key: "pricing", body: __PricingPage.default, nav: "pricing", title: "Pricing · Escape" },
    "/innerverse": { key: "innerverse", body: __InnerversePage.default, nav: "innerverse", title: "Innerverse · Escape" },
    "/app-testing": { key: "beta", body: __BetaPage.default, nav: "beta", title: "App Testing · Escape" },
    "/app-demo": { key: "demo", body: __DemoPage.default, nav: "demo", title: "App Demo · Escape" },
    "/privacy-policy": { key: "privacy", body: __LegalPage.default, nav: "legal", props: { doc: "privacy" }, title: "Privacy Policy · Escape" },
    "/terms": { key: "terms", body: __LegalPage.default, nav: "legal", props: { doc: "terms" }, title: "Terms of Service · Escape" },
    "/cookie-policy": { key: "cookies", body: __LegalPage.default, nav: "legal", props: { doc: "cookies" }, title: "Cookie Policy · Escape" },
}
const PATH_OF: Record<PageKey, string> = { gate: "/", home: "/home", lucille: "/lucille-ai", community: "/community", pricing: "/pricing", innerverse: "/innerverse", beta: "/app-testing", demo: "/app-demo", privacy: "/privacy-policy", terms: "/terms", cookies: "/cookie-policy" }
const defaults = (C: any) => (C && C.defaultProps) || {}

function readRoute(fallback: string) {
    if (!isBrowser) return { path: fallback, anchor: "" }
    const h = window.location.hash.replace(/^#/, "")
    if (!h.startsWith("/")) return { path: fallback, anchor: h }
    const [path, anchor] = h.split("#")
    return { path: path || "/", anchor: anchor || "" }
}

interface SiteProps {
    startPage: PageKey
    gateFirst: boolean
    pageTitles: boolean
}

/**
 * The entire Escape website in one component: orb gate, nav, every page, footer.
 * Pages are hash routes (escapeapp.ai/#/home, /#/lucille-ai …), so it all lives on one Framer page.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 900
 */
export default function EscapeSite(p: SiteProps) {
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const start = p.gateFirst ? "/" : PATH_OF[p.startPage] || "/home"
    const [r, setR] = React.useState(() => (onCanvas ? { path: PATH_OF[p.startPage] || "/", anchor: "" } : readRoute(start)))

    // canvas preview follows the "Show page" control
    React.useEffect(() => { if (onCanvas) setR({ path: PATH_OF[p.startPage] || "/", anchor: "" }) }, [onCanvas, p.startPage])

    React.useEffect(() => {
        if (onCanvas || !isBrowser) return
        const root = document.documentElement
        const go = (href: string) => {
            if (/^(https?:|mailto:|tel:)/.test(href)) { window.open(href, "_blank", "noopener"); return }
            if (href.startsWith("#") && !href.startsWith("#/")) { document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" }); return }
            const target = href.replace(/^#/, "")
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
            if (reduce || root.classList.contains("esc-leaving")) { window.location.hash = target; return }
            root.classList.add("esc-leaving")
            window.setTimeout(() => { window.location.hash = target; requestAnimationFrame(() => root.classList.remove("esc-leaving")) }, 450)
        }
        ;(window as any).__escapeNavigate = go
        // every <a href="/home"> or "#section" inside the site routes inside this component
        const onClick = (e: MouseEvent) => {
            const a = (e.target as HTMLElement)?.closest?.("a") as HTMLAnchorElement | null
            if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return
            const href = a.getAttribute("href") || ""
            const internal = (href.startsWith("/") && !href.startsWith("//") && (href === "/" || SITE_PAGES[href.split("#")[0]])) || (href.startsWith("#") && href.length > 1)
            if (internal) { e.preventDefault(); go(href) }
        }
        const onHash = () => setR(readRoute(start))
        document.addEventListener("click", onClick)
        window.addEventListener("hashchange", onHash)
        return () => { document.removeEventListener("click", onClick); window.removeEventListener("hashchange", onHash); if ((window as any).__escapeNavigate === go) delete (window as any).__escapeNavigate }
    }, [onCanvas, start])

    React.useEffect(() => {
        if (onCanvas || !isBrowser) return
        if (r.anchor) window.setTimeout(() => document.getElementById(r.anchor)?.scrollIntoView({ behavior: "smooth" }), 120)
        else window.scrollTo(0, 0)
        if (p.pageTitles) document.title = r.path === "/" ? "Escape · How are you arriving today?" : SITE_PAGES[r.path]?.title || "Escape"
    }, [r.path, r.anchor, onCanvas, p.pageTitles])

    const css = `html{scroll-behavior:smooth}.esc-site{position:relative;width:100%;min-width:0;overflow-x:clip;background:#0B1230;transition:opacity .45s cubic-bezier(.22,.61,.36,1)}html.esc-leaving .esc-site{opacity:0}@media (prefers-reduced-motion:reduce){.esc-site{transition:none}html{scroll-behavior:auto}}.esc-site-gate{min-height:100vh;min-height:100svh}`

    if (r.path === "/" || !SITE_PAGES[r.path]) {
        return (
            <div className="esc-site esc-site-gate">
                <style>{css}</style>
                <PathGate {...defaults(PathGate)} />
            </div>
        )
    }
    const P = SITE_PAGES[r.path]
    const Body = P.body
    return (
        <div className="esc-site" key={r.path}>
            <style>{css}</style>
            <div style={{ position: onCanvas ? "absolute" : "fixed", top: 0, left: 0, right: 0, zIndex: 20 }}>
                <SiteNav {...defaults(SiteNav)} current={P.nav} />
            </div>
            <main>
                <Body {...defaults(Body)} {...(P.props || {})} />
            </main>
            <SiteFooter {...defaults(SiteFooter)} />
        </div>
    )
}

EscapeSite.defaultProps = { startPage: "home", gateFirst: true, pageTitles: true }

addPropertyControls(EscapeSite, {
    gateFirst: { type: ControlType.Boolean, title: "Start at orb gate", defaultValue: true, enabledTitle: "Yes", disabledTitle: "No" },
    startPage: {
        type: ControlType.Enum, title: "Show page", defaultValue: "home",
        description: "The page shown on the canvas, and the first page when the orb gate is off.",
        options: ["gate", "home", "lucille", "community", "pricing", "innerverse", "beta", "demo", "privacy", "terms", "cookies"],
        optionTitles: ["Orb gate", "Home", "Lucille AI", "Community", "Pricing", "Innerverse", "App testing (beta)", "App demo", "Privacy", "Terms", "Cookies"],
    },
    pageTitles: { type: ControlType.Boolean, title: "Tab titles", defaultValue: true, enabledTitle: "Per page", disabledTitle: "Framer's" },
})
