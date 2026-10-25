# Escape website: Framer code components

These are the Escape site components, built in `.tsx` for Framer and styled after the v6 app:

- **Type:** Gilda Display + Work Sans.
- **Moods:** the six app moods, with the real TouchDesigner Mood Orbs.
- **Tones:** night by default, with a sun/moon toggle for day.
- **Glass and motion:** glass cards with a soft glow, and the app's calm motion (520 ms, ease 0.25/0.6/0.25/1). Reduced Motion is respected.

## What's here

| File | What it is | Goes on |
|---|---|---|
| `code/EscapeKit.tsx` | Shared tokens, mood store, Orb, Wordmark (the app's Lottie), buttons, cards, FAQ, icons | Add it first. It isn't placed on the canvas. |
| `code/PathGate.tsx` | **The orb gate.** A centre orb with six mood orbs around it. You choose a feeling, the site takes on that mood, and you're taken to the matching page. | `/` |
| `code/SiteNav.tsx` | Floating glass nav: mood orb (back to gate), sun/moon toggle, CTA, mobile menu | top of every page |
| `code/SiteFooter.tsx` | Footer with early access, store badges and the disclaimer | bottom of every page |
| `code/HomePage.tsx` | Hero with the **app splash animation**, founder note, bento, live check-in, how it works, journey, privacy, community, CTA | `/home` |
| `code/LucillePage.tsx` | Meet Lucille | `/lucille-ai` |
| `code/CommunityPage.tsx` | Coins (real API values), energy journey, Marketplace, creators | `/community` |
| `code/PricingPage.tsx` | Journey Pass monthly/yearly, FAQ | `/pricing` |
| `code/InnerversePage.tsx` | Coming soon: worlds, realms, avatar, quests | `/innerverse` |
| `code/BetaPage.tsx` | App testing & early access | `/app-testing` |
| `code/DemoPage.tsx` | Demo player with chapter jumps and captions | `/app-demo` |
| `code/LegalPage.tsx` | Privacy / Terms / Cookies (one component, choose the document) | `/privacy-policy`, `/terms`, `/cookie-policy` |
| `media/escape_splash.mp4` | The app splash loop (the 9.5 MB GIF re-encoded to 1.1 MB) | Home → "Splash video" |
| `media/escape_splash.webm` | WebM fallback for browsers without H.264 | Home → "Splash WebM" |
| `media/escape_splash_poster.webp` | Its first frame | Home → "Splash poster" |
| `escape_site_preview.html` | **The whole site in one file, for testing before Framer.** Double-click to open. Pages use `#/home`-style links. | anywhere |

## Set it up in Framer (about 20 minutes)

1. **Add the code files.** In Assets → Code, click **+ → New code file** and name it exactly `EscapeKit`. Paste in `EscapeKit.tsx`. Repeat for every other file, keeping the same names, because the pages import `./EscapeKit.tsx`.
2. **Create the pages** with the paths in the table above.
3. **Orb gate (`/`).** Drag in `PathGate`. Set Width to Fill and Height to 100vh. No nav or footer goes on this page. Each mood's destination is editable on the right-hand panel.
4. **Every other page:**
   - `SiteNav` at the top. Set Width to Fill and Position to **Fixed** (top 0), and choose the **Current page**.
   - The page body component, with Width Fill and Height Fit.
   - `SiteFooter` at the bottom, with Width Fill.
5. **Home hero.** Upload `media/escape_splash.mp4` to **Splash video**, the `.webm` to **Splash WebM** and the `.webp` to **Splash poster**.
6. **Legal pages.** Use the same `LegalPage` on all three and set **Document** on each.
7. **Fill in the links** in each component's panel:
   - Apply/waitlist form (a Framer form page works well)
   - TestFlight and Play testing links
   - App Store / Play URLs at launch
   - Instagram / TikTok
   - Indiegogo, if you're running it
8. **Breakpoints.** The components resize to their own width (container queries), so they adapt by themselves at desktop, tablet and phone breakpoints.

### Using the mood in native Framer layers

The chosen mood and tone are mirrored to CSS variables on `<html>`. Native Framer layers can use them directly, for example a fill of `var(--esc-accent)`.

Available variables: `--esc-bg`, `--esc-bg2`, `--esc-ink`, `--esc-muted`, `--esc-faint`, `--esc-accent`, `--esc-gold`, `--esc-glowA`, `--esc-glowB`, `--esc-border`, `--esc-nav`.

`<html data-esc-mood="calm" data-esc-tone="dark">` is also set, so you can target those attributes too.

## How the orb gate routes

| Mood | Path | Opens |
|---|---|---|
| Calm | Slow down | `/home` |
| Focused | Talk it through | `/lucille-ai` |
| Energized | Grow and earn | `/community` |
| Restless | See it move | `/app-demo` |
| Tired | Drift somewhere | `/innerverse` |
| Low | Start gently | `/home` |

The choice is saved in the visitor's browser (`localStorage: escape.site.v1`). Return visitors see "Welcome back. Last time: Calm". The nav orb always leads back to the gate.

## Claims trimmed for App Store / FTC safety

These figures from the intern file were removed because nothing backs them yet:

- 25M+ coins, 100K daily videos, 500+ new members a day
- 1,000+ users, 4.9/5 rating, 99.9% uptime
- "Trained for over 27…"
- 200+ languages
- 10,000+ expressions / 43 muscles
- The 44% / 52% / 60% stats
- Sephora / Target / Therabody / AG gift cards, which implied partnerships. These are now "Partner rewards, coming soon".

"100% private, on-device processing, no data stored" also came out. Lucille runs in the cloud, so that wasn't true. It's now **"Private by design · Your data is never sold"**.

Coin values come from the live API (`COIN_RULES` in `escape_api/core.py`). If those change, update `COIN_RULES` in `EscapeKit.tsx`.

## Before going live, please confirm

1. **Mood Scan.** The app's iOS permission text describes a camera Mood Scan (selfie, plus fingertip pulse with the flash). The site only mentions it in the Privacy Policy. If it ships, it can come back as a feature card.
2. **Tester count.** BetaPage → "Tester count" is empty. Fill it only with a real number.
3. **Prices.** $9.99 and $47.95 match the intern file. They need to match App Store Connect and Google Play exactly.
4. **Legal text** is a draft written from what the app actually collects. Have counsel review it, and keep "Last updated" current.
5. **Inboxes.** privacy@, beta@ and creators@escapeapp.ai need to exist, or change the links.

## Notes

- **Orb loops** stream from Firebase Storage (`visuals/v3/…_720_h264.mp4`), the same files the app uses. The poster shows first, and the video fades in. Small orbs stay on the poster to save decoders.
- **Accessibility:**
  - WCAG 2.2 AA contrast in both tones.
  - 44 px minimum targets.
  - Visible focus rings.
  - Keyboard-operable gate, mood radios and FAQ.
  - `aria-live` on mood-driven copy.
  - Reduced Motion turns off looping motion and the gate swell.
- **Fonts** load from Google Fonts (Gilda Display, Work Sans). You can also pick them in Framer's font panel for native text.
