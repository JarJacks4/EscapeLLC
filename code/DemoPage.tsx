// Escape — App Demo page body: an interactive, sound-on walkthrough of what makes Escape different.
// Fill width, auto height.
//
// One flow, in this order: Mood Analyzer reads you → Lucille responds (voice, memory, 120+
// languages) → a soundscape plays → a workout with Lucille coaching → coins earned → coins redeemed.
// The screens are drawn in code (no video), and the sound is real: Lucille's lines come from
// Denise's studio recordings with the app's voice finish, and the soundscape is a Lucille render.
// Audio files live in MEDIA_BASE/demo/ (see README); each one can be swapped in Framer's panel.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Page, Backdrop, Eyebrow, Button, Icon, Orb, ClosingCta, ROUTES, MEDIA_BASE, LINKS, easeSoft, type IconName } from "./EscapeKit.tsx"

const src = (v: any) => (typeof v === "string" ? v : v?.src) || ""
const DEMO = MEDIA_BASE + "demo/"

interface Props {
    voiceMood: string
    voiceListen: string
    voiceMemory: string
    voiceSoundscape: string
    voiceMove: string
    voiceReward: string
    soundscape: string
    waitlistHref: string
    crowdfundHref: string
}

const SOUND_KEYS = { mood: "voiceMood", listen: "voiceListen", memory: "voiceMemory", forest: "voiceSoundscape", move: "voiceMove", reward: "voiceReward", music: "soundscape" } as const
type Cue = { at: number; sound: keyof typeof SOUND_KEYS } | { at: number; chime: "tick" | "coin" | "done" }
interface Chapter { id: string; n: number; title: string; body: string; icon: IconName; dur: number; cues: Cue[]; captions: { at: number; to: number; text: string }[] }

const CHAPTERS: Chapter[] = [
    {
        id: "mood", n: 1, title: "Mood Analyzer", icon: "spark", dur: 18000,
        body: "A short camera read of your pulse and expression tells Escape how you're arriving.",
        cues: [{ at: 1700, chime: "tick" }, { at: 6900, chime: "done" }, { at: 7300, sound: "mood" }],
        captions: [{ at: 7300, to: 9800, text: "Here's what I noticed…" }, { at: 9800, to: 17200, text: "Because you're feeling restless, a one-minute reset gives that energy somewhere slow to go." }],
    },
    {
        id: "lucille", n: 2, title: "Lucille", icon: "chat", dur: 16000,
        body: "She picks up from your mood reading, remembers past sessions and speaks over 120 languages.",
        cues: [{ at: 2900, sound: "listen" }, { at: 6600, sound: "memory" }],
        captions: [{ at: 2900, to: 5600, text: "I'm here. Tell me a little more about that." }, { at: 6600, to: 8500, text: "Continue where you left off." }],
    },
    {
        id: "sound", n: 3, title: "Soundscapes", icon: "wave", dur: 24000,
        body: "Lucille suggests a soundscape for your mood, and it starts playing. Turn your sound up.",
        cues: [{ at: 1600, sound: "music" }, { at: 4200, sound: "forest" }],
        captions: [{ at: 4200, to: 7200, text: "The air is cool and smells of pine." }, { at: 7200, to: 11600, text: "Each step is soft on the moss." }, { at: 11600, to: 18600, text: "Mist moves between the trees, slow and unhurried." }],
    },
    {
        id: "move", n: 4, title: "Movement", icon: "move", dur: 15000,
        body: "Yoga, pilates, tai chi and short workouts, with Lucille coaching every move and breath.",
        cues: [{ at: 1900, sound: "move" }, { at: 13600, chime: "coin" }],
        captions: [{ at: 1900, to: 6000, text: "Wake up your spine and legs, then find your balance for the day." }, { at: 6000, to: 7900, text: "Mountain Pose." }, { at: 7900, to: 13300, text: "In for four. Out for six. Let your shoulders fall." }],
    },
    {
        id: "market", n: 5, title: "Marketplace", icon: "gift", dur: 13000,
        body: "Every bit of self-care earns Escape Coins. Redeem them for rewards, like real gift cards.",
        cues: [{ at: 900, chime: "coin" }, { at: 1800, chime: "coin" }, { at: 2700, chime: "coin" }, { at: 7000, chime: "done" }, { at: 7600, sound: "reward" }],
        captions: [{ at: 7600, to: 8800, text: "Well done." }, { at: 8800, to: 11600, text: "Showing up is the hard part, and you did it." }],
    },
]
const TOTAL = CHAPTERS.reduce((a, c) => a + c.dur, 0)

// ───────────────────────── tiny synth for UI chimes (no files, no CORS) ─────────────────────────
let actx: AudioContext | null = null
function chime(kind: "tick" | "coin" | "done", muted: boolean) {
    if (muted || typeof window === "undefined") return
    try {
        actx = actx || new (window.AudioContext || (window as any).webkitAudioContext)()
        if (actx.state === "suspended") actx.resume()
        const t0 = actx.currentTime
        const notes = kind === "coin" ? [988, 1319] : kind === "done" ? [659, 880, 1175] : [1568]
        notes.forEach((f, i) => {
            const o = actx!.createOscillator(), g = actx!.createGain()
            o.type = "sine"; o.frequency.value = f
            const s = t0 + i * 0.09
            g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(kind === "tick" ? 0.05 : 0.09, s + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.5)
            o.connect(g).connect(actx!.destination); o.start(s); o.stop(s + 0.55)
        })
    } catch { /* no audio */ }
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function DemoPage(p: Props) {
    const reduce = useReducedMotion()
    const [ch, setCh] = React.useState(0)
    const [t, setT] = React.useState(0) // ms into the chapter
    const [playing, setPlaying] = React.useState(false)
    const [started, setStarted] = React.useState(false)
    const [done, setDone] = React.useState(false)
    const [muted, setMuted] = React.useState(false)
    const audio = React.useRef<Record<string, HTMLAudioElement>>({})
    const fired = React.useRef<Set<string>>(new Set())
    const last = React.useRef<number>(0)
    const C = CHAPTERS[ch]

    // build the audio elements once (in the browser only)
    React.useEffect(() => {
        if (typeof window === "undefined") return
        const map: Record<string, HTMLAudioElement> = {}
        for (const [k, prop] of Object.entries(SOUND_KEYS)) {
            const url = src((p as any)[prop])
            if (!url) continue
            const a = new Audio(); a.preload = "auto"; a.src = url
            if (k === "music") { a.loop = true; a.volume = 0.85 }
            map[k] = a
        }
        audio.current = map
        return () => Object.values(map).forEach((a) => { a.pause(); a.removeAttribute("src"); a.load() })
    }, [p.voiceMood, p.voiceListen, p.voiceMemory, p.voiceSoundscape, p.voiceMove, p.voiceReward, p.soundscape])

    React.useEffect(() => { Object.values(audio.current).forEach((a) => (a.muted = muted)) }, [muted])

    const stopAll = React.useCallback(() => { Object.values(audio.current).forEach((a) => { a.pause(); try { a.currentTime = 0 } catch {} }) }, [])
    const pauseAll = React.useCallback(() => { Object.values(audio.current).forEach((a) => a.pause()) }, [])

    // the clock
    React.useEffect(() => {
        if (!playing) return
        let raf = 0
        last.current = performance.now()
        const tick = (now: number) => {
            const dt = Math.min(100, now - last.current); last.current = now
            setT((prev) => prev + dt)
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [playing])

    // cues + chapter advance
    React.useEffect(() => {
        if (!playing) return
        for (const cue of C.cues) {
            const key = `${ch}:${cue.at}`
            if (t >= cue.at && !fired.current.has(key)) {
                fired.current.add(key)
                if ("chime" in cue) chime(cue.chime, muted)
                else {
                    const a = audio.current[cue.sound]
                    if (a) { try { a.currentTime = 0 } catch {} a.play().catch(() => {}) }
                }
            }
        }
        // the soundscape ducks under Lucille's voice, then fades out at the end of its chapter
        const music = audio.current.music
        if (music && C.id === "sound") {
            const fade = C.dur - t < 2500 ? Math.max(0, (C.dur - t) / 2500) : 1
            const duck = t > 4000 && t < 18800 ? 0.4 : 0.85
            music.volume = Math.max(0, Math.min(1, duck * fade))
        }
        if (t >= C.dur) {
            if (ch < CHAPTERS.length - 1) go(ch + 1)
            else { setPlaying(false); setDone(true); stopAll() }
        }
    }, [t, playing]) // eslint-disable-line react-hooks/exhaustive-deps

    function go(i: number) {
        stopAll()
        fired.current = new Set([...fired.current].filter((k) => !k.startsWith(`${i}:`)))
        setCh(i); setT(0); setDone(false)
    }
    function start() {
        setStarted(true); setDone(false)
        fired.current = new Set(); go(0); setPlaying(true)
        chime("tick", muted) // unlocks audio on iOS inside the tap
        // prime every clip inside the tap so later cues are allowed to play on iOS
        Object.values(audio.current).forEach((a) => { const m = a.muted; a.muted = true; a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = m }).catch(() => { a.muted = m }) })
    }
    function toggle() {
        if (!started || done) return start()
        if (playing) { setPlaying(false); pauseAll() }
        else {
            setPlaying(true)
            // resume whatever was mid-line
            Object.values(audio.current).forEach((a) => { if (a.currentTime > 0 && !a.ended) a.play().catch(() => {}) })
        }
    }
    function jump(i: number) {
        if (!started) { setStarted(true); Object.values(audio.current).forEach((a) => { const m = a.muted; a.muted = true; a.play().then(() => { a.pause(); a.currentTime = 0; a.muted = m }).catch(() => { a.muted = m }) }) }
        go(i); setPlaying(true); chime("tick", muted)
    }

    const elapsed = CHAPTERS.slice(0, ch).reduce((a, c) => a + c.dur, 0) + Math.min(t, C.dur)
    const caption = C.captions.find((c) => t >= c.at && t < c.to)?.text

    return (
        <Page>
            <style>{DE_CSS}</style>
            <section className="esc-sec de-hero">
                <Backdrop top />
                <div className="esc-wrap de-grid">
                    <div className="esc-stack esc-serene" style={{ gap: 18, alignItems: "flex-start" }}>
                        <Eyebrow>Interactive demo · sound on</Eyebrow>
                        <h1 className="esc-d esc-h1">See what Escape <span className="esc-gold">does for you</span></h1>
                        <p className="esc-lede">One journey, about a minute and a half: your mood is read, Lucille responds, a soundscape plays, you move with Lucille, and your self-care turns into rewards.</p>
                        <div className="esc-row" style={{ gap: 12 }}>
                            <Button onClick={toggle} arrow={!playing}>{!started || done ? (done ? "Watch again" : "Play the demo") : playing ? "Pause" : "Resume"}</Button>
                            <button type="button" className="de-mute" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
                                <Icon name={muted ? "close" : "wave"} size={16} />{muted ? "Sound off" : "Sound on"}
                            </button>
                        </div>
                        <ol className="de-chapters" aria-label="Demo chapters">
                            {CHAPTERS.map((c, i) => {
                                const on = i === ch && started
                                const pct = !started ? 0 : i < ch || done ? 100 : on ? Math.min(100, (t / c.dur) * 100) : 0
                                return (
                                    <li key={c.id}>
                                        <button type="button" className={`de-ch ${on && !done ? "on" : ""}`} onClick={() => jump(i)} aria-current={on ? "step" : undefined}>
                                            <span className="de-n esc-d">{c.n}</span>
                                            <span style={{ flex: 1, minWidth: 0 }}>
                                                <span className="de-title"><span><Icon name={c.icon} size={16} /> {c.title}</span></span>
                                                <span className="de-body">{c.body}</span>
                                                <span className="de-bar" aria-hidden><span style={{ width: `${pct}%` }} /></span>
                                            </span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ol>
                    </div>

                    <div className="de-phone-wrap">
                        <div className="de-glow" aria-hidden style={{ background: `radial-gradient(closest-side, ${glowFor(started && !done ? C.id : "", t)}, transparent 70%)` }} />
                        <div className="de-phone">
                            <div className="de-island" aria-hidden />
                            <div className="de-screen">
                                {!started ? (
                                    <Intro onPlay={start} />
                                ) : done ? (
                                    <End onReplay={start} waitlistHref={p.waitlistHref} />
                                ) : (
                                    <AnimatePresence mode="wait">
                                        <motion.div key={C.id} className="de-scene-wrap" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: easeSoft }}>
                                            {C.id === "mood" && <MoodScene t={t} />}
                                            {C.id === "lucille" && <LucilleScene t={t} />}
                                            {C.id === "sound" && <SoundScene t={t} playing={playing} />}
                                            {C.id === "move" && <MoveScene t={t} playing={playing} />}
                                            {C.id === "market" && <MarketScene t={t} />}
                                        </motion.div>
                                    </AnimatePresence>
                                )}
                            </div>
                            {started && !done && <div className="de-cap" aria-live="polite">{caption ? <span><b>Lucille</b> {caption}</span> : null}</div>}
                        </div>
                        <div className="de-progress" aria-hidden><span style={{ width: `${(started ? (done ? 1 : elapsed / TOTAL) : 0) * 100}%` }} /></div>
                        <p className="esc-small" style={{ textAlign: "center", maxWidth: 360, margin: 0 }}>Demo screens. Lucille's voice is from her studio sessions with the app's AI voice finish. For wellbeing, not a medical device.</p>
                    </div>
                </div>
            </section>

            <ClosingCta eyebrow="Coming to iOS & Android" title={<>Be first to experience <span className="esc-gold">Escape</span></>} lede={p.crowdfundHref ? "Join the beta, or back Escape on Indiegogo and get early access as a supporter." : "Join the beta and we'll let you know the moment it opens."} primary={{ label: "Join the beta", href: p.waitlistHref }} secondary={p.crowdfundHref ? { label: "Support on Indiegogo", href: p.crowdfundHref } : undefined} badges />
        </Page>
    )
}

function glowFor(id: string, t: number) {
    if (id === "mood") return t > 6900 ? "rgba(224,88,154,.55)" : "rgba(142,124,217,.45)"
    if (id === "lucille") return "rgba(224,88,154,.4)"
    if (id === "sound") return "rgba(79,163,255,.45)"
    if (id === "move") return "rgba(240,138,29,.42)"
    if (id === "market") return "rgba(245,197,66,.42)"
    return "rgba(185,163,240,.5)"
}

// ───────────────────────── screens ─────────────────────────

function Intro({ onPlay }: { onPlay: () => void }) {
    return (
        <div className="de-scene de-center">
            <Orb mood="calm" size="46%" live rings />
            <p className="esc-d" style={{ fontSize: 24, margin: "18px 0 6px" }}>How's your inner weather?</p>
            <p className="de-mini">Turn your sound on</p>
            <button type="button" className="de-play" onClick={onPlay} aria-label="Play the demo with sound"><Icon name="play" size={26} /></button>
        </div>
    )
}

function End({ onReplay, waitlistHref }: { onReplay: () => void; waitlistHref: string }) {
    return (
        <div className="de-scene de-center">
            <Orb mood="calm" size="40%" live rings />
            <p className="esc-d" style={{ fontSize: 26, margin: "18px 0 6px" }}>That's Escape.</p>
            <p className="de-mini" style={{ maxWidth: 220 }}>Mood read, Lucille, sound, movement and rewards, in one flow.</p>
            <div className="esc-stack" style={{ gap: 10, marginTop: 14, width: "80%" }}>
                <a className="de-cta" href={waitlistHref}>Join the beta</a>
                <button type="button" className="de-cta ghost" onClick={onReplay}>Watch again</button>
            </div>
        </div>
    )
}

function MoodScene({ t }: { t: number }) {
    const scanning = t >= 1500 && t < 6900
    const result = t >= 6900
    const secs = Math.max(0, Math.ceil((6900 - Math.max(t, 1500)) / 1000))
    const bpm = Math.round(72 + Math.min(1, Math.max(0, (t - 1500) / 5400)) * 16)
    return (
        <div className="de-scene">
            <p className="de-top">Mood Scan</p>
            {!result ? (
                <>
                    <div className="de-cam">
                        <svg viewBox="0 0 200 240" className="de-face" aria-hidden>
                            <ellipse cx="100" cy="104" rx="56" ry="70" />
                            <path d="M58 228c4-38 22-54 42-54s38 16 42 54" />
                            <path d="M76 96q8-6 16 0M108 96q8-6 16 0M84 140q16 10 32 0" />
                            {scanning && <g className="de-mesh"><path d="M44 104h112M100 34v140M56 64l88 80M144 64l-88 80" /></g>}
                        </svg>
                        <span className="de-corner" /><span className="de-corner" /><span className="de-corner" /><span className="de-corner" />
                        {scanning && <span className="de-scanline" />}
                        <div className="de-chips">
                            {(scanning ? ["Face in frame", "Good light", `${secs} s`] : ["Pulse · camera", "How you feel · tap"]).map((c) => <span key={c}>{c}</span>)}
                        </div>
                    </div>
                    {scanning ? (
                        <div className="de-row-between"><span className="de-mini">Breathe with the orb. Hold the phone still.</span><span className="de-bpm"><Icon name="heart" size={14} />{bpm} bpm</span></div>
                    ) : (
                        <span className="de-btn">Start Mood Scan</span>
                    )}
                </>
            ) : (
                <div className="de-center" style={{ gap: 10, flex: 1 }}>
                    <Orb mood="restless" size="44%" live rings />
                    <span className="de-mini">You're arriving</span>
                    <p className="esc-d" style={{ fontSize: 30, margin: 0, color: "#F49AC2" }}>Restless</p>
                    <div className="de-card">
                        <b>What Lucille noticed</b>
                        <span>Pulse a little high (88 bpm), energy up, pleasantness low.</span>
                    </div>
                    <div className="de-card">
                        <b>Lucille suggests</b>
                        <span>A one-minute reset, then a soundscape tuned to your mood.</span>
                    </div>
                </div>
            )}
        </div>
    )
}

const LANGS = [["English", "I'm here."], ["Español", "Estoy aquí."], ["Français", "Je suis là."], ["Deutsch", "Ich bin da."], ["Português", "Estou aqui."], ["हिन्दी", "मैं यहाँ हूँ।"], ["日本語", "ここにいるよ。"], ["العربية", "أنا هنا."], ["한국어", "여기 있어요."]]

function LucilleScene({ t }: { t: number }) {
    const typed = "Too many tabs open in my head."
    const n = Math.max(0, Math.min(typed.length, Math.floor((t - 300) / 70)))
    const li = t >= 9200 ? Math.min(LANGS.length - 1, Math.floor((t - 9200) / 700)) : -1
    return (
        <div className="de-scene">
            <div className="de-row" style={{ gap: 10 }}>
                <Orb mood="restless" size={36} live />
                <div><p className="de-top" style={{ margin: 0, textAlign: "left" }}>Lucille</p><span className="de-mini">Picked up from your Mood Scan · Restless</span></div>
            </div>
            <div className="de-chat">
                {t > 300 && <div className="de-bub me">{typed.slice(0, n)}{n < typed.length && <span className="de-caret" />}<span className="de-voice" aria-hidden><i /><i /><i /><i /><i /></span></div>}
                {t > 2900 && <motion.div className="de-bub lu" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>I'm here. Tell me a little more about that.</motion.div>}
                {t > 6300 && (
                    <motion.div className="de-mem" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="de-mem-tag"><Icon name="book" size={12} />Remembered from last Tuesday</span>
                        <span>"Deadlines make my shoulders tight."</span>
                    </motion.div>
                )}
                {t > 6600 && li < 0 && <motion.div className="de-bub lu" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>Continue where you left off. Last time it was deadlines in your shoulders. Let's start there.</motion.div>}
                {li >= 0 && (
                    <motion.div className="de-lang" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <span className="de-lang-badge"><Icon name="globe" size={13} />Speaks 120+ languages</span>
                        <AnimatePresence mode="wait">
                            <motion.div key={li} className="de-bub lu" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                                <span className="de-lang-name">{LANGS[li][0]}</span>{LANGS[li][1]}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

function SoundScene({ t, playing }: { t: number; playing: boolean }) {
    const now = t >= 1600
    return (
        <div className="de-scene">
            {!now ? (
                <div className="de-center" style={{ flex: 1, gap: 12 }}>
                    <span className="de-mini">Lucille suggests</span>
                    <div className="de-card">
                        <b>Misty Forest</b>
                        <span>Soundscape tuned to your mood · Restless → calm</span>
                    </div>
                    <span className="de-btn">Play soundscape</span>
                </div>
            ) : (
                <div className="de-center" style={{ flex: 1, gap: 14 }}>
                    <span className="de-mini">Now playing</span>
                    <div className="de-art"><Orb mood="focused" size="70%" live rings /></div>
                    <p className="esc-d" style={{ fontSize: 26, margin: 0 }}>Misty Forest</p>
                    <span className="de-mini">Nature · narrated by Lucille</span>
                    <div className={`de-eq ${playing ? "on" : ""}`} aria-hidden>{Array.from({ length: 28 }).map((_, i) => <i key={i} style={{ animationDelay: `${(i * 137) % 900}ms`, animationDuration: `${700 + ((i * 211) % 700)}ms` }} />)}</div>
                    <div className="de-seek"><span style={{ width: `${Math.min(100, ((t - 1600) / 22400) * 100)}%` }} /></div>
                </div>
            )}
        </div>
    )
}

function MoveScene({ t, playing }: { t: number; playing: boolean }) {
    const inPlayer = t >= 1500
    const pose = t < 6000 ? "Spine & legs warm-up" : t < 7900 ? "Mountain Pose" : "Breathe: in 4, out 6"
    const left = Math.max(0, 480 - Math.floor(t / 1000))
    return (
        <div className="de-scene">
            {!inPlayer ? (
                <div className="de-center" style={{ flex: 1, gap: 12 }}>
                    <span className="de-mini">Body · picked for Restless</span>
                    <div className="de-card"><b>Morning Flow</b><span>Yoga · 8 min · coached by Lucille</span></div>
                    <span className="de-btn">Start session</span>
                </div>
            ) : (
                <div className="de-center" style={{ flex: 1, gap: 12 }}>
                    <span className="de-mini">Move 1 of 10</span>
                    <svg viewBox="0 0 120 160" className={`de-figure ${playing ? "on" : ""} ${t >= 6000 ? "tall" : ""}`} aria-hidden>
                        <circle cx="60" cy="24" r="12" />
                        <path d="M60 38v54" />
                        <path className="arm l" d="M60 50L34 78" />
                        <path className="arm r" d="M60 50L86 78" />
                        <path d="M60 92L44 146M60 92l16 54" />
                    </svg>
                    <p className="esc-d" style={{ fontSize: 24, margin: 0 }}>{pose}</p>
                    <div className="de-row-between" style={{ width: "100%" }}>
                        <span className="de-mini">Coached by Lucille</span>
                        <span className="de-bpm">{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</span>
                    </div>
                    {t >= 13600 && <motion.span className="de-toast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><Icon name="coin" size={14} />+10 coins · session complete</motion.span>}
                </div>
            )}
        </div>
    )
}

function MarketScene({ t }: { t: number }) {
    const earned = [
        { at: 900, t: "Mood check-in", c: 5 },
        { at: 1800, t: "Body session", c: 10 },
        { at: 2700, t: "First session today", c: 15 },
    ]
    const got = earned.filter((e) => t >= e.at).reduce((a, e) => a + e.c, 0)
    const store = t >= 4300
    const redeemed = t >= 7000
    const balance = 1020 + got - (redeemed ? 1000 : 0)
    return (
        <div className="de-scene">
            <div className="de-row-between"><p className="de-top" style={{ margin: 0 }}>{store ? "Marketplace" : "Today's coins"}</p><span className="de-coins"><Icon name="coin" size={14} />{balance.toLocaleString("en-US")}</span></div>
            {!store ? (
                <div className="esc-stack" style={{ gap: 10, marginTop: 14 }}>
                    {earned.map((e) => t >= e.at && (
                        <motion.div key={e.t} className="de-card de-earn" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                            <span>{e.t}</span><b className="de-plus">+{e.c}</b>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="esc-stack" style={{ gap: 12, marginTop: 14 }}>
                    <div className={`de-gift ${redeemed ? "done" : ""}`}>
                        <span className="de-gift-top"><Icon name="gift" size={16} />Gift card</span>
                        <b className="esc-d">$10</b>
                        <span className="de-mini">1,000 coins</span>
                        <span className="de-btn" style={{ alignSelf: "stretch" }}>{redeemed ? "Redeemed ✓" : "Redeem"}</span>
                    </div>
                    <div className="de-row" style={{ gap: 10 }}>
                        <div className="de-card" style={{ flex: 1 }}><b>Theme</b><span>300 coins</span></div>
                        <div className="de-card" style={{ flex: 1 }}><b>Aura</b><span>450 coins</span></div>
                    </div>
                    {redeemed && <motion.span className="de-toast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><Icon name="check" size={14} />Gift card redeemed</motion.span>}
                </div>
            )}
        </div>
    )
}

const DE_CSS = `
.esc-sec.de-hero{padding-top:clamp(120px,12cqi,160px)}
.de-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:clamp(32px,5cqi,80px);align-items:center}
.de-mute{all:unset;cursor:pointer;display:inline-flex;gap:8px;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--esc-border);color:var(--esc-muted);font-size:15px}
.de-mute:focus-visible{outline:3px solid var(--esc-accent);outline-offset:2px}
.de-chapters{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:6px;width:100%;max-width:560px}
.de-ch{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:flex;gap:16px;align-items:flex-start;padding:12px 16px;border-radius:20px;border:1px solid transparent;transition:background .6s var(--esc-ease-soft),border-color .6s var(--esc-ease-soft)}
.de-ch:hover{background:var(--esc-glass2)}
.de-ch.on{background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2));border-color:var(--esc-border)}
.de-ch:focus-visible{outline:3px solid var(--esc-accent);outline-offset:3px}
.de-n{font-size:22px;color:var(--esc-faint);width:26px;flex:none;line-height:1.3;transition:color .6s}
.de-ch.on .de-n{color:var(--esc-accent)}
.de-title{display:flex;gap:12px;font-weight:500;color:var(--esc-ink)}
.de-title svg{vertical-align:-2px;color:var(--esc-accent)}
.de-body{display:block;font-size:14px;line-height:1.5;color:var(--esc-muted);margin-top:2px}
.de-bar{display:block;height:2px;border-radius:2px;background:var(--esc-line);margin-top:8px;overflow:hidden}
.de-bar span{display:block;height:100%;background:var(--esc-accent)}
.de-phone-wrap{position:relative;justify-self:center;display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;min-width:0}
.de-glow{position:absolute;inset:4% 0 16%;border-radius:50%;filter:blur(40px);opacity:.9;transition:background 1.2s;pointer-events:none}
.de-phone{position:relative;width:min(340px,82vw);aspect-ratio:600/1100;border-radius:48px;padding:10px;background:linear-gradient(160deg,#2A3566,#0B1230);box-shadow:0 0 0 1px rgba(230,234,244,.18),0 50px 120px -40px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.18)}
.de-island{position:absolute;top:20px;left:50%;translate:-50% 0;width:92px;height:26px;border-radius:99px;background:#05081A;z-index:3;opacity:.92}
.de-screen{position:absolute;inset:10px;border-radius:38px;overflow:hidden;background:radial-gradient(120% 70% at 50% 0%,#1E2656,#0B1230 60%,#070B22);color:#E6EAF4}
.de-scene-wrap{position:absolute;inset:0}
.de-scene{position:absolute;inset:0;padding:54px 18px 74px;display:flex;flex-direction:column;gap:12px}
.de-center{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.de-scene.de-center{padding-bottom:40px}
.de-top{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:rgba(230,234,244,.7);margin:0;text-align:center}
.de-mini{font-size:12.5px;color:rgba(230,234,244,.68);line-height:1.4}
.de-row{display:flex;align-items:center}
.de-row-between{display:flex;align-items:center;justify-content:space-between;gap:10px}
.de-btn{display:inline-flex;justify-content:center;align-items:center;min-height:40px;padding:0 18px;border-radius:999px;background:#B9A3F0;color:#0B1230;font-weight:600;font-size:14px;align-self:center}
.de-card{display:flex;flex-direction:column;gap:3px;text-align:left;padding:10px 12px;border-radius:16px;background:rgba(230,234,244,.07);border:1px solid rgba(230,234,244,.14);font-size:12.5px;color:rgba(230,234,244,.8);width:100%;box-sizing:border-box}
.de-card b{font-weight:600;color:#E6EAF4;font-size:13.5px}
.de-play{all:unset;cursor:pointer;margin-top:18px;width:68px;height:68px;border-radius:50%;display:grid;place-items:center;color:#0B1230;background:rgba(246,248,255,.92);box-shadow:0 20px 60px -20px rgba(0,0,0,.6)}
.de-play svg{margin-left:4px}
.de-play:focus-visible,.de-cta:focus-visible{outline:3px solid #B9A3F0;outline-offset:4px}
.de-cta{all:unset;box-sizing:border-box;cursor:pointer;display:flex;justify-content:center;align-items:center;min-height:44px;border-radius:999px;background:#B9A3F0;color:#0B1230;font-weight:600;font-size:14px}
.de-cta.ghost{background:transparent;color:#E6EAF4;border:1px solid rgba(230,234,244,.3)}
.de-cam{position:relative;flex:1;border-radius:24px;overflow:hidden;background:radial-gradient(70% 60% at 50% 42%,rgba(185,163,240,.22),transparent 70%),#0E1538;border:1px solid rgba(230,234,244,.12);display:grid;place-items:center}
.de-face{width:62%;fill:none;stroke:rgba(230,234,244,.55);stroke-width:2;stroke-linecap:round}
.de-mesh path{stroke:rgba(224,88,154,.55);stroke-width:1;stroke-dasharray:3 4}
.de-corner{position:absolute;width:22px;height:22px;border:2px solid #B9A3F0}
.de-corner:nth-of-type(1){top:12px;left:12px;border-right:0;border-bottom:0;border-radius:8px 0 0 0}
.de-corner:nth-of-type(2){top:12px;right:12px;border-left:0;border-bottom:0;border-radius:0 8px 0 0}
.de-corner:nth-of-type(3){bottom:12px;left:12px;border-right:0;border-top:0;border-radius:0 0 0 8px}
.de-corner:nth-of-type(4){bottom:12px;right:12px;border-left:0;border-top:0;border-radius:0 0 8px 0}
.de-scanline{position:absolute;left:8%;right:8%;height:2px;background:linear-gradient(90deg,transparent,#F49AC2,transparent);box-shadow:0 0 14px #E0589A;animation:de-scan 2.4s ease-in-out infinite}
@keyframes de-scan{0%,100%{top:16%}50%{top:80%}}
.de-chips{position:absolute;left:0;right:0;bottom:12px;display:flex;justify-content:center;gap:6px;flex-wrap:wrap;padding:0 10px}
.de-chips span{font-size:11px;padding:4px 9px;border-radius:999px;background:rgba(11,18,48,.7);border:1px solid rgba(230,234,244,.18)}
.de-bpm{display:inline-flex;gap:6px;align-items:center;font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;color:#F49AC2;white-space:nowrap}
.de-chat{display:flex;flex-direction:column;gap:8px;margin-top:6px}
.de-bub{position:relative;max-width:88%;padding:9px 12px;border-radius:16px;font-size:13px;line-height:1.45}
.de-bub.me{align-self:flex-end;background:#B9A3F0;color:#0B1230;border-bottom-right-radius:6px;padding-bottom:20px}
.de-bub.lu{align-self:flex-start;background:rgba(230,234,244,.1);border:1px solid rgba(230,234,244,.14);border-bottom-left-radius:6px}
.de-caret{display:inline-block;width:1px;height:13px;background:#0B1230;margin-left:1px;vertical-align:-2px;animation:de-blink 1s steps(2) infinite}
@keyframes de-blink{50%{opacity:0}}
.de-voice{position:absolute;right:10px;bottom:6px;display:flex;gap:2px;align-items:flex-end;height:10px}
.de-voice i{width:2px;background:#0B1230;border-radius:2px;animation:de-eq .8s ease-in-out infinite alternate;height:4px}
.de-voice i:nth-child(2){animation-delay:.15s}.de-voice i:nth-child(3){animation-delay:.3s}.de-voice i:nth-child(4){animation-delay:.45s}.de-voice i:nth-child(5){animation-delay:.6s}
.de-mem{align-self:stretch;display:flex;flex-direction:column;gap:3px;padding:8px 12px;border-radius:14px;border:1px dashed rgba(245,197,66,.5);background:rgba(245,197,66,.08);font-size:12.5px;color:rgba(230,234,244,.85)}
.de-mem-tag{display:inline-flex;gap:6px;align-items:center;font-size:11px;font-weight:600;color:#F5C542;text-transform:uppercase;letter-spacing:.06em}
.de-lang{display:flex;flex-direction:column;gap:6px}
.de-lang-badge{align-self:flex-start;display:inline-flex;gap:6px;align-items:center;font-size:11px;font-weight:600;padding:4px 9px;border-radius:999px;background:rgba(79,163,255,.16);color:#9CC2FF;border:1px solid rgba(79,163,255,.35)}
.de-lang-name{display:block;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:rgba(230,234,244,.55);margin-bottom:2px}
.de-art{width:62%;aspect-ratio:1;border-radius:28px;display:grid;place-items:center;background:radial-gradient(closest-side,rgba(79,163,255,.25),transparent),rgba(230,234,244,.05);border:1px solid rgba(230,234,244,.12)}
.de-eq{display:flex;gap:3px;align-items:center;height:36px;width:86%;justify-content:center}
.de-eq i{flex:1;max-width:5px;height:20%;border-radius:3px;background:linear-gradient(#9CC2FF,#4FA3FF)}
.de-eq.on i{animation:de-eq 1s ease-in-out infinite alternate}
@keyframes de-eq{0%{height:15%}100%{height:100%}}
.de-seek{width:86%;height:3px;border-radius:3px;background:rgba(230,234,244,.15);overflow:hidden}
.de-seek span{display:block;height:100%;background:#4FA3FF}
.de-figure{width:42%;fill:none;stroke:#F5B26B;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 12px rgba(240,138,29,.6))}
.de-figure .arm{transform-origin:60px 50px;transform-box:view-box;transition:transform 1.2s cubic-bezier(.25,.6,.25,1)}
.de-figure.on .arm.l{animation:de-arm-l 4s ease-in-out infinite}
.de-figure.on .arm.r{animation:de-arm-r 4s ease-in-out infinite}
.de-figure.tall .arm.l{animation:none;transform:rotate(140deg)}
.de-figure.tall .arm.r{animation:none;transform:rotate(-140deg)}
@keyframes de-arm-l{0%,100%{transform:rotate(0)}50%{transform:rotate(120deg)}}
@keyframes de-arm-r{0%,100%{transform:rotate(0)}50%{transform:rotate(-120deg)}}
.de-toast{display:inline-flex;gap:6px;align-items:center;font-size:12.5px;font-weight:600;padding:7px 12px;border-radius:999px;background:rgba(245,197,66,.16);color:#F5C542;border:1px solid rgba(245,197,66,.4);align-self:center}
.de-coins{display:inline-flex;gap:6px;align-items:center;font-size:14px;font-weight:600;color:#F5C542;font-variant-numeric:tabular-nums}
.de-earn{flex-direction:row;justify-content:space-between;align-items:center}
.de-plus{color:#F5C542!important}
.de-gift{display:flex;flex-direction:column;gap:6px;align-items:flex-start;padding:16px;border-radius:20px;background:linear-gradient(150deg,rgba(245,197,66,.22),rgba(224,88,154,.18));border:1px solid rgba(245,197,66,.4);transition:transform .5s}
.de-gift.done{transform:scale(.98)}
.de-gift b{font-size:40px;line-height:1}
.de-gift-top{display:inline-flex;gap:6px;align-items:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em}
.de-cap{position:absolute;left:20px;right:20px;bottom:24px;min-height:20px;z-index:4;font-size:12.5px;line-height:1.45;color:#E6EAF4;text-align:center}
.de-cap span{display:inline-block;padding:6px 10px;border-radius:12px;background:rgba(5,8,26,.78);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.de-cap b{color:#B9A3F0;font-weight:600;margin-right:4px}
.de-progress{width:min(300px,74vw);height:3px;border-radius:3px;background:var(--esc-line);overflow:hidden}
.de-progress span{display:block;height:100%;background:var(--esc-accent)}
@media (prefers-reduced-motion:reduce){.de-scanline,.de-eq.on i,.de-voice i,.de-figure.on .arm,.de-caret{animation:none}}
@container (max-width:900px){.de-grid{grid-template-columns:minmax(0,1fr)}.de-phone-wrap{order:-1}.de-chapters{max-width:none}}
`

DemoPage.defaultProps = {
    voiceMood: DEMO + "lucille_mood.mp3",
    voiceListen: DEMO + "lucille_listen.mp3",
    voiceMemory: DEMO + "lucille_memory.mp3",
    voiceSoundscape: DEMO + "lucille_forest.mp3",
    voiceMove: DEMO + "lucille_move.mp3",
    voiceReward: DEMO + "lucille_reward.mp3",
    soundscape: DEMO + "soundscape_misty_forest.mp3",
    waitlistHref: ROUTES.beta,
    crowdfundHref: LINKS.indiegogo,
}
addPropertyControls(DemoPage, {
    voiceMood: { type: ControlType.File, title: "1 · Mood voice", allowedFileTypes: ["mp3", "m4a"] },
    voiceListen: { type: ControlType.File, title: "2 · Lucille voice", allowedFileTypes: ["mp3", "m4a"] },
    voiceMemory: { type: ControlType.File, title: "2 · Memory voice", allowedFileTypes: ["mp3", "m4a"] },
    soundscape: { type: ControlType.File, title: "3 · Soundscape", allowedFileTypes: ["mp3", "m4a"] },
    voiceSoundscape: { type: ControlType.File, title: "3 · Narration", allowedFileTypes: ["mp3", "m4a"] },
    voiceMove: { type: ControlType.File, title: "4 · Coaching voice", allowedFileTypes: ["mp3", "m4a"] },
    voiceReward: { type: ControlType.File, title: "5 · Reward voice", allowedFileTypes: ["mp3", "m4a"] },
    waitlistHref: { type: ControlType.Link, title: "Beta link" },
    crowdfundHref: { type: ControlType.Link, title: "Indiegogo link" },
})
