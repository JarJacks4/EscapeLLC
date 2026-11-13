// Escape website: the one Framer code file (name it EscapeSite).
// It loads the site bundle (media/site/escape-site.js in the Escape media bucket) and renders it.
// It also carries the text of every page, so the HTML Framer publishes has real headings, paragraphs
// and links before any JavaScript runs. Search engines and AI crawlers that do not run JavaScript
// read that text, and it is what shows if scripts are blocked or the bundle fails to load.
// The text is generated from the site source (EscapeLLC/geo). Text built: 2026-11-13 (lite: legal pages carry their title and summary only)
import * as React from "react"
import * as JSX from "react/jsx-runtime"
import * as Framer from "framer"
import * as Motion from "framer-motion"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const BUNDLE = "https://storage.googleapis.com/escape-self-care-505618-escape-media/web/site/escape-site.js"

// Every page's text: "key<TAB>html" lines, ASCII only, raw-deflated, base64. unpack() reads it back.
const PACKED = 
    "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"
const NAV = "<nav aria-label=\"Escape pages\"><a href=\"/\">Home</a> &#183; <a href=\"/lucille-ai\">Lucille AI</a> &#183; <a href=\"/community\">Marketplace</a> &#183; <a href=\"/pricing\">Pricing</a> &#183; <a href=\"/innerverse\">Innerverse</a> &#183; <a href=\"/beta-test\">App testing</a> &#183; <a href=\"/demo-app\">App demo</a></nav>"
const FOOT = "<footer><p><a href=\"/privacy-policy\">Privacy Policy</a> &#183; <a href=\"/consumer-health-data\">Consumer Health Data</a> &#183; <a href=\"/terms\">Terms of Service</a> &#183; <a href=\"/safety\">Safety</a> &#183; <a href=\"/cookie-policy\">Cookie Policy</a> &#183; <a href=\"/delete-account\">Delete your account</a></p><p><a href=\"https://discord.gg/WnASA2SfA\">Discord</a> &#183; <a href=\"https://escape-influencer.web.app/\">Influencer program</a> &#183; <a href=\"https://www.indiegogo.com/\">Back us on Indiegogo</a> &#183; <a href=\"mailto:hello@escapeapp.ai\">Contact</a> &#183; <a href=\"https://www.instagram.com/escapeselfcare\">Instagram</a> &#183; <a href=\"https://www.tiktok.com/@escapeselfcare\">TikTok</a> &#183; <a href=\"https://www.facebook.com/profile.php?id=61596011750533\">Facebook</a> &#183; <a href=\"https://www.linkedin.com/company/escapeappai/\">LinkedIn</a></p><p>Escape is a self-care app from Escape Enterprises LLC. It is not therapy or medical care.</p></footer>"

// Public paths -> page. Both the Framer page names and the site's own route names are listed.
const PATH_KEY: Record<string, string> = {
    "/": "home", "/home": "home", "/lucille-ai": "lucille", "/community": "marketplace", "/marketplace": "marketplace",
    "/pricing": "pricing", "/innerverse": "innerverse", "/beta-test": "beta", "/app-testing": "beta",
    "/demo-app": "demo", "/app-demo": "demo", "/privacy-policy": "privacy", "/consumer-health-data": "health",
    "/terms": "terms", "/safety": "safety", "/delete-account": "deleteAccount", "/cookie-policy": "cookies",
}
const cleanPath = (s: any) => (typeof s === "string" ? s.replace(/[?#].*$/, "").replace(/\/+$/, "") || "/" : "")

// ---- unpack: base64 -> raw inflate (RFC 1951) -> text. No browser or Node APIs, so it also runs when Framer pre-renders the page. ----
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
const LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258]
const LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
const DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577]
const DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
const CLORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]

const B64T: number[] = []
for (let i = 0; i < 64; i++) B64T[B64.charCodeAt(i)] = i

function unpack(s: string): string {
    const src: number[] = []
    let acc = 0, nb = 0
    for (let i = 0; i < s.length; i++) {
        const v = B64T[s.charCodeAt(i)]
        if (v === undefined) continue
        acc = (acc << 6) | v; nb += 6
        if (nb >= 8) { nb -= 8; src.push((acc >> nb) & 255); acc &= (1 << nb) - 1 }
    }
    let pos = 0, buf = 0, cnt = 0
    const out: number[] = []
    const bits = (n: number) => {
        while (cnt < n) {
            if (pos >= src.length) throw new Error("short")
            buf |= src[pos++] << cnt; cnt += 8
        }
        const v = buf & ((1 << n) - 1)
        buf >>>= n; cnt -= n
        return v
    }
    const table = (lens: number[]) => {
        const count: number[] = [], offs: number[] = [], symbol: number[] = []
        for (let i = 0; i < 16; i++) count[i] = 0
        for (let i = 0; i < lens.length; i++) count[lens[i]]++
        count[0] = 0
        offs[0] = 0; offs[1] = 0
        for (let i = 1; i < 15; i++) offs[i + 1] = offs[i] + count[i]
        for (let i = 0; i < lens.length; i++) if (lens[i]) symbol[offs[lens[i]]++] = i
        return { count, symbol }
    }
    const decode = (h: { count: number[]; symbol: number[] }) => {
        let code = 0, first = 0, index = 0
        for (let len = 1; len <= 15; len++) {
            if (cnt === 0) {
                if (pos >= src.length) throw new Error("short")
                buf = src[pos++]; cnt = 8
            }
            code |= buf & 1; buf >>>= 1; cnt--
            const c = h.count[len]
            if (code - c < first) return h.symbol[index + (code - first)]
            index += c; first += c; first <<= 1; code <<= 1
        }
        throw new Error("code")
    }
    let last = 0
    do {
        last = bits(1)
        const type = bits(2)
        if (type === 0) {
            buf = 0; cnt = 0
            if (pos + 4 > src.length) throw new Error("short")
            const len = src[pos] | (src[pos + 1] << 8)
            pos += 4
            if (pos + len > src.length) throw new Error("short")
            for (let i = 0; i < len; i++) out.push(src[pos++])
        } else if (type === 1 || type === 2) {
            let lit, dist
            if (type === 1) {
                const l: number[] = []
                for (let i = 0; i < 288; i++) l[i] = i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8
                const d: number[] = []
                for (let i = 0; i < 30; i++) d[i] = 5
                lit = table(l); dist = table(d)
            } else {
                const nlen = bits(5) + 257, ndist = bits(5) + 1, ncode = bits(4) + 4
                const cl: number[] = []
                for (let i = 0; i < 19; i++) cl[i] = 0
                for (let i = 0; i < ncode; i++) cl[CLORDER[i]] = bits(3)
                const ch = table(cl)
                const lens: number[] = []
                while (lens.length < nlen + ndist) {
                    const sym = decode(ch)
                    if (sym < 16) lens.push(sym)
                    else {
                        let prev = 0, rep = 0
                        if (sym === 16) { if (!lens.length) throw new Error("rep"); prev = lens[lens.length - 1]; rep = 3 + bits(2) }
                        else if (sym === 17) rep = 3 + bits(3)
                        else rep = 11 + bits(7)
                        while (rep--) lens.push(prev)
                    }
                }
                lit = table(lens.slice(0, nlen)); dist = table(lens.slice(nlen, nlen + ndist))
            }
            for (;;) {
                const sym = decode(lit)
                if (sym < 256) out.push(sym)
                else if (sym === 256) break
                else {
                    const k = sym - 257
                    if (k > 28) throw new Error("len")
                    const len = LBASE[k] + bits(LEXT[k])
                    const ds = decode(dist)
                    if (ds > 29) throw new Error("dist")
                    const start = out.length - (DBASE[ds] + bits(DEXT[ds]))
                    if (start < 0) throw new Error("far")
                    for (let j = 0; j < len; j++) out.push(out[start + j])
                }
            }
        } else throw new Error("type")
    } while (!last)
    let text = ""
    for (let i = 0; i < out.length; i += 4096) text += String.fromCharCode.apply(null, out.slice(i, i + 4096) as any)
    return text
}

let pages: Record<string, string> | null = null
/** The readable HTML for one page: its text, then the site links. Empty if anything goes wrong. */
function pageHtml(key: string): string {
    if (!pages) {
        pages = {}
        try {
            for (const line of unpack(PACKED).split("\n")) { const i = line.indexOf("\t"); if (i > 0) pages[line.slice(0, i)] = line.slice(i + 1) }
        } catch (e) { pages = {} }
    }
    const body = pages[key] || pages.home
    return body ? "<main>" + body + "</main>" + NAV + FOOT : ""
}

/** True in the browser when the published HTML already holds the page text (Framer pre-rendered it). */
function textAlreadyInPage(): boolean {
    try {
        const el = typeof document !== "undefined" ? document.querySelector(".esc-pre-text") : null
        return !!(el && el.firstChild)
    } catch (e) { return false }
}

const CSS =
    ".esc-pre{width:100%;background:#0B1230;color:#E6EAF4;font:16px/1.6 system-ui,-apple-system,'Segoe UI',sans-serif;-webkit-text-size-adjust:100%}" +
    ".esc-pre-cover{min-height:100vh;display:grid;place-items:center;font-size:14px}" +
    ".esc-pre-text{box-sizing:border-box;max-width:760px;margin:0 auto;padding:40px 20px 72px}" +
    ".esc-pre-text h1{font-size:32px;line-height:1.2;margin:8px 0 14px;font-weight:600}" +
    ".esc-pre-text h2{font-size:23px;line-height:1.3;margin:36px 0 10px;font-weight:600}" +
    ".esc-pre-text h3{font-size:18px;line-height:1.35;margin:22px 0 6px;font-weight:600}" +
    ".esc-pre-text p,.esc-pre-text ul,.esc-pre-text ol{margin:0 0 12px}" +
    ".esc-pre-text ul,.esc-pre-text ol{padding-left:22px}" +
    ".esc-pre-text li{margin:0 0 4px}" +
    ".esc-pre-text a{color:#F2D79B;text-decoration:underline}" +
    ".esc-pre-text nav,.esc-pre-text footer{font-size:14px;line-height:1.9;margin-top:36px;padding-top:18px;border-top:1px solid rgba(230,234,244,.18)}" +
    ".esc-pre-note{box-sizing:border-box;max-width:760px;margin:0 auto;padding:24px 20px 0;font-size:14px;opacity:.75}" +
    "@media (scripting:none){.esc-pre-cover{display:none!important}}"

interface SiteProps { startPage: string; gateFirst: boolean; pageTitles: boolean; bundleUrl: string }

let modP: Promise<any> | null = null
function load(url: string) {
    if (modP) return modP
    modP = new Promise((resolve, reject) => {
        const w = window as any
        if (w.__escapeSiteFactory) return resolve(w.__escapeSiteFactory(React, Framer, Motion, JSX))
        const s = document.createElement("script")
        s.src = url + (url.includes("?") ? "&" : "?") + "v=" + Math.floor(Date.now() / 3600000)
        s.async = true
        s.onload = () => (w.__escapeSiteFactory ? resolve(w.__escapeSiteFactory(React, Framer, Motion, JSX)) : reject(new Error("bundle loaded but no factory")))
        s.onerror = () => reject(new Error("could not load " + url))
        document.head.appendChild(s)
    })
    return modP
}

// Framer's own router, when it is there: it knows which page is being rendered, also while Framer pre-renders.
const useFramerRouter: any = (Framer as any).useRouter
const useFramerRouteId: any = (Framer as any).useCurrentRouteId
function useRoutePage(): string {
    let key = ""
    try {
        const router = typeof useFramerRouter === "function" ? useFramerRouter() : null
        const id = typeof useFramerRouteId === "function" ? useFramerRouteId() : router && router.currentRouteId
        const route = router && router.routes && id ? router.routes[id] : null
        key = PATH_KEY[cleanPath(route && route.path)] || ""
    } catch (e) { key = "" }
    return key
}

/** @framerSupportedLayoutWidth any @framerSupportedLayoutHeight any */
export default function EscapeSite(p: SiteProps) {
    const [Site, setSite] = React.useState<any>(null)
    const [err, setErr] = React.useState("")
    const routePage = useRoutePage()
    const [inPage] = React.useState(textAlreadyInPage)
    React.useEffect(() => {
        let on = true
        load(p.bundleUrl || BUNDLE).then((m) => { if (on) setSite(() => m.default) }, (e) => { if (on) setErr(String((e && e.message) || e)) })
        return () => { on = false }
    }, [p.bundleUrl])
    const canvas = RenderTarget.current() === RenderTarget.canvas
    if (Site) {
        // The address decides the page: a component left on "Home" still shows Pricing on /pricing, and the orb gate only opens the home page.
        const here = canvas || typeof window === "undefined" ? "" : cleanPath(window.location.pathname)
        const fromPath = here && here !== "/" ? PATH_KEY[here] : ""
        const page = fromPath || p.startPage
        const gate = fromPath ? false : p.gateFirst && (canvas || page === "home" || page === "gate")
        return <Site startPage={page} gateFirst={gate} pageTitles={p.pageTitles} />
    }
    if (canvas) {
        return (
            <div style={{ minHeight: 320, width: "100%", background: "#0B1230", color: "#E6EAF4", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", fontSize: 14 }}>
                {err ? <span>Escape site did not load: {err}</span> : <span style={{ opacity: 0.5 }}>Escape</span>}
            </div>
        )
    }
    const key = routePage && routePage !== "home" ? routePage : p.startPage === "gate" ? "home" : p.startPage
    // When Framer has already put the text in the published HTML, leave it as it is: the browser does not need to unpack it again.
    const html = inPage && !err ? "" : pageHtml(key)
    return (
        <div className="esc-pre">
            <style dangerouslySetInnerHTML={{ __html: CSS }} />
            <noscript dangerouslySetInnerHTML={{ __html: "<style>.esc-pre-cover{display:none!important}</style>" }} />
            {err
                ? <p className="esc-pre-note">The full Escape site did not load, so this is the text version of the page. Reload to try again.</p>
                : <div className="esc-pre-cover"><span style={{ opacity: 0.5 }}>Escape</span></div>}
            <div className="esc-pre-text" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}

EscapeSite.defaultProps = { startPage: "home", gateFirst: true, pageTitles: true, bundleUrl: BUNDLE }
addPropertyControls(EscapeSite, {
    gateFirst: { type: ControlType.Boolean, title: "Start at orb gate", defaultValue: true, enabledTitle: "Yes", disabledTitle: "No", description: "Only the home page opens with the orb gate. Other pages ignore this." },
    startPage: {
        type: ControlType.Enum, title: "Show page", defaultValue: "home",
        description: "Set this to the page this Framer page is. It picks the text that search engines read, the page on the canvas, and the first page when the orb gate is off.",
        options: ["gate", "home", "lucille", "marketplace", "pricing", "innerverse", "beta", "demo", "privacy", "health", "terms", "safety", "deleteAccount", "cookies"],
        optionTitles: ["Orb gate", "Home", "Lucille AI", "Marketplace", "Pricing", "Innerverse", "App testing (beta)", "App demo", "Privacy", "Health data", "Terms", "Safety", "Delete account", "Cookies"],
    },
    pageTitles: { type: ControlType.Boolean, title: "Tab titles", defaultValue: true, enabledTitle: "Per page", disabledTitle: "Framer's" },
    bundleUrl: { type: ControlType.String, title: "Bundle URL", defaultValue: BUNDLE },
})
