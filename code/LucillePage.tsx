// Escape — Lucille AI page body. Fill width, auto height.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import { Page, Backdrop, Reveal, Eyebrow, Button, SectionHead, Card, Feature, Orb, Icon, Faq, ClosingCta, ROUTES, useEscape, moodById, ease } from "./EscapeKit.tsx"

interface Props { primaryLabel: string; primaryHref: string }

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function LucillePage(p: Props) {
    return (
        <Page>
            <style>{LU_CSS}</style>
            <Hero {...p} />
            <Capabilities />
            <WhyLucille />
            <Voice />
            <Safety />
            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Questions" title="About Lucille" />
                    <Faq items={[
                        { q: "Is Lucille a therapist?", a: "No. Lucille is a self-care companion. She can help you reflect, slow down and build small habits, but she doesn't diagnose or treat anything and isn't a substitute for a professional. If you're in crisis, contact local emergency services (in the US, call or text 988)." },
                        { q: "Does she remember what I tell her?", a: "Lucille keeps the context that makes her helpful (your check-ins, goals and recent conversations) so you don't have to repeat yourself. You can delete your account and its data from Settings in the app at any time." },
                        { q: "Can I talk to her out loud?", a: "Yes. You can type or use voice. Her voice is warm with a slightly synthetic finish on purpose, so it's always clear you're talking with an AI." },
                        { q: "Is Lucille included in my plan?", a: <>Lucille is part of the Escape Journey Pass, along with everything else in the app. See <a className="esc-link" href={ROUTES.pricing}>pricing</a>.</> },
                    ]} />
                </div>
            </section>
            <ClosingCta eyebrow="Coming to iOS & Android" title={<>The future of self-care is <span className="esc-gold">personal</span>.</>} lede="Explore calmer, more personal reflection with a companion that adapts to you." primary={{ label: p.primaryLabel, href: p.primaryHref }} secondary={{ label: "View pricing", href: ROUTES.pricing }} />
        </Page>
    )
}

function Hero(p: Props) {
    const s = useEscape()
    const reduce = useReducedMotion()
    const m = moodById(s.mood)
    const lines = [
        { me: true, t: m ? `I'm feeling ${m.label.toLowerCase()} today.` : "I don't really know how I feel today." },
        { me: false, t: m && (m.id === "calm" || m.id === "energized" || m.id === "focused") ? "Love that. Want to make the most of it with something short that fits?" : "That's okay. We can start small. One slow breath with me, then we'll see what you need." },
        { me: true, t: "Okay. Let's try." },
    ]
    return (
        <section className="esc-sec lu-hero">
            <Backdrop top />
            <div className="esc-wrap lu-hero-in">
                <motion.div className="esc-stack esc-serene" style={{ gap: 20, alignItems: "flex-start" }}>
                    <Eyebrow>Your wellness companion</Eyebrow>
                    <h1 className="esc-d esc-h1">Meet Lucille</h1>
                    <p className="esc-d esc-gold" style={{ fontSize: "clamp(24px,2.6cqi,34px)", margin: "-4px 0 0" }}>A companion who listens first.</p>
                    <p className="esc-lede">Lucille is the heart of Escape: an AI companion that notices how you're arriving, remembers what matters to you, and suggests one small, kind next step. Talk or type, any time of day.</p>
                    <div className="esc-row" style={{ gap: 12 }}>
                        <Button href={p.primaryHref} arrow>{p.primaryLabel}</Button>
                        <Button href={ROUTES.pricing} variant="ghost">View pricing</Button>
                    </div>
                    <ul className="lu-pills">
                        {["Text & voice", "Remembers what matters", "Daily brief", "Plans with you"].map((t) => <li key={t} className="esc-chip"><Icon name="check" size={16} style={{ color: "var(--esc-accent)" }} />{t}</li>)}
                    </ul>
                </motion.div>
                <div className="lu-visual">
                    <Orb mood={s.mood} size="min(420px, 86%)" live rings hero label="Lucille, speaking" />
                    <div className="lu-chat esc-glass" aria-label="Example conversation with Lucille">
                        {lines.map((l, i) => (
                            <motion.span key={`${s.mood}-${i}`} className={`bub ${l.me ? "me" : "lu"}`} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.6 + i * 0.9 }}>
                                {l.t}
                            </motion.span>
                        ))}
                        <span className="esc-small" style={{ fontSize: 12 }}>Example conversation</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

function Capabilities() {
    return (
        <section className="esc-sec">
            <div className="esc-wrap">
                <SectionHead center eyebrow="Holistic intelligence" title="Everything Lucille can do with you" lede="AI, personalization and immersive audio, brought together around how you feel today." />
                <div className="esc-grid g3">
                    <Feature icon="chat" title="Conversation" body="Empathy-first conversation by text or voice. She asks before she advises and never rushes you." />
                    <Feature icon="spark" title="Daily drop & brief" body="One gentle pick each morning, shaped by your mood, your goals and what's worked for you before." delay={0.05} />
                    <Feature icon="calendar" title="Plans with you" body="Build a self-care plan together. Lucille breaks it into small daily steps and checks in kindly." delay={0.1} />
                    <Feature icon="wave" title="Soundscapes" body="Ask for a sound to match the moment. Audio shifts with your mood, the time and the weather." delay={0.15} />
                    <Feature icon="chart" title="Mood insights" body="Clear, compassionate patterns over time, and an Energy Scan that shows where you're growing." delay={0.2} />
                    <Feature icon="compass" title="Innerverse navigator" body="In the 3D Innerverse, Lucille becomes your guide through worlds shaped by your inner state." soon delay={0.25} />
                </div>
            </div>
        </section>
    )
}

function WhyLucille() {
    const rows = [
        ["Static scripts and the same playlist for everyone", "Responds to how you feel right now, and learns your rhythms"],
        ["Feeds engineered for attention and comparison", "No feed to scroll. Just you, at your pace"],
        ["Chatbots built for productivity, not presence", "Built to listen first, with care and gentle boundaries"],
    ]
    return (
        <section className="esc-sec">
            <Backdrop intensity={0.5} />
            <div className="esc-wrap">
                <SectionHead eyebrow="Why Lucille" title="Self-care shouldn't feel generic" lede="Between daily stress, quiet burnout and endless feeds, you deserve technology that understands you." />
                <Reveal className="esc-glass lu-compare">
                    <div className="lu-compare-head"><span className="esc-over">Most wellness apps</span><span className="esc-over" style={{ color: "var(--esc-accent)" }}>Lucille</span></div>
                    {rows.map(([a, b]) => (
                        <div key={a} className="lu-compare-row">
                            <span className="esc-p"><Icon name="close" size={18} style={{ color: "var(--esc-faint)" }} />{a}</span>
                            <span style={{ color: "var(--esc-ink)" }}><Icon name="check" size={18} style={{ color: "var(--esc-accent)" }} />{b}</span>
                        </div>
                    ))}
                </Reveal>
            </div>
        </section>
    )
}

function Voice() {
    const reduce = useReducedMotion()
    return (
        <section className="esc-sec">
            <div className="esc-wrap lu-voice">
                <div>
                    <SectionHead eyebrow="Her voice" title={<>Warm, and <span className="esc-gold">honestly</span> an AI</>} lede="Lucille's voice has a soft, slightly synthetic finish by design. It's comforting to listen to, and you always know who you're talking with." />
                    <Button href={ROUTES.demo} variant="ghost" icon={<Icon name="play" size={14} />}>Hear her in the demo</Button>
                </div>
                <Reveal className="esc-glass lu-wave" delay={0.1}>
                    <div className="bars" aria-hidden>
                        {Array.from({ length: 36 }).map((_, i) => (
                            <span key={i} style={{ animationDelay: `${(i % 9) * 0.11}s`, height: `${30 + 60 * Math.abs(Math.sin(i * 0.7))}%`, animationPlayState: reduce ? "paused" : "running" }} />
                        ))}
                    </div>
                    <div className="esc-row" style={{ gap: 12 }}>
                        <span className="esc-icon"><Icon name="mic" /></span>
                        <span className="esc-stack"><strong style={{ fontWeight: 500 }}>Voice conversation</strong><span className="esc-small">Hands-free, any time</span></span>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

function Safety() {
    return (
        <section className="esc-sec" style={{ paddingTop: 0 }}>
            <div className="esc-wrap">
                <Card className="lu-safety">
                    <span className="esc-icon"><Icon name="heart" /></span>
                    <div className="esc-stack" style={{ gap: 8 }}>
                        <h3 className="esc-d esc-h3">A companion, not a clinician</h3>
                        <p className="esc-p">Lucille is designed for everyday self-care and reflection. She doesn't diagnose or treat, and she'll point you to real people when it matters. If you're in crisis in the US, call or text <strong style={{ color: "var(--esc-ink)" }}>988</strong>; elsewhere, contact your local emergency number.</p>
                    </div>
                </Card>
            </div>
        </section>
    )
}

const LU_CSS = `
.esc-sec.lu-hero{padding-top:clamp(120px,12cqi,168px)}
.lu-hero-in{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(32px,5cqi,72px);align-items:center}
.lu-pills{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:8px}
.lu-visual{position:relative;display:grid;place-items:center;min-height:520px}
.lu-chat{position:absolute;right:0;bottom:0;width:min(330px,80%);border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:8px}
.bub{max-width:90%;padding:11px 15px;border-radius:18px;font-size:15px;line-height:1.45}
.bub.me{align-self:flex-end;background:color-mix(in oklab,var(--esc-accent) 24%,transparent);border-bottom-right-radius:6px}
.bub.lu{align-self:flex-start;background:var(--esc-glass1);border:1px solid var(--esc-border);border-bottom-left-radius:6px}
.lu-compare{border-radius:28px;padding:clamp(20px,3cqi,36px)}
.lu-compare-head,.lu-compare-row{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.lu-compare-head{padding-bottom:14px;border-bottom:1px solid var(--esc-line)}
.lu-compare-row{padding:18px 0;border-bottom:1px solid var(--esc-line)}
.lu-compare-row:last-child{border-bottom:0}
.lu-compare-row span{display:flex;gap:10px;align-items:flex-start;line-height:1.5}
.lu-compare-row svg{margin-top:2px}
.lu-voice{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,4cqi,64px);align-items:center}
.lu-wave{border-radius:32px;padding:clamp(24px,3cqi,36px);display:flex;flex-direction:column;gap:22px}
.bars{height:140px;display:flex;align-items:center;gap:5px}
.bars span{flex:1;border-radius:99px;background:linear-gradient(var(--esc-accent),var(--esc-glowB));animation:lu-bar 1.4s var(--esc-ease) infinite alternate;transform-origin:center}
@keyframes lu-bar{from{transform:scaleY(.35)}to{transform:scaleY(1)}}
.lu-safety{display:flex;gap:20px;align-items:flex-start;border-radius:28px}
@container (max-width:900px){.lu-hero-in,.lu-voice{grid-template-columns:minmax(0,1fr)}.lu-visual{min-height:420px}.lu-compare-head,.lu-compare-row{grid-template-columns:1fr}.lu-compare-head span:first-child{display:none}.lu-compare-row span:first-child{font-size:14px}}
`

LucillePage.defaultProps = { primaryLabel: "Get early access", primaryHref: ROUTES.beta }
addPropertyControls(LucillePage, {
    primaryLabel: { type: ControlType.String, title: "Main button" },
    primaryHref: { type: ControlType.Link, title: "Main link" },
})
