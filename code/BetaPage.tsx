// Escape — App Testing & early access page body. Fill width, auto height.
// Point "Apply link" at your sign-up form (a Framer form page, Typeform, or a TestFlight public link).
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import { Page, Backdrop, Eyebrow, Button, SectionHead, Card, Feature, Orb, Icon, Faq, ClosingCta, ROUTES, useEscape, ease } from "./EscapeKit.tsx"

interface Props { applyHref: string; testflightHref: string; playTestHref: string; testerCount: string }

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function BetaPage(p: Props) {
    const s = useEscape()
    const reduce = useReducedMotion()
    const steps = [
        { icon: "flask" as const, t: "Apply", b: "Tell us your device and what you'd love from Escape. It takes a minute." },
        { icon: "apple" as const, t: "Install", b: "Get the build through TestFlight on iPhone or the Google Play testing track on Android." },
        { icon: "calendar" as const, t: "Live with it", b: "Use Escape for a week the way you normally would. Check in, talk with Lucille, try a session." },
        { icon: "chat" as const, t: "Tell us", b: "Share what felt good and what didn't, right from the app or by email." },
    ]
    return (
        <Page>
            <style>{BE_CSS}</style>
            <section className="esc-sec be-hero">
                <Backdrop top />
                <div className="esc-wrap be-hero-in">
                    <motion.div className="esc-stack esc-serene" style={{ gap: 20, alignItems: "flex-start" }}>
                        <Eyebrow>Escape beta program</Eyebrow>
                        <h1 className="esc-d esc-h1">App testing & <span className="esc-gold">early access</span></h1>
                        <p className="esc-lede">Help shape the future of empathetic self-care. Test upcoming builds of Escape on iOS and Android, and tell us what would make it better for you.</p>
                        <div className="esc-row" style={{ gap: 12 }}>
                            <Button href={p.applyHref} arrow>Get early access</Button>
                            <Button href={ROUTES.home} variant="ghost">Back to home</Button>
                        </div>
                        <ul className="be-trust">
                            <li><Icon name="shield" size={18} />Private by design</li>
                            <li><Icon name="check" size={18} />Free to join</li>
                            <li><Icon name="heart" size={18} />WCAG 2.2 AA in mind</li>
                        </ul>
                    </motion.div>
                    <div className="be-visual" aria-hidden>
                        <div className="be-phone esc-glass">
                            <div className="be-notch" />
                            <Orb mood={s.mood} size="70%" live rings hero />
                            <span className="esc-d" style={{ fontSize: 26 }}>Good evening</span>
                            <span className="esc-small">How are you arriving?</span>
                            <div className="be-rows">
                                <span className="esc-glass be-row"><Icon name="spark" size={16} style={{ color: "var(--esc-gold)" }} />Today's pick · Box breathing</span>
                                <span className="esc-glass be-row"><Icon name="chat" size={16} style={{ color: "var(--esc-accent)" }} />Lucille · "Want to slow down?"</span>
                                <span className="esc-glass be-row"><Icon name="coin" size={16} style={{ color: "var(--esc-gold)" }} />640 / 1,000 to Grounding</span>
                            </div>
                            <div className="be-chips">{["Calm", "Tired", "Focused"].map((c) => <span key={c} className="esc-chip">{c}</span>)}</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="How it works" title="Four steps, about a week" />
                    <div className="esc-grid g4" role="list">
                        {steps.map((st, i) => (
                            <Card key={st.t} className="esc-stack" style={{ gap: 12 }} delay={i * 0.05}>
                                <div className="esc-row" style={{ justifyContent: "space-between" }}>
                                    <span className="esc-icon"><Icon name={st.icon} /></span>
                                    <span className="esc-d" style={{ fontSize: 34, color: "var(--esc-accent)" }}>0{i + 1}</span>
                                </div>
                                <h3 className="esc-d esc-h3" style={{ marginTop: 6 }}>{st.t}</h3>
                                <p className="esc-p" style={{ fontSize: 15 }}>{st.b}</p>
                            </Card>
                        ))}
                    </div>
                    <div className="esc-row" style={{ gap: 12, justifyContent: "center", marginTop: 28 }}>
                        {p.testflightHref && <Button href={p.testflightHref} variant="ghost" icon={<Icon name="apple" size={18} />} newTab>Join on TestFlight</Button>}
                        {p.playTestHref && <Button href={p.playTestHref} variant="ghost" icon={<Icon name="play-store" size={18} />} newTab>Join on Google Play</Button>}
                    </div>
                </div>
            </section>

            <section className="esc-sec">
                <Backdrop intensity={0.55} />
                <div className="esc-wrap">
                    <SectionHead eyebrow="Beta exclusive" title="What testers get" lede={p.testerCount ? `${p.testerCount} people are already testing Escape. Join them.` : "Testers get in first, and get thanked properly."} />
                    <div className="esc-grid g3">
                        <Feature icon="star" title="Founding member badge" body="A permanent badge on your profile that says you were here first." />
                        <Feature icon="spark" title="Early Lucille builds" body="Try new conversation, voice and planning features before anyone else." delay={0.05} />
                        <Feature icon="users" title="A line to the team" body="Your feedback goes straight to the people building Escape." delay={0.1} />
                    </div>
                </div>
            </section>

            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Questions" title="Before you join" />
                    <Faq items={[
                        { q: "Which devices can I test on?", a: "Recent iPhones (through TestFlight) and Android phones (through the Google Play testing track). We'll confirm your device when you apply." },
                        { q: "What do you collect during the beta?", a: "The same things the app needs to work (your account, check-ins, sessions, journal and conversations with Lucille), plus crash reports and any feedback you choose to send. We never sell your data." },
                        { q: "Is Escape a replacement for therapy or medical care?", a: "No. Escape is a self-care and wellbeing app. It doesn't diagnose or treat, and it isn't a substitute for professional care. If you're in crisis in the US, call or text 988." },
                        { q: "Does it cost anything?", a: "No. The beta is free, and testers keep their founding badge after launch." },
                    ]} />
                </div>
            </section>
            <ClosingCta eyebrow="A self-care revolution within" title={<>Ready to <span className="esc-gold">shape</span> Escape?</>} lede="Apply in a minute. We'll email you when your build is ready." primary={{ label: "Get early access", href: p.applyHref }} secondary={{ label: "Explore home", href: ROUTES.home }} />
        </Page>
    )
}

const BE_CSS = `
.esc-sec.be-hero{padding-top:clamp(120px,12cqi,168px)}
.be-hero-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:clamp(32px,5cqi,72px);align-items:center}
.be-trust{list-style:none;margin:4px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:10px 22px;color:var(--esc-faint);font-size:14px}
.be-trust li{display:inline-flex;gap:8px;align-items:center}
.be-trust svg{color:var(--esc-accent)}
.be-visual{display:grid;place-items:center}
.be-phone{width:min(320px,80%);aspect-ratio:9/19;border-radius:48px;padding:56px 22px 28px;display:flex;flex-direction:column;align-items:center;gap:10px;position:relative;background:linear-gradient(170deg,color-mix(in oklab,var(--esc-glowB) 60%,transparent),var(--esc-glass2))}
.be-notch{position:absolute;top:16px;width:96px;height:26px;border-radius:99px;background:rgba(5,8,26,.85)}
.be-rows{display:flex;flex-direction:column;gap:8px;width:100%;margin-top:14px}
.be-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;font-size:13px;white-space:nowrap;overflow:hidden}
.be-chips{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:auto}
@container (max-width:900px){.be-hero-in{grid-template-columns:minmax(0,1fr)}}
`

BetaPage.defaultProps = { applyHref: "mailto:beta@escapeapp.ai?subject=Escape%20beta", testflightHref: "", playTestHref: "", testerCount: "" }
addPropertyControls(BetaPage, {
    applyHref: { type: ControlType.Link, title: "Apply link" },
    testflightHref: { type: ControlType.Link, title: "TestFlight link" },
    playTestHref: { type: ControlType.Link, title: "Play testing link" },
    testerCount: { type: ControlType.String, title: "Tester count", placeholder: "e.g. 300+ (only if true)" },
})
