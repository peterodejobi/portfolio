/* motion.js: preloader, curtain hero, menu, cursor, previews, scroll-scrubbed sections */
(function () {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  if (reduce) root.classList.add('reduce');

  // scrub(): 0 -> 1 as an element's top moves from startFrac to endFrac of the viewport height
  const scrub = (el, s, e) => reduce ? 1 : clamp((innerHeight * s - el.getBoundingClientRect().top) / (innerHeight * (s - e)));
  const subs = [];                                   // functions run every animation frame
  (function tick() { subs.forEach(f => f()); requestAnimationFrame(tick); })();

  /* ---------- reveal on enter (fade-ups and masked headlines) ---------- */
  $$('.mg').forEach(g => $$('.mask', g).forEach((m, i) => m.style.setProperty('--d', (i * 0.1) + 's')));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.2 });
  $$('.reveal, .mg').filter(el => !el.closest('.gate')).forEach(el => io.observe(el));

  /* ---------- full-screen menu ---------- */
  const menu = $('#menu'), burger = $('.burger');
  function setMenu(open) {
    menu.classList.toggle('open', open); burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', !open); root.classList.toggle('locked', open);
  }
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- custom cursor (fine pointers only) ---------- */
  if (fine) {
    root.classList.add('has-cursor');
    const cur = $('.cursor'), dot = $('.dot'), ring = $('.ring'), label = $('.ring b');
    let mx = -100, my = -100, dx = -100, dy = -100, rx = -100, ry = -100;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; cur.classList.add('on'); });
    document.addEventListener('mouseleave', () => cur.classList.remove('on'));
    addEventListener('blur', () => cur.classList.remove('on'));
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor],a,button,label');
      const k = t ? (t.dataset.cursor || 'hover') : '';
      if (['view', 'soon', 'email', 'grab'].includes(k)) { cur.dataset.s = 'label'; label.textContent = k; } else cur.dataset.s = k;
    });
    addEventListener('mousedown', () => cur.classList.add('press'));
    addEventListener('mouseup', () => cur.classList.remove('press'));
    subs.push(() => {                                // dot follows quickly, ring trails behind
      dx = lerp(dx, mx, 0.5); dy = lerp(dy, my, 0.5); rx = lerp(rx, mx, 0.15); ry = lerp(ry, my, 0.15);
      dot.style.transform = `translate(${dx}px,${dy}px)`; ring.style.transform = `translate(${rx}px,${ry}px)`;
    });
  }

  /* ---------- hero curtain: opens after the loader, closes as you scroll away ---------- */
  const hero = $('.hero');
  if (hero) {
    let open = reduce ? 1 : 0;
    const copy = $('.hcopy');
    addEventListener('loader:done', () => {
      if (reduce) { hero.classList.add('go'); return; }
      const t0 = performance.now() + 200;
      (function step(now) {                          // 3.2 s ease-in-out
        const t = clamp((now - t0) / 3200);
        open = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        if (t < 1) requestAnimationFrame(step);
      })(performance.now());
      setTimeout(() => hero.classList.add('go'), 1400);
    });
    subs.push(() => {
      const r = hero.getBoundingClientRect();
      const p = reduce ? 0 : clamp(-r.top / (r.height - innerHeight * 0.2));
      const close = smooth((p - 0.05) / 0.9);
      hero.style.setProperty('--o', (open * (1 - close)).toFixed(3));
      copy.style.opacity = reduce ? 1 : 1 - clamp(close * 1.8);
    });
  }

  /* ---------- type-specimen preloader ---------- */
  const L = $('#loader');
  const startHome = () => requestAnimationFrame(() => dispatchEvent(new Event('loader:done')));
  if (!L || reduce || root.classList.contains('seen')) { if (L) L.remove(); startHome(); }
  else {
    try { sessionStorage.seen = 1; } catch (e) {}
    root.classList.add('locked');
    const fonts = Promise.all([300, 400, 500, 600, 700, 800, 900].map(w => document.fonts.load(w + ' 40px Inter')));
    Promise.race([fonts, new Promise(r => setTimeout(r, 2500))]).then(runLoader);
  }
  function runLoader() {
    const specs = $$('.spec', L), vh = innerHeight, fs = Math.min(innerWidth * 0.24, 280);
    const ctx = document.createElement('canvas').getContext('2d'); ctx.font = `700 ${fs}px Inter`;
    const H = ctx.measureText('H'), X = ctx.measureText('x'), Y = ctx.measureText('y');   // real glyph metrics
    const asc = H.fontBoundingBoxAscent || fs * 0.97, desc = H.fontBoundingBoxDescent || fs * 0.24;
    const base = vh * 0.49 + H.actualBoundingBoxAscent / 2;                              // split line cuts through the word
    const pos = { cap: base - H.actualBoundingBoxAscent, x: base - X.actualBoundingBoxAscent, base: base, desc: base + Y.actualBoundingBoxDescent };
    specs.forEach(s => {
      $('.word', s).style.cssText = `font-size:${fs}px;line-height:${asc + desc}px;top:${base - asc}px`;
      $$('.gl', s).forEach(g => g.style.top = pos[g.dataset.k] + 'px');
      $('.tag', s).style.top = (base + desc + 36) + 'px';
    });
    const T = []; let fired = false, ended = false;
    const at = (ms, f) => T.push(setTimeout(f, ms));
    const weights = [[300, 'Light 300'], [400, 'Regular 400'], [500, 'Medium 500'], [600, 'SemiBold 600'], [700, 'Bold 700'], [800, 'ExtraBold 800'], [900, 'Black 900'], ['900i', 'Black Italic 900'], [500, 'Medium 500']];
    const tagline = 'Student developer — Lagos';
    const fire = () => { if (!fired) { fired = true; dispatchEvent(new Event('loader:done')); } };
    const end = () => { if (!ended) { ended = true; L.remove(); root.classList.remove('locked'); } };
    at(150, () => L.classList.add('on'));
    weights.forEach((w, i) => at(550 + i * 280, () => specs.forEach(s => {   // hard cuts, no tween
      const el = $('.word', s); el.style.fontWeight = parseInt(w[0], 10); el.style.fontStyle = w[0] === '900i' ? 'italic' : 'normal'; $('.wl', s).textContent = w[1];
    })));
    for (let i = 1; i <= tagline.length; i++) at(1500 + (i / tagline.length) * 1300, () => specs.forEach(s => $('.typed', s).textContent = tagline.slice(0, i)));
    at(3300, () => L.classList.add('nocaret'));
    at(3450, fire);
    at(3550, () => L.classList.add('split'));
    at(4950, end);
    const skip = () => { if (ended) return; T.forEach(clearTimeout); fire(); L.classList.add('split', 'fast'); setTimeout(end, 500); };
    L.addEventListener('click', skip); addEventListener('keydown', skip, { once: true });
  }

  /* ---------- inline word previews that follow the cursor ---------- */
  const peek = $('.peek');
  if (peek && fine) {
    const img = $('img', peek), cap = $('span', peek);
    let tx = 0, ty = 0, x = 0, y = 0, lean = 0;
    addEventListener('pointermove', e => { tx = e.clientX + 24; ty = e.clientY + 24; });
    $$('[data-peek]').forEach(w => {
      w.addEventListener('mouseenter', () => { img.src = w.dataset.peek; cap.textContent = w.dataset.cap; peek.classList.toggle('portrait', w.dataset.ratio === 'p'); peek.classList.add('on'); });
      w.addEventListener('mouseleave', () => peek.classList.remove('on'));
    });
    subs.push(() => {
      const nx = lerp(x, tx, 0.12), ny = lerp(y, ty, 0.12);
      lean = lerp(lean, clamp((nx - x) * 1.2, -8, 8), 0.2); x = nx; y = ny;   // lean with horizontal speed
      peek.style.transform = `translate(${x}px,${y}px) rotate(${lean}deg)`;
    });
  }

  /* ---------- Act I: photo cards — peel, pile, spread, ring (from oyin.design spec) ---------- */
  const rwRoot = $('.rw-root');
  if (rwRoot) {
    const stage = $('.rw-stage', rwRoot) || rwRoot;
    const cards = $$('[data-card]', rwRoot);
    const copy = $('[data-copy]', rwRoot);
    const n = cards.length;
    const TILT = [-2, 2, -1, 2, 2, -2, -2, 1];
    const PILE = [4, -5, 3, -2, 6, -6, 2, -3];
    const thumbKeys = ['product', null, 'system', null, 'brand', null, 'proto', null];
    const thumbs = thumbKeys.map(k => k ? document.querySelector('.dc-thumb[data-thumb="' + k + '"]') : null);
    const PERSPECTIVE = 1400;
    const QUARTER = Math.PI / 2;
    const S1 = Math.sin(Math.PI / 8), S3 = Math.sin(3 * Math.PI / 8);

    let peel = reduce ? 1 : 0, p = reduce ? 1 : 0;
    let hovered = -1;
    const lift = cards.map(() => 0);
    const liftTarget = cards.map(() => 0);
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    addEventListener('pointermove', e => {
      mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });

    // Helpers
    const clamp01 = v => Math.min(1, Math.max(0, v));
    const smoothStep = t => { t = clamp01(t); return t * t * (3 - 2 * t); };
    const range = (v, a, b) => smoothStep((v - a) / (b - a));
    const lrp = (a, b, t) => a + (b - a) * t;
    const rad = d => d * Math.PI / 180;
    const angleOf = i => (i / n) * Math.PI * 2 - QUARTER;

    // Sub-ranges
    const SPREAD = [0.18, 0.50], EXPAND = [0.42, 1.00];
    const SPREAD_M = [0.15, 0.42], EXPAND_M = [0.22, 1.00];

    // Hover & Click
    cards.forEach((el, i) => {
      el.addEventListener('pointerenter', () => {
        if (p < 0.92) return;
        hovered = i; el.classList.add('is-hover'); liftTarget[i] = 1;
      });
      el.addEventListener('pointerleave', () => {
        if (hovered === i) hovered = -1;
        el.classList.remove('is-hover'); liftTarget[i] = 0;
      });
      el.addEventListener('click', () => {
        const href = el.dataset.href;
        if (href && p > 0.92) location.href = href;
      });
    });

    function renderCards() {
      const W = innerWidth, H = innerHeight, mobile = W < 720;
      const rect = rwRoot.getBoundingClientRect();
      const sTop = rect.top;

      // Compute peel from section top (72% → 0%)
      const peelRaw = reduce ? 1 : clamp01((H * 0.72 - sTop) / (H * 0.72));
      peel = lrp(peel, peelRaw, 0.14);

      // Compute p from pinned progress (once top hits viewport top, over 260% / 180% of vh)
      const pinTravel = H * (mobile ? 1.8 : 2.6);
      const pRaw = reduce ? 1 : clamp01(-sTop / pinTravel);
      p = lrp(p, pRaw, 0.14);

      // Mouse chase
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      // Lift tweening for hovers
      for (let i = 0; i < n; i++) {
        lift[i] += (liftTarget[i] - lift[i]) * 0.14;
        if (Math.abs(lift[i] - liftTarget[i]) < 0.001) lift[i] = liftTarget[i];
      }

      // Restore thumbnails if scrolled back above peel
      if (peel <= 0.02) {
        thumbs.forEach(th => { if (th) th.style.visibility = ''; });
      }

      // Stage center in viewport coordinates
      const stageRect = stage.getBoundingClientRect();
      const stageCenterX = stageRect.left + stageRect.width / 2;
      const stageCenterY = stageRect.top + stageRect.height / 2;

      // Scene values
      const late = clamp01((peel - 0.6) / 0.4);
      const drop = clamp01(p / 0.3);
      const liftAmt = drop > 0 ? 0.3 + 0.7 * (1 - (1 - drop) ** 2) : 0.3 * late * late;
      const b = range(p, ...(mobile ? SPREAD_M : SPREAD));
      const x = range(p, ...(mobile ? EXPAND_M : EXPAND));

      const Rbig = Math.min(H * 0.44, (W / 2) * 0.75);
      const Rsmall = Math.min(W, H) * 0.2;
      const R = lrp(Rsmall, Rbig, x) * b;

      const cardW = cards[0].offsetWidth || 160;
      const cardH = (cardW / 0.88) * 1.08;

      // Superellipse parameters for mobile ring
      const yMin = copy.offsetHeight / 2 + 8 + cardH / 2;
      const yMax = Math.max(yMin, Math.min(yMin + cardH + 6, H / 2 - 84 - cardH / 2));
      const Rx = (W / 2 - cardW * 0.56 - 6) / S3;
      const det = S1 * (S3 ** 3) - S3 * (S1 ** 3);
      const ca = (yMin * (S3 ** 3) - yMax * (S1 ** 3)) / det;
      const cc = (yMax * S1 - yMin * S3) / det;

      const turn = QUARTER * x + (mobile ? (Math.PI / 8) * x : 0);
      const pileY = -H * 0.3 * (1 - liftAmt);
      const leanX = rad(lrp(26, 9, x) * b + mouse.y * 5 * b);
      const leanY = rad(mouse.x * 7 * b);

      const out = [];

      for (let i = 0; i < n; i++) {
        const el = cards[i];
        const a = angleOf(i) + turn;
        const pileDx = ((i % 3) - 1) * 10 * (1 - b);
        const pileDy = -i * 3 * (1 - b);
        const s = Math.sin(a);

        // Ring target offsets relative to viewport center
        let mx = Math.cos(a) * (mobile ? lrp(Rsmall, Rx, x) * b : R) + pileDx;
        let my = (mobile ? lrp(s * Rsmall, ca * s + cc * (s ** 3), x) * b : s * R) + pileY + pileDy;

        // Fake 3D lean + perspective
        const rel = my - pileY;
        const vy = pileY + rel * Math.cos(leanX);
        let depth = rel * Math.sin(leanX);
        const sx = mx * Math.cos(leanY);
        depth += mx * Math.sin(leanY);
        const k = PERSPECTIVE / (PERSPECTIVE - depth);
        mx = sx * k;
        my = pileY + (vy - pileY) * k;

        let scaleX = lrp(0.86, 1, b) * k, scaleY = scaleX;
        let rotate = lrp(PILE[i], TILT[i], b);
        let alpha = 1;
        const key = b > 0.6 ? 500 + depth : (thumbs[i] ? 200 : 100) + i;

        // Target coordinates in screen/viewport space
        let targetX = W / 2 + mx;
        let targetY = H / 2 + my;

        // Peel phase overrides (while peel < 1)
        if (peel < 1) {
          const t = smoothStep((peel - i * 0.05) / 0.65);
          const th = thumbs[i];
          if (th) {
            const r = th.getBoundingClientRect();
            const thumbScreenX = r.left + r.width / 2;
            const thumbScreenY = r.top + r.height / 2;
            const arc = Math.sin(Math.PI * t) * -60;

            targetX = lrp(thumbScreenX, targetX, t);
            targetY = lrp(thumbScreenY, targetY, t) + arc;
            scaleX = lrp(r.width / (cardW || 1), 0.86, t);
            scaleY = lrp(r.height / (cardH || 1), 0.86, t);
            rotate = lrp(0, PILE[i], t) + Math.sin(Math.PI * t) * (i % 2 ? 10 : -10);

            if (t > 0.02) {
              th.style.visibility = 'hidden';
              alpha = 1;
            } else {
              th.style.visibility = '';
              alpha = 0;
            }
          } else {
            alpha = t;
            scaleX = lrp(0.6 * 0.86, 0.86, t);
            scaleY = scaleX;
            targetY += (1 - t) * 40;
          }
        } else if (!reduce && thumbs[i]) {
          thumbs[i].style.visibility = 'hidden';
        }

        // Hover overrides
        const F = lift[i];
        const dim = (hovered >= 0 && hovered !== i) ? 1 : 0;
        scaleX *= 1 + 0.12 * F;
        scaleY *= 1 + 0.12 * F;
        rotate *= 1 - F;
        alpha *= 1 - 0.45 * dim * range(p, 0.9, 1);

        // Convert target screen position to transforms relative to stage center
        const finalTransformX = targetX - stageCenterX;
        const finalTransformY = targetY - stageCenterY;

        out.push({
          el, key, lifted: F > 0.01,
          px: finalTransformX, py: finalTransformY,
          targetX, targetY,
          rotate, scaleX, scaleY, alpha,
          rotX: (leanX * 180 / Math.PI) * 0.35,
          rotY: (-leanY * 180 / Math.PI) * 0.5
        });
      }

      // Stacking: sort by key and resolve overlaps
      const half = out.map(o => ({
        x: o.targetX, y: o.targetY,
        w: (cardW * o.scaleX) / 2, h: (cardH * o.scaleY) / 2
      }));
      const overlaps = (a, b) =>
        Math.abs(half[a].x - half[b].x) < (half[a].w + half[b].w) * 1.04 &&
        Math.abs(half[a].y - half[b].y) < (half[a].h + half[b].h) * 1.04;

      const sortedIndices = out.map((_, i) => i).sort((a, b) => out[a].key - out[b].key);
      const rank = new Map(sortedIndices.map((idx, rankIdx) => [idx, rankIdx]));
      const left = new Set(sortedIndices), nextOrder = [];
      while (left.size) {
        let pick = -1;
        for (const c of left) {
          const free = [...left].every(o => o === c || !overlaps(o, c) || rank.get(o) > rank.get(c));
          if (free && (pick < 0 || out[c].key < out[pick].key)) pick = c;
        }
        if (pick < 0) { pick = left.values().next().value; }
        nextOrder.push(pick);
        left.delete(pick);
      }

      // Exit transition toward video section when scrolling past the pinned ring
      const exitProgress = reduce ? 0 : clamp01((-sTop - pinTravel) / (H * 0.7));

      nextOrder.forEach((idx, z) => {
        const o = out[idx];
        const { el, lifted, px, py, rotate: rot, scaleX: sx2, scaleY: sy2, alpha: al, rotX, rotY } = o;
        const exitAlpha = Math.max(0, al * (1 - exitProgress * 1.3));
        const blurAmount = (exitProgress * 14).toFixed(1);
        el.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg) scale(' + sx2.toFixed(4) + ',' + sy2.toFixed(4) + ') perspective(900px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
        el.style.opacity = exitAlpha.toFixed(3);
        el.style.filter = exitProgress > 0.01 ? 'blur(' + blurAmount + 'px)' : '';
        el.style.visibility = exitAlpha > 0.01 ? 'visible' : 'hidden';
        el.style.zIndex = lifted ? 1000 : 100 + z;
      });

      // Copy fade
      const c = clamp01((p - 0.78) / 0.17);
      const copyAlpha = c * Math.max(0, 1 - exitProgress * 1.6);
      copy.style.opacity = copyAlpha.toFixed(3);
      copy.style.visibility = copyAlpha > 0.01 ? 'visible' : 'hidden';
      copy.style.transform = 'translate(-50%, calc(-50% + ' + ((1 - c) * 20).toFixed(1) + 'px))';

      // Readiness
      rwRoot.classList.toggle('is-ready', p > 0.92);
    }

    if (reduce) { peel = 1; p = 1; renderCards(); }
    subs.push(() => {
      const r = rwRoot.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) {
        if (r.top > innerHeight * 0.72) thumbs.forEach(th => { if (th) th.style.visibility = ''; });
        return;
      }
      renderCards();
    });
  }

  /* ---------- Act II: lines draw and text brightens with scroll ---------- */
  $$('.step').forEach(s => {
    const ln = $('.ln', s), tx = $('.tx', s);
    subs.push(() => { ln.style.transform = `scaleX(${scrub(s, 0.85, 0.55)})`; tx.style.opacity = 0.18 + 0.82 * scrub(s, 0.75, 0.5); });
  });

  /* ---------- footer pelmet unrolls as you scroll ---------- */
  const call = $('footer.call'), pel = $('.pelmet');
  if (call && pel) subs.push(() => { pel.style.transform = `scaleY(${scrub(call, 1, 0.45)})`; });

  /* ---------- Lagos clock ---------- */
  const clocks = $$('.clk');
  const setClock = () => clocks.forEach(c => c.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' }));
  setClock(); setInterval(setClock, 15000);
})();
