// Escape — site footer. Fill width, auto height, at the bottom of every page.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { Page, Button, StoreBadges, ROUTES, DISCLAIMER, Backdrop, LINKS } from "./EscapeKit.tsx"

interface Props {
    tagline: string
    accessTitle: string
    accessBody: string
    accessLabel: string
    accessHref: string
    appStoreUrl: string
    playUrl: string
    contactEmail: string
    instagramUrl: string
    tiktokUrl: string
    linkedinUrl: string
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function SiteFooter(p: Props) {
    const cols = [
        { title: "Product", links: [["Lucille AI", ROUTES.lucille], ["Pricing", ROUTES.pricing], ["App demo", ROUTES.demo], ["Innerverse · soon", ROUTES.innerverse], ["Indiegogo", LINKS.indiegogo]] },
        { title: "Rewards", links: [["Marketplace", ROUTES.marketplace], ["Influencer program", LINKS.influencers], ["Beta Discord", LINKS.discord], ["App testing", ROUTES.beta]] },
        { title: "Company", links: [["Privacy Policy", ROUTES.privacy], ["Consumer Health Data", ROUTES.health], ["Terms of Service", ROUTES.terms], ["Safety", ROUTES.safety], ["Cookie Policy", ROUTES.cookies], ["Contact", `mailto:${p.contactEmail}`]] },
    ]
    return (
        <Page>
            <style>{FOOT_CSS}</style>
            <footer className="foot">
                <Backdrop intensity={0.5} />
                <div className="esc-wrap foot-in">
                    <div className="foot-brand">
                        <a href={ROUTES.home} className="esc-d foot-mark" aria-label="Escape home">ESCAPE<sup>™</sup></a>
                        <p className="esc-p" style={{ maxWidth: 340 }}>{p.tagline}</p>
                        <StoreBadges appStoreUrl={p.appStoreUrl || undefined} playUrl={p.playUrl || undefined} />
                        <div className="esc-row" style={{ gap: 18 }}>
                            {p.instagramUrl && <a className="esc-link" href={p.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>}
                            {p.tiktokUrl && <a className="esc-link" href={p.tiktokUrl} target="_blank" rel="noopener noreferrer">TikTok</a>}
                            {p.linkedinUrl && <a className="esc-link" href={p.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                        </div>
                    </div>
                    {cols.map((c) => (
                        <nav key={c.title} aria-label={c.title} className="foot-col">
                            <h2 className="esc-over" style={{ margin: "0 0 14px" }}>{c.title}</h2>
                            <ul>{c.links.map(([l, h]) => { const ext = /^https?:/.test(h); return <li key={l}><a href={h} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined}>{l}{ext && <span className="esc-sr"> (opens in a new tab)</span>}</a></li> })}</ul>
                        </nav>
                    ))}
                    <div className="esc-glass foot-access">
                        <h2 className="esc-d" style={{ fontSize: 24, margin: 0 }}>{p.accessTitle}</h2>
                        <p className="esc-p" style={{ fontSize: 15 }}>{p.accessBody}</p>
                        <Button href={p.accessHref} small arrow>{p.accessLabel}</Button>
                    </div>
                </div>
                <div className="esc-wrap foot-legal">
                    <hr className="esc-hr" />
                    <div className="foot-row">
                        <span className="esc-small">© {new Date().getFullYear()} Escape Enterprises LLC. All rights reserved.</span>
                        <span className="esc-small foot-disc">{DISCLAIMER}</span>
                    </div>
                </div>
            </footer>
        </Page>
    )
}

const FOOT_CSS = `
.foot{position:relative;padding:clamp(56px,7cqi,88px) 0 28px;border-top:1px solid var(--esc-line)}
.foot-in{display:grid;grid-template-columns:1.4fr repeat(3,1fr) 1.3fr;gap:clamp(24px,3cqi,40px);align-items:start}
.foot-brand{display:flex;flex-direction:column;gap:18px}
.foot-mark{font-size:26px;letter-spacing:.14em;color:var(--esc-ink);text-decoration:none}
.foot-mark sup{font-size:.45em;letter-spacing:0;margin-left:2px}
.foot-col ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.foot-col a{color:var(--esc-muted);text-decoration:none;font-size:15px;min-height:36px;display:inline-flex;align-items:center}
.foot-col a:hover{color:var(--esc-ink);text-decoration:underline;text-underline-offset:4px}
.foot-access{border-radius:24px;padding:22px;display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.foot-legal{margin-top:clamp(40px,5cqi,64px);display:flex;flex-direction:column;gap:20px}
.foot-row{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}
.foot-disc{max-width:640px}
@container (max-width:1100px){.foot-in{grid-template-columns:1fr 1fr 1fr}.foot-brand{grid-column:1/-1}.foot-access{grid-column:1/-1}}
@container (max-width:600px){.foot-in{grid-template-columns:1fr 1fr}}
`

SiteFooter.defaultProps = {
    tagline: "Self-care that meets you where you are. Guided by Lucille, shaped by how you feel.",
    accessTitle: "Early access",
    accessBody: "Support the journey and be first in when Escape opens on iOS and Android.",
    accessLabel: "Get access",
    accessHref: ROUTES.beta,
    appStoreUrl: "",
    playUrl: "",
    contactEmail: "privacy@escapeapp.ai",
    instagramUrl: LINKS.instagram,
    tiktokUrl: LINKS.tiktok,
    linkedinUrl: LINKS.linkedin,
}

addPropertyControls(SiteFooter, {
    tagline: { type: ControlType.String, title: "Tagline", displayTextArea: true },
    accessTitle: { type: ControlType.String, title: "Access title" },
    accessBody: { type: ControlType.String, title: "Access text", displayTextArea: true },
    accessLabel: { type: ControlType.String, title: "Access button" },
    accessHref: { type: ControlType.Link, title: "Access link" },
    appStoreUrl: { type: ControlType.Link, title: "App Store URL" },
    playUrl: { type: ControlType.Link, title: "Google Play URL" },
    contactEmail: { type: ControlType.String, title: "Contact email" },
    instagramUrl: { type: ControlType.Link, title: "Instagram" },
    tiktokUrl: { type: ControlType.Link, title: "TikTok" },
    linkedinUrl: { type: ControlType.Link, title: "LinkedIn" },
})
