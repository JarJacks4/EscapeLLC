// Escape website: the one Framer code file (name it EscapeSite).
// It loads the site bundle (media/site/escape-site.js in the Escape media bucket) and renders it.
// It also carries the text of every page, so the HTML Framer publishes has real headings, paragraphs
// and links before any JavaScript runs. Search engines and AI crawlers that do not run JavaScript
// read that text, and it is what shows if scripts are blocked or the bundle fails to load.
// The text is generated from the site source (EscapeLLC/geo). Text built: 2026-11-12
import * as React from "react"
import * as JSX from "react/jsx-runtime"
import * as Framer from "framer"
import * as Motion from "framer-motion"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const BUNDLE = "https://storage.googleapis.com/escape-self-care-505618-escape-media/web/site/escape-site.js"

// Every page's text: "key<TAB>html" lines, ASCII only, raw-deflated, base64. unpack() reads it back.
const PACKED = 
    "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" +
    "Qn2i3vX/lyDr/wE="
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
