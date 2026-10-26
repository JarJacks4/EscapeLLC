// Escape — Community & rewards page body. Fill width, auto height.
// Coin values come from the live API rules (COIN_RULES in EscapeKit). Partner rewards and the
// mindful feed are marked "coming soon" until they ship.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import { LINKS } from "./EscapeKit.tsx"
import { Page, Backdrop, Reveal, Eyebrow, Button, SectionHead, Card, Feature, Orb, Icon, Faq, ClosingCta, CENTERS, COIN_RULES, ROUTES, useEscape, ease } from "./EscapeKit.tsx"

interface Props { applyHref: string; ambassadorHref: string; primaryHref: string }

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function CommunityPage(p: Props) {
    return (
        <Page>
            <style>{CO_CSS}</style>
            <Hero primaryHref={p.primaryHref} />
            <Earn />
            <Journey />
            <Marketplace />
            <Creators applyHref={p.applyHref} ambassadorHref={p.ambassadorHref} />
            <Values />
            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Questions" title="Coins & community" />
                    <Faq items={[
                        { q: "Do coins cost money?", a: "No. Coins are earned only by taking care of yourself in the app. They can't be bought, and they have no cash value." },
                        { q: "Why are there daily limits?", a: "So coins reward real self-care rather than tapping. Each activity has a small daily cap, shown above." },
                        { q: "What happens at 1,000 coins?", a: "Your Energy Scan opens with the first center, Grounding. Every 1,000 lifetime coins after that opens the next of the seven centers. Spending coins never takes a level away." },
                        { q: "Who can join the creators program?", a: "Anyone who shares mindfulness, movement or wellbeing content honestly and kindly. Apply below and we'll be in touch." },
                    ]} />
                </div>
            </section>
            <ClosingCta eyebrow="Escape community & creators" title={<>Ready to start your <span className="esc-gold">rewarding</span> journey?</>} lede="Join early, earn from day one, and help shape what Escape becomes." primary={{ label: "Get early access", href: p.primaryHref }} secondary={{ label: "Support on Kickstarter", href: LINKS.kickstarter }} />
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
        <section className="esc-sec co-hero">
            <Backdrop top />
            <div className="esc-wrap co-hero-in">
                <motion.div className="esc-stack esc-serene" style={{ gap: 20, alignItems: "flex-start" }}>
                    <Eyebrow>Escape community</Eyebrow>
                    <h1 className="esc-d esc-h1">Get rewarded for showing up <span className="esc-gold">for yourself</span></h1>
                    <p className="esc-lede">Every check-in, session and journal entry earns Escape coins. Coins open your energy centers, unlock the Marketplace, and connect you with people building calmer habits too.</p>
                    <div className="esc-row" style={{ gap: 12 }}>
                        <Button href={primaryHref} arrow>Start earning coins</Button>
                        <Button href="#creators" variant="ghost">Creators program</Button>
                    </div>
                </motion.div>
                <div className="co-visual" aria-hidden>
                    <Orb mood={s.mood} size="56%" live rings hero style={{ position: "absolute", left: "22%", top: "22%" }} />
                    {toasts.map((t, i) => (
                        <motion.div key={t.t} className="esc-glass co-toast" style={{ left: t.x, top: t.y }}
                            initial={reduce ? false : { opacity: 0, y: 12 }} animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, -6, 0] }}
                            transition={reduce ? {} : { opacity: { duration: 0.6, delay: 0.5 + i * 0.35 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 } }}>
                            <span className="esc-icon" style={{ width: 36, height: 36, borderRadius: 11 }}><Icon name="coin" size={18} /></span>
                            <span className="esc-stack"><span style={{ fontSize: 14, fontWeight: 500 }}>{t.t}</span><span className="co-plus">+{t.c} coins</span></span>
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
                            <span className="co-big esc-d">+{r.coins}</span>
                            <strong style={{ fontWeight: 500 }}>{r.what}</strong>
                            <span className="esc-small">{r.cap}</span>
                        </Card>
                    ))}
                    <Card className="esc-stack co-earn-note" style={{ gap: 10 }} delay={0.3}>
                        <span className="esc-icon"><Icon name="wave" /></span>
                        <strong style={{ fontWeight: 500 }}>Listening counts too</strong>
                        <span className="esc-small">+1 coin for every 5 minutes in Soundscapes.</span>
                    </Card>
                </div>
            </div>
        </section>
    )
}

function Journey() {
    return (
        <section className="esc-sec">
            <Backdrop intensity={0.6} />
            <div className="esc-wrap">
                <SectionHead eyebrow="Identity & progression" title="Earn. Express. Evolve." lede="Every 1,000 lifetime coins opens the next energy center, and your Energy Scan starts reading it each day." />
                <Reveal className="esc-glass co-track">
                    <div className="co-line" aria-hidden />
                    <ol>
                        {CENTERS.map((c, i) => (
                            <li key={c.name}>
                                <span className="co-node" style={{ background: c.color, boxShadow: `0 0 0 6px color-mix(in oklab, ${c.color} 20%, transparent), 0 0 26px ${c.color}` }} />
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

function Marketplace() {
    return (
        <section className="esc-sec">
            <div className="esc-wrap">
                <SectionHead eyebrow="Marketplace" title="Spend what you've earned" lede="Redeem coins for things that make Escape feel like yours." />
                <div className="esc-grid g4">
                    <Feature icon="star" title="Themes" body="New looks for your app and your mood orb." />
                    <Feature icon="users" title="Avatar items" body="Outfits, auras and details for your avatar." delay={0.05} />
                    <Feature icon="wave" title="Soundscapes" body="Unlock new sound worlds and layers." delay={0.1} />
                    <Feature icon="gift" title="Partner rewards" body="Real-world perks from wellbeing brands we trust." soon delay={0.15} />
                </div>
            </div>
        </section>
    )
}

function Creators({ applyHref, ambassadorHref }: { applyHref: string; ambassadorHref: string }) {
    return (
        <section className="esc-sec" id="creators">
            <Backdrop intensity={0.5} />
            <div className="esc-wrap">
                <SectionHead eyebrow="Verified creator studio" title="Mindful creators" lede="A creator community sharing genuine practices: breathwork, yoga, movement, reflection. Real people, real routines." />
                <div className="esc-grid g2">
                    <Card className="esc-stack" style={{ gap: 14 }}>
                        <span className="esc-chip" style={{ alignSelf: "flex-start" }}>Creator studio</span>
                        <h3 className="esc-d esc-h3">Creators</h3>
                        <p className="esc-p">Make mindful content with Escape, host challenges in your community, and get early access to new features and Lucille builds.</p>
                        <ul className="co-list">
                            <li><Icon name="check" size={18} />Founding creator badge</li>
                            <li><Icon name="check" size={18} />Early feature access</li>
                            <li><Icon name="check" size={18} />A direct line to the Escape team</li>
                        </ul>
                        <div style={{ marginTop: "auto" }}><Button href={ambassadorHref} arrow small newTab>Join the creator studio</Button></div>
                    </Card>
                    <Card className="esc-stack" style={{ gap: 14 }} delay={0.08}>
                        <span className="esc-chip" style={{ alignSelf: "flex-start" }}>Influencer program</span>
                        <h3 className="esc-d esc-h3">Influencers</h3>
                        <p className="esc-p">Share your mindfulness journey and inspire people authentically. We'll support your content and feature it in Escape.</p>
                        <ul className="co-list">
                            <li><Icon name="check" size={18} />Breathwork, yoga & movement shorts</li>
                            <li><Icon name="check" size={18} />Featured in the app</li>
                            <li><Icon name="check" size={18} />Partnership opportunities</li>
                        </ul>
                        <div style={{ marginTop: "auto" }}><Button href={applyHref} arrow small newTab>Apply to the influencer program</Button></div>
                    </Card>
                </div>
            </div>
        </section>
    )
}

function Values() {
    return (
        <section className="esc-sec">
            <div className="esc-wrap">
                <SectionHead center eyebrow="Mindful feed · coming soon" title="A community that feels good to be in" lede="What we're building toward, and holding ourselves to." />
                <div className="esc-grid g3">
                    <Feature icon="heart" title="Kindness first" body="Encouragement over critique. Clear community guidelines and fast moderation." />
                    <Feature icon="leaf" title="Calm by design" body="No infinite pressure to keep scrolling. Short, useful, then back to your day." delay={0.05} />
                    <Feature icon="shield" title="You're in control" body="Choose what you share and who sees it. Private by default." delay={0.1} />
                </div>
            </div>
        </section>
    )
}

const CO_CSS = `
.esc-sec.co-hero{padding-top:clamp(120px,12cqi,168px)}
.co-hero-in{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:clamp(32px,5cqi,72px);align-items:center}
.co-visual{position:relative;aspect-ratio:1;width:100%;max-width:520px;justify-self:center}
.co-toast{position:absolute;display:flex;gap:12px;align-items:center;padding:12px 16px 12px 12px;border-radius:18px;white-space:nowrap;max-width:50%}
.co-plus{font-size:13px;color:var(--esc-gold);font-weight:600}
.co-big{font-size:46px;line-height:1;color:var(--esc-gold)}
.co-earn-note{background:linear-gradient(160deg,color-mix(in oklab,var(--esc-accent) 14%,transparent),var(--esc-glass2))}
.co-track{position:relative;border-radius:32px;padding:clamp(28px,4cqi,48px) clamp(16px,3cqi,40px)}
.co-track ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;position:relative}
.co-track li{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
.co-node{width:22px;height:22px;border-radius:50%;margin-bottom:6px}
.co-line{position:absolute;left:calc(clamp(16px,3cqi,40px) + 7%);right:calc(clamp(16px,3cqi,40px) + 7%);top:calc(clamp(28px,4cqi,48px) + 11px);height:2px;background:linear-gradient(90deg,#E5484D,#EF7702,#F5C542,#39D9C1,#4CF6F6,#8E7CD9,#B9A3F0);opacity:.6}
.co-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;color:var(--esc-muted)}
.co-list li{display:flex;gap:10px;align-items:center}
.co-list svg{color:var(--esc-accent)}
@container (max-width:900px){.co-hero-in{grid-template-columns:minmax(0,1fr)}.co-track ol{grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.co-track li{flex-direction:row;text-align:left;flex-wrap:wrap;gap:4px 10px}.co-node{margin:0}.co-line{display:none}.co-toast{transform:scale(.88);transform-origin:left top;max-width:none}.co-visual .co-toast:nth-child(3),.co-visual .co-toast:nth-child(4){display:none}}
`

CommunityPage.defaultProps = { applyHref: LINKS.influencers, ambassadorHref: LINKS.creators, primaryHref: ROUTES.beta }
addPropertyControls(CommunityPage, {
    applyHref: { type: ControlType.Link, title: "Influencer program" },
    ambassadorHref: { type: ControlType.Link, title: "Creator studio" },
    primaryHref: { type: ControlType.Link, title: "Main link" },
})
