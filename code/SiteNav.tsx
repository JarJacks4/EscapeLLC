// Escape — site navigation (floating glass bar).
//
// Left: wordmark. Middle: pages. Right: your mood orb (back to the gate to change it), the
// sun/moon tone toggle (same idea as the Home orb in the app) and the main call to action.
// Under 900 px it collapses to a menu sheet.
//
// In Framer: put it in each page (or a shared layout) at the top, Fill width, and set the
// layer's Position to Sticky (top 0) or Fixed so it floats over the page.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence } from "framer-motion"
import { Page, Orb, Icon, Button, ROUTES, escape, moodById, useEscape, ease, FlightOrb } from "./EscapeKit.tsx"

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
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function SiteNav(p: Props) {
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
