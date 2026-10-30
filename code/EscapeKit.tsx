// Escape — shared kit for the Framer site (tokens, mood store, orb, primitives).
//
// Same system as the Escape v6 app:
//   * Gilda Display (display) + Work Sans (UI)
//   * six moods with the app's own hues and TouchDesigner Mood Orb loops (Firebase Storage)
//   * night is the default tone; the sun/moon toggle switches to day (like the Home orb)
//   * text passes WCAG 2.2 AA on every surface; never pure #000 / #FFF fields
//   * motion: 520 ms, ease (0.25, 0.6, 0.25, 1), 1.8 % rise, honors prefers-reduced-motion
//
// Every Escape component imports from this file. It is a module, not a canvas component.
// The chosen mood + tone live in one small store (localStorage "escape.site.v1"), and are
// mirrored to CSS variables on <html>, so Framer-native layers can use them too:
//   var(--esc-accent)  var(--esc-ink)  var(--esc-bg)  var(--esc-glowA)  var(--esc-glowB) …
import * as React from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"

// ───────────────────────── moods ─────────────────────────

export type MoodId = "calm" | "energized" | "focused" | "restless" | "tired" | "low"
export type Tone = "dark" | "light"

export interface Mood {
    id: MoodId
    label: string
    line: string
    hue: string // the orb / chip color (v6MoodHue)
    accentDark: string // ≥ 3:1 on night fields
    accentLight: string // ≥ 4.5:1 on day fields (also used for link text there)
    base: [string, string, string] // the app's mood gradient (dark, contrast-fitted)
    glowA: string
    glowB: string
    loop: string // orb loop id in Firebase Storage
}

export const MOODS: Mood[] = [
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
    { id: "low", label: "Low", line: "Heavy, a little gray", hue: "#7D8BB5", accentDark: "#C9D1EE", accentLight: "#4A5884",
      base: ["#3A4675", "#232C55", "#141A33"], glowA: "rgba(169,179,214,.40)", glowB: "rgba(57,81,159,.50)", loop: "escape_calm_e15_t85_v3" },
]

export const NEUTRAL_LOOP = "escape_picks_e50_t50_v3"
export const moodById = (id?: MoodId | null) => MOODS.find((m) => m.id === id) || null

export const ORB_STORAGE =
    "https://firebasestorage.googleapis.com/v0/b/escape-self-care-505618.firebasestorage.app/o/visuals%2Fv3%2F"
export const orbVideo = (loop: string) => `${ORB_STORAGE}${loop}_720_h264.mp4?alt=media`
export const orbPoster = (loop: string) => `${ORB_STORAGE}${loop}_poster.webp?alt=media`

/** The seven energy centers (Energy Scan). One opens every 1,000 lifetime coins. */
export const CENTERS = [
    { name: "Grounding", color: "#E5484D" },
    { name: "Creativity", color: "#EF7702" },
    { name: "Power", color: "#F5C542" },
    { name: "Connection", color: "#39D9C1" },
    { name: "Expression", color: "#4CF6F6" },
    { name: "Intuition", color: "#8E7CD9" },
    { name: "Purpose", color: "#B9A3F0" },
]

/** Real coin rules from the Escape API (escape_api/core.py COIN_RULES). Keep in sync. */
export const COIN_RULES = [
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
export const API_BASE = "https://lucille-861854898360.us-central1.run.app"

/** POST to a public endpoint with a timeout. Never throws: { ok, status, data }. */
export async function postPublic(path: string, body: unknown, timeoutMs = 15000): Promise<{ ok: boolean; status: number; data: any }> {
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

export const LINKS = {
    discord: "https://discord.gg/WnASA2SfA",
    influencers: "https://escape-influencer.web.app/",
    maze: "https://t.maze.co/513528542",
    betaForm: "https://forms.gle/yLFiaTAdeg37AhJC6",
    // Indiegogo campaign (Ben, Oct 29). Replace with the live campaign URL when it opens.
    indiegogo: "https://www.indiegogo.com/",
    tiktok: "https://www.tiktok.com/@escapeselfcare",
    instagram: "https://www.instagram.com/escapeselfcare",
    facebook: "https://www.facebook.com/profile.php?id=61596011750533",
    linkedin: "https://www.linkedin.com/company/escapeappai/",
}

// ───────────────────────── analytics (Meta Pixel, with consent) ─────────────────────────
//
// Noah's Meta Pixel (Business Suite) tracks visits, beta sign-ups and Discord clicks. It loads
// only after the visitor accepts it in the consent bar (the Cookie Policy says so), because the
// pixel is a cross-site tracker. Until then every track() call is a no-op.

export const PIXEL_ID = "1685481716363748"
const CONSENT_KEY = "escape.consent.v1"
export type Consent = "accepted" | "declined" | null
export function readConsent(): Consent {
    if (!isBrowser) return null
    try { const v = window.localStorage.getItem(CONSENT_KEY); return v === "accepted" || v === "declined" ? v : null } catch { return null }
}
export function writeConsent(c: Exclude<Consent, null>) {
    try { window.localStorage.setItem(CONSENT_KEY, c) } catch {}
    if (c === "accepted") loadPixel()
}
let pixelLoaded = false
export function loadPixel(id: string = PIXEL_ID) {
    if (!isBrowser || pixelLoaded || !id) return
    pixelLoaded = true
    const w = window as any
    if (!w.fbq) {
        const n: any = (w.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) })
        if (!w._fbq) w._fbq = n
        n.push = n; n.loaded = true; n.version = "2.0"; n.queue = []
        const t = document.createElement("script"); t.async = true; t.src = "https://connect.facebook.net/en_US/fbevents.js"
        document.head.appendChild(t)
    }
    w.fbq("init", id)
    w.fbq("track", "PageView")
}
/** Standard events: "PageView" | "Lead" (beta application sent) | "Contact" (Discord). Anything else is a custom event. */
export function track(event: string, params?: Record<string, unknown>) {
    if (!isBrowser) return
    const w = window as any
    if (typeof w.fbq !== "function") return
    const std = ["PageView", "Lead", "Contact", "CompleteRegistration", "ViewContent", "Subscribe"]
    w.fbq(std.includes(event) ? "track" : "trackCustom", event, params || {})
}
/** Loads the pixel on mount when consent was given earlier, and counts a page view on each route change. */
export function useAnalytics(path: string) {
    React.useEffect(() => { if (readConsent() === "accepted") loadPixel() }, [])
    const first = React.useRef(true)
    React.useEffect(() => {
        if (first.current) { first.current = false; return }
        track("PageView")
    }, [path])
}

/** The consent bar: shown once until the visitor picks. Decline is as easy as accept. */
export function ConsentBar(p: { policyHref: string }) {
    const [c, setC] = React.useState<Consent>("declined")
    React.useEffect(() => { setC(readConsent()) }, [])
    if (c) return null
    const pick = (v: Exclude<Consent, null>) => { writeConsent(v); setC(v) }
    return (
        <div className="esc-consent" role="region" aria-label="Cookies and analytics">
            <p className="esc-small" style={{ margin: 0 }}>We use the Meta Pixel to see which pages lead people to the beta. Only if you say yes. No ads in Escape, ever. <a className="esc-link" href={p.policyHref}>Cookie Policy</a></p>
            <div className="esc-row" style={{ gap: 8, flexWrap: "nowrap" }}>
                <button type="button" className="esc-btn esc-btn-g esc-btn-sm" onClick={() => pick("declined")}>No thanks</button>
                <button type="button" className="esc-btn esc-btn-p esc-btn-sm" onClick={() => pick("accepted")}>Okay</button>
            </div>
        </div>
    )
}

// ───────────────────────── routes ─────────────────────────

export const ROUTES = {
    gate: "/",
    home: "/home",
    lucille: "/lucille-ai",
    marketplace: "/marketplace",
    pricing: "/pricing",
    innerverse: "/innerverse",
    beta: "/app-testing",
    demo: "/app-demo",
    privacy: "/privacy-policy",
    health: "/consumer-health-data",
    safety: "/safety",
    deleteAccount: "/delete-account",
    terms: "/terms",
    cookies: "/cookie-policy",
}

/** The orb gate: each mood tints the site and opens the part of it that fits that feeling. */
export const MOOD_PATHS: Record<MoodId, { title: string; line: string; href: string }> = {
    calm: { title: "Slow down", line: "Start with the whole of Escape", href: ROUTES.home },
    focused: { title: "Talk it through", line: "Meet Lucille, your companion", href: ROUTES.lucille },
    energized: { title: "Grow and earn", line: "Coins, levels and rewards", href: ROUTES.marketplace },
    restless: { title: "See it move", line: "Watch the app in action", href: ROUTES.demo },
    tired: { title: "Drift somewhere", line: "Preview the 3D Innerverse", href: ROUTES.innerverse },
    low: { title: "Start gently", line: "One small step, at your pace", href: ROUTES.home },
}

/** Go to a page. On the Framer site this is a normal navigation; the standalone HTML preview
 *  installs window.__escapeNavigate so the same components work inside one file. */
export function navigate(href: string) {
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

export const escape = {
    get: () => state,
    setMood: (mood: MoodId | null) => commit({ ...state, mood }),
    setTone: (tone: Tone) => commit({ ...state, tone }),
    toggleTone: () => commit({ ...state, tone: state.tone === "dark" ? "light" : "dark" }),
}

const SERVER_STATE: EscState = { mood: null, tone: "dark" }
export function useEscape(): EscState {
    return React.useSyncExternalStore(
        (f) => { subs.add(f); return () => { subs.delete(f) } },
        () => state,
        () => SERVER_STATE
    )
}

// ───────────────────────── tokens → CSS variables ─────────────────────────

export function tokens(s: EscState) {
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
export const ease = [0.25, 0.6, 0.25, 1] as const
/** Slower, softer curve for arrivals and reveals (serene). */
export const easeSoft = [0.22, 0.61, 0.36, 1] as const

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
.esc-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:60;margin:0 auto;max-width:720px;display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:14px 18px;border-radius:20px;border:1px solid var(--esc-border);background:color-mix(in srgb,var(--esc-bg) 92%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 18px 48px rgba(0,0,0,.28)}
.esc-consent p{flex:1 1 320px}
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
export function useEscapeSetup() {
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
export function useTokenStyle(): React.CSSProperties {
    const s = useEscapeSetup()
    return tokens(s) as React.CSSProperties
}

/** The CSS above as a <style> tag, for the first server-rendered paint. */
export function EscapeStyle() {
    return <style dangerouslySetInnerHTML={{ __html: CSS }} />
}

// ───────────────────────── primitives ─────────────────────────

/** Rise-and-fade on scroll (the app's 1.8 % rise, 520 ms). */
export function Reveal(props: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties; as?: "div" | "li" | "section" }) {
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

export function Eyebrow(props: { children: React.ReactNode; dot?: boolean }) {
    return (
        <span className="esc-chip">
            {props.dot !== false && <span className="esc-dot" aria-hidden />}
            {props.children}
        </span>
    )
}

export function Button(props: { href?: string; children: React.ReactNode; variant?: "primary" | "ghost"; small?: boolean; onClick?: () => void; arrow?: boolean; icon?: React.ReactNode; ariaLabel?: string; newTab?: boolean }) {
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

export function SectionHead(props: { eyebrow?: string; title: React.ReactNode; lede?: React.ReactNode; center?: boolean; max?: number }) {
    return (
        <Reveal className={`esc-stack ${props.center ? "esc-center" : ""}`} style={{ gap: 18, alignItems: props.center ? "center" : "flex-start", maxWidth: props.max || 760, marginBottom: "clamp(36px,4.5cqi,56px)" }}>
            {props.eyebrow && <Eyebrow>{props.eyebrow}</Eyebrow>}
            <h2 className="esc-d esc-h2">{props.title}</h2>
            {props.lede && <p className="esc-lede" style={{ marginLeft: props.center ? "auto" : 0, marginRight: props.center ? "auto" : 0 }}>{props.lede}</p>}
        </Reveal>
    )
}

export function Card(props: { children: React.ReactNode; className?: string; style?: React.CSSProperties; delay?: number; glow?: boolean }) {
    return (
        <Reveal delay={props.delay} className={`esc-glass esc-card esc-lift ${props.glow !== false ? "esc-glow" : ""} ${props.className || ""}`} style={props.style}>
            {props.children}
        </Reveal>
    )
}

export function Feature(props: { icon: IconName; title: string; body: string; soon?: boolean; delay?: number; children?: React.ReactNode }) {
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
export function Backdrop(props: { intensity?: number; top?: boolean }) {
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
 *  * clipped to a circle with a hairline border, the loop centered on the sphere (the sphere sits
 *    ~5.5 % above the middle of the 720×1280 loops, so the crop is shifted to it)
 *  * re-colored with the mood's hue using a `color` blend, which keeps the orb's light and
 *    texture and swaps only its hue, so each of the six moods reads as its own orb
 *  * a two-layer glow in the same hue (tight halo + wide bloom)
 *  * color, glow and loop cross-fade (600 ms) when the mood changes; breathes on a 3 s pulse
 */
export function Orb(props: { mood?: MoodId | null; size?: number | string; live?: boolean; eager?: boolean; glow?: boolean; breathe?: boolean; rings?: boolean; label?: string; style?: React.CSSProperties; tint?: string | null; warm?: boolean; hero?: boolean }) {
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
                {/* clip-path + mask as well as border-radius: Safari and some GPUs skip the rounded
                    overflow clip on <video> and blended layers, which showed the loop's square frame
                    behind the sphere (Noah, Oct 28). */}
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", isolation: "isolate",
                    clipPath: "circle(50% at 50% 50%)",
                    /* The orb frames are rendered on a deep navy background and the sphere fills 90 % of
                       the frame, so a hard circle clip still showed a navy ring or, when the clip was
                       skipped, the whole square (Noah, Oct 28; the app had the same bug). The mask fades
                       the frame out just past the sphere's edge instead: nothing of the background shows. */
                    WebkitMaskImage: "radial-gradient(circle closest-side, #000 78%, rgba(0,0,0,0) 88%)", maskImage: "radial-gradient(circle closest-side, #000 78%, rgba(0,0,0,0) 88%)",
                    boxShadow: shadow, transition: "box-shadow .6s var(--esc-ease)" }}>
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

/** Where the sphere sits in each loop (center x/y as a fraction of the frame, diameter as a
 *  fraction of its width), measured from the TouchDesigner renders. Used to fit every sphere to
 *  90 % of its circle, dead center. */
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
export const MEDIA_BASE = "https://storage.googleapis.com/escape-self-care-505618-escape-media/web/"
export let ORB_FALLBACK_BASE = MEDIA_BASE + "orbs/"
/** Flip to true once the H.264 copies (…_720_h264.mp4) are uploaded to Firebase Storage. */
export const ORB_HAS_H264 = true
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
    // A standalone preview (window.__escapeOrbFallback) can't reach Firebase: use the local
    // poster of the offline loop. A poster that fails to load is hidden, never a broken-image box.
    const localPoster = isBrowser && (window as any).__escapeOrbFallback
    const [posterOk, setPosterOk] = React.useState(true)
    return (
        <>
            {posterOk && (
                <img src={localPoster ? `${fb}escape_${grid}_e50_t50_v3_540_offline_poster.webp` : orbPoster(loop)} alt="" draggable={false}
                    style={fitStyle(localPoster ? `offline_${grid}` : loop)} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setPosterOk(false)} />
            )}
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
export function launchOrb(el: Element | null, mood: MoodId | null) {
    if (!el || !isBrowser) return
    const r = el.getBoundingClientRect()
    try { sessionStorage.setItem(FLIGHT_KEY, JSON.stringify({ mood, x: r.left, y: r.top, s: r.width, at: Date.now() })) } catch {}
}

/**
 * Lands the orb on the next page: it appears exactly where it left the last page and glides into
 * this page's hero orb ([data-esc-hero]) or the nav orb, then hands over seamlessly. Rendered by
 * SiteNav, so it runs on every page.
 */
export function FlightOrb() {
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

/** ESCAPE wordmark — the exact Lottie from the app splash (5 s fade-in), recolored. */
export function Wordmark(props: { color?: string; width?: number | string; play?: boolean; label?: boolean }) {
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
            {/* the Lottie canvas is 512² with the wordmark centered; crop to the mark */}
            <div ref={ref} aria-hidden style={{ position: "absolute", left: "-5.7%", right: "-5.7%", top: "-152%", bottom: "-152%" }} />
            {failed && (
                <span className="esc-d" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: "calc(1em * 2.4)", letterSpacing: ".04em", color: props.color }}>ESCAPE</span>
            )}
        </div>
    )
}

/** First frame of the app splash, tiny, so the hero is never blank before the video loads. */
export const SPLASH_POSTER = "data:image/webp;base64,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"

// ───────────────────────── FAQ ─────────────────────────

export function Faq(props: { items: { q: string; a: React.ReactNode }[] }) {
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

export function StoreBadges(props: { appStoreUrl?: string; playUrl?: string }) {
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

export type IconName =
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

export function Icon({ name, size = 22, stroke = 1.6, style }: { name: IconName | "apple"; size?: number; stroke?: number; style?: React.CSSProperties }) {
    const filled = name === "play" || name === "apple" || name === "play-store"
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flex: "none", ...style }}>
            {name === "play" ? P.play : P[name === "apple" ? "apple" : name]}
        </svg>
    )
}

/** Wrapper every page/section component uses: tokens inline, global CSS, page background. */
export function Page(props: { children: React.ReactNode; className?: string; style?: React.CSSProperties; bare?: boolean }) {
    const t = useTokenStyle()
    return (
        <div className={`esc ${props.bare ? "" : "esc-page"} ${props.className || ""}`} style={{ ...t, ...props.style }}>
            <EscapeStyle />
            {props.children}
        </div>
    )
}

/** Gentle full-width call to action used at the end of most pages. */
export function ClosingCta(props: { eyebrow?: string; title: React.ReactNode; lede: string; primary: { label: string; href: string }; secondary?: { label: string; href: string }; badges?: boolean; appStoreUrl?: string; playUrl?: string }) {
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
                            {props.secondary && <Button href={props.secondary.href} variant="ghost" newTab={/^https?:/.test(props.secondary.href)} onClick={() => { if (/discord/i.test(props.secondary!.href)) track("Contact", { content_name: "discord", placement: "closing_cta" }) }}>{props.secondary.label}</Button>}
                        </div>
                        {props.badges && <div style={{ marginTop: 10 }}><StoreBadges appStoreUrl={props.appStoreUrl} playUrl={props.playUrl} /></div>}
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

export const DISCLAIMER =
    "Escape is a self-care and wellbeing app. It is not a medical device and does not diagnose, treat or replace professional care. If you are in crisis in the US, call or text 988; elsewhere, contact your local emergency number."
