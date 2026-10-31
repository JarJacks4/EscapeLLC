# Escape creator program site (escape-influencer.web.app)

Plain static site: `public/index.html`, `public/styles.css`, `public/app.js`.
Rebuilt on Oct 31 2026 from the live site in the escapeapp.ai style (the original
source folder was not in any Escape repo).

Deploy (Firebase CLI, signed in with an account that owns the `escape-influencer` project):

    cd influencer
    firebase deploy --only hosting

Content notes for Ben:
- Testimonials were removed: the program hasn't launched, so they can't be real yet
  (FTC rule on fake reviews/testimonials, 2024). Add real ones, with permission, later.
- "Per subscription" and "Avg. RPM $2.10" were removed; Escape launches free, so payouts
  are per download, with an "estimate, not a promise" note under the calculator.
- The affiliate calculator now follows the tier table (Gold +$50, Platinum +$75).
- Footer year is 2027 as requested.
