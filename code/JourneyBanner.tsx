// Escape — arrival banner. Sits under the nav on every page; shows only on the page the gate
// sent you to. It closes the loop: why you're here, what else exists, how to change it.
import * as React from "react"
import { addPropertyControls } from "framer"
import { motion, AnimatePresence } from "framer-motion"
import { Page, Orb, Icon, ROUTES, moodById, ease } from "./EscapeKit.tsx"
import { journey, type Journey } from "./PathGate.tsx"

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
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function JourneyBanner() {
    const [j, setJ] = React.useState<Journey | null>(null)
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
