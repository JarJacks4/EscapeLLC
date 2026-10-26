// Escape — Home page body (between SiteNav and SiteFooter). Fill width, auto height.
//
// The hero keeps the app's splash animation exactly: the same face loop, the same white→royal
// glow at the bottom, the same ESCAPE Lottie, and the same fade timings as
// SplashScreenVersion5 (page 600 ms, image 1610 ms, glow 1490 ms, column 1730 ms, text 2400 ms).
// Upload media/escape_splash.mp4 to "Splash video", media/escape_splash.webm to "Splash WebM"
// (plays where H.264 can't) and the poster to "Splash poster".
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import {
    Page, Backdrop, Reveal, Eyebrow, Button, SectionHead, Card, Feature, Orb, Wordmark, Icon, ClosingCta,
    MOODS, CENTERS, COIN_RULES, ROUTES, LINKS, SPLASH_POSTER, MEDIA_BASE, escape, useEscape, moodById, ease, type MoodId,
} from "./EscapeKit.tsx"

const src = (v: any) => (typeof v === "string" ? v : v?.src) || ""

interface Props {
    splashVideo: string
    splashVideoWebm: string
    splashPoster: any
    primaryLabel: string
    primaryHref: string
    demoHref: string
    founderQuote: string
    founderName: string
    founderRole: string
    appStoreUrl: string
    playUrl: string
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function HomePage(p: Props) {
    return (
        <Page>
            <style>{HOME_CSS}</style>
            <Hero {...p} />
            <Bento />
            <TryIt />
            <HowItWorks />
            <Journey />
            <Privacy />
            <Welcome quote={p.founderQuote} name={p.founderName} role={p.founderRole} />
            <RewardsTeaser />
            <ClosingCta
                eyebrow="A self-care revolution within"
                title={<>Ready when <span className="esc-gold">you</span> are.</>}
                lede="Join the early access list and be first in when Escape opens on iOS and Android."
                primary={{ label: p.primaryLabel, href: p.primaryHref }}
                secondary={{ label: "See pricing", href: ROUTES.pricing }}
                badges appStoreUrl={p.appStoreUrl || undefined} playUrl={p.playUrl || undefined}
            />
        </Page>
    )
}

// ───────────────────────── hero (the app splash) ─────────────────────────

function Hero(p: Props) {
    const reduce = useReducedMotion()
    const fade = (ms: number, delay = 0, curve: any = [0.42, 0, 1, 1]) =>
        reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: ms / 1000, ease: curve, delay } }
    const video = src(p.splashVideo)
    const webm = src(p.splashVideoWebm)
    const poster = src(p.splashPoster) || SPLASH_POSTER
    return (
        <motion.section className="hero" {...fade(600)}>
            <Backdrop top />
            <div className="esc-wrap hero-in">
                <div className="hero-copy esc-serene">
                    <Eyebrow>AI self-care companion · Powered by Lucille</Eyebrow>
                    <h1 className="esc-d esc-h1">Your Everyday Escape</h1>
                    <p className="esc-d esc-gold hero-tag">Not a way out — a way in.</p>
                    <p className="esc-lede">A self-care app and immersive experience for reflection, presence and personal expression, at your own pace. Check in, talk with Lucille, and get a day that fits how you actually feel.</p>
                    <div className="esc-row" style={{ gap: 12, marginTop: 8 }}>
                        <Button href={p.primaryHref} arrow>{p.primaryLabel}</Button>
                        <Button href={p.demoHref} variant="ghost" icon={<span className="hero-play"><Icon name="play" size={12} /></span>}>Watch the app demo</Button>
                    </div>
                    <ul className="hero-trust">
                        <li><Icon name="shield" size={18} /> Private by design</li>
                        <li><Icon name="lock" size={18} /> Your data is never sold</li>
                        <li><Icon name="star" size={18} /> Free during preview</li>
                    </ul>
                </div>

                <div className="hero-visual" aria-label="Escape splash: a figure made of soft blue light, with the Escape wordmark" role="img">
                    <motion.div className="hero-arch" {...(reduce ? {} : { initial: { opacity: 0, filter: "blur(14px)", scale: 1.02 }, animate: { opacity: 1, filter: "blur(0px)", scale: 1 }, transition: { duration: 1.61, ease: [0.42, 0, 0.58, 1] } })}>
                        {video ? (
                            <video poster={poster} muted autoPlay loop playsInline preload="auto">
                                {webm && <source src={webm} type="video/webm" />}
                                <source src={video} type="video/mp4" />
                            </video>
                        ) : (
                            <img src={poster} alt="" />
                        )}
                        <motion.div className="hero-glow" aria-hidden {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 0.7 }, transition: { duration: 1.49, ease: [0.42, 0, 1, 1] } })} />
                        <div className="hero-word">
                            <Wordmark color="#1C2645" width="100%" label={false} />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    )
}

// ───────────────────────── welcome + founder note (further down the page) ─────────────────────────

function Welcome(props: { quote: string; name: string; role: string }) {
    return (
        <section className="esc-sec">
            <div className="esc-wrap">
                <Reveal className="esc-glass founder">
                    <span className="esc-over">Welcome to Escape</span>
                    <p className="esc-lede" style={{ maxWidth: 640, margin: 0 }}>Self-care, made for you: thoughtful tools that meet you where you are, guided by an AI companion that listens first.</p>
                    <blockquote className="esc-d">“{props.quote}”</blockquote>
                    <span className="esc-p"><strong style={{ color: "var(--esc-ink)", fontWeight: 500 }}>{props.name}</strong> · {props.role}</span>
                </Reveal>
            </div>
        </section>
    )
}

// ───────────────────────── bento: what's inside ─────────────────────────

function Bento() {
    const s = useEscape()
    return (
        <section className="esc-sec">
            <Backdrop intensity={0.55} />
            <div className="esc-wrap">
                <SectionHead center eyebrow="What's inside" title="Everything Escape does for you" lede="It starts with how you're arriving. Escape reads your mood, and everything else follows." />
                <div className="bento">
                    <Card className="b-lucille b-mood esc-stack" style={{ gap: 16 }}>
                        <div className="moodcam" aria-hidden>
                            <span className="moodcam-corner" /><span className="moodcam-corner" /><span className="moodcam-corner" /><span className="moodcam-corner" />
                            <Orb mood={s.mood || "restless"} size="58%" live rings />
                            <span className="moodcam-line" />
                            <span className="moodcam-tag">Reading your mood…</span>
                        </div>
                        <div>
                            <span className="esc-over">Our biggest feature</span>
                            <h3 className="esc-d esc-h3" style={{ marginTop: 6 }}>Mood Analyzer</h3>
                        </div>
                        <p className="esc-p">A quick look through your camera reads how you're arriving. Lucille, your soundscape, your session and your colors all adapt to it, before you type a word.</p>
                        <a className="esc-link" href={ROUTES.demo} style={{ marginTop: "auto" }}>See it in the demo <Icon name="arrow" size={16} /></a>
                    </Card>
                    <Card className="esc-stack" style={{ gap: 12 }} delay={0.05}>
                        <div className="esc-row" style={{ gap: 12 }}>
                            <Orb mood={s.mood} size={44} live />
                            <h3 className="esc-d esc-h3" style={{ margin: 0 }}>Lucille AI</h3>
                        </div>
                        <p className="esc-p">Talk or type in over 120 languages. She picks up from your mood reading and remembers what matters to you.</p>
                        <a className="esc-link" href={ROUTES.lucille} style={{ marginTop: "auto" }}>Meet Lucille <Icon name="arrow" size={16} /></a>
                    </Card>
                    <Feature icon="wave" title="Soundscapes" body="Lucille suggests a living soundscape for your mood and the weather outside, with a calmer night mode for sleep." delay={0.1} />
                    <Feature icon="move" title="Movement" body="Yoga, pilates, tai chi and short workouts, with Lucille coaching you through every rep and breath." delay={0.15} />
                    <Feature icon="gift" title="Marketplace" body="Earn Escape Coins for every bit of self-care, then redeem them for rewards, including real gift cards." delay={0.2} />
                    <Card className="b-scan esc-stack" style={{ gap: 14 }} delay={0.25}>
                        <div className="esc-row" style={{ justifyContent: "space-between" }}>
                            <span className="esc-icon"><Icon name="spark" /></span>
                            <span className="esc-chip" style={{ minHeight: 28 }}>Unlocks at 1,000 coins</span>
                        </div>
                        <h3 className="esc-d esc-h3" style={{ marginTop: 10 }}>Energy Scan</h3>
                        <p className="esc-p">A daily read of seven energy centers, drawn from your check-ins, sessions and journal. It shows where you're balanced and what to try next.</p>
                        <div className="centers" aria-label="The seven energy centers">
                            {CENTERS.map((c) => <span key={c.name} title={c.name} style={{ background: c.color, boxShadow: `0 0 14px ${c.color}` }} />)}
                        </div>
                    </Card>
                    <Feature icon="cube" title="Innerverse" body="Explore 3D worlds with your own avatar, play mini games and meet people from around the world." soon delay={0.3} />
                </div>
            </div>
        </section>
    )
}

// ───────────────────────── try it: the check-in (tints the site) ─────────────────────────

const PICKS: Record<MoodId, { pick: string; why: string }> = {
    calm: { pick: "A 5-minute body scan", why: "Keep the calm you've got and let it settle in." },
    energized: { pick: "A 10-minute yoga flow", why: "Spend the energy on something that feels good." },
    focused: { pick: "A focus soundscape", why: "Protect the clear headspace while it lasts." },
    restless: { pick: "Box breathing, 4 rounds", why: "Give the buzzing somewhere slow to land." },
    tired: { pick: "Deep-sleep breathing", why: "Rest counts. Let the evening wind down." },
    low: { pick: "A short walk with Lucille", why: "Gentle, small, and you don't have to talk." },
}

function TryIt() {
    const s = useEscape()
    const m = moodById(s.mood)
    const [hov, setHov] = React.useState<MoodId | null>(null)
    return (
        <section className="esc-sec">
            <div className="esc-wrap tryit">
                <div>
                    <SectionHead eyebrow="Try it" title={<>How are you, <span className="esc-gold">really</span>?</>} lede="This is the check-in from the app. Pick a mood and watch the site change with you, the same way Escape does." />
                    <div className="moods" role="radiogroup" aria-label="Your mood">
                        {MOODS.map((mood) => {
                            const on = s.mood === mood.id
                            return (
                                <button key={mood.id} type="button" role="radio" aria-checked={on} className={`mood ${on ? "on" : ""}`} style={{ "--hue": mood.hue } as any} onClick={() => escape.setMood(on ? null : mood.id)} onMouseEnter={() => setHov(mood.id)} onMouseLeave={() => setHov(null)} onFocus={() => setHov(mood.id)} onBlur={() => setHov(null)}>
                                    <span className="mood-orb"><Orb mood={mood.id} size="100%" glow={on} breathe={on} live={on || hov === mood.id} warm /></span>
                                    <span className="esc-stack" style={{ alignItems: "flex-start" }}>
                                        <span style={{ fontWeight: 500 }}>{mood.label}</span>
                                        <span className="esc-small">{mood.line}</span>
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
                <Reveal className="esc-glass esc-glow tryit-card" delay={0.1}>
                    <Orb mood={s.mood} size="min(320px, 70%)" live rings />
                    <div aria-live="polite" className="esc-stack" style={{ gap: 8, alignItems: "center", textAlign: "center" }}>
                        <span className="esc-over">{m ? `Feeling ${m.label.toLowerCase()}` : "Waiting for you"}</span>
                        <h3 className="esc-d esc-h3">{m ? PICKS[m.id].pick : "Choose a mood to see today's pick"}</h3>
                        <p className="esc-p">{m ? PICKS[m.id].why : "Lucille suggests one small thing that fits. No streak guilt, no pressure."}</p>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

// ───────────────────────── how it works ─────────────────────────

const STEPS = [
    { n: "01", title: "Check in", body: "Tell Escape how you're arriving: a mood, a word, or a few lines to Lucille.", mood: "low" as MoodId },
    { n: "02", title: "Understand", body: "Lucille listens without judging and connects today with what you've shared before.", mood: "focused" as MoodId },
    { n: "03", title: "Personalize", body: "Your day fills in: a breathwork, a soundscape, a movement session, a reflective prompt.", mood: "calm" as MoodId },
    { n: "04", title: "Adapt", body: "Over weeks, Escape learns your rhythms and your Energy Scan shows how you're growing.", mood: "energized" as MoodId },
]

function HowItWorks() {
    const [step, setStep] = React.useState(0)
    const refs = React.useRef<(HTMLLIElement | null)[]>([])
    React.useEffect(() => {
        if (typeof IntersectionObserver === "undefined") return
        const io = new IntersectionObserver(
            (es) => es.forEach((e) => e.isIntersecting && setStep(Number((e.target as HTMLElement).dataset.i))),
            { rootMargin: "-40% 0px -40% 0px" }
        )
        refs.current.forEach((el) => el && io.observe(el))
        return () => io.disconnect()
    }, [])
    return (
        <section className="esc-sec">
            <Backdrop intensity={0.6} />
            <div className="esc-wrap how">
                <div className="how-sticky">
                    <SectionHead eyebrow="How Lucille works" title="Shaped by emotional science and human care" lede="Not to treat. Not to judge. Just to gently personalize your self-care." />
                    <div className="how-orb" aria-hidden><Orb mood={STEPS[step].mood} size="100%" live /></div>
                </div>
                <ol className="how-steps">
                    {STEPS.map((st, i) => (
                        <li key={st.n} ref={(el) => { refs.current[i] = el }} data-i={i}>
                            <Reveal className={`esc-glass how-step ${i === step ? "on" : ""}`} delay={i * 0.05}>
                                <span className="how-n esc-d">{st.n}</span>
                                <div className="esc-stack" style={{ gap: 8 }}>
                                    <h3 className="esc-d esc-h3">{st.title}</h3>
                                    <p className="esc-p">{st.body}</p>
                                </div>
                            </Reveal>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}

// ───────────────────────── journey: coins → energy centers ─────────────────────────

function Journey() {
    return (
        <section className="esc-sec">
            <Backdrop intensity={0.55} />
            <div className="esc-wrap">
                <SectionHead center eyebrow="Your journey" title="Every small act of care counts" lede="Escape coins reward showing up, never streak panic. Every 1,000 lifetime coins opens the next energy center." />
                <div className="esc-grid g2" style={{ alignItems: "start" }}>
                    <Card className="esc-stack" style={{ gap: 18 }}>
                        <h3 className="esc-d esc-h3">Seven centers, one at a time</h3>
                        <ol className="ladder">
                            {CENTERS.map((c, i) => (
                                <li key={c.name}>
                                    <span className="ladder-dot" style={{ background: c.color, boxShadow: `0 0 16px ${c.color}` }} />
                                    <span style={{ fontWeight: 500 }}>{c.name}</span>
                                    <span className="esc-small" style={{ marginLeft: "auto" }}>{((i + 1) * 1000).toLocaleString("en-US")} coins</span>
                                </li>
                            ))}
                        </ol>
                    </Card>
                    <Card className="esc-stack" style={{ gap: 18 }} delay={0.08}>
                        <h3 className="esc-d esc-h3">How coins are earned</h3>
                        <table className="coins">
                            <caption className="esc-sr">Coins per activity</caption>
                            <tbody>
                                {COIN_RULES.map((r) => (
                                    <tr key={r.what}>
                                        <th scope="row">{r.what}<span className="esc-small">{r.cap}</span></th>
                                        <td><span className="coin">+{r.coins}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="esc-small">Daily limits keep it fair. Spend coins in the Marketplace on themes, avatar items and more.</p>
                    </Card>
                </div>
            </div>
        </section>
    )
}

// ───────────────────────── privacy ─────────────────────────

function Privacy() {
    const items = [
        { icon: "lock" as const, title: "Never sold", body: "We don't sell or rent your data, and there are no ads inside Escape." },
        { icon: "shield" as const, title: "Encrypted", body: "Everything travels over encrypted connections and is stored with access controls." },
        { icon: "trash" as const, title: "Yours to delete", body: "Delete your account and its data from Settings in the app, at any time." },
        { icon: "bell" as const, title: "Quiet by default", body: "A few calm reminders you choose. Nothing that guilts you into opening the app." },
    ]
    return (
        <section className="esc-sec">
            <div className="esc-wrap">
                <SectionHead eyebrow="Private by design" title="Built for calm, privacy and presence" lede="A self-care app should feel safe. These are promises we design around, not footnotes." />
                <div className="esc-grid g4">
                    {items.map((it, i) => (
                        <Card key={it.title} className="esc-stack" style={{ gap: 12 }} delay={i * 0.05}>
                            <span className="esc-icon"><Icon name={it.icon} /></span>
                            <h3 className="esc-d" style={{ fontSize: 22, margin: "8px 0 0" }}>{it.title}</h3>
                            <p className="esc-p" style={{ fontSize: 15 }}>{it.body}</p>
                        </Card>
                    ))}
                </div>
                <Reveal style={{ marginTop: 20 }}><a className="esc-link" href={ROUTES.privacy}>Read the privacy policy <Icon name="arrow" size={16} /></a></Reveal>
            </div>
        </section>
    )
}

// ───────────────────────── rewards teaser ─────────────────────────

function RewardsTeaser() {
    return (
        <section className="esc-sec">
            <Backdrop intensity={0.55} />
            <div className="esc-wrap">
                <SectionHead eyebrow="Earn while you heal" title="Rewards & partners" lede="Self-care that pays you back, and a program for people who want to share it." />
                <div className="esc-grid g2">
                    <Card className="esc-stack" style={{ gap: 14 }}>
                        <span className="esc-icon"><Icon name="gift" /></span>
                        <h3 className="esc-d esc-h3" style={{ marginTop: 8 }}>Coins & Marketplace</h3>
                        <p className="esc-p">Earn for real self-care, then spend it on themes, avatar items, new soundscapes and gift cards.</p>
                        <a className="esc-link" href={ROUTES.marketplace}>How rewards work <Icon name="arrow" size={16} /></a>
                    </Card>
                    <Card className="esc-stack" style={{ gap: 14 }} delay={0.08}>
                        <span className="esc-icon"><Icon name="users" /></span>
                        <h3 className="esc-d esc-h3" style={{ marginTop: 8 }}>Influencer program</h3>
                        <p className="esc-p">Share breathwork, yoga, movement or mindfulness content with Escape and get featured in the app.</p>
                        <a className="esc-link" href={LINKS.influencers} target="_blank" rel="noopener">Apply to the program <Icon name="arrow" size={16} /></a>
                    </Card>
                </div>
            </div>
        </section>
    )
}

const HOME_CSS = `
.hero{position:relative;padding:clamp(120px,12cqi,168px) 0 clamp(64px,8cqi,112px)}
.hero-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:clamp(32px,5cqi,80px);align-items:center}
.hero-copy{display:flex;flex-direction:column;align-items:flex-start;gap:20px}
.hero-tag{font-size:clamp(24px,2.6cqi,34px);margin:-4px 0 0}
.hero-play{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:color-mix(in oklab,var(--esc-gold) 22%,transparent);color:var(--esc-gold)}
.hero-trust{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:10px 22px;color:var(--esc-faint);font-size:14px}
.hero-trust li{display:inline-flex;align-items:center;gap:8px}
.hero-trust svg{color:var(--esc-accent)}
.hero-visual{justify-self:center;width:min(100%,440px)}
.hero-arch{position:relative;aspect-ratio:9/16;max-height:78vh;margin:0 auto;border-radius:999px 999px 44px 44px;overflow:hidden;background:#EDF1F7;box-shadow:0 40px 120px -40px color-mix(in oklab,var(--esc-accent) 70%,transparent),0 0 0 1px var(--esc-border)}
.hero-arch video,.hero-arch img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:esc-drift-slow 26s var(--esc-ease-soft) infinite}
.hero-glow{position:absolute;left:-10%;right:-10%;bottom:0;height:38%;background:linear-gradient(#fff,#39519F);opacity:.7;filter:blur(18px);-webkit-mask-image:linear-gradient(transparent,#000 28%);mask-image:linear-gradient(transparent,#000 28%)}
.hero-word{position:absolute;left:12%;right:12%;bottom:9%}
.founder{border-radius:32px;padding:clamp(28px,4cqi,48px);display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center}
.founder blockquote{margin:0;font-size:clamp(28px,3.4cqi,44px);line-height:1.15;color:var(--esc-ink)}
.bento{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(14px,1.6cqi,22px)}
.b-lucille{grid-row:span 2}
.b-scan{grid-column:span 2}
.moodcam{position:relative;aspect-ratio:4/3;border-radius:22px;overflow:hidden;display:grid;place-items:center;background:radial-gradient(circle at 50% 45%,color-mix(in oklab,var(--esc-accent) 22%,transparent),transparent 70%),var(--esc-glass2);border:1px solid var(--esc-border)}
.moodcam-corner{position:absolute;width:22px;height:22px;border:2px solid var(--esc-accent);opacity:.8}
.moodcam-corner:nth-child(1){top:12px;left:12px;border-right:0;border-bottom:0;border-radius:8px 0 0 0}
.moodcam-corner:nth-child(2){top:12px;right:12px;border-left:0;border-bottom:0;border-radius:0 8px 0 0}
.moodcam-corner:nth-child(3){bottom:12px;left:12px;border-right:0;border-top:0;border-radius:0 0 0 8px}
.moodcam-corner:nth-child(4){bottom:12px;right:12px;border-left:0;border-top:0;border-radius:0 0 8px 0}
.moodcam-line{position:absolute;left:8%;right:8%;height:2px;top:20%;background:linear-gradient(90deg,transparent,var(--esc-accent),transparent);box-shadow:0 0 14px var(--esc-accent);animation:esc-scan 3.2s ease-in-out infinite}
.moodcam-tag{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);font-size:13px;padding:5px 12px;border-radius:999px;background:var(--esc-nav);border:1px solid var(--esc-border);white-space:nowrap}
@keyframes esc-scan{0%,100%{top:18%}50%{top:78%}}
@media (prefers-reduced-motion:reduce){.moodcam-line{animation:none;top:50%}}
.bubbles{display:flex;flex-direction:column;gap:8px;margin-top:4px}
.bub{max-width:88%;padding:12px 16px;border-radius:18px;font-size:15px;line-height:1.45}
.bub.me{align-self:flex-end;background:color-mix(in oklab,var(--esc-accent) 22%,transparent);border-bottom-right-radius:6px}
.bub.lu{align-self:flex-start;background:var(--esc-glass1);border:1px solid var(--esc-border);border-bottom-left-radius:6px}
.centers{display:flex;gap:12px;margin-top:auto;padding-top:6px}
.centers span{width:18px;height:18px;border-radius:50%}
@container (max-width:980px){.bento{grid-template-columns:repeat(2,minmax(0,1fr))}.b-lucille{grid-row:auto;grid-column:span 2}}
@container (max-width:640px){.bento{grid-template-columns:minmax(0,1fr)}.b-lucille,.b-scan{grid-column:auto}}
.tryit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,4cqi,64px);align-items:center}
.moods{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.mood{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:12px;min-height:64px;padding:8px 14px 8px 8px;border-radius:20px;cursor:pointer;border:1px solid var(--esc-border);background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2));color:var(--esc-ink);transition:border-color .38s var(--esc-ease),transform .38s var(--esc-ease)}
.mood:hover{transform:translateY(-2px)}
.mood.on{border-color:var(--hue);box-shadow:0 0 0 1px var(--hue),0 12px 40px -18px var(--hue)}
.mood:focus-visible{outline:3px solid var(--hue);outline-offset:3px}
.mood-orb{width:48px;height:48px;flex:none}
.tryit-card{border-radius:36px;padding:clamp(28px,4cqi,48px);display:flex;flex-direction:column;align-items:center;gap:20px;min-height:520px;justify-content:center}
@container (max-width:900px){.tryit{grid-template-columns:minmax(0,1fr)}.tryit-card{min-height:0}}
.how{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,5cqi,80px);align-items:start}
.how-sticky{position:sticky;top:110px}
.how-orb{width:min(340px,80%);aspect-ratio:1}
.how-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:16px}
.how-steps li{min-height:clamp(180px,22vh,260px);display:flex;align-items:center}
.how-steps li>div{width:100%}
.how-step{display:flex;gap:22px;padding:clamp(22px,3cqi,32px);border-radius:28px;transition:border-color .52s var(--esc-ease),box-shadow .52s var(--esc-ease)}
.how-step.on{border-color:var(--esc-accent);box-shadow:0 18px 60px -28px var(--esc-accent)}
.how-n{font-size:40px;color:var(--esc-accent);line-height:1;flex:none;width:58px}
@container (max-width:900px){.how{grid-template-columns:minmax(0,1fr)}.how-sticky{position:static}.how-orb{display:none}.how-steps li{min-height:0}}
.ladder{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.ladder li{display:flex;align-items:center;gap:14px;min-height:48px;border-bottom:1px solid var(--esc-line)}
.ladder li:last-child{border-bottom:0}
.ladder-dot{width:14px;height:14px;border-radius:50%;flex:none}
.coins{width:100%;border-collapse:collapse}
.coins th{text-align:left;font-weight:500;padding:10px 0;border-bottom:1px solid var(--esc-line);display:flex;flex-direction:column;gap:2px}
.coins td{text-align:right;border-bottom:1px solid var(--esc-line);vertical-align:middle}
.coins tr:last-child th,.coins tr:last-child td{border-bottom:0}
.coin{display:inline-flex;align-items:center;min-height:30px;padding:0 12px;border-radius:999px;font-weight:600;font-size:14px;color:var(--esc-gold);background:color-mix(in oklab,var(--esc-gold) 14%,transparent)}
@container (max-width:900px){.hero-in{grid-template-columns:minmax(0,1fr)}.hero-visual{order:-1;width:min(62%,280px)}.hero{padding-top:104px}}
`

HomePage.defaultProps = {
    splashVideo: MEDIA_BASE + "escape_splash.mp4",
    splashVideoWebm: MEDIA_BASE + "escape_splash.webm",
    splashPoster: MEDIA_BASE + "escape_splash_poster.webp",
    primaryLabel: "Start your journey",
    primaryHref: ROUTES.beta,
    demoHref: ROUTES.demo,
    founderQuote: "Not a way out — a way in.",
    founderName: "Jared Jackson",
    founderRole: "Co-founder & CTO, Escape",
    appStoreUrl: "",
    playUrl: "",
}

addPropertyControls(HomePage, {
    splashVideo: { type: ControlType.File, title: "Splash video", allowedFileTypes: ["mp4", "webm", "mov"] },
    splashVideoWebm: { type: ControlType.File, title: "Splash WebM", allowedFileTypes: ["webm"] },
    splashPoster: { type: ControlType.Image, title: "Splash poster" },
    primaryLabel: { type: ControlType.String, title: "Main button" },
    primaryHref: { type: ControlType.Link, title: "Main link" },
    demoHref: { type: ControlType.Link, title: "Demo link" },
    founderQuote: { type: ControlType.String, title: "Founder quote", displayTextArea: true },
    founderName: { type: ControlType.String, title: "Founder" },
    founderRole: { type: ControlType.String, title: "Founder role" },
    appStoreUrl: { type: ControlType.Link, title: "App Store URL" },
    playUrl: { type: ControlType.Link, title: "Google Play URL" },
})
