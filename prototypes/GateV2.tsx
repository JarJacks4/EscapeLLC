// Escape — Orb Gate v2: a two-question entry journey.
//
// UX reasoning (why it changed):
//  * One question at a time. Step 1 only asks how you feel; the orbs carry feeling words only,
//    never page names, so the choice is purely emotional (lower cognitive load, Hick's law).
//  * Validate first (affect labelling): after you pick, Lucille reflects the feeling back in one
//    line before suggesting anything. Feeling heard lowers arousal and builds trust.
//  * Then make the destination explicit: "What would help right now?" with three options, each
//    labelled with exactly where it goes ("Opens · Lucille AI page") and how long it takes.
//    One is marked Suggested (a default reduces decision effort) but all three are equal size.
//  * Give value before asking for anything: for restless / tired / low, the first option is a
//    30-second breath with the orb, right here. The product proves itself on the first screen.
//  * Always an exit: "Skip to the full site" is visible on every step; "Pick a different
//    feeling" goes back. Progress shows 1 · 2 · 3 so people know how short this is.
//  * After arrival, a banner on the landing page says why you're there and how to change it
//    (visibility of system status), so the tinted site never feels like a mystery.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { MOODS, ROUTES, Orb, Page, Icon, escape, moodById, ease, easeSoft, navigate, launchOrb, SPLASH_POSTER, type MoodId, type IconName } from "../../escape-framer/code/EscapeKit.tsx"

// ───────────────────────── journey content ─────────────────────────

export type Option =
    | { kind: "breathe"; title: string; body: string; time: string; icon: IconName }
    | { kind: "page"; title: string; body: string; time: string; icon: IconName; href: string; page: string }

const P = {
    home: { href: ROUTES.home, page: "Home" },
    lucille: { href: ROUTES.lucille, page: "Lucille AI" },
    community: { href: ROUTES.community, page: "Community & rewards" },
    pricing: { href: ROUTES.pricing, page: "Pricing" },
    innerverse: { href: ROUTES.innerverse, page: "Innerverse" },
    beta: { href: ROUTES.beta, page: "App Testing" },
    demo: { href: ROUTES.demo, page: "App Demo" },
}
const breathe = (title = "Breathe with the orb first"): Option => ({ kind: "breathe", title, body: "Three slow breaths, guided by the orb. No sign-up, nothing to read.", time: "30 sec", icon: "leaf" })

export const JOURNEY: Record<MoodId, { reflect: string; after: string; options: Option[] }> = {
    calm: {
        reflect: "Lovely. Let's keep that going.",
        after: "Here's where you could start:",
        options: [
            { kind: "page", ...P.home, title: "See everything Escape does", body: "The full tour: Lucille, sessions, Soundscapes and your journey.", time: "3 min read", icon: "compass" },
            { kind: "page", ...P.demo, title: "Watch the app in action", body: "Four short chapters with captions.", time: "3 min video", icon: "play" },
            { kind: "page", ...P.beta, title: "Get early access", body: "Join the beta and help shape Escape.", time: "1 min form", icon: "flask" },
        ],
    },
    energized: {
        reflect: "Good energy. Let's put it somewhere good.",
        after: "Here's what might suit you:",
        options: [
            { kind: "page", ...P.community, title: "Earn coins and level up", body: "How self-care earns coins and opens your seven energy centers.", time: "2 min read", icon: "coin" },
            { kind: "page", ...P.beta, title: "Get early access", body: "Be one of the first to try it.", time: "1 min form", icon: "flask" },
            { kind: "page", ...P.pricing, title: "See plans & pricing", body: "One pass, everything included, 7 days free.", time: "1 min read", icon: "star" },
        ],
    },
    focused: {
        reflect: "Clear head. A good moment to look around.",
        after: "Here's where you could start:",
        options: [
            { kind: "page", ...P.lucille, title: "Meet Lucille, the AI companion", body: "What she does, how she listens, and her voice.", time: "2 min read", icon: "chat" },
            { kind: "page", ...P.home, title: "See everything Escape does", body: "The full tour of the app.", time: "3 min read", icon: "compass" },
            { kind: "page", ...P.pricing, title: "Compare plans", body: "Monthly or yearly, and what's included.", time: "1 min read", icon: "star" },
        ],
    },
    restless: {
        reflect: "Buzzing is okay. Let's give it somewhere to land.",
        after: "What would help right now?",
        options: [
            breathe("Take three slow breaths first"),
            { kind: "page", ...P.demo, title: "Watch the 3-minute demo", body: "See how Escape helps on days like this.", time: "3 min video", icon: "play" },
            { kind: "page", ...P.home, title: "Just look around", body: "The full site, at your own pace.", time: "3 min read", icon: "compass" },
        ],
    },
    tired: {
        reflect: "Running low. We'll keep this gentle.",
        after: "What would help right now?",
        options: [
            breathe(),
            { kind: "page", ...P.innerverse, title: "Preview the calm 3D worlds", body: "Forests, oceans and starlight, coming to Escape.", time: "2 min browse", icon: "cube" },
            { kind: "page", ...P.home, title: "Read about Escape", body: "The full tour, whenever you're ready.", time: "3 min read", icon: "book" },
        ],
    },
    low: {
        reflect: "Thank you for being honest. Heavy days count too.",
        after: "What would help right now?",
        options: [
            breathe(),
            { kind: "page", ...P.lucille, title: "Meet Lucille, someone to talk to", body: "A companion who listens first and never rushes you.", time: "2 min read", icon: "heart" },
            { kind: "page", ...P.home, title: "Start at the beginning", body: "The full tour, one small step at a time.", time: "3 min read", icon: "compass" },
        ],
    },
}

// ───────────────────────── journey memory (for the landing banner) ─────────────────────────

export interface Journey { mood: MoodId; href: string; page: string; title: string; at: number }
const JKEY = "escape.journey.v1"
export const journey = {
    save(j: Journey) { try { sessionStorage.setItem(JKEY, JSON.stringify(j)) } catch {} },
    load(): Journey | null { try { const r = sessionStorage.getItem(JKEY); return r ? JSON.parse(r) : null } catch { return null } },
    clear() { try { sessionStorage.removeItem(JKEY) } catch {} },
}

// ───────────────────────── component ─────────────────────────

type Step = "feel" | "help" | "breathe" | "check" | "go"

interface Props { skipHref: string; betaHref: string; showCrisisLine: boolean; bgVideo: string; bgVideoWebm: string; bgPoster: any; bgBlur: number; moodOverlay: number }

const src = (v: any) => (typeof v === "string" ? v : v?.src) || ""

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 900
 */
export default function GateV2(p: Props) {
    const reduce = useReducedMotion()
    const [step, setStep] = React.useState<Step>("feel")
    const [mood, setMood] = React.useState<MoodId | null>(null)
    const [hover, setHover] = React.useState<MoodId | null>(null)
    const [breathed, setBreathed] = React.useState<"" | "better" | "same">("")
    const [dest, setDest] = React.useState<Option | null>(null)
    const [remembered, setRemembered] = React.useState<MoodId | null>(null)
    const headRef = React.useRef<HTMLHeadingElement>(null)
    const goRef = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => setRemembered(escape.get().mood), [])
    React.useEffect(() => { if (step !== "feel") headRef.current?.focus() }, [step])

    const shown = step === "feel" ? hover : mood
    const m = moodById(shown)
    const j = mood ? JOURNEY[mood] : null
    const options = j ? (breathed ? j.options.filter((o) => o.kind !== "breathe") : j.options) : []

    const pickMood = (id: MoodId) => { setMood(id); setHover(null); setBreathed(""); escape.setMood(id); setStep("help") }
    const pick = (o: Option) => {
        if (o.kind === "breathe") { setStep("breathe"); return }
        setDest(o); setStep("go")
        journey.save({ mood: mood!, href: o.href, page: o.page, title: o.title, at: Date.now() })
        const go = () => { launchOrb(goRef.current, mood); navigate(o.href) }
        reduce ? go() : window.setTimeout(go, 1700)
    }

    const field = m
        ? `radial-gradient(38% 52% at 68% 48%, ${m.glowA}, transparent 72%), radial-gradient(120% 90% at 50% 45%, ${m.base[1]} 0%, ${m.base[0]} 38%, ${m.base[2]} 78%, #05081A 100%)`
        : "radial-gradient(120% 90% at 50% 45%, #18224A 0%, #101E43 40%, #0B1230 75%, #05081A 100%)"
    const stepNo = step === "feel" ? 1 : step === "go" ? 3 : 2

    return (
        <Page bare style={{ minHeight: "100svh" }}>
            <style>{CSS}</style>
            <div className="g2">
                {/* the app's splash, blurred far back: atmosphere, never competing with the orbs */}
                <motion.div className="g2-bg" aria-hidden initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.4, ease: easeSoft }}>
                    <video muted autoPlay loop playsInline preload="auto" poster={src(p.bgPoster) || SPLASH_POSTER} style={{ filter: `blur(${p.bgBlur}px) saturate(1.25) brightness(.88)` }}>
                        {src(p.bgVideoWebm) && <source src={src(p.bgVideoWebm)} type="video/webm" />}
                        {src(p.bgVideo) && <source src={src(p.bgVideo)} type="video/mp4" />}
                    </video>
                </motion.div>
                <AnimatePresence initial={false}>
                    <motion.div key={shown || "none"} aria-hidden className="g2-field" style={{ background: field }} initial={{ opacity: 0 }} animate={{ opacity: m ? p.moodOverlay : 0.6 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: easeSoft }} />
                </AnimatePresence>
                <div className="g2-vignette" aria-hidden />
                <AnimatePresence>{step === "go" && !reduce && <motion.div className="g2-veil" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7, ease: easeSoft }} />}</AnimatePresence>
                <div className="esc-noise" aria-hidden />

                <header className="g2-top">
                    <span className="esc-d g2-mark" aria-label="Escape">ESCAPE<sup>™</sup></span>
                    <ol className="g2-steps" aria-label={`Step ${stepNo} of 3`}>
                        {["How you feel", "What would help", "Go"].map((t, i) => (
                            <li key={t} className={i + 1 === stepNo ? "on" : i + 1 < stepNo ? "done" : ""} aria-current={i + 1 === stepNo ? "step" : undefined}>
                                <span className="g2-dot">{i + 1 < stepNo ? <Icon name="check" size={12} /> : i + 1}</span><span className="g2-steplabel">{t}</span>
                            </li>
                        ))}
                    </ol>
                    <a className="esc-link g2-skip" href={p.skipHref} onClick={() => journey.clear()}>Skip to the full site <Icon name="arrow" size={16} /></a>
                </header>

                <AnimatePresence mode="popLayout" initial={false}>
                    {/* ── step 1: feeling only ── */}
                    {step === "feel" && (
                        <motion.main key="feel" className="g2-main g2-feel" initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.4, ease: easeSoft } }} transition={{ duration: 0.9, ease: easeSoft }}>
                            <div className="g2-copy">
                                {remembered && (
                                    <button type="button" className="esc-chip g2-again" onClick={() => pickMood(remembered)}>
                                        <span className="esc-dot" aria-hidden style={{ background: moodById(remembered)!.hue, boxShadow: `0 0 12px ${moodById(remembered)!.hue}` }} />
                                        Still feeling {moodById(remembered)!.label.toLowerCase()}? Continue
                                    </button>
                                )}
                                <h1 className="esc-d g2-h1">How are you arriving today?</h1>
                                <p className="g2-sub">Pick the feeling that's closest. We'll suggest a good place to start, and you can always see everything.</p>
                                <p className="g2-hint" aria-live="polite">{m ? <><strong style={{ color: m.accentDark, fontWeight: 500 }}>{m.label}</strong> · {m.line}</> : " "}</p>
                            </div>
                            <div className="g2-ring" role="group" aria-label="How are you feeling?">
                                <div className="g2-core"><Orb mood={hover} size="100%" live rings /></div>
                                {MOODS.map((mo, i) => {
                                    const a = (-90 + i * 60) * (Math.PI / 180)
                                    const on = hover === mo.id
                                    return (
                                        <motion.button key={mo.id} type="button" className={`g2-mood ${on ? "on" : ""}`}
                                            style={{ "--x": `${50 + 41 * Math.cos(a)}%`, "--y": `${50 + 41 * Math.sin(a)}%`, "--hue": mo.hue } as any}
                                            onMouseEnter={() => setHover(mo.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(mo.id)} onBlur={() => setHover(null)}
                                            onClick={() => pickMood(mo.id)} aria-label={`${mo.label}: ${mo.line}`}
                                            initial={reduce ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: easeSoft, delay: 0.5 + i * 0.12 }}>
                                            <motion.span className="g2-orb" layoutId={`orb-${mo.id}`} transition={{ duration: 1.1, ease: easeSoft }}><span className="g2-orb-in"><Orb mood={mo.id} size="100%" glow={on} breathe={on} live={on} warm /></span></motion.span>
                                            <span className="g2-label">{mo.label}</span>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </motion.main>
                    )}

                    {/* ── step 2: reflect, then explicit options ── */}
                    {step === "help" && j && m && (
                        <motion.main key={`help-${breathed}`} className="g2-main g2-help" initial={{ opacity: 0, y: 10, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.4, ease: easeSoft } }} transition={{ duration: 0.9, ease: easeSoft }}>
                            <div className="g2-reflect">
                                <motion.div className="g2-orb-md" layoutId={`orb-${mood}`} transition={{ duration: 1.1, ease: easeSoft }}><Orb mood={mood} size="100%" live rings /></motion.div>
                                <span className="esc-chip" style={{ alignSelf: "flex-start" }}><span className="esc-dot" aria-hidden style={{ background: m.hue, boxShadow: `0 0 12px ${m.hue}` }} />You chose {m.label}</span>
                                <h1 className="esc-d g2-h2" tabIndex={-1} ref={headRef}>
                                    {breathed === "better" ? "Glad that helped." : breathed === "same" ? "That's okay. It doesn't have to work every time." : j.reflect}
                                </h1>
                                <p className="g2-sub" style={{ margin: 0 }}>{breathed ? "Where would you like to go next?" : j.after}</p>
                                {p.showCrisisLine && mood === "low" && (
                                    <p className="g2-care"><Icon name="heart" size={16} /><span>If you're struggling right now, you don't have to do it alone. In the US, call or text <strong>988</strong> any time.</span></p>
                                )}
                            </div>
                            <ul className="g2-options" aria-label="Where to start">
                                {options.map((o, i) => (
                                    <motion.li key={o.title} initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, ease: easeSoft, delay: 0.2 + i * 0.12 }}>
                                        <button type="button" className={`g2-opt ${i === 0 ? "sug" : ""}`} onClick={() => pick(o)} style={{ "--hue": m.hue } as any}>
                                            <span className="g2-opt-icon"><Icon name={o.icon} /></span>
                                            <span className="g2-opt-body">
                                                <span className="g2-opt-title">{o.title}{i === 0 && <span className="g2-sug">Suggested</span>}</span>
                                                <span className="g2-opt-text">{o.body}</span>
                                                <span className="g2-opt-meta">
                                                    <span className="g2-dest">{o.kind === "breathe" ? <><Icon name="orb" size={14} />Stays on this screen</> : <><Icon name="arrow" size={14} />Opens · {o.page} page</>}</span>
                                                    <span>{o.time}</span>
                                                </span>
                                            </span>
                                            <span className="g2-opt-go" aria-hidden><Icon name="arrow" size={20} /></span>
                                        </button>
                                    </motion.li>
                                ))}
                            </ul>
                            <div className="g2-back">
                                <button type="button" className="esc-link g2-linkbtn" onClick={() => setStep("feel")}><Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} /> Pick a different feeling</button>
                            </div>
                        </motion.main>
                    )}

                    {/* ── step 2b: the 30-second breath ── */}
                    {step === "breathe" && (
                        <Breathe key="breathe" mood={mood} headRef={headRef} onDone={() => setStep("check")} onSkip={() => { setBreathed("same"); setStep("help") }} />
                    )}
                    {step === "check" && (
                        <motion.main key="check" className="g2-main g2-center" initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.4, ease: easeSoft } }} transition={{ duration: 0.9, ease: easeSoft }}>
                            <motion.div className="g2-orb-md" style={{ margin: "0 auto" }} layoutId={`orb-${mood}`} transition={{ duration: 1.1, ease: easeSoft }}><Orb mood={mood} size="100%" live /></motion.div>
                            <h1 className="esc-d g2-h2" tabIndex={-1} ref={headRef}>How do you feel now?</h1>
                            <div className="esc-row" style={{ gap: 12, justifyContent: "center" }}>
                                <button type="button" className="esc-btn esc-btn-p" onClick={() => { setBreathed("better"); setStep("help") }}>A little calmer</button>
                                <button type="button" className="esc-btn esc-btn-g" onClick={() => { setBreathed("same"); setStep("help") }}>About the same</button>
                            </div>
                            <p className="g2-sub" style={{ margin: "4px auto 0" }}>That's what a moment in Escape feels like. There are hundreds more inside.</p>
                        </motion.main>
                    )}

                    {/* ── step 3: go ── */}
                    {step === "go" && dest && dest.kind === "page" && (
                        <motion.main key="go" className="g2-main g2-center g2-go" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                            <motion.div ref={goRef} className="g2-orb-lg" layoutId={`orb-${mood}`} transition={{ duration: 1.1, ease: easeSoft }}>
                                <Orb mood={mood} size="100%" live glow />
                            </motion.div>
                            <motion.div className="esc-stack" style={{ alignItems: "center", gap: 6 }} initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: [0, 1, 1, 0], filter: "blur(0px)" }} transition={{ duration: 1.6, times: [0, 0.3, 0.7, 1], ease: easeSoft }}>
                                <p className="esc-over" aria-live="polite" style={{ margin: 0, color: "rgba(230,234,244,.8)" }}>Taking you to</p>
                                <h1 className="esc-d g2-h2">{dest.page}</h1>
                            </motion.div>
                        </motion.main>
                    )}
                </AnimatePresence>

                <footer className="g2-foot">
                    <span className="esc-small">Your feeling only shapes this visit. It stays on this device.</span>
                    <a className="esc-link" href={p.betaHref}>Joining the beta? <Icon name="arrow" size={16} /></a>
                </footer>
            </div>
        </Page>
    )
}

// ───────────────────────── breathing ─────────────────────────

const PHASES = [{ t: "Breathe in", s: 4 }, { t: "Hold", s: 1.5 }, { t: "And out, slowly", s: 5.5 }]

function Breathe({ mood, onDone, onSkip, headRef }: { mood: MoodId | null; onDone: () => void; onSkip: () => void; headRef: React.RefObject<HTMLHeadingElement> }) {
    const reduce = useReducedMotion()
    const [round, setRound] = React.useState(0)
    const [phase, setPhase] = React.useState(0)
    React.useEffect(() => {
        const ms = PHASES[phase].s * 1000
        const id = window.setTimeout(() => {
            if (phase < PHASES.length - 1) setPhase(phase + 1)
            else if (round < 2) { setRound(round + 1); setPhase(0) }
            else onDone()
        }, ms)
        return () => window.clearTimeout(id)
    }, [phase, round])
    const scale = phase === 0 ? 1.35 : phase === 1 ? 1.35 : 0.85
    return (
        <motion.main className="g2-main g2-center" initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.4, ease: easeSoft } }} transition={{ duration: 0.9, ease: easeSoft }}>
            <motion.div className="g2-breath" layoutId={`orb-${mood}`} transition={{ duration: 1.1, ease: easeSoft }}>
                <motion.div style={{ width: "100%", height: "100%" }} animate={reduce ? {} : { scale }} transition={{ duration: PHASES[phase].s, ease: "easeInOut" }}>
                    <Orb mood={mood} size="100%" live breathe={false} />
                </motion.div>
            </motion.div>
            <h1 className="esc-d g2-h2" tabIndex={-1} ref={headRef} aria-live="polite">{PHASES[phase].t}</h1>
            <p className="g2-sub" style={{ margin: "0 auto" }}>Breath {round + 1} of 3 · follow the orb</p>
            <button type="button" className="esc-link g2-linkbtn" onClick={onSkip}>Skip</button>
        </motion.main>
    )
}

const CSS = `
.g2{position:relative;min-height:100svh;width:100%;overflow:clip;display:flex;flex-direction:column;color:#E6EAF4;isolation:isolate}
.g2-bg{position:absolute;inset:-6%;z-index:-3;overflow:hidden;background:#0B1230}
.g2-bg video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 30%;animation:esc-drift-slow 32s var(--esc-ease-soft) infinite}
.g2-field{position:absolute;inset:0;z-index:-2}
.g2-vignette{position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(90deg,rgba(11,18,48,.62) 0%,rgba(11,18,48,.38) 38%,rgba(11,18,48,0) 62%),linear-gradient(0deg,rgba(5,8,26,.55) 0%,rgba(5,8,26,0) 22%),linear-gradient(180deg,rgba(5,8,26,.45) 0%,rgba(5,8,26,0) 16%),radial-gradient(120% 100% at 50% 50%,transparent 45%,rgba(5,8,26,.45) 100%)}
@container (max-width:900px){.g2-vignette{background:linear-gradient(180deg,rgba(11,18,48,.6) 0%,rgba(11,18,48,.3) 45%,rgba(5,8,26,.55) 100%)}}
.g2-veil{position:fixed;inset:0;z-index:30;background:#0B1230;pointer-events:none}
.g2 .esc-noise{z-index:-1}
.g2 .esc-link{color:#E6EAF4;min-height:44px}
.g2-top,.g2-foot{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px clamp(20px,4cqi,48px);flex-wrap:wrap}
.g2-mark{font-size:22px;letter-spacing:.14em}
.g2-mark sup{font-size:.45em;letter-spacing:0;margin-left:2px}
.g2-steps{list-style:none;margin:0;padding:0;display:flex;gap:6px;align-items:center}
.g2-steps li{display:flex;align-items:center;gap:8px;font-size:13px;color:rgba(230,234,244,.6);padding:6px 12px 6px 6px;border-radius:99px}
.g2-steps li.on{color:#E6EAF4;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(230,234,244,.16)}
.g2-dot{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:12px;border:1px solid rgba(230,234,244,.3)}
.g2-steps li.on .g2-dot{background:#E6EAF4;color:#0B1230;border-color:#E6EAF4}
.g2-steps li.done .g2-dot{background:rgba(230,234,244,.18);border-color:transparent}
.g2-main{flex:1;padding-bottom:24px!important;width:100%;max-width:1360px;margin:0 auto;padding:0 clamp(20px,5cqi,72px)}
.g2-feel{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:clamp(24px,4cqi,64px);align-items:center}
.g2-copy{display:flex;flex-direction:column;align-items:flex-start}
.g2-again{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 16px;border-radius:99px;margin-bottom:18px;cursor:pointer;font-size:14px;color:#E6EAF4;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1px rgba(230,234,244,.2)}
.g2-again:hover{background:rgba(255,255,255,.14)}
.g2-h1{font-size:clamp(42px,5.4cqi,78px)}
.g2-h2{font-size:clamp(32px,3.6cqi,52px);outline:none}
.g2-sub{margin:18px 0 0;font-size:clamp(17px,1.4cqi,20px);line-height:1.55;color:rgba(230,234,244,.85);max-width:40ch}
.g2-hint{margin:22px 0 0;min-height:1.6em;font-size:16px;color:rgba(230,234,244,.8)}
.g2-ring{position:relative;width:min(100%,640px);aspect-ratio:1;justify-self:center}
.g2-core{position:absolute;left:50%;top:50%;width:40%;aspect-ratio:1;translate:-50% -50%}
.g2-mood{all:unset;box-sizing:border-box;position:absolute;left:var(--x);top:var(--y);translate:-50% -50%;width:20%;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;border-radius:20px;padding:6px}
.g2-orb{display:block;width:76%;aspect-ratio:1}
.g2-orb-in{display:block;width:100%;height:100%;transition:transform .7s var(--esc-ease-soft),filter .7s var(--esc-ease-soft);filter:saturate(.9) brightness(.95)}
.g2-mood:hover .g2-orb-in,.g2-mood.on .g2-orb-in,.g2-mood:focus-visible .g2-orb-in{transform:scale(1.16);filter:none}
.g2-label{font:500 16px/1.2 "Work Sans",system-ui,sans-serif}
.g2-mood.on .g2-label{color:var(--hue);filter:brightness(1.4)}
.g2-mood:focus-visible{outline:3px solid var(--hue);outline-offset:2px}
.g2-help{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:clamp(24px,5cqi,80px);align-items:center}
.g2-reflect{display:flex;flex-direction:column;gap:18px}
.g2-orb-md{width:clamp(120px,14cqi,180px);aspect-ratio:1}
.g2-care{display:flex;gap:10px;align-items:flex-start;margin:4px 0 0;padding:14px 16px;border-radius:16px;font-size:15px;line-height:1.5;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1px rgba(230,234,244,.16);max-width:46ch}
.g2-care svg{margin-top:2px;color:#F5B26B;flex:none}
.g2-options{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:14px}
.g2-opt{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:flex;gap:18px;align-items:center;padding:20px 22px;border-radius:24px;background:linear-gradient(160deg,rgba(255,255,255,.10),rgba(255,255,255,.04));box-shadow:inset 0 0 0 1px rgba(230,234,244,.16);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);transition:transform .38s var(--esc-ease),box-shadow .38s var(--esc-ease),background .38s}
.g2-opt:hover{transform:translateY(-2px);box-shadow:inset 0 0 0 1px var(--hue),0 18px 50px -24px var(--hue)}
.g2-opt.sug{box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--hue) 70%,transparent)}
.g2-opt:focus-visible{outline:3px solid var(--hue);outline-offset:3px}
.g2-opt-icon{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;flex:none;color:#E6EAF4;background:color-mix(in oklab,var(--hue) 35%,transparent)}
.g2-opt-body{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}
.g2-opt-title{font:500 18px/1.3 "Work Sans",system-ui,sans-serif;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.g2-sug{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:3px 9px;border-radius:99px;background:#E6EAF4;color:#0B1230}
.g2-opt-text{font-size:15px;line-height:1.45;color:rgba(230,234,244,.82)}
.g2-opt-meta{display:flex;gap:14px;flex-wrap:wrap;margin-top:6px;font-size:13px;color:rgba(230,234,244,.74)}
.g2-dest{display:inline-flex;gap:6px;align-items:center;color:#E6EAF4;font-weight:500}
.g2-opt-go{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.08);transition:background .3s}
.g2-opt:hover .g2-opt-go{background:var(--hue);color:#0B1230}
.g2-back{grid-column:1/-1}
.g2-linkbtn{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:8px;min-height:44px;color:#E6EAF4;font-weight:500}
.g2-linkbtn:hover{text-decoration:underline;text-underline-offset:4px}
.g2-linkbtn:focus-visible{outline:3px solid #E6EAF4;outline-offset:3px;border-radius:8px}
.g2-center{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center}
.g2-breath{width:min(300px,60vw);aspect-ratio:1;margin-bottom:12px}
.g2-orb-lg{width:clamp(160px,18cqi,240px);aspect-ratio:1}
.g2-go{position:relative;z-index:40}
@container (max-width:980px){.g2-steplabel{display:none}.g2-steps li{padding:4px}}
@container (max-width:900px){
 .g2-feel,.g2-help{grid-template-columns:minmax(0,1fr)}
 .g2-feel{text-align:center}.g2-copy{align-items:center}.g2-sub{margin-left:auto;margin-right:auto}
 .g2-reflect{align-items:center;text-align:center}.g2-reflect .esc-chip{align-self:center!important}.g2-care{text-align:left}
}
@container (max-width:560px){
 .g2-top{padding:14px 16px}.g2-mark{font-size:18px}.g2-skip{order:3;width:100%;justify-content:center}
 .g2-ring{aspect-ratio:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 6px;padding-top:min(56vw,260px)}
 .g2-core{top:0;translate:-50% 0;width:min(52vw,240px)}
 .g2-mood{position:relative;left:auto;top:auto;translate:none;width:auto}
 .g2-orb{width:64px}
 .g2-opt{padding:16px;gap:14px}.g2-opt-icon{width:44px;height:44px}.g2-opt-go{display:none}
 .g2-foot{justify-content:center;text-align:center}
}
`

GateV2.defaultProps = { skipHref: ROUTES.home, betaHref: ROUTES.beta, showCrisisLine: true, bgVideo: "", bgVideoWebm: "", bgPoster: "", bgBlur: 18, moodOverlay: 0.82 }
addPropertyControls(GateV2, {
    skipHref: { type: ControlType.Link, title: "Skip link" },
    betaHref: { type: ControlType.Link, title: "Beta link" },
    showCrisisLine: { type: ControlType.Boolean, title: "988 line on Low" },
    bgVideo: { type: ControlType.File, title: "Background video", allowedFileTypes: ["mp4", "mov"] },
    bgVideoWebm: { type: ControlType.File, title: "Background WebM", allowedFileTypes: ["webm"] },
    bgPoster: { type: ControlType.Image, title: "Background poster" },
    bgBlur: { type: ControlType.Number, title: "Background blur", min: 0, max: 80, step: 2, unit: "px" },
    moodOverlay: { type: ControlType.Number, title: "Mood colour strength", min: 0.4, max: 1, step: 0.02 },
})
