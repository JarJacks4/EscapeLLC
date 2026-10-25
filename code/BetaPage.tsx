// Escape — App Testing / Beta Access page body. Fill width, Fit height.
//
// The flow (mirrors escapeapp.ai/beta-test, made into one guided journey):
//   hero → why join → APPLY (4 short steps, on the page) → "You're on the list" with your place →
//   what happens next → Discord + Maze → FAQ → support on Kickstarter.
// Applications go to POST /v1/public/beta-apply on the Lucille API (stored for the team, one per
// email). If the API can't be reached, the visitor is offered the Google Form instead.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Page, Backdrop, Eyebrow, Button, SectionHead, Card, Feature, Orb, Icon, Faq, Reveal, ROUTES, LINKS, useEscape, moodById, easeSoft, postPublic, type IconName } from "./EscapeKit.tsx"

interface Props {
    testLength: string
    reviewTime: string
    discordUrl: string
    mazeUrl: string
    kickstarterUrl: string
    fallbackFormUrl: string
    privacyHref: string
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1440
 */
export default function BetaPage(p: Props) {
    const s = useEscape()
    const applyRef = React.useRef<HTMLDivElement>(null)
    const toApply = () => applyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    return (
        <Page>
            <style>{BE_CSS}</style>
            <section className="esc-sec be-hero">
                <Backdrop top />
                <div className="esc-wrap be-hero-in">
                    <div className="esc-stack esc-serene" style={{ gap: 20, alignItems: "flex-start" }}>
                        <span className="esc-chip"><span className="esc-dot" aria-hidden />Limited spots available</span>
                        <h1 className="esc-d esc-h1">Join the <span className="esc-gold">Escape beta</span></h1>
                        <p className="esc-lede">Help shape a calmer kind of self-care app. Get Lucille early, tell us what works, and get a founding tester badge plus one year of Premium on us.</p>
                        <div className="esc-row" style={{ gap: 12 }}>
                            <Button onClick={toApply} arrow>Apply in 2 minutes</Button>
                            <Button href={p.kickstarterUrl} variant="ghost" newTab>Support on Kickstarter</Button>
                        </div>
                        <ul className="be-trust">
                            <li><Icon name="check" size={18} />Free to join</li>
                            <li><Icon name="shield" size={18} />Your data is never sold</li>
                            <li><Icon name="calendar" size={18} />Reply within {p.reviewTime}</li>
                        </ul>
                    </div>
                    <div className="be-visual" aria-hidden>
                        <div className="be-phone esc-glass">
                            <div className="be-notch" />
                            <Orb mood={s.mood} size="64%" live rings hero />
                            <span className="esc-d" style={{ fontSize: 26 }}>Good evening</span>
                            <span className="esc-small">How are you arriving?</span>
                            <div className="be-rows">
                                <span className="esc-glass be-row"><Icon name="spark" size={16} style={{ color: "var(--esc-gold)" }} />Today's pick · Box breathing</span>
                                <span className="esc-glass be-row"><Icon name="chat" size={16} style={{ color: "var(--esc-accent)" }} />Lucille · "Want to slow down?"</span>
                                <span className="esc-glass be-row"><Icon name="star" size={16} style={{ color: "var(--esc-gold)" }} />Beta tester badge</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Why join" title="Why join the beta?" />
                    <div className="esc-grid g3">
                        <Feature icon="spark" title="Early access" body="Try Lucille, new sessions and features before anyone else." />
                        <Feature icon="chat" title="Direct influence" body="Your feedback goes straight to the team and shapes what ships." delay={0.05} />
                        <Feature icon="gift" title="Exclusive perks" body="One year of Premium on us and a founding tester badge in the app." delay={0.1} />
                    </div>
                </div>
            </section>

            <section className="esc-sec" id="apply">
                <Backdrop intensity={0.55} />
                <div className="esc-wrap" ref={applyRef} style={{ scrollMarginTop: 100 }}>
                    <SectionHead center eyebrow="Apply" title="Apply for beta access" lede="Four quick steps. We read every application." />
                    <ApplyFlow {...p} />
                </div>
            </section>

            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="What to expect" title="What happens after you apply" />
                    <ol className="be-steps">
                        {[
                            { icon: "check" as IconName, t: "We review", b: `Every application is read, and you'll hear back within ${p.reviewTime}.` },
                            { icon: "apple" as IconName, t: "You get access", b: "Your download link (TestFlight on iPhone, Google Play testing on Android), setup steps and a Discord invite." },
                            { icon: "calendar" as IconName, t: "You test", b: `Use Escape the way you normally would for about ${p.testLength}. Join a few short Maze studies if you like.` },
                            { icon: "gift" as IconName, t: "You're rewarded", b: "One year of Premium on us and your founding tester badge." },
                        ].map((st, i) => (
                            <Reveal key={st.t} as="li" delay={i * 0.06} className="esc-glass be-step">
                                <span className="be-num esc-d">{i + 1}</span>
                                <span className="esc-icon" style={{ width: 44, height: 44 }}><Icon name={st.icon} /></span>
                                <strong style={{ fontWeight: 500, fontSize: 18 }}>{st.t}</strong>
                                <span className="esc-p" style={{ fontSize: 15 }}>{st.b}</span>
                            </Reveal>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="esc-sec">
                <div className="esc-wrap esc-grid g2">
                    <Card className="esc-stack" style={{ gap: 14 }}>
                        <span className="esc-icon"><Icon name="users" /></span>
                        <h3 className="esc-d esc-h3" style={{ marginTop: 6 }}>Connect on Discord</h3>
                        <p className="esc-p">Real-time feedback channels, weekly team AMAs, beta announcements and community challenges. Accepted testers get an invite automatically.</p>
                        <div style={{ marginTop: "auto" }}><Button href={p.discordUrl} variant="ghost" small newTab arrow>Join the Discord</Button></div>
                    </Card>
                    <Card className="esc-stack" style={{ gap: 14 }} delay={0.06}>
                        <span className="esc-icon"><Icon name="flask" /></span>
                        <h3 className="esc-d esc-h3" style={{ marginTop: 6 }}>UX research with Maze</h3>
                        <p className="esc-p">Short, optional studies (5–10 minutes): usability tests, feature surveys and design feedback, about once a month.</p>
                        <div style={{ marginTop: "auto" }}><Button href={p.mazeUrl} variant="ghost" small newTab arrow>About Maze studies</Button></div>
                    </Card>
                </div>
            </section>

            <section className="esc-sec">
                <div className="esc-wrap">
                    <SectionHead center eyebrow="Questions" title="Before you apply" />
                    <Faq items={[
                        { q: "How long does the beta last?", a: `About ${p.testLength}. We'll always tell you before a test round ends.` },
                        { q: "Which phones can I test on?", a: "Recent iPhones through TestFlight, and Android phones through the Google Play testing track." },
                        { q: "Is my data private?", a: <>Yes. Beta data is encrypted and handled under the same standards as the app, and it's never sold. See the <a className="esc-link" href={p.privacyHref}>privacy policy</a>.</> },
                        { q: "How often will you ask for feedback?", a: "About once a week, through Discord, a short Maze study or the in-app feedback button. All optional." },
                        { q: "Can I invite friends?", a: "Yes. After your first week you'll get three invite codes to share." },
                        { q: "Is Escape a replacement for therapy?", a: "No. Escape is a self-care app. It doesn't diagnose or treat. If you're in crisis in the US, call or text 988." },
                    ]} />
                </div>
            </section>

            <section className="esc-sec" style={{ paddingTop: 0 }}>
                <div className="esc-wrap">
                    <Reveal className="esc-glass esc-glow be-ks">
                        <div className="esc-stack" style={{ gap: 8 }}>
                            <span className="esc-over">Can't wait for a spot?</span>
                            <h2 className="esc-d" style={{ fontSize: "clamp(26px,3cqi,36px)", margin: 0 }}>Back Escape on Kickstarter</h2>
                            <p className="esc-p">Supporters get exclusive early access and help bring Lucille to everyone.</p>
                        </div>
                        <Button href={p.kickstarterUrl} newTab arrow>Support the campaign</Button>
                    </Reveal>
                </div>
            </section>
        </Page>
    )
}

// ───────────────────────── the application ─────────────────────────

const GOALS: { id: string; label: string }[] = [
    { id: "focus", label: "Find focus" }, { id: "slow_down", label: "Slow down" }, { id: "sleep", label: "Sleep better" },
    { id: "lighter", label: "Feel lighter" }, { id: "move", label: "Move my body" }, { id: "kind", label: "Be kind to myself" }, { id: "explore", label: "Just explore" },
]
const SOURCES = ["TikTok", "Instagram", "A friend", "Kickstarter", "Discord", "LinkedIn", "Other"]
const STEPS = ["You", "Your phone", "What you'd love", "Stay in touch"]

interface Form { name: string; email: string; age: boolean; device: "" | "iphone" | "android" | "both"; deviceModel: string; goals: string[]; source: string; discord: boolean; maze: boolean; consent: boolean }
const EMPTY: Form = { name: "", email: "", age: false, device: "", deviceModel: "", goals: [], source: "", discord: true, maze: false, consent: false }
const DRAFT = "escape.beta.draft.v1"

function ApplyFlow(p: Props) {
    const s = useEscape()
    const reduce = useReducedMotion()
    const [step, setStep] = React.useState(0)
    const [f, setF] = React.useState<Form>(EMPTY)
    const [errors, setErrors] = React.useState<Record<string, string>>({})
    const [busy, setBusy] = React.useState(false)
    const [done, setDone] = React.useState<null | { position?: number; duplicate?: boolean }>(null)
    const [failed, setFailed] = React.useState(false)
    const headRef = React.useRef<HTMLHeadingElement>(null)
    const first = React.useRef(true)

    React.useEffect(() => { try { const d = sessionStorage.getItem(DRAFT); if (d) setF({ ...EMPTY, ...JSON.parse(d) }) } catch {} }, [])
    React.useEffect(() => { try { sessionStorage.setItem(DRAFT, JSON.stringify(f)) } catch {} }, [f])
    React.useEffect(() => { if (first.current) { first.current = false; return } headRef.current?.focus() }, [step, done])

    const set = <K extends keyof Form>(k: K, v: Form[K]) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })) }
    const validate = (i: number) => {
        const e: Record<string, string> = {}
        if (i === 0) {
            if (!f.name.trim()) e.name = "What should we call you?"
            if (!/^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(f.email.trim())) e.email = "Please enter a valid email."
            if (!f.age) e.age = "The beta is for people 18 and older."
        }
        if (i === 1 && !f.device) e.device = "Pick the phone you'll test on."
        if (i === 3 && !f.consent) e.consent = "We need your OK to email you about the beta."
        setErrors(e)
        return Object.keys(e).length === 0
    }
    const next = () => { if (validate(step)) setStep(Math.min(3, step + 1)) }
    const back = () => setStep(Math.max(0, step - 1))
    const submit = async () => {
        if (!validate(3)) return
        setBusy(true); setFailed(false)
        const res = await postPublic("/v1/public/beta-apply", {
            name: f.name.trim(), email: f.email.trim(), device: f.device, deviceModel: f.deviceModel.trim() || undefined,
            goals: f.goals, source: f.source || undefined, discord: f.discord, maze: f.maze, mood: s.mood || undefined,
            ageConfirmed: f.age, consent: f.consent,
        })
        setBusy(false)
        if (res.ok && res.data?.ok) { setDone({ position: res.data.position, duplicate: res.data.duplicate }); try { sessionStorage.removeItem(DRAFT) } catch {} }
        else if (res.status === 422 && res.data?.detail) setErrors({ form: typeof res.data.detail === "string" ? res.data.detail : "Please check your answers." })
        else setFailed(true)
    }

    const m = moodById(s.mood)
    const anim = reduce ? {} : { initial: { opacity: 0, x: 18, filter: "blur(6px)" }, animate: { opacity: 1, x: 0, filter: "blur(0px)" }, exit: { opacity: 0, x: -18, filter: "blur(6px)" }, transition: { duration: 0.5, ease: easeSoft } }

    if (done) {
        return (
            <motion.div className="esc-glass esc-glow ap ap-done" initial={reduce ? false : { opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: easeSoft }}>
                <Orb mood={s.mood} size={120} live rings glow />
                <span className="esc-over">{done.duplicate ? "Application updated" : "Application received"}</span>
                <h3 className="esc-d ap-h" tabIndex={-1} ref={headRef}>You're on the list, {f.name.trim().split(" ")[0]}.</h3>
                {done.position ? <p className="ap-pos">You're <strong>#{done.position}</strong> in line{done.duplicate ? ", same as before" : ""}.</p> : null}
                <p className="esc-p" style={{ maxWidth: 520, margin: "0 auto" }}>We'll email <strong style={{ color: "var(--esc-ink)" }}>{f.email.trim()}</strong> within {p.reviewTime} with your download link and setup steps.</p>
                <ol className="ap-next">
                    <li className="on"><span>1</span>Applied</li>
                    <li><span>2</span>Review · {p.reviewTime}</li>
                    <li><span>3</span>Download link + Discord</li>
                    <li><span>4</span>Test · ~{p.testLength}</li>
                </ol>
                <div className="esc-row" style={{ gap: 10, justifyContent: "center" }}>
                    <Button href={p.discordUrl} newTab arrow>Join the Discord now</Button>
                    <Button href={p.kickstarterUrl} variant="ghost" newTab>Support on Kickstarter</Button>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="esc-glass ap" style={{ "--hue": m ? m.hue : "#8E7CD9" } as any}>
            <div className="ap-progress" aria-hidden><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
            <ol className="ap-steps" aria-label={`Step ${step + 1} of 4`}>
                {STEPS.map((t, i) => (
                    <li key={t} className={i === step ? "on" : i < step ? "done" : ""} aria-current={i === step ? "step" : undefined}>
                        <span className="ap-dot">{i < step ? <Icon name="check" size={12} /> : i + 1}</span><span className="ap-steplabel">{t}</span>
                    </li>
                ))}
            </ol>
            <form onSubmit={(e) => { e.preventDefault(); step < 3 ? next() : submit() }} noValidate>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.fieldset key={step} className="ap-fs" {...anim}>
                        {step === 0 && (<>
                            <legend><h3 className="esc-d ap-h" tabIndex={-1} ref={headRef}>First, a little about you</h3></legend>
                            <Field id="ap-name" label="Your name" error={errors.name}>
                                <input id="ap-name" autoComplete="name" value={f.name} maxLength={80} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "ap-name-e" : undefined} />
                            </Field>
                            <Field id="ap-email" label="Email" hint="We'll only use it for the beta." error={errors.email}>
                                <input id="ap-email" type="email" inputMode="email" autoComplete="email" value={f.email} maxLength={254} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "ap-email-e" : "ap-email-h"} />
                            </Field>
                            <Check id="ap-age" checked={f.age} onChange={(v) => set("age", v)} error={errors.age}>I'm 18 or older</Check>
                        </>)}
                        {step === 1 && (<>
                            <legend><h3 className="esc-d ap-h" tabIndex={-1} ref={headRef}>Which phone will you test on?</h3></legend>
                            <div className="ap-choices" role="radiogroup" aria-label="Your phone" aria-invalid={!!errors.device}>
                                {([["iphone", "iPhone", "apple"], ["android", "Android", "play-store"], ["both", "Both", "check"]] as const).map(([id, label, icon]) => (
                                    <button key={id} type="button" role="radio" aria-checked={f.device === id} className={`ap-choice ${f.device === id ? "on" : ""}`} onClick={() => set("device", id)}>
                                        <Icon name={icon as IconName} size={24} /><span>{label}</span>
                                    </button>
                                ))}
                            </div>
                            {errors.device && <p className="ap-err" role="alert">{errors.device}</p>}
                            <Field id="ap-model" label="Phone model (optional)" hint="e.g. iPhone 15, Pixel 8, Galaxy S24">
                                <input id="ap-model" value={f.deviceModel} maxLength={60} onChange={(e) => set("deviceModel", e.target.value)} aria-describedby="ap-model-h" />
                            </Field>
                        </>)}
                        {step === 2 && (<>
                            <legend><h3 className="esc-d ap-h" tabIndex={-1} ref={headRef}>What would you love from Escape?</h3></legend>
                            <p className="esc-small" style={{ margin: "-4px 0 4px" }}>Pick any that fit. Optional.</p>
                            <div className="ap-chips" role="group" aria-label="What you'd love from Escape">
                                {GOALS.map((g) => {
                                    const on = f.goals.includes(g.id)
                                    return <button key={g.id} type="button" aria-pressed={on} className={`ap-chip ${on ? "on" : ""}`} onClick={() => set("goals", on ? f.goals.filter((x) => x !== g.id) : [...f.goals, g.id])}>{on && <Icon name="check" size={14} />}{g.label}</button>
                                })}
                            </div>
                            <Field id="ap-source" label="How did you hear about us? (optional)">
                                <select id="ap-source" value={f.source} onChange={(e) => set("source", e.target.value)}>
                                    <option value="">Choose one</option>
                                    {SOURCES.map((x) => <option key={x} value={x}>{x}</option>)}
                                </select>
                            </Field>
                        </>)}
                        {step === 3 && (<>
                            <legend><h3 className="esc-d ap-h" tabIndex={-1} ref={headRef}>How should we stay in touch?</h3></legend>
                            <Toggle checked={f.discord} onChange={(v) => set("discord", v)} title="Invite me to the Discord" sub="Feedback channels, AMAs and beta news." />
                            <Toggle checked={f.maze} onChange={(v) => set("maze", v)} title="I'm up for short Maze studies" sub="5–10 minutes, about once a month." />
                            <div className="ap-review">
                                <span className="esc-over">Your application</span>
                                <span>{f.name || "—"} · {f.email || "—"}</span>
                                <span>{f.device ? { iphone: "iPhone", android: "Android", both: "iPhone + Android" }[f.device] : "—"}{f.deviceModel ? ` · ${f.deviceModel}` : ""}</span>
                                {f.goals.length > 0 && <span>{f.goals.map((g) => GOALS.find((x) => x.id === g)?.label).join(", ")}</span>}
                            </div>
                            <Check id="ap-consent" checked={f.consent} onChange={(v) => set("consent", v)} error={errors.consent}>
                                Escape may email me about the beta. I've read the <a className="esc-link" href={p.privacyHref} target="_blank" rel="noopener noreferrer">privacy policy</a>.
                            </Check>
                        </>)}
                    </motion.fieldset>
                </AnimatePresence>
                {errors.form && <p className="ap-err" role="alert">{errors.form}</p>}
                {failed && (
                    <div className="ap-fail" role="alert">
                        <p className="esc-p" style={{ margin: 0 }}>We couldn't reach our servers just now. Your answers are kept. Try again, or apply through our form.</p>
                        <div className="esc-row" style={{ gap: 8 }}>
                            <button type="button" className="ap-btn ghost" onClick={submit}>Try again</button>
                            <a className="ap-btn ghost" href={p.fallbackFormUrl} target="_blank" rel="noopener noreferrer">Open the form</a>
                        </div>
                    </div>
                )}
                <div className="ap-nav">
                    {step > 0 ? <button type="button" className="ap-btn ghost" onClick={back}><Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} />Back</button> : <span />}
                    <button type="submit" className="ap-btn" disabled={busy}>{busy ? "Sending…" : step < 3 ? "Continue" : "Submit application"}{!busy && <Icon name="arrow" size={16} />}</button>
                </div>
            </form>
        </div>
    )
}

function Field(props: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
    return (
        <div className={`ap-field ${props.error ? "bad" : ""}`}>
            <label htmlFor={props.id}>{props.label}</label>
            {props.children}
            {props.hint && !props.error && <span id={`${props.id}-h`} className="esc-small">{props.hint}</span>}
            {props.error && <span id={`${props.id}-e`} className="ap-err" role="alert">{props.error}</span>}
        </div>
    )
}

function Check(props: { id: string; checked: boolean; onChange: (v: boolean) => void; error?: string; children: React.ReactNode }) {
    return (
        <div className="ap-check-wrap">
            <label className={`ap-check ${props.error ? "bad" : ""}`} htmlFor={props.id}>
                <input id={props.id} type="checkbox" checked={props.checked} onChange={(e) => props.onChange(e.target.checked)} aria-invalid={!!props.error} />
                <span className="ap-box" aria-hidden><Icon name="check" size={14} /></span>
                <span>{props.children}</span>
            </label>
            {props.error && <span className="ap-err" role="alert">{props.error}</span>}
        </div>
    )
}

function Toggle(props: { checked: boolean; onChange: (v: boolean) => void; title: string; sub: string }) {
    return (
        <button type="button" role="switch" aria-checked={props.checked} className={`ap-toggle ${props.checked ? "on" : ""}`} onClick={() => props.onChange(!props.checked)}>
            <span className="esc-stack" style={{ gap: 2, alignItems: "flex-start", textAlign: "left" }}><strong style={{ fontWeight: 500 }}>{props.title}</strong><span className="esc-small">{props.sub}</span></span>
            <span className="ap-sw" aria-hidden><span /></span>
        </button>
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
.be-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;counter-reset:s}
.be-step{position:relative;border-radius:24px;padding:22px;display:flex;flex-direction:column;gap:10px}
.be-num{position:absolute;right:18px;top:12px;font-size:40px;color:color-mix(in oklab,var(--esc-accent) 40%,transparent)}
.be-ks{border-radius:32px;padding:clamp(24px,4cqi,44px);display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap}
.ap{max-width:720px;margin:0 auto;border-radius:32px;padding:clamp(20px,3.5cqi,40px);position:relative;overflow:hidden}
.ap-progress{position:absolute;left:0;right:0;top:0;height:3px;background:var(--esc-line)}
.ap-progress span{display:block;height:100%;background:linear-gradient(90deg,var(--esc-accent),var(--hue));transition:width .6s var(--esc-ease-soft)}
.ap-steps{list-style:none;margin:6px 0 24px;padding:0;display:flex;gap:6px;flex-wrap:wrap}
.ap-steps li{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--esc-faint);padding:5px 12px 5px 5px;border-radius:99px}
.ap-steps li.on{color:var(--esc-ink);background:var(--esc-glass1);box-shadow:inset 0 0 0 1px var(--esc-border)}
.ap-dot{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:12px;border:1px solid var(--esc-border)}
.ap-steps li.on .ap-dot{background:var(--esc-accent);color:var(--esc-onAccent);border-color:transparent}
.ap-steps li.done .ap-dot{background:var(--esc-glass1)}
.ap-fs{border:0;margin:0;padding:0;min-width:0;display:flex;flex-direction:column;gap:18px}
.ap-fs legend{padding:0;margin:0 0 4px}
.ap-h{font-size:clamp(26px,2.6cqi,34px);outline:none;margin:0}
.ap-field{display:flex;flex-direction:column;gap:6px}
.ap-field label{font-weight:500;font-size:15px}
.ap-field input,.ap-field select{appearance:none;box-sizing:border-box;width:100%;min-height:52px;padding:0 16px;border-radius:16px;font:400 16px "Work Sans",system-ui,sans-serif;color:var(--esc-ink);background:var(--esc-glass2);border:1px solid var(--esc-border);outline:none;transition:border-color .3s,box-shadow .3s}
.ap-field select{background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),linear-gradient(135deg,currentColor 50%,transparent 50%);background-position:calc(100% - 22px) 50%,calc(100% - 16px) 50%;background-size:6px 6px;background-repeat:no-repeat;padding-right:40px}
.ap-field select option{color:#0B1230}
.ap-field input:focus,.ap-field select:focus{border-color:var(--esc-accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--esc-accent) 30%,transparent)}
.ap-field.bad input{border-color:#FF8A80}
.ap-err{color:#FFB4AB;font-size:14px;margin:0}
[data-esc-tone="light"] .ap-err{color:#B3261E}
.ap-check{display:flex;gap:12px;align-items:flex-start;cursor:pointer;line-height:1.5;min-height:44px}
.ap-check input{position:absolute;opacity:0;width:1px;height:1px}
.ap-box{flex:none;width:24px;height:24px;margin-top:1px;border-radius:8px;display:grid;place-items:center;color:transparent;border:1.5px solid var(--esc-border);background:var(--esc-glass2);transition:background .3s,border-color .3s,color .3s}
.ap-check input:checked+.ap-box{background:var(--esc-accent);border-color:var(--esc-accent);color:var(--esc-onAccent)}
.ap-check input:focus-visible+.ap-box{outline:3px solid var(--esc-accent);outline-offset:2px}
.ap-check.bad .ap-box{border-color:#FF8A80}
.ap-choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.ap-choice{all:unset;box-sizing:border-box;cursor:pointer;min-height:96px;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font-weight:500;color:var(--esc-ink);background:var(--esc-glass2);border:1px solid var(--esc-border);transition:border-color .3s,background .3s,transform .3s}
.ap-choice:hover{transform:translateY(-2px)}
.ap-choice.on{border-color:var(--esc-accent);background:color-mix(in oklab,var(--esc-accent) 16%,transparent);box-shadow:0 12px 40px -20px var(--esc-accent)}
.ap-chips{display:flex;flex-wrap:wrap;gap:8px}
.ap-chip{all:unset;box-sizing:border-box;cursor:pointer;min-height:44px;padding:0 16px;border-radius:999px;display:inline-flex;align-items:center;gap:6px;font-size:15px;color:var(--esc-muted);border:1px solid var(--esc-border);background:var(--esc-glass2);transition:all .3s}
.ap-chip.on{color:var(--esc-onAccent);background:var(--esc-accent);border-color:var(--esc-accent)}
.ap-toggle{all:unset;box-sizing:border-box;cursor:pointer;width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;min-height:64px;padding:12px 16px;border-radius:18px;border:1px solid var(--esc-border);background:var(--esc-glass2)}
.ap-sw{flex:none;width:48px;height:28px;border-radius:99px;background:var(--esc-line);position:relative;transition:background .3s}
.ap-sw span{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#E6EAF4;transition:transform .35s var(--esc-ease-soft)}
.ap-toggle.on .ap-sw{background:var(--esc-accent)}
.ap-toggle.on .ap-sw span{transform:translateX(20px)}
.ap-choice:focus-visible,.ap-chip:focus-visible,.ap-toggle:focus-visible,.ap-btn:focus-visible{outline:3px solid var(--esc-accent);outline-offset:3px}
.ap-review{display:flex;flex-direction:column;gap:4px;padding:14px 16px;border-radius:16px;background:var(--esc-glass2);border:1px dashed var(--esc-border);font-size:14px;color:var(--esc-muted)}
.ap-nav{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:24px}
.ap-btn{all:unset;box-sizing:border-box;cursor:pointer;min-height:52px;padding:0 24px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;font-weight:500;color:var(--esc-onAccent);background:linear-gradient(135deg,var(--esc-accent),color-mix(in oklab,var(--esc-accent) 62%,#39519F));box-shadow:0 10px 34px -12px var(--esc-accent)}
.ap-btn.ghost{color:var(--esc-ink);background:var(--esc-glass2);border:1px solid var(--esc-border);box-shadow:none;text-decoration:none}
.ap-btn:disabled{opacity:.6;cursor:default}
.ap-fail{display:flex;flex-direction:column;gap:10px;margin-top:16px;padding:14px 16px;border-radius:16px;border:1px solid #F5C26B;background:color-mix(in oklab,#F5C26B 10%,transparent)}
.ap-done{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center}
.ap-pos{margin:0;font-size:20px}
.ap-pos strong{color:var(--esc-gold);font-weight:600}
.ap-next{list-style:none;margin:6px 0;padding:0;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.ap-next li{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 14px 0 6px;border-radius:99px;font-size:13px;color:var(--esc-muted);border:1px solid var(--esc-border)}
.ap-next li span{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:12px;background:var(--esc-glass1)}
.ap-next li.on{color:var(--esc-ink);border-color:var(--esc-accent)}
.ap-next li.on span{background:var(--esc-accent);color:var(--esc-onAccent)}
@container (max-width:980px){.be-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container (max-width:900px){.be-hero-in{grid-template-columns:minmax(0,1fr)}}
@container (max-width:560px){.be-steps{grid-template-columns:minmax(0,1fr)}.ap-steplabel{display:none}.ap-steps li{padding:4px}.ap-choices{grid-template-columns:minmax(0,1fr)}.ap-choice{min-height:60px;flex-direction:row}.ap-nav .ap-btn{flex:1;justify-content:center}.be-ks{flex-direction:column;align-items:flex-start}}
`

BetaPage.defaultProps = {
    testLength: "4 weeks",
    reviewTime: "48 hours",
    discordUrl: LINKS.discord,
    mazeUrl: LINKS.maze,
    kickstarterUrl: LINKS.kickstarter,
    fallbackFormUrl: LINKS.betaForm,
    privacyHref: ROUTES.privacy,
}
addPropertyControls(BetaPage, {
    testLength: { type: ControlType.String, title: "Test length" },
    reviewTime: { type: ControlType.String, title: "Review time" },
    discordUrl: { type: ControlType.Link, title: "Discord" },
    mazeUrl: { type: ControlType.Link, title: "Maze" },
    kickstarterUrl: { type: ControlType.Link, title: "Kickstarter" },
    fallbackFormUrl: { type: ControlType.Link, title: "Backup form" },
    privacyHref: { type: ControlType.Link, title: "Privacy link" },
})
