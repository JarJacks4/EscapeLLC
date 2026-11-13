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
    "Ks7QjRhKIF5I4hTfmzg5nWEFtFCfKKP9/yXI+n8="
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
