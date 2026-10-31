// Escape website: one small Framer code file. The site itself (14 components, 4,600 lines) is
// built into media/site/escape-site.js and served from the Escape media bucket, next to the orb
// loops and the demo audio. This file loads that bundle and renders it. To update the site,
// rebuild the bundle from EscapeLLC/code and re-upload it; this file never changes.
import * as React from "react"
import * as JSX from "react/jsx-runtime"
import * as Framer from "framer"
import * as Motion from "framer-motion"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const BUNDLE = "https://storage.googleapis.com/escape-self-care-505618-escape-media/web/site/escape-site.js"

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

/** @framerSupportedLayoutWidth any @framerSupportedLayoutHeight any */
export default function EscapeSite(p: SiteProps) {
    const [Site, setSite] = React.useState<any>(null)
    const [err, setErr] = React.useState("")
    React.useEffect(() => {
        let on = true
        load(p.bundleUrl || BUNDLE).then((m) => { if (on) setSite(() => m.default) }, (e) => { if (on) setErr(String((e && e.message) || e)) })
        return () => { on = false }
    }, [p.bundleUrl])
    if (Site) return <Site startPage={p.startPage} gateFirst={p.gateFirst} pageTitles={p.pageTitles} />
    const canvas = RenderTarget.current() === RenderTarget.canvas
    return (
        <div style={{ minHeight: canvas ? 320 : "100vh", width: "100%", background: "#0B1230", color: "#E6EAF4", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", fontSize: 14 }}>
            {err ? <span>Escape site did not load: {err}</span> : <span style={{ opacity: 0.5 }}>Escape</span>}
        </div>
    )
}

EscapeSite.defaultProps = { startPage: "home", gateFirst: true, pageTitles: true, bundleUrl: BUNDLE }
addPropertyControls(EscapeSite, {
    gateFirst: { type: ControlType.Boolean, title: "Start at orb gate", defaultValue: true, enabledTitle: "Yes", disabledTitle: "No" },
    startPage: {
        type: ControlType.Enum, title: "Show page", defaultValue: "home",
        description: "The page shown on the canvas, and the first page when the orb gate is off.",
        options: ["gate", "home", "lucille", "marketplace", "pricing", "innerverse", "beta", "demo", "privacy", "health", "terms", "safety", "deleteAccount", "cookies"],
        optionTitles: ["Orb gate", "Home", "Lucille AI", "Marketplace", "Pricing", "Innerverse", "App testing (beta)", "App demo", "Privacy", "Health data", "Terms", "Safety", "Delete account", "Cookies"],
    },
    pageTitles: { type: ControlType.Boolean, title: "Tab titles", defaultValue: true, enabledTitle: "Per page", disabledTitle: "Framer's" },
    bundleUrl: { type: ControlType.String, title: "Bundle URL", defaultValue: BUNDLE },
})
