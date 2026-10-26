// Escape — "Say something to Lucille": one real reply from Lucille on the website.
//
// Calls POST /v1/public/taste on the Lucille API (with voice: true, so a reply can come with
// Lucille reading it in her own voice; the "Hear Lucille" button appears only when it does) (no account; 280 characters in, a few sentences
// out; per-visitor and daily limits on the server; nothing is stored). Crisis messages are
// answered by the app's safety screen with 988, never by the model. If the API is unreachable,
// it falls back to a gentle built-in reply so the card never looks broken.
//
// Use it inside LucillePage (it is already there) or drop it anywhere: Fill width, Fit height.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Page, Orb, Icon, Button, ROUTES, useEscape, moodById, easeSoft, postPublic } from "./EscapeKit.tsx"

type Phase = "idle" | "thinking" | "reply" | "limit"

const STARTERS = ["Long day. My head won't stop.", "I can't fall asleep lately.", "Honestly, I feel pretty good today."]
const OFFLINE_REPLY = "I'm glad you said something. Let's take one slow breath together: in for four, out for six. When you're ready, I'll be right here in the Escape app."

interface Props { ctaLabel: string; ctaHref: string; placeholder: string; compact: boolean }

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 440
 */
export default function LucilleTaste(p: Props) {
    return <Page bare style={{ background: "transparent" }}><TasteCard {...p} /></Page>
}

export function TasteCard(p: Partial<Props>) {
    const s = useEscape()
    const m = moodById(s.mood)
    const reduce = useReducedMotion()
    const [text, setText] = React.useState("")
    const [sent, setSent] = React.useState("")
    const [phase, setPhase] = React.useState<Phase>("idle")
    const [reply, setReply] = React.useState("")
    const [shown, setShown] = React.useState(0)
    const [crisis, setCrisis] = React.useState(false)
    const [remaining, setRemaining] = React.useState<number | null>(null)
    const [audio, setAudio] = React.useState<string | null>(null)
    const [speaking, setSpeaking] = React.useState(false)
    const player = React.useRef<HTMLAudioElement | null>(null)
    React.useEffect(() => () => { player.current?.pause() }, [])
    const inputRef = React.useRef<HTMLTextAreaElement>(null)
    const words = reply.split(" ")

    // reveal the reply a few words at a time, like Lucille speaking
    React.useEffect(() => {
        if (phase !== "reply") return
        if (reduce) { setShown(words.length); return }
        setShown(0)
        let i = 0
        const id = window.setInterval(() => { i += 1; setShown(i); if (i >= words.length) window.clearInterval(id) }, 55)
        return () => window.clearInterval(id)
    }, [phase, reply])

    const send = async (msg?: string) => {
        const message = (msg ?? text).trim()
        if (!message || phase === "thinking") return
        setSent(message); setText(""); setPhase("thinking"); setCrisis(false); setAudio(null); player.current?.pause(); setSpeaking(false)
        const started = Date.now()
        const res = await postPublic("/v1/public/taste", { message: message.slice(0, 280), mood: s.mood || undefined, voice: true }, 25000)
        const wait = Math.max(0, 900 - (Date.now() - started)) // let the orb "think" a beat
        await new Promise((r) => setTimeout(r, wait))
        const d = res.data || {}
        if (res.ok && d.reply) {
            setReply(d.reply); setRemaining(typeof d.remaining === "number" ? d.remaining : null)
            setCrisis(d.source === "crisis")
            setAudio(typeof d.audio === "string" ? d.audio : null)
            setPhase(d.source === "limit" ? "limit" : "reply")
        } else {
            setReply(OFFLINE_REPLY); setRemaining(null); setPhase("reply")
        }
    }
    const hear = () => {
        if (!audio) return
        if (speaking) { player.current?.pause(); setSpeaking(false); return }
        const a = player.current && player.current.src === audio ? player.current : new Audio(audio)
        player.current = a
        a.onended = () => setSpeaking(false)
        a.currentTime = 0
        a.play().then(() => setSpeaking(true)).catch(() => setSpeaking(false))
    }
    const again = () => { player.current?.pause(); setSpeaking(false); setAudio(null); setPhase("idle"); setReply(""); setSent(""); setTimeout(() => inputRef.current?.focus(), 50) }
    const left = 280 - text.length

    return (
        <div className="lt esc-glass" style={{ "--hue": m ? m.hue : "#8E7CD9" } as any}>
            <style>{CSS}</style>
            <div className="lt-head">
                <Orb mood={s.mood} size={44} live glow={phase === "thinking" || speaking} rings={phase === "thinking" || speaking} breathe />
                <div className="esc-stack" style={{ gap: 2 }}>
                    <strong style={{ fontWeight: 500 }}>Lucille</strong>
                    <span className="esc-small" aria-live="polite">{phase === "thinking" ? "Thinking…" : speaking ? "Speaking…" : phase === "idle" ? "Say something, she'll answer" : "AI companion"}</span>
                </div>
            </div>

            <div className="lt-body" aria-live="polite">
                <AnimatePresence initial={false}>
                    {phase === "idle" && (
                        <motion.div key="idle" className="lt-starters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: easeSoft }}>
                            {STARTERS.map((st) => (
                                <button key={st} type="button" className="lt-chip" onClick={() => send(st)}>{st}</button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                {sent && <motion.p className="bub me" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: easeSoft }}>{sent}</motion.p>}
                {phase === "thinking" && (
                    <motion.p className="bub lu lt-dots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} aria-label="Lucille is thinking"><span /><span /><span /></motion.p>
                )}
                {(phase === "reply" || phase === "limit") && (
                    <motion.p className="bub lu" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeSoft }}>
                        {words.slice(0, shown).join(" ")}
                        {shown < words.length && <span className="lt-caret" aria-hidden />}
                    </motion.p>
                )}
                {audio && !crisis && shown >= words.length && (
                    <motion.button type="button" className={`lt-hear ${speaking ? "on" : ""}`} onClick={hear} aria-pressed={speaking} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeSoft }}>
                        <span className="lt-hear-ic" aria-hidden>{speaking ? <span className="lt-bars"><i /><i /><i /><i /></span> : <Icon name="play" size={12} />}</span>
                        {speaking ? "Pause" : "Hear Lucille say it"}
                    </motion.button>
                )}
                {crisis && shown >= words.length && (
                    <a className="lt-crisis" href="tel:988"><Icon name="heart" size={16} /> Call or text 988 (US) · free, 24/7</a>
                )}
            </div>

            {phase === "idle" || phase === "thinking" ? (
                <form className="lt-form" onSubmit={(e) => { e.preventDefault(); send() }}>
                    <label className="esc-sr" htmlFor="lt-input">Your message to Lucille</label>
                    <textarea id="lt-input" ref={inputRef} rows={2} maxLength={280} value={text} disabled={phase === "thinking"}
                        placeholder={p.placeholder || "Tell Lucille how you're doing…"}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }} />
                    <div className="lt-row">
                        <span className="esc-small" aria-hidden>{left < 60 ? `${left} left` : "One message · not saved"}</span>
                        <button type="submit" className="lt-send" disabled={!text.trim() || phase === "thinking"} aria-label="Send to Lucille"><Icon name="arrow" size={18} /></button>
                    </div>
                </form>
            ) : (
                <motion.div className="lt-after" initial={{ opacity: 0 }} animate={{ opacity: shown >= words.length ? 1 : 0 }} transition={{ duration: 0.6, ease: easeSoft }}>
                    <p className="esc-small" style={{ margin: 0 }}>{phase === "limit" ? "That's today's preview." : "Want to keep talking? Lucille remembers you in the app."}</p>
                    <div className="esc-row" style={{ gap: 8 }}>
                        <Button href={p.ctaHref || ROUTES.beta} small arrow>{p.ctaLabel || "Get early access"}</Button>
                        {phase !== "limit" && remaining !== 0 && <button type="button" className="lt-again" onClick={again}>Say something else</button>}
                    </div>
                </motion.div>
            )}
            <p className="lt-note">Lucille is an AI, not a therapist. Messages aren't saved. In crisis? Call or text 988.</p>
        </div>
    )
}

const CSS = `
.lt{border-radius:28px;padding:18px;display:flex;flex-direction:column;gap:14px;width:100%;max-width:460px;background:var(--esc-nav)}
.lt-head{display:flex;align-items:center;gap:12px}
.lt-body{display:flex;flex-direction:column;gap:8px;min-height:96px}
.lt .bub{margin:0;max-width:92%;padding:11px 15px;border-radius:18px;font-size:15px;line-height:1.5}
.lt .bub.me{align-self:flex-end;background:color-mix(in oklab,var(--hue) 28%,transparent);border-bottom-right-radius:6px;color:var(--esc-ink)}
.lt .bub.lu{align-self:flex-start;background:var(--esc-glass1);border:1px solid var(--esc-border);border-bottom-left-radius:6px;color:var(--esc-ink)}
.lt-starters{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.lt-chip{all:unset;box-sizing:border-box;cursor:pointer;min-height:40px;padding:8px 14px;border-radius:14px;font-size:14px;color:var(--esc-muted);border:1px dashed var(--esc-border);transition:border-color .3s,color .3s}
.lt-chip:hover{color:var(--esc-ink);border-color:var(--hue)}
.lt-chip:focus-visible,.lt-again:focus-visible,.lt-send:focus-visible{outline:3px solid var(--esc-accent);outline-offset:2px}
.lt-dots{display:inline-flex;gap:5px;align-items:center;min-height:22px}
.lt-dots span{width:7px;height:7px;border-radius:50%;background:var(--esc-muted);animation:lt-dot 1.2s var(--esc-ease) infinite}
.lt-dots span:nth-child(2){animation-delay:.18s}.lt-dots span:nth-child(3){animation-delay:.36s}
@keyframes lt-dot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
.lt-caret{display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-2px;background:var(--esc-accent);animation:lt-blink 1s steps(2) infinite}
@keyframes lt-blink{to{opacity:0}}
.lt-hear{all:unset;box-sizing:border-box;cursor:pointer;align-self:flex-start;display:inline-flex;align-items:center;gap:10px;min-height:40px;padding:0 14px 0 6px;border-radius:999px;font-size:14px;font-weight:500;color:var(--esc-ink);background:var(--esc-glass1);border:1px solid var(--esc-border);transition:border-color .3s}
.lt-hear:hover,.lt-hear.on{border-color:var(--hue)}
.lt-hear:focus-visible{outline:3px solid var(--esc-accent);outline-offset:2px}
.lt-hear-ic{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:var(--esc-onAccent);background:var(--esc-accent)}
.lt-bars{display:flex;gap:2px;align-items:center;height:12px}
.lt-bars i{width:2px;height:100%;background:currentColor;border-radius:2px;animation:lt-bar .9s var(--esc-ease) infinite alternate}
.lt-bars i:nth-child(2){animation-delay:.15s}.lt-bars i:nth-child(3){animation-delay:.3s}.lt-bars i:nth-child(4){animation-delay:.45s}
@keyframes lt-bar{from{transform:scaleY(.3)}to{transform:scaleY(1)}}
.lt-crisis{display:inline-flex;gap:8px;align-items:center;min-height:40px;padding:0 14px;border-radius:14px;font-weight:500;color:#0B1230;background:#F5C26B;text-decoration:none;align-self:flex-start}
.lt-form{display:flex;flex-direction:column;gap:6px;border-radius:20px;padding:10px 10px 8px 14px;background:var(--esc-glass2);border:1px solid var(--esc-border);transition:border-color .3s}
.lt-form:focus-within{border-color:var(--hue)}
.lt-form textarea{all:unset;box-sizing:border-box;width:100%;resize:none;font:400 16px/1.45 "Work Sans",system-ui,sans-serif;color:var(--esc-ink);min-height:46px}
.lt-form textarea::placeholder{color:var(--esc-faint)}
.lt-row{display:flex;justify-content:space-between;align-items:center;gap:10px}
.lt-send{all:unset;cursor:pointer;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:var(--esc-onAccent);background:var(--esc-accent);transition:opacity .3s,transform .3s}
.lt-send:disabled{opacity:.4;cursor:default}
.lt-send:not(:disabled):hover{transform:translateX(2px)}
.lt-after{display:flex;flex-direction:column;gap:10px}
.lt-again{all:unset;cursor:pointer;min-height:44px;padding:0 14px;border-radius:999px;font-size:14px;font-weight:500;color:var(--esc-ink);border:1px solid var(--esc-border)}
.lt-note{margin:0;font-size:12px;line-height:1.45;color:var(--esc-faint)}
`

LucilleTaste.defaultProps = { ctaLabel: "Get early access", ctaHref: ROUTES.beta, placeholder: "Tell Lucille how you're doing…", compact: false }
addPropertyControls(LucilleTaste, {
    ctaLabel: { type: ControlType.String, title: "Button" },
    ctaHref: { type: ControlType.Link, title: "Button link" },
    placeholder: { type: ControlType.String, title: "Placeholder" },
})
