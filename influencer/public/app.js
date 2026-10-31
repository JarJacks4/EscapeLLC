// Escape creator program: mood orbs, menu, path tabs, earnings estimate, gentle celebrations.
(() => {
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ───────── Mood orbs: the same TouchDesigner loops as the app and escapeapp.ai ─────────
  const ORB_STORAGE = 'https://firebasestorage.googleapis.com/v0/b/escape-self-care-505618.firebasestorage.app/o/visuals%2Fv3%2F';
  const FALLBACK = 'https://storage.googleapis.com/escape-self-care-505618-escape-media/web/orbs/';
  // Where the sphere sits in each 9:16 loop: centre x, centre y, diameter (fractions of the frame).
  const GEO = {
    escape_calm_e50_t15_v3: [0.5026, 0.4484, 0.6476],
    escape_focus_e85_t50_v3: [0.464, 0.465, 0.62],
    escape_picks_e50_t15_v3: [0.5021, 0.4426, 0.5514],
    escape_focus_e50_t85_v3: [0.465, 0.463, 0.63],
  };
  const fit = (el, key) => {
    const [cx, cy, d] = GEO[key] || [0.5, 0.443, 0.6];
    const w = (0.9 / d) * 100, h = w * (16 / 9);
    Object.assign(el.style, { width: w + '%', height: h + '%', left: (50 - cx * w) + '%', top: (50 - cy * h) + '%' });
  };
  const orbs = [...document.querySelectorAll('.orb[data-loop]')];
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target.querySelector('video');
      if (!v) return;
      if (e.isIntersecting && !reduce) v.play().catch(() => {});
      else v.pause();
    });
  }, { rootMargin: '120px' }) : null;
  orbs.forEach((orb) => {
    const loop = orb.dataset.loop, grid = loop.split('_')[1];
    orb.style.setProperty('--hue', orb.dataset.hue || '#8E7CD9');
    const img = new Image();
    img.alt = ''; img.decoding = 'async'; img.loading = 'lazy';
    fit(img, loop);
    img.onload = () => img.classList.add('on');
    img.onerror = () => img.remove();
    img.src = `${ORB_STORAGE}${loop}_poster.webp?alt=media`;
    orb.appendChild(img);
    // Small orbs stay on the poster (one video decoder per big orb only), like the app.
    if (!orb.classList.contains('orb-sm') && !orb.classList.contains('orb-md')) {
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      fit(v, loop);
      [[`${ORB_STORAGE}${loop}_720_h264.mp4?alt=media`, 'video/mp4'],
       [`${FALLBACK}escape_${grid}_e50_t50_v3_540_offline.mp4`, 'video/mp4']].forEach(([src, type]) => {
        const s = document.createElement('source'); s.src = src; s.type = type; v.appendChild(s);
      });
      v.addEventListener('loadeddata', () => { v.classList.add('on'); img.classList.remove('on'); });
      orb.appendChild(v);
      if (io) io.observe(orb); else if (!reduce) v.play().catch(() => {});
    }
    const tint = document.createElement('span'); tint.className = 'tint'; orb.appendChild(tint);
  });

  // ───────── Mobile menu ─────────
  const menu = document.getElementById('menu'), links = document.getElementById('navLinks');
  const setMenu = (open) => {
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  links?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // ───────── Path tabs (arrow keys move between them) ─────────
  const tabs = [...document.querySelectorAll('.tab')];
  const select = (t) => {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(n); n.focus();
    });
  });

  // ───────── Reveal on scroll (content is visible without JS) ─────────
  const reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) reveals.forEach((el) => el.classList.add('in'));
  else {
    const ro = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }), { threshold: 0.12 });
    reveals.forEach((el) => ro.observe(el));
  }

  // ───────── Earnings estimate ─────────
  // Rates from the tier table. Affiliate bonuses follow the table (Gold +$50, Platinum +$75).
  const TIERS = [
    { name: 'Bronze', max: 300, amb: 1.50, ambBonus: 0, aff: 1.00, affBonus: 0 },
    { name: 'Silver', max: 500, amb: 1.75, ambBonus: 50, aff: 1.25, affBonus: 0 },
    { name: 'Gold', max: 800, amb: 2.00, ambBonus: 100, aff: 1.50, affBonus: 50 },
    { name: 'Platinum', max: Infinity, amb: 2.25, ambBonus: 150, aff: 1.75, affBonus: 75 },
  ];
  const tierFor = (n) => TIERS.find((t) => n <= t.max);
  const range = document.getElementById('downloads');
  const out = document.getElementById('downloadsOut');
  const tierOut = document.getElementById('tierOut');
  const ambOut = document.getElementById('ambOut');
  const affOut = document.getElementById('affOut');
  const calc = document.getElementById('calc');
  const money = (v) => '$' + Math.round(v).toLocaleString('en-US');
  let lastTier = null;
  const update = (celebrate) => {
    const n = Number(range.value);
    const t = n === 0 ? TIERS[0] : tierFor(n);
    out.textContent = `${n.toLocaleString('en-US')} downloads`;
    tierOut.textContent = t.name;
    ambOut.textContent = money(n === 0 ? 0 : n * t.amb + t.ambBonus);
    affOut.textContent = money(n === 0 ? 0 : n * t.aff + t.affBonus);
    calc.dataset.tier = t.name;
    document.querySelectorAll('.tiers tr[data-row]').forEach((r) => r.classList.toggle('on', r.dataset.row === t.name));
    if (celebrate && lastTier && TIERS.indexOf(t) > TIERS.indexOf(lastTier)) cheer(t.name);
    lastTier = t;
  };
  range?.addEventListener('input', () => update(true));
  if (range) update(false);

  // ───────── A gentle cheer on reaching a new tier (mood-orb colours) ─────────
  const HUES = ['#8E7CD9', '#F08A1D', '#4FA3FF', '#E0589A', '#D9A066', '#B9A3F0'];
  let toastEl, toastTimer;
  function cheer(name) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('aria-hidden', 'true'); document.body.appendChild(toastEl); }
    toastEl.textContent = name;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1100);
    if (!reduce) sparkle();
  }
  let canvas;
  function sparkle() {
    if (!canvas) {
      canvas = document.createElement('canvas');
      Object.assign(canvas.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 55 });
      document.body.appendChild(canvas);
    }
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const parts = Array.from({ length: 90 }, () => {
      const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 4.5;
      return { x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 1.5 + Math.random() * 2.5, c: HUES[(Math.random() * HUES.length) | 0], life: 1 };
    });
    const t0 = performance.now();
    (function frame(t) {
      const k = (t - t0) / 1300;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vx *= .985; p.vy = p.vy * .985 + .02;
        ctx.globalAlpha = Math.max(0, 1 - k);
        ctx.fillStyle = p.c;
        ctx.shadowColor = p.c; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      if (k < 1) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }
})();
