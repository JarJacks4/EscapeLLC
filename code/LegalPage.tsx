// Escape — Legal pages (Privacy Policy, Terms of Service, Cookie Policy). Fill width, auto height.
// One component, three pages: set "Document" on each page. The text below is a DRAFT written
// from what the app actually does (permissions, processors, purchases). Have counsel review it
// before publishing, then keep "Last updated" current.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { Page, Backdrop, Eyebrow, Reveal, Icon, ROUTES } from "./EscapeKit.tsx"

type Doc = "privacy" | "terms" | "cookies"
interface Props { doc: Doc; lastUpdated: string; company: string; email: string; address: string }
type Section = { id: string; title: string; body: React.ReactNode }

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function LegalPage(p: Props) {
    const docs: Record<Doc, { title: string; href: string; promise?: string; sections: Section[] }> = {
        privacy: { title: "Privacy Policy", href: ROUTES.privacy, promise: "We collect only what Escape needs to work, we never sell your data, and you can delete your account and its data from Settings at any time.", sections: privacy(p) },
        terms: { title: "Terms of Service", href: ROUTES.terms, sections: terms(p) },
        cookies: { title: "Cookie Policy", href: ROUTES.cookies, sections: cookies(p) },
    }
    const d = docs[p.doc] || docs.privacy
    const [active, setActive] = React.useState(d.sections[0].id)
    React.useEffect(() => {
        if (typeof IntersectionObserver === "undefined") return
        const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-20% 0px -70% 0px" })
        d.sections.forEach((s) => { const el = document.getElementById(s.id); el && io.observe(el) })
        return () => io.disconnect()
    }, [p.doc])

    return (
        <Page>
            <style>{LG_CSS}</style>
            <section className="esc-sec lg-hero">
                <Backdrop top intensity={0.7} />
                <div className="esc-wrap esc-stack esc-serene" style={{ gap: 18, alignItems: "flex-start" }}>
                    <Eyebrow>Legal</Eyebrow>
                    <h1 className="esc-d esc-h1">{d.title}</h1>
                    <p className="esc-p">Last updated: {p.lastUpdated} · {p.company}</p>
                    <nav className="lg-tabs" aria-label="Legal documents">
                        {(Object.keys(docs) as Doc[]).map((k) => (
                            <a key={k} href={docs[k].href} aria-current={k === p.doc ? "page" : undefined} className={k === p.doc ? "on" : ""}>{docs[k].title}</a>
                        ))}
                    </nav>
                </div>
            </section>
            <section className="esc-sec" style={{ paddingTop: 0 }}>
                <div className="esc-wrap lg-body">
                    <nav className="lg-toc" aria-label="On this page">
                        <span className="esc-over">On this page</span>
                        <ol>
                            {d.sections.map((s, i) => (
                                <li key={s.id}><a href={`#${s.id}`} className={active === s.id ? "on" : ""}><span>{i + 1}.</span>{s.title}</a></li>
                            ))}
                        </ol>
                    </nav>
                    <article className="lg-article">
                        {d.promise && (
                            <Reveal className="esc-glass lg-promise">
                                <span className="esc-icon"><Icon name="shield" /></span>
                                <p className="esc-p" style={{ color: "var(--esc-ink)" }}><strong style={{ fontWeight: 500 }}>Our core privacy promise.</strong> {d.promise}</p>
                            </Reveal>
                        )}
                        {d.sections.map((s, i) => (
                            <section key={s.id} id={s.id} className="lg-sec">
                                <h2 className="esc-d"><span>{i + 1}.</span> {s.title}</h2>
                                <div className="lg-text">{s.body}</div>
                            </section>
                        ))}
                        <div className="esc-glass lg-contact">
                            <div>
                                <h2 className="esc-d" style={{ fontSize: 26, margin: "0 0 6px" }}>Questions about this policy?</h2>
                                <p className="esc-p">Write to us for anything: data access, corrections, deletion or general questions.</p>
                            </div>
                            <div className="esc-stack" style={{ gap: 6 }}>
                                <a className="esc-link" href={`mailto:${p.email}`}>{p.email}</a>
                                <span className="esc-small">{p.address}</span>
                            </div>
                        </div>
                        <a className="esc-link" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }) }}>Back to top ↑</a>
                    </article>
                </div>
            </section>
        </Page>
    )
}

// ───────────────────────── drafts ─────────────────────────

const ul = (items: React.ReactNode[]) => <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>

function privacy(p: Props): Section[] {
    return [
        { id: "intro", title: "Introduction", body: <><p>This policy explains how {p.company} ("Escape", "we") handles information when you use the Escape app and this website. Escape is a self-care and wellbeing app; it is not a medical device.</p></> },
        { id: "collect", title: "What we collect and why", body: <>
            <p>We collect the minimum needed to run Escape and personalize it for you:</p>
            {ul([
                <><strong>Account:</strong> your name, email and sign-in method (Apple, Google or email), so you can sign in on your devices.</>,
                <><strong>What you create:</strong> mood check-ins, journal entries, plans, sessions you complete, and your conversations with Lucille (text, and voice you choose to send). This is what makes Escape personal.</>,
                <><strong>Coins and progress:</strong> coins, streaks and Energy Scan results.</>,
                <><strong>Device and usage:</strong> app version, crash reports and performance data, and a push-notification token if you allow notifications.</>,
                <><strong>Purchases:</strong> your subscription status from the App Store or Google Play (via our subscription provider). We never see your card details.</>,
            ])}
            <p>Optional, only if you allow it on your device:</p>
            {ul([
                <><strong>Approximate location</strong> (about 1 km) to tune Soundscapes to your local weather and time of day.</>,
                <><strong>Apple Health / Health Connect:</strong> reading heart rate, HRV, sleep and steps to tune sessions, and saving mood check-ins and mindful minutes. Health data is never sold or used for advertising.</>,
                <><strong>Camera</strong> for the Mood Scan: the reading is used, not the photo or video.</>,
                <><strong>Microphone and speech recognition</strong> when you talk with Lucille or dictate a journal entry.</>,
                <><strong>Photos</strong> you choose for your profile or a journal entry.</>,
            ])}
        </> },
        { id: "use", title: "How we use information", body: <>{ul([
            "To provide Escape: your account, check-ins, sessions, Soundscapes, plans and journal.",
            "To let Lucille respond to you with context, and to suggest what may help today.",
            "To award coins, calculate your Energy Scan and send reminders you've chosen.",
            "To keep Escape secure, fix bugs and improve features (using aggregated or de-identified data where we can).",
        ])}<p>We do not use your wellbeing content for advertising, and there are no ads in Escape.</p></> },
        { id: "share", title: "How we share information", body: <><p>We do not sell or rent your personal information. We share it only with service providers who process it for us under contract, such as:</p>{ul([
            "Google Cloud and Firebase (hosting, database, sign-in, notifications, crash reports and analytics).",
            "AI model providers that generate Lucille's replies, voice and transcriptions.",
            "Our subscription provider and the App Store / Google Play for purchases.",
        ])}<p>We may also disclose information if required by law, or to protect someone's safety.</p></> },
        { id: "social", title: "Sharing you choose", body: <p>If you share a milestone, a soundscape mix or creator content, it's visible to the people you share it with. You control what you share.</p> },
        { id: "security", title: "Security and retention", body: <p>Data is encrypted in transit and protected with access controls. We keep your information while your account is active. When you delete your account in Settings, we delete your personal data from our active systems, except where we must keep limited records by law; backups roll off on a regular schedule.</p> },
        { id: "rights", title: "Your choices and rights", body: <>{ul([
            "Access, correct or export your data by emailing us.",
            "Delete your account and its data from Settings in the app, at any time.",
            "Turn off notifications, location, Health, camera or microphone access in your device settings.",
            "California residents: you have rights under the CCPA/CPRA, including to know, delete and correct. We do not sell or share personal information for cross-context advertising.",
            "If you're in the EEA or UK, you have rights under the GDPR, including to object and to complain to your data protection authority.",
        ])}</> },
        { id: "dnt", title: "Do Not Track", body: <p>This website doesn't track you across other sites, so it treats every visit the same whether or not your browser sends a Do Not Track or Global Privacy Control signal.</p> },
        { id: "children", title: "Children", body: <p>Escape isn't directed to children under 13, and we don't knowingly collect their information. If you believe a child has given us information, contact us and we'll delete it.</p> },
        { id: "changes", title: "Changes and governing law", body: <p>We'll update this page when our practices change and, for significant changes, tell you in the app. This policy is governed by the laws of the United States and the state where {p.company} is organized.</p> },
    ]
}

function terms(p: Props): Section[] {
    return [
        { id: "agree", title: "Agreement", body: <p>By using Escape you agree to these terms. If you don't agree, please don't use Escape.</p> },
        { id: "notmedical", title: "Not medical care", body: <p>Escape and Lucille provide self-care and wellbeing support only. They don't diagnose, treat or replace professional care. If you're in crisis in the US, call or text 988; elsewhere, contact your local emergency number.</p> },
        { id: "account", title: "Your account", body: <p>You're responsible for your account and for keeping your sign-in secure. You must be at least 13 (or the minimum age in your country) to use Escape.</p> },
        { id: "subs", title: "Free Preview and subscriptions", body: <p>Escape is free during the Free Preview. When paid plans start, we'll tell you in advance, and nothing is charged unless you choose a plan. Paid Journey Passes are billed through the App Store or Google Play and renew automatically until you cancel in your store account settings, at least 24 hours before renewal. Refunds are handled by the store under its policies.</p> },
        { id: "coins", title: "Coins and rewards", body: <p>Escape coins are earned through activity in the app. They have no cash value, can't be bought, sold or transferred, and may be adjusted to prevent abuse. Marketplace items and partner rewards are subject to availability.</p> },
        { id: "content", title: "Your content", body: <p>You own what you create in Escape. You give us the permission needed to store and process it to run the service for you. Content you choose to share publicly must follow our community guidelines.</p> },
        { id: "ai", title: "AI features", body: <p>Lucille is an AI. Her responses can be wrong or incomplete; use your judgment and don't rely on them for medical, legal or financial decisions.</p> },
        { id: "acceptable", title: "Acceptable use", body: <p>Don't misuse Escape: no harassment, illegal content, attempts to break security, or scraping. We may suspend accounts that put others at risk.</p> },
        { id: "liability", title: "Disclaimers and liability", body: <p>Escape is provided "as is". To the extent the law allows, {p.company} isn't liable for indirect or consequential losses, and our total liability is limited to what you paid us in the past 12 months.</p> },
        { id: "changes", title: "Changes and contact", body: <p>We may update these terms and will tell you in the app about significant changes. Questions: {p.email}.</p> },
    ]
}

function cookies(p: Props): Section[] {
    return [
        { id: "what", title: "What this covers", body: <p>This explains what this website stores in your browser. The Escape app is covered by the Privacy Policy.</p> },
        { id: "essential", title: "Preferences we store", body: <p>When you choose a mood on the orb gate, or switch between day and night, we save that choice in your browser's local storage (key <code>escape.site.v1</code>) so the site remembers it. It never leaves your device and isn't used to identify you.</p> },
        { id: "analytics", title: "Analytics", body: <p>We use privacy-friendly, aggregate page analytics provided by our website host to understand which pages are useful. We don't use advertising cookies or cross-site trackers.</p> },
        { id: "embeds", title: "Fonts and media", body: <p>Fonts, the mood orb videos and other media load from Google services. Those requests include standard technical information such as your IP address.</p> },
        { id: "control", title: "Your control", body: <p>You can clear site data in your browser settings at any time, which resets your mood and tone choice. Questions: {p.email}.</p> },
    ]
}

const LG_CSS = `
.esc-sec.lg-hero{padding-top:clamp(120px,12cqi,160px);padding-bottom:40px}
.lg-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.lg-tabs a{min-height:44px;display:inline-flex;align-items:center;padding:0 18px;border-radius:999px;border:1px solid var(--esc-border);color:var(--esc-muted);text-decoration:none;font-weight:500;background:linear-gradient(160deg,var(--esc-glass1),var(--esc-glass2))}
.lg-tabs a.on{color:var(--esc-onAccent);background:var(--esc-accent);border-color:var(--esc-accent)}
.lg-body{display:grid;grid-template-columns:260px minmax(0,1fr);gap:clamp(24px,4cqi,64px);align-items:start}
.lg-toc{position:sticky;top:110px;display:flex;flex-direction:column;gap:12px}
.lg-toc ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;border-left:1px solid var(--esc-line)}
.lg-toc a{display:flex;gap:8px;min-height:38px;align-items:center;padding:0 14px;margin-left:-1px;border-left:2px solid transparent;color:var(--esc-faint);text-decoration:none;font-size:14px}
.lg-toc a span{color:var(--esc-faint);width:20px}
.lg-toc a.on{color:var(--esc-ink);border-left-color:var(--esc-accent)}
.lg-article{display:flex;flex-direction:column;gap:clamp(28px,3cqi,40px);max-width:760px}
.lg-promise{display:flex;gap:16px;align-items:flex-start;border-radius:24px;padding:22px}
.lg-sec{scroll-margin-top:110px}
.lg-sec h2{font-size:clamp(24px,2.2cqi,30px);margin:0 0 12px}
.lg-sec h2 span{color:var(--esc-accent)}
.lg-text{color:var(--esc-muted);line-height:1.7;display:flex;flex-direction:column;gap:12px}
.lg-text p{margin:0}
.lg-text ul{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:8px}
.lg-text strong{color:var(--esc-ink);font-weight:500}
.lg-text code{font-size:.9em;padding:2px 6px;border-radius:6px;background:var(--esc-glass1)}
.lg-contact{border-radius:28px;padding:clamp(22px,3cqi,32px);display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
@container (max-width:900px){.lg-body{grid-template-columns:minmax(0,1fr)}.lg-toc{position:static}}
`

LegalPage.defaultProps = {
    doc: "privacy",
    lastUpdated: "October 25, 2026",
    company: "Escape Enterprises LLC",
    email: "privacy@escapeapp.ai",
    address: "Escape Enterprises LLC · Attn: Privacy & Legal",
}
addPropertyControls(LegalPage, {
    doc: { type: ControlType.Enum, title: "Document", options: ["privacy", "terms", "cookies"], optionTitles: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
    lastUpdated: { type: ControlType.String, title: "Last updated" },
    company: { type: ControlType.String, title: "Company" },
    email: { type: ControlType.String, title: "Email" },
    address: { type: ControlType.String, title: "Mailing address", displayTextArea: true },
})
