// Escape — Pricing page body. Fill width, auto height.
// Prices are props so they can match App Store Connect / Google Play exactly.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import { Page, Backdrop, Reveal, Eyebrow, Button, SectionHead, Feature, Icon, Faq, ClosingCta, ROUTES, ease } from "./EscapeKit.tsx"

interface Props {
    monthlyPrice: string
    yearlyPrice: string
    yearlyPerMonth: string
    yearlySave: string
    trialDays: number
    ctaLabel: string
    ctaHref: string
}

const INCLUDED = [
    "Lucille AI companion, text & voice",
    "Mind, Reset & Body sessions",
    "Yoga, pilates & tai chi",
    "Adaptive Soundscapes",
    "Mood check-ins & insights",
    "Daily plans & journal",
    "Energy Scan & Escape coins",
    "New sessions as they're released",
]

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function PricingPage(p: Props) {
    const reduce = useReducedMotion()
    const [plan, setPlan] = React.useState<"monthly" | "yearly">("yearly")
    const plans = [
        { id: "monthly" as const, name: "Journey Pass · Monthly", price: p.monthlyPrice, per: "/ month", note: "Flexible month-to-month", quote: "Less than a daily coffee." },
        { id: "yearly" as const, name: "Journey Pass · Yearly", price: p.yearlyPrice, per: "/ year", note: `Just ${p.yearlyPerMonth} / month, billed yearly`, quote: "Invest once. Breathe all year.", badge: p.yearlySave },
    ]
    return (
        <Page>
            <style>{PR_CSS}</style>
            <section className="esc-sec pr-hero">
                <Backdrop top />
                <div className="esc-wrap">
                    <motion.div className="esc-stack esc-center esc-serene" style={{ gap: 18, alignItems: "center", maxWidth: 780, marginBottom: 48 }}>
                        <Eyebrow>Free {p.trialDays}-day trial</Eyebrow>
                        <h1 className="esc-d esc-h1">One pass. <span className="esc-gold">All of Escape.</span></h1>
                        <p className="esc-lede" style={{ margin: "0 auto" }}>The Escape Journey Pass unlocks everything: Lucille, every session, Soundscapes, plans, insights and your Energy Scan. Try it free, cancel any time.</p>
                        <div className="pr-toggle" role="radiogroup" aria-label="Billing period">
                            {plans.map((pl) => (
                                <button key={pl.id} type="button" role="radio" aria-checked={plan === pl.id} className={plan === pl.id ? "on" : ""} onClick={() => setPlan(pl.id)}>
                                    {pl.id === "monthly" ? "Monthly" : "Yearly"}{pl.badge && <span className="pr-save">{pl.badge}</span>}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                    <div className="pr-cards">
                        {plans.map((pl, i) => {
                            const on = plan === pl.id
                            return (
                                <Reveal key={pl.id} delay={i * 0.08} className={`esc-glass esc-glow pr-card ${on ? "on" : ""}`}>
                                    <div className="esc-row" style={{ justifyContent: "space-between", gap: 10 }}>
                                        <span className="esc-over">{pl.name}</span>
                                        {pl.badge ? <span className="pr-best">Best value</span> : <span className="esc-chip" style={{ minHeight: 28 }}>Most flexible</span>}
                                    </div>
                                    <div className="pr-price"><span className="esc-d">{pl.price}</span><span className="esc-p">{pl.per}</span></div>
                                    <p className="esc-p" style={{ marginTop: -6 }}>{pl.note}</p>
                                    <p className="esc-d esc-gold" style={{ fontSize: 22, margin: 0 }}>“{pl.quote}”</p>
                                    <Button href={p.ctaHref} variant={on ? "primary" : "ghost"} onClick={() => setPlan(pl.id)}>{p.ctaLabel}</Button>
                                    <span className="esc-small" style={{ textAlign: "center" }}>{p.trialDays} days free, then {pl.price}{pl.per}. Cancel anytime.</span>
                                    <hr className="esc-hr" />
                                    <span style={{ fontWeight: 500 }}>Everything included:</span>
                                    <ul className="pr-list">{INCLUDED.map((x) => <li key={x}><Icon name="check" size={18} />{x}</li>)}</ul>
                                </Reveal>
                            )
                        })}
                    </div>
                    <p className="esc-small esc-center" style={{ textAlign: "center", marginTop: 22, maxWidth: 680 }}>Prices in USD. Subscriptions are billed through the App Store or Google Play and renew automatically until cancelled in your store account settings. Local prices may vary.</p>
                </div>
            </section>

            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Full ecosystem access" title="Everything you need for your everyday escape" />
                    <div className="esc-grid g4">
                        <Feature icon="chat" title="Lucille" body="A companion that adapts to how you feel, by text or voice." />
                        <Feature icon="move" title="Sessions" body="Breathing, resets, yoga, pilates and tai chi, sized to your energy." delay={0.05} />
                        <Feature icon="wave" title="Soundscapes" body="Living audio that follows your mood, the time and the weather." delay={0.1} />
                        <Feature icon="spark" title="Energy Scan" body="Seven centers, opening as your coins grow, read fresh each day." delay={0.15} />
                    </div>
                </div>
            </section>

            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Questions & answers" title="Frequently asked questions" />
                    <Faq items={[
                        { q: `What happens after my ${p.trialDays}-day free trial?`, a: `You get full access during the trial. If you don't cancel at least 24 hours before it ends, your chosen plan starts and is charged through the App Store or Google Play.` },
                        { q: "Can I cancel any time?", a: "Yes. Manage or cancel from your App Store or Google Play subscription settings. You keep access until the end of the period you've paid for." },
                        { q: "Can I switch between monthly and yearly?", a: "Yes, from your store subscription settings. The change applies at your next renewal." },
                        { q: "Is my data secure?", a: <>Your data travels encrypted, is never sold, and you can delete your account from Settings at any time. Read the <a className="esc-link" href={ROUTES.privacy}>privacy policy</a>.</> },
                    ]} />
                </div>
            </section>
            <ClosingCta eyebrow="A self-care revolution within" title={<>Ready to transform your <span className="esc-gold">self-care</span>?</>} lede="Start free, take your time, and keep only what helps." primary={{ label: p.ctaLabel, href: p.ctaHref }} secondary={{ label: "Explore Lucille", href: ROUTES.lucille }} />
        </Page>
    )
}

const PR_CSS = `
.esc-sec.pr-hero{padding-top:clamp(120px,12cqi,168px)}
.pr-toggle{display:inline-flex;padding:5px;border-radius:999px;border:1px solid var(--esc-border);background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2));margin-top:8px}
.pr-toggle button{all:unset;cursor:pointer;min-height:44px;padding:0 20px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;font-weight:500;color:var(--esc-muted);transition:background .38s var(--esc-ease),color .38s}
.pr-toggle button.on{background:var(--esc-accent);color:var(--esc-onAccent)}
.pr-toggle button:focus-visible{outline:3px solid var(--esc-accent);outline-offset:2px}
.pr-save{font-size:12px;padding:2px 8px;border-radius:99px;background:color-mix(in oklab,var(--esc-gold) 22%,transparent);color:var(--esc-gold)}
.pr-toggle button.on .pr-save{background:rgba(11,18,48,.18);color:inherit}
.pr-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;max-width:960px;margin:0 auto}
.pr-card{border-radius:32px;padding:clamp(24px,3cqi,36px);display:flex;flex-direction:column;gap:16px;opacity:.86}
.pr-card.on{opacity:1;transform:translateY(-4px);border-color:var(--esc-accent);box-shadow:0 30px 80px -36px var(--esc-accent)}
.pr-card .esc-btn{width:100%}
.pr-best{font-size:12px;font-weight:600;padding:5px 12px;border-radius:99px;color:var(--esc-onAccent);background:var(--esc-gold)}
.pr-price{display:flex;align-items:baseline;gap:8px}
.pr-price .esc-d{font-size:clamp(48px,5cqi,64px);line-height:1}
.pr-list{list-style:none;margin:0;padding:0;display:grid;gap:10px;color:var(--esc-muted)}
.pr-list li{display:flex;gap:10px;align-items:flex-start}
.pr-list svg{color:var(--esc-accent);margin-top:2px}
@container (max-width:760px){.pr-cards{grid-template-columns:minmax(0,1fr)}}
`

PricingPage.defaultProps = {
    monthlyPrice: "$9.99",
    yearlyPrice: "$47.95",
    yearlyPerMonth: "$4.00",
    yearlySave: "Save 60%",
    trialDays: 7,
    ctaLabel: "Start your free trial",
    ctaHref: ROUTES.beta,
}
addPropertyControls(PricingPage, {
    monthlyPrice: { type: ControlType.String, title: "Monthly price" },
    yearlyPrice: { type: ControlType.String, title: "Yearly price" },
    yearlyPerMonth: { type: ControlType.String, title: "Yearly / month" },
    yearlySave: { type: ControlType.String, title: "Yearly badge" },
    trialDays: { type: ControlType.Number, title: "Trial days", min: 0, max: 30, step: 1 },
    ctaLabel: { type: ControlType.String, title: "Button" },
    ctaHref: { type: ControlType.Link, title: "Button link" },
})
