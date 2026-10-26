// Escape — Innerverse (coming soon) page body. Fill width, auto height.
// World screenshots: each world card has an image slot (property controls). Until real renders
// are dropped in, the card shows a clearly labeled placeholder.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import { Page, Backdrop, Reveal, Eyebrow, Button, SectionHead, Card, Feature, Orb, Icon, Faq, ClosingCta, ROUTES, ease } from "./EscapeKit.tsx"

const src = (v: any) => (typeof v === "string" ? v : v?.src) || ""

interface Props { waitlistHref: string; santoriniImage: any; costaRicaImage: any; world1: any; world2: any; world3: any; world4: any; world5: any; world6: any }

const REALMS = [
    { name: "Enchanted Forest", body: "Sun-dappled ancient redwoods and whispering foliage for grounding.", g: "linear-gradient(160deg,#1E5B3A,#0C2A1E 60%,#08160F)", glow: "#7ED6A1" },
    { name: "Ocean Depths", body: "Weightless bioluminescent currents that slow your breathing.", g: "linear-gradient(170deg,#0D4B78,#06213F 60%,#030E1F)", glow: "#4CF6F6" },
    { name: "Cosmic Realm", body: "Float among starlight and soft nebulae for expansive calm.", g: "radial-gradient(120% 90% at 70% 20%,#5B3AA8,#1A1648 50%,#05081A)", glow: "#B9A3F0" },
    { name: "Sacred Temple", body: "Mist-wrapped mountain courtyards and resonant singing bowls.", g: "linear-gradient(170deg,#8A5A2B,#3B2414 60%,#1A0F08)", glow: "#F5C26B" },
    { name: "Crystal Cavern", body: "Acoustic mineral chambers that echo harmonic frequencies.", g: "linear-gradient(160deg,#3D3190,#1F37A8 45%,#0B1230)", glow: "#9CC2FF" },
    { name: "Mountain Summit", body: "Crisp alpine dawn above a sea of clouds to awaken focus.", g: "linear-gradient(180deg,#F0A55A,#C85A7A 35%,#2A2366 75%,#0B1230)", glow: "#FFE2BF" },
]

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function InnerversePage(p: Props) {
    const reduce = useReducedMotion()
    return (
        <Page>
            <style>{IV_CSS}</style>
            <section className="esc-sec iv-hero">
                <div aria-hidden className="iv-stars" />
                <Backdrop top />
                <div className="esc-wrap esc-stack esc-center esc-serene" style={{ alignItems: "center", gap: 20, textAlign: "center" }}>
                    <motion.div>
                        <Orb mood="calm" size="min(300px, 60vw)" live rings hero label="The Innerverse" />
                    </motion.div>
                    <span className="esc-soon">Coming soon</span>
                    <h1 className="esc-d esc-h1">The Escape <span className="esc-gold">Innerverse</span></h1>
                    <p className="esc-lede" style={{ margin: "0 auto" }}>The Innerverse is a 3D world inside Escape. Create your own avatar, explore calming worlds, play mini games and meet people from around the world, with Lucille as your guide.</p>
                    <div className="esc-row" style={{ gap: 12, justifyContent: "center" }}>
                        <Button href={p.waitlistHref} arrow>Join the waitlist</Button>
                        <Button href="#worlds" variant="ghost">Explore the worlds</Button>
                    </div>
                </div>
            </section>

            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="What it is" title="What you'll do in the Innerverse" lede="Three things you can count on when it opens." />
                    <div className="esc-grid g3">
                        <Feature icon="users" title="Create your own avatar" body="Design an avatar that looks and feels like you, then dress it with items you earn in the Marketplace." />
                        <Feature icon="star" title="Play mini games" body="Short, calming mini games inside each world: breathing challenges, puzzles and quests." delay={0.05} />
                        <Feature icon="globe" title="Meet people worldwide" body="Explore worlds together and connect with people from around the world who are building calmer habits too." delay={0.1} />
                    </div>
                </div>
            </section>

            <section className="esc-sec" id="worlds">
                <div className="esc-wrap">
                    <SectionHead eyebrow="Featured destinations · coming soon" title="Real-world sanctuaries, reimagined in 3D" lede="Spatial, acoustic recreations of places that calm people all over the world." />
                    <div className="esc-grid g2">
                        <Postcard title="Coastal Horizon" place="Santorini, Greece" body="Whitewashed cliffs and blue domes over the Aegean, with the sea breathing below." img={src(p.santoriniImage)} g="linear-gradient(180deg,#9CC2FF 0%,#E6EAF4 38%,#3A5BD9 62%,#0E2C6E 100%)" />
                        <Postcard title="Misty Rainforest" place="Cloudbridge, Costa Rica" body="Lush canopy and distant waterfalls. Unwind among the sounds of the cloud forest." img={src(p.costaRicaImage)} g="linear-gradient(180deg,#C9D1EE 0%,#5FA37A 34%,#1E5B3A 70%,#08160F 100%)" delay={0.08} />
                    </div>
                </div>
            </section>

            <section className="esc-sec">
                <Backdrop intensity={0.55} />
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Six worlds · screenshots" title="See the worlds" lede="A look at each world in the Innerverse. Each one supports a different part of your wellbeing." />
                    <div className="esc-grid g3">
                        {REALMS.map((r, i) => {
                            const shot = src((p as any)[`world${i + 1}`])
                            return (
                            <Reveal key={r.name} delay={i * 0.05} className="esc-glass esc-lift iv-realm">
                                <div className="iv-art" style={{ background: shot ? `center/cover url(${shot})` : r.g }} role="img" aria-label={shot ? `${r.name} screenshot` : `${r.name}: screenshot coming soon`}>
                                    {!shot && <><span style={{ background: `radial-gradient(closest-side, ${r.glow}, transparent)` }} /><em className="iv-ph"><Icon name="cube" size={16} />Screenshot coming soon</em></>}
                                </div>
                                <div className="esc-stack" style={{ gap: 8, padding: "20px 22px 24px" }}>
                                    <div className="esc-row" style={{ justifyContent: "space-between", gap: 8 }}>
                                        <h3 className="esc-d" style={{ fontSize: 22, margin: 0 }}>{r.name}</h3>
                                    </div>
                                    <p className="esc-p" style={{ fontSize: 15 }}>{r.body}</p>
                                </div>
                            </Reveal>
                            )
                        })}
                    </div>
                </div>
            </section>

            <section className="esc-sec">
                <div className="esc-wrap iv-avatar">
                    <div>
                        <SectionHead eyebrow="Your digital self" title="Create your own avatar" lede="You build your avatar yourself, and it grows as you take care of yourself in Escape." />
                        <div className="esc-stack" style={{ gap: 14 }}>
                            {[["You design it", "Choose how your avatar looks, so it feels like you."], ["Yours to style", "Outfits, auras and details you redeem in the Marketplace."], ["It grows with you", "New looks open as your energy centers open."]].map(([t, b]) => (
                                <div key={t} className="esc-row" style={{ gap: 14, alignItems: "flex-start", flexWrap: "nowrap" }}>
                                    <span className="esc-icon" style={{ width: 40, height: 40 }}><Icon name="check" size={18} /></span>
                                    <span className="esc-stack"><strong style={{ fontWeight: 500 }}>{t}</strong><span className="esc-p" style={{ fontSize: 15 }}>{b}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Reveal className="esc-glass iv-preview" delay={0.1}>
                        <div className="iv-aura" aria-hidden><span /><span /><span /></div>
                        <div className="iv-avatar-orb"><Orb mood="calm" size="100%" live glow label="Avatar preview" /></div>
                        <span className="esc-small" style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center" }}>Avatar preview · coming soon</span>
                        <span className="esc-chip" style={{ position: "absolute", left: 18, top: 18 }}><span className="esc-dot" aria-hidden />Preview</span>
                    </Reveal>
                </div>
            </section>

            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Games, quests & people" title="More than a place to look at" lede="Every path inside the Innerverse adapts to how you feel." />
                    <div className="esc-grid g2">
                        <Feature icon="compass" title="Mini games & quests" body="Play short mini games and quests that open your next level: a breath at the summit, a puzzle by the sea." soon />
                        <Feature icon="spark" title="Lucille, the navigator" body="Your companion becomes your guide, suggesting where to go based on how you're arriving." soon delay={0.08} />
                    </div>
                </div>
            </section>

            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Questions" title="Innerverse, answered" />
                    <Faq items={[
                        { q: "What is the Innerverse?", a: "A 3D world inside the Escape app. You explore calming worlds with your own avatar, play mini games, and meet other people, with Lucille as your guide." },
                        { q: "Do I create my own avatar?", a: "Yes. You design your avatar yourself, and you can style it with outfits and auras you redeem in the Marketplace." },
                        { q: "Are there mini games?", a: "Yes. Each world has short mini games and quests, like breathing challenges and puzzles." },
                        { q: "Can I interact with people from around the world?", a: "Yes. You can explore worlds together and connect with people from around the world." },
                        { q: "When does it open, and how do I get in?", a: "The Innerverse is in development. Join the waitlist and you'll be among the first let in." },
                    ]} />
                </div>
            </section>

            <ClosingCta eyebrow="Coming soon · early waitlist" title={<>Join the <span className="esc-gold">wellness revolution</span></>} lede="Be first into the Innerverse when it opens." primary={{ label: "Join the waitlist", href: p.waitlistHref }} />
        </Page>
    )
}

function Postcard(p: { title: string; place: string; body: string; img: string; g: string; delay?: number }) {
    return (
        <Reveal delay={p.delay} className="esc-glass esc-lift iv-card">
            <div className="iv-scene" style={{ background: p.img ? `center/cover url(${p.img})` : p.g }} aria-hidden>
                {!p.img && <><span className="iv-sun" /><span className="iv-hill a" /><span className="iv-hill b" /></>}
                <span className="esc-soon" style={{ position: "absolute", left: 18, top: 18, background: "rgba(11,18,48,.55)", color: "#F5C26B" }}>Coming soon</span>
            </div>
            <div className="esc-stack" style={{ gap: 6, padding: "22px 24px 26px" }}>
                <span className="esc-over">{p.place}</span>
                <h3 className="esc-d esc-h3">{p.title}</h3>
                <p className="esc-p">{p.body}</p>
            </div>
        </Reveal>
    )
}

const IV_CSS = `
.esc-sec.iv-hero{padding-top:clamp(130px,13cqi,180px)}
.iv-stars{position:absolute;inset:0;opacity:.5;background-image:radial-gradient(1px 1px at 12% 22%,#fff,transparent),radial-gradient(1px 1px at 72% 12%,#fff,transparent),radial-gradient(1.5px 1.5px at 38% 64%,#fff,transparent),radial-gradient(1px 1px at 88% 48%,#fff,transparent),radial-gradient(1px 1px at 22% 82%,#fff,transparent),radial-gradient(1.5px 1.5px at 58% 34%,#fff,transparent),radial-gradient(1px 1px at 6% 52%,#fff,transparent),radial-gradient(1px 1px at 94% 86%,#fff,transparent)}
[data-esc-tone="light"] .iv-stars{display:none}
.iv-card,.iv-realm{border-radius:28px;overflow:hidden;padding:0}
.iv-scene{position:relative;aspect-ratio:16/9;overflow:hidden}
.iv-sun{position:absolute;width:22%;aspect-ratio:1;border-radius:50%;left:62%;top:18%;background:radial-gradient(closest-side,#FFF6E6,rgba(255,246,230,0))}
.iv-hill{position:absolute;left:-10%;right:-10%;border-radius:50% 50% 0 0}
.iv-hill.a{bottom:-30%;height:60%;background:rgba(11,18,48,.35)}
.iv-hill.b{bottom:-44%;height:66%;left:20%;background:rgba(11,18,48,.55)}
.iv-art{position:relative;height:150px;overflow:hidden}
.iv-art{aspect-ratio:16/10;height:auto}
.iv-art span{position:absolute;width:60%;aspect-ratio:1;left:20%;top:10%;opacity:.55;filter:blur(8px)}
.iv-ph{position:absolute;left:50%;top:50%;translate:-50% -50%;display:inline-flex;gap:8px;align-items:center;font-style:normal;font-size:13px;padding:6px 12px;border-radius:999px;background:rgba(11,18,48,.6);color:#E6EAF4;border:1px dashed rgba(230,234,244,.45);white-space:nowrap}
.iv-avatar{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,4cqi,64px);align-items:center}
.iv-preview{position:relative;border-radius:36px;aspect-ratio:4/5;overflow:hidden;background:radial-gradient(80% 60% at 50% 35%,color-mix(in oklab,var(--esc-accent) 30%,transparent),transparent),linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2))}
.iv-avatar-orb{position:absolute;left:50%;top:46%;width:46%;translate:-50% -50%}
.iv-aura span{position:absolute;left:50%;top:46%;aspect-ratio:1;border-radius:50%;translate:-50% -50%;border:1px solid color-mix(in oklab,var(--esc-accent) 45%,transparent);animation:esc-breathe 6s var(--esc-ease) infinite}
.iv-aura span:nth-child(1){width:62%}.iv-aura span:nth-child(2){width:80%;opacity:.6;animation-delay:.8s}.iv-aura span:nth-child(3){width:98%;opacity:.3;animation-delay:1.6s}
@container (max-width:900px){.iv-avatar{grid-template-columns:minmax(0,1fr)}}
`

InnerversePage.defaultProps = { waitlistHref: ROUTES.beta, santoriniImage: "", costaRicaImage: "", world1: "", world2: "", world3: "", world4: "", world5: "", world6: "" }
addPropertyControls(InnerversePage, {
    waitlistHref: { type: ControlType.Link, title: "Waitlist link" },
    santoriniImage: { type: ControlType.Image, title: "Santorini image" },
    costaRicaImage: { type: ControlType.Image, title: "Costa Rica image" },
    world1: { type: ControlType.Image, title: "Forest shot" },
    world2: { type: ControlType.Image, title: "Ocean shot" },
    world3: { type: ControlType.Image, title: "Cosmic shot" },
    world4: { type: ControlType.Image, title: "Temple shot" },
    world5: { type: ControlType.Image, title: "Cavern shot" },
    world6: { type: ControlType.Image, title: "Summit shot" },
})
