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

  /* ---------- Act I: pinned pile that becomes a 3D ring ---------- */
  const work = $('.work');
  if (work) {
    const stage = $('.stage', work), ringEl = $('.ring3d', work), cards = $$('.c3', work), cp = $('.workcopy', work);
    let mx = 0, my = 0, pm = 0, pn = 0;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
    subs.push(() => {
      const r = work.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;                          // skip work when off-screen
      const p = reduce ? 1 : clamp(-r.top / (r.height - innerHeight));
      pm = lerp(pm, mx, 0.06); pn = lerp(pn, my, 0.06);                         // eased mouse parallax
      const drop = smooth(p / 0.18), spread = smooth((p - 0.18) / 0.32);
      const R = innerHeight * (0.22 + 0.22 * smooth((p - 0.42) / 0.58));
      const turn = (Math.PI / 2) * clamp((p - 0.2) / 0.8), tilt = lerp(26, 9, smooth(p));
      ringEl.style.transform = `translateY(${(1 - drop) * -30}vh) rotateX(${tilt - pn * 5}deg) rotateY(${pm * 7}deg)`;
      cards.forEach((c, i) => {
        const a = (i / cards.length) * Math.PI * 2 + turn;
        const px = Math.sin(i * 12.9) * 70, py = Math.cos(i * 7.3) * 50, pr = Math.sin(i * 5.1) * 12;   // messy pile
        const x = lerp(px, Math.sin(a) * R * 1.7, spread), y = lerp(py, 0, spread), z = lerp(i * 2, Math.cos(a) * R, spread);
        c.style.transform = `translate3d(${x}px,${y}px,${z}px) translate(-50%,-50%) rotate(${lerp(pr, 0, spread)}deg)`;
      });
      const o = smooth((p - 0.78) / 0.17);
      cp.style.opacity = o; cp.style.transform = `translateY(${(1 - o) * 20}px)`;
      stage.classList.toggle('live', p > 0.92);
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
