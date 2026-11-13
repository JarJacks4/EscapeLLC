// Escape website: the one Framer code file (name it EscapeSite).
// It loads the site bundle (media/site/escape-site.js in the Escape media bucket) and renders it.
// It also carries the text of every page, so the HTML Framer publishes has real headings, paragraphs
// and links before any JavaScript runs. Search engines and AI crawlers that do not run JavaScript
// read that text, and it is what shows if scripts are blocked or the bundle fails to load.
// The text is generated from the site source (EscapeLLC/geo). Text built: 2026-11-13
import * as React from "react"
import * as JSX from "react/jsx-runtime"
import * as Framer from "framer"
import * as Motion from "framer-motion"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const BUNDLE = "https://storage.googleapis.com/escape-self-care-505618-escape-media/web/site/escape-site.js"

// Every page's text: "key<TAB>html" lines, ASCII only, raw-deflated, base64. unpack() reads it back.
const PACKED = 
    "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" +
    "hhKIF5I4xfcmTk5nWAEt1CfKaP9/CbL+Hw=="
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
