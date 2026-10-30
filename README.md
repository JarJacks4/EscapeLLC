# Escape website: Framer code components

These are the Escape site components, built in `.tsx` for Framer and styled after the v6 app:

- **Type:** Gilda Display + Work Sans.
- **Moods:** the six app moods, with the real TouchDesigner Mood Orbs.
- **Tones:** night by default, with a sun/moon toggle for day.
- **Motion:** serene fades and the app's calm motion. Reduced Motion is respected.
- **Mobile:** the components resize to their own width (container queries), so they adapt by themselves at desktop, tablet and phone breakpoints. They were tested at 390, 768 and 1440 px with no sideways scroll.

## The easy way: one file

`EscapeSite.tsx` is the **whole site in one code component**: the orb gate, nav, every page and the footer.

1. Upload the media (step 1 below).
2. In Framer, open Assets → Code → **New code file**, name it `EscapeSite`, and paste in the whole file.
3. Drag `EscapeSite` onto an empty page. Set Width to **Fill** and Height to **Fit**.
4. Publish.

Pages are hash links (`/#/home`, `/#/lucille-ai`, `/#/app-testing` …). On the canvas, the **Show page** control picks which page you preview. Use either this file or the separate components below, not both.

## What's here

| File | What it is | Goes on |
|---|---|---|
| `code/EscapeKit.tsx` | Shared tokens, mood store, Orb, FlightOrb, Wordmark (the app's Lottie), buttons, cards, FAQ, icons, `LINKS`, `MEDIA_BASE`, `API_BASE` | Add it first. It isn't placed on the canvas. |
| `code/PathGate.tsx` | **The orb gate.** Two questions ("How are you feeling?", then "What would help?"), an optional 30-second breath, and a page that says where you're headed. The orb flies into the next page. The blurred app splash sits behind it, with a mood-colored overlay. | `/` |
| `code/JourneyBanner.tsx` | "You chose Calm → Slow down" arrival banner with a mini site map. SiteNav already renders it. | Nothing to place. |
| `code/SiteNav.tsx` | Floating glass nav: a live mood orb (back to the gate), sun/moon toggle, CTA, mobile menu, the arrival banner and the landing orb | top of every page |
| `code/SiteFooter.tsx` | Footer with early access, socials, the influencer program, Marketplace, Discord, Indiegogo and the disclaimer | bottom of every page |
| `code/HomePage.tsx` | Hero with the **app splash animation**, then the features first (Mood Analyzer, Lucille, Soundscapes, Movement, Marketplace, Innerverse), check-in, how it works, privacy, welcome + founder note, rewards, CTA | `/home` |
| `code/LucillePage.tsx` | Meet Lucille, with **Talk to Lucille** in the hero | `/lucille-ai` |
| `code/LucilleTaste.tsx` | The "Talk to Lucille" card: one message, one short reply, optional voice ("Hear Lucille say it"). Used by LucillePage. You can also drop it on any page. | (optional) |
| `code/MarketplacePage.tsx` | Escape Coins: how you earn, rewards (gift cards, themes, avatar items, soundscapes), energy levels, the influencer program | `/marketplace` |
| `code/PricingPage.tsx` | Journey Pass monthly/yearly, FAQ | `/pricing` |
| `code/InnerversePage.tsx` | Coming soon: worlds, realms, avatar, quests | `/innerverse` |
| `code/BetaPage.tsx` | **Beta access.** Four-step apply flow (You → Your phone → What you'd love → Stay in touch), then a "You're #N in line" screen, Discord, Maze and FAQ | `/app-testing` |
| `code/DemoPage.tsx` | **Interactive demo with sound**, in one flow: Mood Analyzer → Lucille (voice, memory, 120+ languages) → Soundscape → Movement → Marketplace | `/app-demo` |
| `code/LegalPage.tsx` | Privacy / Terms / Cookies (one component, choose the document) | `/privacy-policy`, `/terms`, `/cookie-policy` |
| `media/` | Splash loop (mp4, webm, poster), backup orb loops in `orbs/`, the demo's sound in `demo/` (Lucille's lines and the Misty Forest soundscape) and the Innerverse world captures in `innerverse/` | upload to the bucket (step 1 below) |
| `transcode_orbs_h264.sh` | Makes H.264 copies of the orb loops (already run, so `ORB_HAS_H264 = true`) | Cloud Shell |
| `previews/` | Screenshots of every page | reference |

## Set it up in Framer (about 20 minutes)

1. **Upload the media once, in Cloud Shell.** Upload the `media` folder to Cloud Shell, then run this from inside it:
   ```bash
   gcloud storage cp -r . gs://escape-self-care-505618-escape-media/web/ --cache-control="public,max-age=31536000"
   ```
   The components already point at that folder (`MEDIA_BASE` in EscapeKit), so you don't need to upload videos into Framer.
2. **Add the code files.** In Assets → Code, click **+ → New code file** and name it exactly as the file, without `.tsx`. Start with `EscapeKit`, then `PathGate`, then the rest. Paste in each file's contents. The names matter because the files import each other (`./EscapeKit.tsx`, `./PathGate.tsx`).
3. **Create the pages** with the paths in the table above.
4. **Orb gate (`/`).** Drag in `PathGate`. Set Width to Fill and Height to 100vh. No nav or footer goes on this page.
5. **Every other page:**
   - `SiteNav` at the top. Set Width to Fill and Position to **Fixed** (top 0), and choose the **Current page**.
   - The page component, with Width Fill and Height Fit.
   - `SiteFooter` at the bottom, with Width Fill.
6. **Legal pages.** Use the same `LegalPage` on all three and set **Document** on each.
7. **Publish**, then open the site on your phone and walk through the gate once.

## Round 2 (Oct 29): Ben's and Noah's notes, where each one lives

- **Meta Pixel (Noah).** Do **not** paste the `<head>` snippet into Framer's Site Settings. The same pixel (`1685481716363748`) is loaded by `EscapeKit` after the visitor accepts the consent bar, which is what the Cookie Policy promises; pasting it in the head as well would double-count PageViews and fire before consent. Events already wired: `PageView` (on consent), `Lead` when the beta form is submitted, `Contact` on every Discord button, `IndiegogoClick` (custom) on every Indiegogo button (home hero, beta hero, beta card, footer). They show up in Events Manager under those names.
- **Indiegogo (Ben).** Every campaign button points at `LINKS.indiegogo` in `EscapeKit.tsx`, which is a placeholder until the campaign page is live. Change that one line (or the Indiegogo link in the Beta page panel).
- **Demo sound (Ben).** The demo plays sound only once `media/demo/` is in the bucket (step 1). One clip is still to be rendered in Denise's voice: `lucille_language.mp3`, the line *"Y si prefieres, podemos hablar en español."* (chapter 2, the 120-languages moment). Until it exists the moment shows as captions only.
- **Innerverse screenshots (Ben, Noah).** Three real captures from the Unreal build are the defaults for Enchanted Forest, Sacred Temple and Crystal Cavern (`media/innerverse/`). The other three cards keep the illustrated scene until Ian's team sends captures; drop them into the page's image slots in Framer.
- **Orbs' black square (Noah).** The sphere is now masked at its own edge, so neither the square frame nor the navy ring can show, on any browser.
- Also in this build: features sit directly under the hero and the founder note is further down; nav says Marketplace; pricing is Free Preview with the later prices struck through, no trial; no creator program; American spelling throughout; the demo runs as one flow in Ben's order with the memory and language moments in chapter 2.


All outside links are already filled in from `LINKS` in EscapeKit: Indiegogo, the beta Discord, Maze, the beta Google Form fallback, the Influencer program, Instagram, TikTok and LinkedIn. **The Indiegogo link is a placeholder (indiegogo.com) until the campaign page is live**: set `LINKS.indiegogo` in EscapeKit. To change one everywhere, edit `LINKS`. Each component's panel can also override its own links.

## Lucille on the website

`LucilleTaste` and `BetaPage` call the Lucille API (`API_BASE` in EscapeKit, the `lucille` Cloud Run service):

- **`POST /v1/public/taste`**
  - One message (up to 280 characters) gets one reply of 2 to 4 sentences.
  - Limits: 3 replies per visitor per day, and 3,000 replies site-wide per day. Voiced replies are capped at 300 per day.
  - Crisis messages never reach the model. They get the app's safety reply with 988.
  - Nothing the visitor types is stored.
- **`POST /v1/public/beta-apply`**
  - Saves the application and returns the visitor's place in line.
  - If the API can't be reached, the page offers the Google Form instead.

If the API is down, the Lucille card shows a calm offline reply, so the site never shows an error. You can tune the limits with env vars on the service: `LUCILLE_TASTE_ENABLED`, `LUCILLE_TASTE_PER_VISITOR`, `LUCILLE_TASTE_DAILY_CAP`, `LUCILLE_TASTE_VOICE_DAILY_CAP` and `LUCILLE_TASTE_VOICE_ENGINES`. Set `LUCILLE_TASTE_VOICE_ENGINES=inhouse` for Denise's voice only.

## Using the mood in native Framer layers

The chosen mood and tone are mirrored to CSS variables on `<html>`. Native Framer layers can use them directly, for example a fill of `var(--esc-accent)`.

Available variables: `--esc-bg`, `--esc-bg2`, `--esc-ink`, `--esc-muted`, `--esc-faint`, `--esc-accent`, `--esc-gold`, `--esc-glowA`, `--esc-glowB`, `--esc-border`, `--esc-nav`.

`<html data-esc-mood="calm" data-esc-tone="dark">` is also set, so you can target those attributes too. The mood is saved in the visitor's browser (`localStorage: escape.site.v1`). Picking a new mood recolors every page and the orbs right away.

## Orbs

- **Shape:** each orb is clipped to its circle, tinted with the mood color the way the app's V6MoodOrb is, and fitted per loop so it sits centered.
- **Motion:** orbs animate on hover and in the nav.
- **Sources, in the order the browser tries them:**
  1. H.264 from Firebase Storage
  2. HEVC
  3. the backup loops in `MEDIA_BASE/orbs/`
  4. WebM
- **If the Firebase H.264 files ever go missing:** set `ORB_HAS_H264 = false` in EscapeKit.

## Claims trimmed for App Store / FTC safety

These figures from the intern file were removed because nothing backs them yet:

- 25M+ coins, 100K daily videos, 500+ new members a day
- 1,000+ users, 4.9/5 rating, 99.9% uptime
- 200+ languages
- 10,000+ expressions
- The 44% / 52% / 60% stats
- Brand gift cards, which implied partnerships. These are now "Partner rewards, coming soon".

"On-device, no data stored" also came out, because Lucille runs in the cloud. It's now **"Private by design · Your data is never sold"**.

Pricing shows the **Free Preview**: $0 now, with the later prices struck through. There is no free trial. The beta perk is the first year of the Journey Pass free after launch, plus a founding tester badge. "Premium" isn't used anywhere.

## Before going live, please confirm

1. **Prices.** $9.99 and $47.95 need to match App Store Connect and Google Play exactly.
2. **Legal text** is a draft. Have counsel review it, and keep "Last updated" current.
3. **Inboxes.** privacy@ and beta@escapeapp.ai need to exist, or change the links.
4. **Indiegogo.** Replace the placeholder `LINKS.indiegogo` with the campaign URL.
5. **Innerverse screenshots.** Drop real world renders into the six "shot" image slots on InnerversePage (or tell Claude and they can be added to the code).
