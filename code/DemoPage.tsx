// Escape — App Demo page body. Fill width, auto height.
// The demo is the app's own screen recording (portrait), shown in a phone frame. Chapters jump
// the player and follow it as it plays; edit their times and titles in Framer's panel.
// Upload media/escape_demo.mp4 to "Demo video" and media/escape_demo_poster.webp to "Poster".
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Page, Backdrop, Eyebrow, Button, SectionHead, Icon, Orb, ClosingCta, ROUTES, useEscape, easeSoft } from "./EscapeKit.tsx"

const src = (v: any) => (typeof v === "string" ? v : v?.src) || ""

interface Chapter { at: number; title: string; body: string }
interface Props {
    demoVideo: string
    demoVideoWebm: string
    demoPoster: any
    captions: string
    chapters: Chapter[]
    waitlistHref: string
    crowdfundHref: string
}

const DEFAULT_CHAPTERS: Chapter[] = [
    { at: 0, title: "Your home, today", body: "A greeting, how you're feeling, a thought from Lucille and today's small plan." },
    { at: 10, title: "Explore sessions", body: "Breathing, meditation, sleep and focus sessions, picked for your mood." },
    { at: 29, title: "Mindful movement", body: "Yoga, pilates, tai chi and gentle exercise, with short routines." },
    { at: 40, title: "Mind & energy centers", body: "Guided sessions, grounding, nature sounds and the seven energy centers." },
    { at: 80, title: "Your profile & settings", body: "Coins, day and night themes, reminders, privacy and help." },
    { at: 140, title: "Check in & talk to Lucille", body: "The quick mood check-in, then voice or text with Lucille." },
]

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function DemoPage(p: Props) {
    const s = useEscape()
    const reduce = useReducedMotion()
    const v = React.useRef<HTMLVideoElement>(null)
    const chapters = (p.chapters && p.chapters.length ? p.chapters : DEFAULT_CHAPTERS).slice().sort((a, b) => a.at - b.at)
    const [active, setActive] = React.useState(0)
    const [playing, setPlaying] = React.useState(false)
    const [t, setT] = React.useState(0)
    const [dur, setDur] = React.useState(0)
    const video = src(p.demoVideo)
    const webm = src(p.demoVideoWebm)
    const fmt = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`

    const jump = (i: number) => {
        setActive(i)
        const el = v.current
        if (!el) return
        el.currentTime = chapters[i].at
        el.play().catch(() => {})
    }
    const toggle = () => { const el = v.current; if (!el) return; el.paused ? el.play().catch(() => {}) : el.pause() }
    const onTime = () => {
        const now = v.current?.currentTime || 0
        setT(now)
        let i = 0
        chapters.forEach((c, k) => { if (now >= c.at) i = k })
        if (i !== active) setActive(i)
    }
    const end = (i: number) => (chapters[i + 1] ? chapters[i + 1].at : dur || chapters[i].at + 20)

    return (
        <Page>
            <style>{DE_CSS}</style>
            <section className="esc-sec de-hero">
                <Backdrop top />
                <div className="esc-wrap de-grid">
                    <div className="esc-stack esc-serene" style={{ gap: 18, alignItems: "flex-start" }}>
                        <Eyebrow>App demo</Eyebrow>
                        <h1 className="esc-d esc-h1">Discover the <span className="esc-gold">Escape</span> app</h1>
                        <p className="esc-lede">A real walk through the app, recorded on an iPhone. Press play, or jump to any chapter.</p>
                        <div className="esc-row" style={{ gap: 12 }}>
                            <Button href={p.waitlistHref} arrow>Join the waitlist</Button>
                            <Button href={ROUTES.pricing} variant="ghost">View pricing</Button>
                        </div>
                        <ol className="de-chapters" aria-label="Chapters">
                            {chapters.map((c, i) => {
                                const on = i === active
                                const pct = on && dur ? Math.min(100, Math.max(0, ((t - c.at) / (end(i) - c.at)) * 100)) : i < active ? 100 : 0
                                return (
                                    <li key={c.title + i}>
                                        <button type="button" className={`de-ch ${on ? "on" : ""}`} onClick={() => jump(i)} aria-current={on ? "step" : undefined} disabled={!video} aria-label={`Chapter ${i + 1}: ${c.title}, at ${fmt(c.at)}`}>
                                            <span className="de-n esc-d">{String(i + 1).padStart(2, "0")}</span>
                                            <span className="esc-stack" style={{ gap: 3, flex: 1, minWidth: 0 }}>
                                                <span className="de-title">{c.title}<span className="de-time">{fmt(c.at)}</span></span>
                                                <AnimatePresence initial={false}>
                                                    {on && (
                                                        <motion.span className="de-body" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.6, ease: easeSoft }}>{c.body}</motion.span>
                                                    )}
                                                </AnimatePresence>
                                                <span className="de-bar" aria-hidden><span style={{ width: `${pct}%` }} /></span>
                                            </span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ol>
                    </div>

                    <motion.div className="de-phone-wrap" initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.6, ease: easeSoft, delay: 0.3 }}>
                        <div className="de-glow" aria-hidden />
                        <div className="de-phone">
                            <div className="de-island" aria-hidden />
                            {video ? (
                                <>
                                    <video ref={v} poster={src(p.demoPoster) || undefined} playsInline preload="metadata" onTimeUpdate={onTime} onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)}
                                        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onClick={toggle} aria-label="Escape app demo">
                                        {webm && <source src={webm} type="video/webm" />}
                                        <source src={video} type="video/mp4" />
                                        {p.captions && <track kind="captions" src={p.captions} srcLang="en" label="English" default />}
                                    </video>
                                    <AnimatePresence>
                                        {!playing && (
                                            <motion.button type="button" className="de-play" onClick={toggle} aria-label={t > 0 ? "Resume demo" : "Play demo"} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 0.6, ease: easeSoft }}>
                                                <Icon name="play" size={26} />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </>
                            ) : (
                                <div className="de-empty"><Orb mood={s.mood} size={140} live rings /><span className="esc-small">Upload the demo video in Framer.</span></div>
                            )}
                        </div>
                        {video && <span className="de-now esc-chip" aria-live="polite"><span className="esc-dot" aria-hidden />{playing ? "Now" : "Chapter"} · {chapters[active].title}</span>}
                    </motion.div>
                </div>
            </section>

            <section className="esc-sec" style={{ paddingTop: 0 }}>
                <div className="esc-wrap">
                    <ul className="de-trust">
                        <li><Icon name="shield" size={18} />Private by design</li>
                        <li><Icon name="spark" size={18} />Powered by Lucille AI</li>
                        <li><Icon name="leaf" size={18} />Built for your pace</li>
                    </ul>
                </div>
            </section>

            <ClosingCta eyebrow="Coming to iOS & Android" title={<>Be first to experience <span className="esc-gold">Escape</span></>} lede={p.crowdfundHref ? "Join the waitlist, or back Escape and get early access as a supporter." : "Join the waitlist and we'll let you know the moment it opens."} primary={{ label: "Join the waitlist", href: p.waitlistHref }} secondary={p.crowdfundHref ? { label: "Support Escape", href: p.crowdfundHref } : { label: "Join the beta", href: ROUTES.beta }} badges />
        </Page>
    )
}

const DE_CSS = `
.esc-sec.de-hero{padding-top:clamp(120px,12cqi,160px)}
.de-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:clamp(32px,5cqi,80px);align-items:center}
.de-chapters{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:8px;width:100%;max-width:560px}
.de-ch{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:flex;gap:16px;align-items:flex-start;padding:14px 18px;border-radius:20px;border:1px solid transparent;transition:background .6s var(--esc-ease-soft),border-color .6s var(--esc-ease-soft)}
.de-ch:hover{background:var(--esc-glass2)}
.de-ch.on{background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2));border-color:var(--esc-border)}
.de-ch:disabled{cursor:default}
.de-ch:focus-visible{outline:3px solid var(--esc-accent);outline-offset:3px}
.de-n{font-size:22px;color:var(--esc-faint);width:30px;flex:none;line-height:1.3;transition:color .6s}
.de-ch.on .de-n{color:var(--esc-accent)}
.de-title{display:flex;justify-content:space-between;gap:12px;font-weight:500;color:var(--esc-ink)}
.de-time{font-size:13px;color:var(--esc-faint);font-weight:400;font-variant-numeric:tabular-nums}
.de-body{display:block;overflow:hidden;font-size:15px;line-height:1.5;color:var(--esc-muted)}
.de-bar{display:block;height:2px;border-radius:2px;background:var(--esc-line);margin-top:8px;overflow:hidden}
.de-bar span{display:block;height:100%;background:var(--esc-accent);transition:width .3s linear}
.de-phone-wrap{position:relative;justify-self:center;display:flex;flex-direction:column;align-items:center;gap:18px}
.de-glow{position:absolute;inset:8% -18%;border-radius:50%;background:radial-gradient(closest-side,var(--esc-glowB),transparent 70%);filter:blur(40px);opacity:.9;animation:esc-breathe 8s var(--esc-ease-soft) infinite}
.de-phone{position:relative;width:min(340px,72vw);aspect-ratio:600/1036;border-radius:48px;padding:10px;background:linear-gradient(160deg,#2A3566,#0B1230);box-shadow:0 0 0 1px rgba(230,234,244,.18),0 50px 120px -40px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.18)}
.de-phone video{display:block;width:100%;height:100%;object-fit:cover;border-radius:38px;background:#0B1230;cursor:pointer}
.de-island{position:absolute;top:20px;left:50%;translate:-50% 0;width:92px;height:26px;border-radius:99px;background:#05081A;z-index:2;opacity:.92}
.de-play{all:unset;cursor:pointer;position:absolute;left:50%;top:50%;translate:-50% -50%;width:76px;height:76px;border-radius:50%;display:grid;place-items:center;color:#0B1230;background:rgba(246,248,255,.9);box-shadow:0 20px 60px -20px rgba(0,0,0,.6);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.de-play svg{margin-left:4px}
.de-play:focus-visible{outline:3px solid var(--esc-accent);outline-offset:4px}
.de-empty{position:absolute;inset:10px;border-radius:38px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0B1230;text-align:center;padding:20px}
.de-now{position:relative}
.de-trust{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:10px 26px;color:var(--esc-faint);font-size:14px;justify-content:center}
.de-trust li{display:inline-flex;gap:8px;align-items:center}
.de-trust svg{color:var(--esc-accent)}
@container (max-width:900px){.de-grid{grid-template-columns:minmax(0,1fr)}.de-phone-wrap{order:-1}.de-chapters{max-width:none}}
`

DemoPage.defaultProps = { demoVideo: "", demoVideoWebm: "", demoPoster: "", captions: "", chapters: DEFAULT_CHAPTERS, waitlistHref: ROUTES.beta, crowdfundHref: "" }
addPropertyControls(DemoPage, {
    demoVideo: { type: ControlType.File, title: "Demo video", allowedFileTypes: ["mp4", "mov"] },
    demoVideoWebm: { type: ControlType.File, title: "Demo WebM", allowedFileTypes: ["webm"] },
    demoPoster: { type: ControlType.Image, title: "Poster" },
    captions: { type: ControlType.File, title: "Captions", allowedFileTypes: ["vtt"] },
    chapters: {
        type: ControlType.Array, title: "Chapters",
        control: { type: ControlType.Object, controls: { at: { type: ControlType.Number, title: "Start (s)", min: 0, step: 1 }, title: { type: ControlType.String, title: "Title" }, body: { type: ControlType.String, title: "Text", displayTextArea: true } } },
    },
    waitlistHref: { type: ControlType.Link, title: "Waitlist link" },
    crowdfundHref: { type: ControlType.Link, title: "Indiegogo link" },
})
