// Escape — the Orb Gate (site entry, "/").
//
// One orb in the middle, six mood orbs around it (the app's check-in moods). Hover or focus a
// mood and the centre orb, the field and the copy become that mood; choose it and the orb
// swells into the next page. The mood is remembered and tints the whole site, and each mood
// opens the part of the site that fits it (editable on the right in Framer).
//
// Put it on the "/" page, Fill × Fill (or Fill width × 100vh).
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { MOODS, MOOD_PATHS, ROUTES, Orb, Page, Icon, escape, moodById, ease, navigate, type MoodId } from "./EscapeKit.tsx"

interface Props {
    headline: string
    subline: string
    skipLabel: string
    skipHref: string
    betaHref: string
    calmHref: string
    focusedHref: string
    energizedHref: string
    restlessHref: string
    tiredHref: string
    lowHref: string
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 900
 */
export default function PathGate(p: Props) {
    const reduce = useReducedMotion()
    const [hover, setHover] = React.useState<MoodId | null>(null)
    const [chosen, setChosen] = React.useState<MoodId | null>(null)
    const [remembered, setRemembered] = React.useState<MoodId | null>(null)
    React.useEffect(() => setRemembered(escape.get().mood), [])

    const hrefFor: Record<MoodId, string> = {
        calm: p.calmHref, focused: p.focusedHref, energized: p.energizedHref,
        restless: p.restlessHref, tired: p.tiredHref, low: p.lowHref,
    }
    const active = chosen || hover
    const m = moodById(active)

    const choose = (id: MoodId) => {
        if (chosen) return
        setChosen(id)
        escape.setMood(id)
        const go = () => navigate(hrefFor[id] || MOOD_PATHS[id].href)
        if (reduce) go()
        else window.setTimeout(go, 900)
    }

    const field = m
        ? `radial-gradient(120% 90% at 50% 45%, ${m.base[1]} 0%, ${m.base[0]} 38%, ${m.base[2]} 78%, #05081A 100%)`
        : "radial-gradient(120% 90% at 50% 45%, #18224A 0%, #101E43 40%, #0B1230 75%, #05081A 100%)"

    return (
        <Page bare style={{ minHeight: "100%", height: "100%" }}>
            <style>{GATE_CSS}</style>
            <div className="gate" style={{ background: "#0B1230" }}>
                {/* field: cross-fades between moods */}
                <AnimatePresence initial={false}>
                    <motion.div key={active || "none"} aria-hidden className="gate-field" style={{ background: field }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease }} />
                </AnimatePresence>
                <div className="esc-noise" aria-hidden />

                <header className="gate-top">
                    <span className="esc-d gate-mark" aria-label="Escape">ESCAPE<sup>™</sup></span>
                    <a className="esc-link gate-skip" href={p.skipHref}>{p.skipLabel} <Icon name="arrow" size={16} /></a>
                </header>

                <main className="gate-main">
                    <motion.div className="gate-copy" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
                        {remembered && !active && (
                            <span className="esc-chip" style={{ marginBottom: 14 }}>
                                <span className="esc-dot" aria-hidden style={{ background: moodById(remembered)!.hue, boxShadow: `0 0 12px ${moodById(remembered)!.hue}` }} />
                                Welcome back. Last time: {moodById(remembered)!.label}
                            </span>
                        )}
                        <h1 className="esc-d gate-h1">{p.headline}</h1>
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.p key={active || "base"} className="gate-sub" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.32, ease }} aria-live="polite">
                                {m ? <><strong style={{ color: m.accentDark, fontWeight: 500 }}>{MOOD_PATHS[m.id].title}.</strong> {MOOD_PATHS[m.id].line}.</> : p.subline}
                            </motion.p>
                        </AnimatePresence>
                    </motion.div>

                    <div className="gate-ring" role="group" aria-label="Choose how you're arriving">
                        {/* centre orb */}
                        <motion.div className="gate-core" animate={chosen && !reduce ? { scale: 7, opacity: 0 } : { scale: 1, opacity: 1 }}
                            transition={chosen ? { duration: 0.9, ease: [0.5, 0, 0.75, 0] } : { duration: 0.52, ease }}>
                            <Orb mood={active} size="100%" live rings={!chosen} />
                        </motion.div>

                        {MOODS.map((mood, i) => {
                            const a = (-90 + i * 60) * (Math.PI / 180)
                            const on = active === mood.id
                            return (
                                <motion.button
                                    key={mood.id}
                                    type="button"
                                    className={`gate-mood ${on ? "on" : ""}`}
                                    style={{ "--x": `${50 + 41 * Math.cos(a)}%`, "--y": `${50 + 41 * Math.sin(a)}%`, "--hue": mood.hue } as any}
                                    onMouseEnter={() => !chosen && setHover(mood.id)}
                                    onMouseLeave={() => !chosen && setHover(null)}
                                    onFocus={() => !chosen && setHover(mood.id)}
                                    onBlur={() => !chosen && setHover(null)}
                                    onClick={() => choose(mood.id)}
                                    aria-label={`${mood.label}: ${MOOD_PATHS[mood.id].title}. ${MOOD_PATHS[mood.id].line}`}
                                    initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: chosen && chosen !== mood.id ? 0 : 1, scale: 1 }}
                                    transition={{ duration: 0.6, ease, delay: chosen ? 0 : 0.25 + i * 0.07 }}
                                >
                                    <span className="gate-orb"><Orb mood={mood.id} size="100%" glow={on} breathe={on} live={on} /></span>
                                    <span className="gate-label">{mood.label}</span>
                                    <span className="gate-line">{mood.line}</span>
                                </motion.button>
                            )
                        })}
                    </div>
                </main>

                <footer className="gate-foot">
                    <span className="esc-small">Your choice only tints the site. It stays on this device and you can change it any time.</span>
                    <a className="esc-link" href={p.betaHref}>Joining the beta? <Icon name="arrow" size={16} /></a>
                </footer>
            </div>
        </Page>
    )
}

const GATE_CSS = `
.gate{position:relative;min-height:100svh;height:100%;width:100%;overflow:hidden;display:flex;flex-direction:column;color:#E6EAF4;isolation:isolate}
.gate-field{position:absolute;inset:0;z-index:-1}
.gate .esc-noise{z-index:-1}
.gate-top,.gate-foot{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:22px clamp(20px,4cqi,48px);flex-wrap:wrap}
.gate-mark{font-size:22px;letter-spacing:.14em}
.gate-mark sup{font-size:.45em;letter-spacing:0;margin-left:2px}
.gate .esc-link{color:#E6EAF4;opacity:.9;min-height:44px}
.gate-main{flex:1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);align-items:center;gap:clamp(24px,4cqi,64px);padding:0 clamp(20px,5cqi,80px);max-width:1440px;width:100%;margin:0 auto}
.gate-copy{display:flex;flex-direction:column;align-items:flex-start}
.gate-h1{font-size:clamp(42px,5.6cqi,80px)}
.gate-sub{margin:18px 0 0;font-size:clamp(17px,1.5cqi,21px);line-height:1.55;color:rgba(230,234,244,.85);max-width:34ch;min-height:3.2em}
.gate-ring{position:relative;width:min(100%,680px);aspect-ratio:1;justify-self:center}
.gate-core{position:absolute;left:50%;top:50%;width:42%;aspect-ratio:1;translate:-50% -50%;z-index:1}
.gate-mood{all:unset;box-sizing:border-box;position:absolute;left:var(--x);top:var(--y);translate:-50% -50%;width:21%;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;text-align:center;border-radius:20px;padding:6px;z-index:2}
.gate-orb{display:block;width:72%;aspect-ratio:1;transition:transform .52s var(--esc-ease),filter .52s var(--esc-ease);filter:saturate(.85) brightness(.92)}
.gate-mood:hover .gate-orb,.gate-mood.on .gate-orb{transform:scale(1.14);filter:none}
.gate-label{font:500 16px/1.2 "Work Sans",system-ui,sans-serif;color:#E6EAF4}
.gate-line{font-size:12.5px;line-height:1.3;color:rgba(230,234,244,.74);opacity:0;transform:translateY(-3px);transition:opacity .38s var(--esc-ease),transform .38s var(--esc-ease)}
.gate-mood:hover .gate-line,.gate-mood.on .gate-line,.gate-mood:focus-visible .gate-line{opacity:1;transform:none}
.gate-mood:focus-visible{outline:3px solid var(--hue);outline-offset:2px}
.gate-mood.on .gate-label{color:var(--hue);filter:brightness(1.35)}
@container (max-width:900px){
 .gate-main{grid-template-columns:minmax(0,1fr);text-align:center;padding-top:8px}
 .gate-copy{align-items:center}
 .gate-sub{margin-left:auto;margin-right:auto}
}
@container (max-width:560px){
 .gate-ring{aspect-ratio:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px 6px;padding-top:min(62vw,300px)}
 .gate-core{top:0;translate:-50% 0;width:min(62vw,300px)}
 .gate-mood{position:relative;left:auto;top:auto;translate:none;width:auto}
 .gate-orb{width:68px}
 .gate-line{display:none}
 .gate-foot{justify-content:center;text-align:center}
}
`

PathGate.defaultProps = {
    headline: "How are you arriving today?",
    subline: "Choose a feeling. Escape will meet you there and open the part of the site that fits.",
    skipLabel: "Enter Escape",
    skipHref: ROUTES.home,
    betaHref: ROUTES.beta,
    calmHref: MOOD_PATHS.calm.href,
    focusedHref: MOOD_PATHS.focused.href,
    energizedHref: MOOD_PATHS.energized.href,
    restlessHref: MOOD_PATHS.restless.href,
    tiredHref: MOOD_PATHS.tired.href,
    lowHref: MOOD_PATHS.low.href,
}

addPropertyControls(PathGate, {
    headline: { type: ControlType.String, title: "Headline" },
    subline: { type: ControlType.String, title: "Subline", displayTextArea: true },
    skipLabel: { type: ControlType.String, title: "Skip label" },
    skipHref: { type: ControlType.Link, title: "Skip link" },
    betaHref: { type: ControlType.Link, title: "Beta link" },
    calmHref: { type: ControlType.Link, title: "Calm →" },
    focusedHref: { type: ControlType.Link, title: "Focused →" },
    energizedHref: { type: ControlType.Link, title: "Energized →" },
    restlessHref: { type: ControlType.Link, title: "Restless →" },
    tiredHref: { type: ControlType.Link, title: "Tired →" },
    lowHref: { type: ControlType.Link, title: "Low →" },
})
