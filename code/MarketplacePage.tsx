// Escape — Marketplace page body: earn Escape Coins for self-care, level up, redeem rewards.
// Fill width, auto height. Coin values come from the live API rules (COIN_RULES in EscapeKit).
// Rewards that haven't shipped yet are marked "coming soon".
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import { Page, Backdrop, Reveal, Eyebrow, Button, SectionHead, Card, Feature, Orb, Icon, Faq, ClosingCta, CENTERS, COIN_RULES, ROUTES, LINKS, useEscape } from "./EscapeKit.tsx"

interface Props { influencerHref: string; primaryHref: string }

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function MarketplacePage(p: Props) {
    return (
        <Page>
            <style>{MK_CSS}</style>
            <Hero primaryHref={p.primaryHref} />
            <Earn />
            <Rewards />
            <Journey />
            <Influencers href={p.influencerHref} />
            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Questions" title="Coins & rewards" />
                    <Faq items={[
                        { q: "Do coins cost money?", a: "No. Coins are earned only by taking care of yourself in the app. They can't be bought, and they have no cash value." },
                        { q: "What can I redeem coins for?", a: "Themes, avatar items and new soundscapes in the app, and real-world gift cards once Marketplace rewards open." },
                        { q: "Why are there daily limits?", a: "So coins reward real self-care rather than tapping. Each activity has a small daily cap, shown above." },
                        { q: "What happens at 1,000 coins?", a: "Your Energy Scan opens with the first center, Grounding. Every 1,000 lifetime coins after that opens the next of the seven centers. Spending coins never takes a level away." },
                    ]} />
                </div>
            </section>
            <ClosingCta eyebrow="Escape Marketplace" title={<>Start earning for <span className="esc-gold">taking care of you</span></>} lede="Join early, earn from day one, and redeem what you've earned." primary={{ label: "Get early access", href: p.primaryHref }} secondary={{ label: "Support on Indiegogo", href: LINKS.indiegogo }} />
        </Page>
    )
}

function Hero({ primaryHref }: { primaryHref: string }) {
    const s = useEscape()
    const reduce = useReducedMotion()
    const toasts = [
        { t: "Box breathing complete", c: 10, x: "0%", y: "10%" },
        { t: "Journal entry", c: 15, x: "58%", y: "2%" },
        { t: "First session today", c: 15, x: "50%", y: "78%" },
        { t: "Mood check-in", c: 5, x: "2%", y: "66%" },
    ]
    return (
        <section className="esc-sec mk-hero">
            <Backdrop top />
            <div className="esc-wrap mk-hero-in">
                <motion.div className="esc-stack esc-serene" style={{ gap: 20, alignItems: "flex-start" }}>
                    <Eyebrow>Escape Marketplace</Eyebrow>
                    <h1 className="esc-d esc-h1">Get rewarded for showing up <span className="esc-gold">for yourself</span></h1>
                    <p className="esc-lede">Every check-in, session, workout and journal entry earns Escape Coins. Spend them in the Marketplace, and watch your energy centers open as you go.</p>
                    <div className="esc-row" style={{ gap: 12 }}>
                        <Button href={primaryHref} arrow>Start earning coins</Button>
                        <Button href="#rewards" variant="ghost">See rewards</Button>
                    </div>
                </motion.div>
                <div className="mk-visual" aria-hidden>
                    <Orb mood={s.mood} size="56%" live rings hero style={{ position: "absolute", left: "22%", top: "22%" }} />
                    {toasts.map((t, i) => (
                        <motion.div key={t.t} className="esc-glass mk-toast" style={{ left: t.x, top: t.y }}
                            initial={reduce ? false : { opacity: 0, y: 12 }} animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, -6, 0] }}
                            transition={reduce ? {} : { opacity: { duration: 0.6, delay: 0.5 + i * 0.35 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 } }}>
                            <span className="esc-icon" style={{ width: 36, height: 36, borderRadius: 11 }}><Icon name="coin" size={18} /></span>
                            <span className="esc-stack"><span style={{ fontSize: 14, fontWeight: 500 }}>{t.t}</span><span className="mk-plus">+{t.c} coins</span></span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function Earn() {
    return (
        <section className="esc-sec">
            <div className="esc-wrap">
                <SectionHead center eyebrow="How you earn" title="Earn coins, unlock rewards" lede="Every mindful moment counts. These are the real values in the app." />
                <div className="esc-grid g4">
                    {COIN_RULES.map((r, i) => (
                        <Card key={r.what} className="esc-stack" style={{ gap: 10 }} delay={i * 0.04}>
                            <span className="mk-big esc-d">+{r.coins}</span>
                            <strong style={{ fontWeight: 500 }}>{r.what}</strong>
                            <span className="esc-small">{r.cap}</span>
                        </Card>
                    ))}
                    <Card className="esc-stack mk-earn-note" style={{ gap: 10 }} delay={0.3}>
                        <span className="esc-icon"><Icon name="wave" /></span>
                        <strong style={{ fontWeight: 500 }}>Listening counts too</strong>
                        <span className="esc-small">+1 coin for every 5 minutes in Soundscapes.</span>
                    </Card>
                </div>
            </div>
        </section>
    )
}

function Rewards() {
    return (
        <section className="esc-sec" id="rewards">
            <Backdrop intensity={0.5} />
            <div className="esc-wrap">
                <SectionHead eyebrow="Redeem" title="Spend what you've earned" lede="Make Escape feel like yours, or turn your self-care into something real." />
                <div className="esc-grid g4">
                    <Feature icon="gift" title="Gift cards" body="Redeem coins for real gift cards from stores you already shop at." soon />
                    <Feature icon="star" title="Themes" body="New looks for your app and your mood orb." delay={0.05} />
                    <Feature icon="users" title="Avatar items" body="Outfits, auras and details for your Innerverse avatar." delay={0.1} />
                    <Feature icon="wave" title="Soundscapes" body="Unlock new sound worlds and layers." delay={0.15} />
                </div>
            </div>
        </section>
    )
}

function Journey() {
    return (
        <section className="esc-sec">
            <div className="esc-wrap">
                <SectionHead eyebrow="Progression" title="Earn. Express. Evolve." lede="Every 1,000 lifetime coins opens the next energy center, and your Energy Scan starts reading it each day." />
                <Reveal className="esc-glass mk-track">
                    <div className="mk-line" aria-hidden />
                    <ol>
                        {CENTERS.map((c, i) => (
                            <li key={c.name}>
                                <span className="mk-node" style={{ background: c.color, boxShadow: `0 0 0 6px color-mix(in oklab, ${c.color} 20%, transparent), 0 0 26px ${c.color}` }} />
                                <span style={{ fontWeight: 500 }}>{c.name}</span>
                                <span className="esc-small">Level {i + 1} · {((i + 1) * 1000).toLocaleString("en-US")}</span>
                            </li>
                        ))}
                    </ol>
                </Reveal>
            </div>
        </section>
    )
}

function Influencers({ href }: { href: string }) {
    return (
        <section className="esc-sec" id="influencers">
            <Backdrop intensity={0.5} />
            <div className="esc-wrap">
                <Card className="mk-infl">
                    <div className="esc-stack" style={{ gap: 14 }}>
                        <span className="esc-chip" style={{ alignSelf: "flex-start" }}>Influencer program</span>
                        <h2 className="esc-d esc-h2" style={{ margin: 0 }}>Share your journey with Escape</h2>
                        <p className="esc-p">Make breathwork, yoga, movement or mindfulness content with Escape. We'll support your content and feature it in the app.</p>
                    </div>
                    <div className="esc-stack" style={{ gap: 16 }}>
                        <ul className="mk-list">
                            <li><Icon name="check" size={18} />Breathwork, yoga & movement shorts</li>
                            <li><Icon name="check" size={18} />Featured in the app</li>
                            <li><Icon name="check" size={18} />Partnership opportunities</li>
                        </ul>
                        <div><Button href={href} arrow newTab>Apply to the influencer program</Button></div>
                    </div>
                </Card>
            </div>
        </section>
    )
}

const MK_CSS = `
.esc-sec.mk-hero{padding-top:clamp(120px,12cqi,168px)}
.mk-hero-in{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:clamp(32px,5cqi,72px);align-items:center}
.mk-visual{position:relative;aspect-ratio:1;width:100%;max-width:520px;justify-self:center}
.mk-toast{position:absolute;display:flex;gap:12px;align-items:center;padding:12px 16px 12px 12px;border-radius:18px;white-space:nowrap;max-width:50%}
.mk-plus{font-size:13px;color:var(--esc-gold);font-weight:600}
.mk-big{font-size:46px;line-height:1;color:var(--esc-gold)}
.mk-earn-note{background:linear-gradient(160deg,color-mix(in oklab,var(--esc-accent) 14%,transparent),var(--esc-glass2))}
.mk-track{position:relative;border-radius:32px;padding:clamp(28px,4cqi,48px) clamp(16px,3cqi,40px)}
.mk-track ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;position:relative}
.mk-track li{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
.mk-node{width:22px;height:22px;border-radius:50%;margin-bottom:6px}
.mk-line{position:absolute;left:calc(clamp(16px,3cqi,40px) + 7%);right:calc(clamp(16px,3cqi,40px) + 7%);top:calc(clamp(28px,4cqi,48px) + 11px);height:2px;background:linear-gradient(90deg,#E5484D,#EF7702,#F5C542,#39D9C1,#4CF6F6,#8E7CD9,#B9A3F0);opacity:.6}
.mk-infl{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:clamp(24px,4cqi,56px);align-items:center;padding:clamp(24px,4cqi,48px)}
.mk-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;color:var(--esc-muted)}
.mk-list li{display:flex;gap:10px;align-items:center}
.mk-list svg{color:var(--esc-accent)}
@container (max-width:900px){.mk-hero-in,.mk-infl{grid-template-columns:minmax(0,1fr)}.mk-track ol{grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.mk-track li{flex-direction:row;text-align:left;flex-wrap:wrap;gap:4px 10px}.mk-node{margin:0}.mk-line{display:none}.mk-toast{transform:scale(.88);transform-origin:left top;max-width:none}.mk-visual .mk-toast:nth-child(3),.mk-visual .mk-toast:nth-child(4){display:none}}
`

MarketplacePage.defaultProps = { influencerHref: LINKS.influencers, primaryHref: ROUTES.beta }
addPropertyControls(MarketplacePage, {
    influencerHref: { type: ControlType.Link, title: "Influencer program" },
    primaryHref: { type: ControlType.Link, title: "Main link" },
})
