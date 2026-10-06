/* Adinan's engagement: shared behaviour for every page.
   Decorations (leaves, gold leaf), scroll reveal, parallax, scroll-drawn lines,
   nav, countdown, and the page-specific scenes on The Evening and Venue pages. */

/* Put the hosts' WhatsApp number here (country code, digits only, e.g. "919876543210")
   so RSVP replies open a chat with them directly. Left empty, WhatsApp asks whom to send to. */
const HOST_WHATSAPP = "919447125325";

const EVENT_START = Date.parse("2026-12-30T17:00:00+05:30");
const EVENT_END = Date.parse("2026-12-30T22:00:00+05:30");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- seeded random so the art is identical on every load ---------- */
function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

/* ---------- watercolour leaf sprays ---------- */
const NS = "http://www.w3.org/2000/svg";
const GREENS = ["#8fa58a", "#a7b9a0", "#6f8a6c", "#b8c7b0", "#7e9878"];
function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent.appendChild(e);
  return e;
}
function quad(p0, p1, p2, t) {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
}
function leaf(g, x, y, ang, s, color, op) {
  const grp = el("g", { transform: `translate(${x} ${y}) rotate(${ang})` }, g);
  el("path", { d: `M0 0 Q ${s * .45} ${-s * .36} ${s} 0 Q ${s * .45} ${s * .36} 0 0Z`, fill: color, "fill-opacity": op }, grp);
  el("path", { d: `M${s * .08} 0 L${s * .9} 0`, stroke: "#4f6a52", "stroke-opacity": .25, "stroke-width": .6, fill: "none" }, grp);
}
function spray(svg, p0, p1, p2, count, size, rand, goldStem) {
  const g = el("g", {}, svg);
  el("path", {
    d: `M${p0} Q${p1} ${p2}`, fill: "none",
    stroke: goldStem ? "#c79a4b" : "#6f8a6c", "stroke-width": goldStem ? 1.6 : 1.1,
    "stroke-opacity": goldStem ? .85 : .6, "stroke-linecap": "round",
  }, g);
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1), a = quad(p0, p1, p2, t), b = quad(p0, p1, p2, Math.min(1, t + .01));
    const tan = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    const side = i % 2 ? 1 : -1;
    const s = size * (0.75 + rand() * 0.5) * (1 - t * .35);
    leaf(g, a[0], a[1], tan + side * (38 + rand() * 18), s, GREENS[Math.floor(rand() * GREENS.length)], .55 + rand() * .35);
  }
  if (count) {
    const tip = quad(p0, p1, p2, 1), pre = quad(p0, p1, p2, .97);
    leaf(g, tip[0], tip[1], Math.atan2(tip[1] - pre[1], tip[0] - pre[0]) * 180 / Math.PI, size * .8, GREENS[2], .75);
  }
}
function drawLeaves(svg, seed) {
  const r = rng(seed);
  spray(svg, [0, 30], [90, 40], [190, 10], 9, 34, r);
  spray(svg, [0, 60], [80, 120], [130, 210], 10, 38, r);
  spray(svg, [10, 0], [40, 110], [20, 280], 11, 36, r);
  spray(svg, [0, 90], [120, 90], [250, 60], 0, 0, r, true);
  spray(svg, [0, 140], [70, 170], [70, 250], 6, 28, r);
}

/* ---------- gold-leaf brush strokes with glitter ---------- */
const GOLDS = ["#b88a3e", "#d4ac63", "#e2c07a", "#9a6f2a", "#f1d9a0", "#c79a4b"];
function goldStroke(ctx, r, ax, ay, bx, by, width, n) {
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  const grad = ctx.createLinearGradient(ax, ay, bx, by);
  grad.addColorStop(0, "rgba(184,138,62,0)"); grad.addColorStop(.2, "rgba(199,154,75,.35)");
  grad.addColorStop(.75, "rgba(212,172,99,.4)"); grad.addColorStop(1, "rgba(184,138,62,0)");
  ctx.strokeStyle = grad; ctx.lineCap = "round"; ctx.lineWidth = width * .8;
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  for (let i = 0; i < n; i++) {
    const t = r(), taper = Math.sin(Math.PI * Math.min(1, t * 1.1));
    const off = ((r() + r() + r()) / 3 - .5) * width * taper * 1.3;
    ctx.globalAlpha = .35 + r() * .65;
    ctx.fillStyle = GOLDS[Math.floor(r() * GOLDS.length)];
    const s = .4 + r() * 1.5;
    ctx.fillRect(ax + dx * t + nx * off, ay + dy * t + ny * off, s, s);
  }
  for (let i = 0; i < 26; i++) {
    const t = r(), off = (r() - .5) * width * 3.2;
    ctx.globalAlpha = .4 + r() * .5; ctx.fillStyle = GOLDS[Math.floor(r() * 3)];
    ctx.beginPath(); ctx.arc(ax + dx * t + nx * off, ay + dy * t + ny * off, .6 + r() * 2.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function paintGold(cv) {
  const ctx = cv.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2), rect = cv.getBoundingClientRect();
  const W = rect.width, H = rect.height;
  if (!W || !H) return;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
  const r = rng(+cv.dataset.seed || 7), k = Math.min(1.4, Math.max(.6, W / 800));
  goldStroke(ctx, r, W * .74, -10, W * 1.02, H * .2, 80 * k, 5200 * k);
  goldStroke(ctx, r, -10, H * .76, W * .24, H * 1.02, 70 * k, 4400 * k);
}

/* ---------- nav ---------- */
function initNav() {
  const nav = $(".nav");
  if (!nav) return;
  const toggle = $(".nav__toggle", nav);
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$(".nav__links a", nav).forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }));
}

/* ---------- reveal on scroll ---------- */
function initReveal() {
  const items = $$("[data-reveal]");
  if (!("IntersectionObserver" in window) || reduceMotion) { items.forEach(i => i.classList.add("is-in")); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: .12 });
  items.forEach(i => io.observe(i));
}

/* ---------- scroll-linked effects (one rAF loop) ---------- */
const scrollHooks = [];
function onScroll(fn) { scrollHooks.push(fn); }
function progressOf(elm) {
  // 0 when the element's top enters the bottom of the viewport, 1 when its bottom leaves the top
  const r = elm.getBoundingClientRect(), vh = innerHeight;
  return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
}
function initScrollLoop() {
  const bar = $(".progress"), nav = $(".nav");
  const parallax = $$("[data-parallax]");
  const draws = $$("[data-draw]").map(p => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
    return { p, len, host: p.closest("[data-draw-host]") || p.ownerSVGElement };
  });
  let ticking = false;
  function frame() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar?.style.setProperty("--p", max > 0 ? scrollY / max : 0);
    nav?.classList.toggle("is-solid", scrollY > 40);
    if (!reduceMotion) {
      parallax.forEach(n => {
        const speed = parseFloat(n.dataset.parallax) || .2;
        const axis = n.dataset.axis || "y";
        const v = scrollY * speed;
        n.style.transform = axis === "x" ? `translate3d(${v}px,0,0)` : axis === "xy" ? `translate3d(${-v}px,${-v * .6}px,0) rotate(${-v * .04}deg)` : `translate3d(0,${v}px,0)`;
      });
    }
    draws.forEach(({ p, len, host }) => {
      const t = reduceMotion ? 1 : Math.min(1, progressOf(host) * 1.6);
      p.style.strokeDashoffset = len * (1 - t);
    });
    scrollHooks.forEach(fn => fn());
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", req);
  frame();
}

/* ---------- countdown ---------- */
function initCountdown() {
  const box = $("[data-countdown]");
  if (!box) return;
  const done = $("[data-countdown-done]");
  const pad = n => String(n).padStart(2, "0");
  const set = (k, v) => { const n = $(`[data-cd="${k}"]`, box); if (n) n.textContent = v; };
  (function tick() {
    const now = Date.now(), ms = EVENT_START - now;
    if (ms <= 0) {
      box.hidden = true;
      if (done) { done.hidden = false; done.textContent = now < EVENT_END ? "The celebration is happening today." : "Thank you for celebrating with us."; }
      return;
    }
    const s = Math.floor(ms / 1000);
    set("d", Math.floor(s / 86400)); set("h", pad(Math.floor(s / 3600) % 24));
    set("m", pad(Math.floor(s / 60) % 60)); set("s", pad(s % 60));
    setTimeout(tick, 1000 - (now % 1000));
  })();
}

/* ---------- The Evening: clock hands + sunset as you scroll ---------- */
function initEvening() {
  const scene = $("[data-evening]");
  if (!scene) return;
  const hourHand = $(".hand--h", scene), minHand = $(".hand--m", scene);
  const clock = $(".clock", scene), horizon = $(".horizon", scene);
  onScroll(() => {
    // clock sweeps from 12:00 to 5:00 as it crosses the screen
    if (clock) {
      const t = reduceMotion ? 1 : Math.min(1, progressOf(clock) * 1.8);
      const minutes = t * 300; // 0..5 hours
      hourHand.style.transform = `rotate(${minutes * .5}deg)`;
      minHand.style.transform = `rotate(${minutes * 6}deg)`;
    }
    if (horizon) {
      const t = reduceMotion ? .6 : progressOf(horizon);
      horizon.style.setProperty("--sun-y", `${20 + t * 150}px`);
    }
    const max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty("--dusk", max > 0 ? Math.min(.85, scrollY / max) : 0);
  });
}

/* ---------- copy buttons ---------- */
function initCopy() {
  $$("[data-copy], [data-copy-text]").forEach(btn => btn.addEventListener("click", async () => {
    const src = btn.dataset.copy ? $(btn.dataset.copy) : null;
    const text = src ? src.textContent.trim() : btn.dataset.copyText;
    const label = btn.querySelector("span") || btn;
    const was = label.textContent;
    try { await navigator.clipboard.writeText(text); label.textContent = "Copied"; }
    catch {
      if (!src) { label.textContent = "Copy not available"; setTimeout(() => (label.textContent = was), 2000); return; }
      const r = document.createRange(); r.selectNodeContents(src); getSelection().removeAllRanges(); getSelection().addRange(r); label.textContent = "Selected, press copy"; }
    setTimeout(() => (label.textContent = was), 2000);
  }));
}

/* ---------- RSVP ---------- */
function initRsvp() {
  const form = $("#rsvp-form");
  if (!form) return;
  const out = $("#guests-out"), guests = $("#guests");
  const step = d => { const v = Math.min(10, Math.max(1, +guests.value + d)); guests.value = v; out.textContent = v; };
  $("#guests-minus").addEventListener("click", () => step(-1));
  $("#guests-plus").addEventListener("click", () => step(1));
  $$('input[name="attending"]').forEach(r => r.addEventListener("change", () => {
    $("#guests-field").hidden = $('input[name="attending"]:checked').value !== "yes";
  }));

  form.addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#rsvp-error");
    const name = $("#name").value.trim();
    const att = $('input[name="attending"]:checked');
    if (!name || !att) {
      err.hidden = false;
      err.textContent = !name ? "Please add your name so the family knows who is replying." : "Please choose whether you can attend.";
      (!name ? $("#name") : $('input[name="attending"]')).focus();
      return;
    }
    err.hidden = true;
    const note = $("#note").value.trim();
    const lines = [
      "Hello,",
      "",
      att.value === "yes"
        ? `${name} will attend the engagement of Adinan & Fathima Nazneen on 30 December 2026 at 5:00 PM, CIAL Golf Course${+guests.value > 1 ? ` (${guests.value} people)` : ""}.`
        : `${name} is sorry to miss the engagement of Adinan & Fathima Nazneen on 30 December 2026, and sends warm wishes.`,
    ];
    if (note) lines.push("", note);
    const msg = lines.join("\n");
    $("#rsvp-message").textContent = msg;
    $("#rsvp-wa").href = `https://wa.me/${HOST_WHATSAPP}?text=${encodeURIComponent(msg)}`;
    form.hidden = true;
    const res = $("#rsvp-result");
    res.hidden = false;
    requestAnimationFrame(() => res.classList.add("is-in"));
    res.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  });
  $("#rsvp-edit").addEventListener("click", () => { $("#rsvp-result").hidden = true; form.hidden = false; $("#name").focus(); });
}


/* ---------- pastel flowers (blooming clusters) ---------- */
const PASTELS = [
  { petal: "#f4c9c5", edge: "#e7a9a6", heart: "#e2b65c" }, // blush
  { petal: "#f7d9c2", edge: "#ebb894", heart: "#c99a4a" }, // peach
  { petal: "#dccfec", edge: "#bfaedb", heart: "#e6c36f" }, // lavender
  { petal: "#f6ecd2", edge: "#e2cf9f", heart: "#b88a3e" }, // cream
  { petal: "#efc6d3", edge: "#dca1b5", heart: "#e2b65c" }, // rose
];
function flower(parent, x, y, r, rand, delay) {
  const c = PASTELS[Math.floor(rand() * PASTELS.length)];
  const n = 5 + Math.floor(rand() * 3);
  const spin = rand() * 360;
  const g = el("g", { class: "bloom", style: `--d:${delay.toFixed(2)}s`, transform: `translate(${x} ${y})` }, parent);
  const inner = el("g", { class: "bloom__inner" }, g);
  for (let layer = 0; layer < 2; layer++) {
    const lr = layer ? r * .62 : r;
    for (let i = 0; i < n; i++) {
      const a = spin + i * 360 / n + layer * (180 / n);
      el("path", {
        d: `M0 0 C ${lr * .55} ${-lr * .45}, ${lr * 1.05} ${-lr * .3}, ${lr} 0 C ${lr * 1.05} ${lr * .3}, ${lr * .55} ${lr * .45}, 0 0Z`,
        fill: layer ? c.edge : c.petal, "fill-opacity": layer ? .55 : .92,
        stroke: c.edge, "stroke-opacity": .5, "stroke-width": .6,
        transform: `rotate(${a})`,
      }, inner);
    }
  }
  el("circle", { r: r * .22, fill: c.heart, "fill-opacity": .9 }, inner);
  for (let i = 0; i < 6; i++) {
    const a = rand() * Math.PI * 2, d = r * (.08 + rand() * .14);
    el("circle", { cx: Math.cos(a) * d, cy: Math.sin(a) * d, r: .8 + rand() * .6, fill: "#fff6e0", "fill-opacity": .9 }, inner);
  }
}
function bud(parent, x, y, r, rand, delay) {
  const c = PASTELS[Math.floor(rand() * PASTELS.length)];
  const g = el("g", { class: "bloom", style: `--d:${delay.toFixed(2)}s`, transform: `translate(${x} ${y}) rotate(${rand() * 60 - 30})` }, parent);
  const inner = el("g", { class: "bloom__inner" }, g);
  el("path", { d: `M0 ${r} C ${-r} ${r * .2}, ${-r * .5} ${-r}, 0 ${-r} C ${r * .5} ${-r}, ${r} ${r * .2}, 0 ${r}Z`, fill: c.petal, stroke: c.edge, "stroke-width": .6 }, inner);
  el("path", { d: `M0 ${r} C ${-r * .6} ${r * .8}, ${-r * .7} ${r * .2}, ${-r * .2} 0 M0 ${r} C ${r * .6} ${r * .8}, ${r * .7} ${r * .2}, ${r * .2} 0`, fill: "none", stroke: "#6f8a6c", "stroke-width": 1.1, "stroke-opacity": .7 }, inner);
}
function drawCluster(svg, seed) {
  const r = rng(seed);
  // a sprig of leaves behind the flowers
  spray(svg, [20, 170], [90, 130], [190, 150], 7, 26, r);
  spray(svg, [40, 60], [80, 110], [70, 190], 5, 22, r);
  flower(svg, 98, 118, 44, r, .1);
  flower(svg, 162, 82, 31, r, .3);
  flower(svg, 50, 74, 26, r, .45);
  bud(svg, 180, 146, 13, r, .6);
  bud(svg, 120, 46, 11, r, .7);
  bud(svg, 34, 146, 12, r, .8);
}

/* ---------- drifting petals & leaves (ambient) ---------- */
const drift = { add() {} };
function initDrift() {
  if (reduceMotion) return;
  const cv = document.createElement("canvas");
  cv.className = "drift"; cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  const r = Math.random;
  const leafCols = ["#8fa58a", "#a7b9a0", "#7e9878", "#b8c7b0"];
  let W = 0, H = 0, dpr = 1, items = [], gust = 0, lastY = scrollY, running = true;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function make(x, y, vx, vy, burst) {
    const leaf = !burst && r() < .4;
    const c = leaf ? null : PASTELS[Math.floor(r() * PASTELS.length)];
    return {
      x: x ?? r() * W, y: y ?? -20 - r() * H * .5,
      vx: vx ?? (r() - .5) * .3, vy: vy ?? .35 + r() * .55,
      size: leaf ? 7 + r() * 7 : 5 + r() * 6,
      rot: r() * Math.PI * 2, vr: (r() - .5) * .03,
      sway: r() * Math.PI * 2, swaySpeed: .01 + r() * .015, flip: r() * Math.PI * 2,
      leaf, color: leaf ? leafCols[Math.floor(r() * leafCols.length)] : c.petal, edge: leaf ? "#4f6a52" : c.edge,
      life: burst ? 1 : -1,
    };
  }
  const target = () => (W < 600 ? 12 : 22);
  function drawOne(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, Math.abs(Math.cos(p.flip)) * .7 + .3); // tumbling
    ctx.globalAlpha = p.life > 0 ? Math.min(1, p.life) * .95 : .85;
    const s = p.size;
    ctx.beginPath();
    if (p.leaf) {
      ctx.moveTo(-s, 0); ctx.quadraticCurveTo(0, -s * .55, s, 0); ctx.quadraticCurveTo(0, s * .55, -s, 0);
    } else {
      ctx.moveTo(0, -s); ctx.bezierCurveTo(s * .9, -s * .8, s * .8, s * .6, 0, s); ctx.bezierCurveTo(-s * .8, s * .6, -s * .9, -s * .8, 0, -s);
    }
    ctx.fillStyle = p.color; ctx.fill();
    ctx.strokeStyle = p.edge; ctx.globalAlpha *= .35; ctx.lineWidth = .6;
    if (p.leaf) { ctx.moveTo(-s * .8, 0); ctx.lineTo(s * .8, 0); }
    ctx.stroke();
    ctx.restore();
  }
  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    const dy = scrollY - lastY; lastY = scrollY;
    gust += (Math.max(-30, Math.min(30, dy)) * .04 - gust) * .08;
    while (items.filter(p => p.life < 0).length < target()) items.push(make());
    for (const p of items) {
      p.sway += p.swaySpeed; p.flip += .02 + p.swaySpeed;
      p.x += p.vx + Math.sin(p.sway) * .6 + gust * .3;
      p.y += p.vy - gust;
      p.rot += p.vr;
      if (p.life > 0) { p.vy += .02; p.vx *= .985; p.life -= .006; }
      drawOne(p);
    }
    items = items.filter(p => p.y < H + 30 && p.y > -H && p.x > -60 && p.x < W + 60 && (p.life < 0 || p.life > 0));
    requestAnimationFrame(tick);
  }
  size();
  for (let i = 0; i < target(); i++) items.push(make(undefined, r() * H));
  addEventListener("resize", size);
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(tick);
  });
  drift.add = (x, y, count = 36) => {
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (r() - .5) * Math.PI * 1.3, sp = 2 + r() * 4.5;
      items.push(make(x, y, Math.cos(a) * sp, Math.sin(a) * sp, true));
    }
  };
  requestAnimationFrame(tick);
}

/* ---------- envelope intro (home page, once per visit) ---------- */
function initIntro(done) {
  const intro = $("#intro");
  let seen = false;
  try { seen = sessionStorage.getItem("envelopeOpened") === "1"; } catch {}
  if (!intro || seen || reduceMotion) { intro?.remove(); done(); return; }
  const root = document.documentElement;
  root.classList.add("intro-active");
  let opened = false;
  function finish() {
    intro.classList.add("is-done");
    root.classList.remove("intro-active");
    try { sessionStorage.setItem("envelopeOpened", "1"); } catch {}
    done();
    setTimeout(() => intro.remove(), 900);
  }
  function open(fast) {
    if (opened) return;
    opened = true;
    clearTimeout(auto);
    if (fast) return finish();
    intro.classList.add("is-opening");
    const env = $(".env", intro).getBoundingClientRect();
    setTimeout(() => drift.add(env.left + env.width / 2, env.top + env.height * .35, 46), 900);
    setTimeout(finish, 2300);
  }
  $("#intro-open").addEventListener("click", () => open(false));
  $("#intro-skip").addEventListener("click", () => open(true));
  addEventListener("keydown", e => { if (e.key === "Escape") open(true); }, { once: true });
  // opens by itself if nobody taps, so the invitation is never stuck behind the envelope
  const auto = setTimeout(() => open(false), 2600);
}

/* ---------- boot ---------- */
document.documentElement.classList.add("js");
document.addEventListener("DOMContentLoaded", () => {
  $$("svg[data-leaves]").forEach(s => drawLeaves(s, +s.dataset.leaves));
  $$("svg[data-flowers]").forEach(s => drawCluster(s, +s.dataset.flowers));
  initDrift();
  const golds = $$("canvas.gold");
  const paintAll = () => golds.forEach(paintGold);
  paintAll();
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(paintAll, 150); });
  document.fonts?.ready.then(paintAll);

  initNav();
  initIntro(initReveal);
  initEvening();
  initScrollLoop();
  initCountdown();
  initCopy();
  initRsvp();
});
