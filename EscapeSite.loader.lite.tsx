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
