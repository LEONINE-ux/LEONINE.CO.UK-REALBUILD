"use strict";
const $ = s => document.querySelector(s);

/* ---------- Photo viewer ---------- */
const lb = $("#lb"), view = $("#lbview"), counter = $("#lbcount");
const shots = [...document.querySelectorAll("#pgrid .ph")];
let cur = 0;
const pad = n => String(n).padStart(3, "0");
function show(i) {
  cur = (i + shots.length) % shots.length;
  const src = shots[cur].querySelector("img");
  const img = new Image(); img.src = src.currentSrc || src.src; img.alt = src.alt;
  const fig = document.createElement("figure"); fig.appendChild(img); view.replaceChildren(fig);
  counter.textContent = pad(cur + 1) + " / " + pad(shots.length);
}
shots.forEach((b, i) => b.addEventListener("click", () => { show(i); lb.showModal(); }));
$("#lbx").onclick = () => lb.close();
$("#lbp").onclick = () => show(cur - 1);
$("#lbn").onclick = () => show(cur + 1);
lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
lb.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") show(cur - 1);
  if (e.key === "ArrowRight") show(cur + 1);
});
let sx = null;
view.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
view.addEventListener("touchend", e => {
  if (sx === null) return;
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  sx = null;
});

/* ---------- Enquiry form ---------- */
const form = $("#enquiry");
const HINTS = {
  "A print": "Size, paper and finish, framed or unframed, and where it will hang. Tell me what you have in mind.",
  "Music or a CD": "What you would like: a CD, a digital copy, something custom. How many, and any details.",
  "A shoot or event": "What the event is, who it is for, how many people, and what you would like from me.",
  "Something else": "Tell me what you have in mind."
};
function updateType() {
  const v = form.querySelector('input[name="request_type"]:checked').value;
  form.querySelectorAll(".fld[data-for]").forEach(f => {
    const on = f.dataset.for === v;
    f.hidden = !on;
    f.querySelectorAll("input").forEach(i => { i.disabled = !on; });
  });
  $("#rt").placeholder = HINTS[v];
}
function setType(v) {
  const r = [...form.querySelectorAll('input[name="request_type"]')].find(i => i.value === v);
  if (r) { r.checked = true; updateType(); }
}
form.addEventListener("change", e => { if (e.target.name === "request_type") updateType(); });
updateType();

$("#lbenq").addEventListener("click", e => {
  e.preventDefault();
  lb.close(); setType("A print");
  $("#rf").value = "Frame " + (cur + 1) + " in the gallery";
  $("#book").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => $("#rt").focus({ preventScroll: true }), 700);
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  const out = form.querySelector("output"), btn = form.querySelector("button[type=submit]");
  btn.disabled = true; out.textContent = "Sending...";
  try {
    const r = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString(),
    });
    if (!r.ok) throw new Error(r.status);
    form.reset(); updateType();
    out.textContent = "Thank you. I\u2019ll reply by email shortly.";
  } catch (_) {
    out.innerHTML = 'Something went wrong. Please email <a href="mailto:leornardo2007@gmail.com">leornardo2007@gmail.com</a> instead.';
  }
  btn.disabled = false;
});

/* ---------- Movies section ----------
   Add the path of your clip (or one stitched file) below, e.g. ["video/film.mp4"] */
const CLIPS = [];
(function () {
  const v = $("#cine");
  if (!v || !CLIPS.length) return;
  let i = 0;
  $("#cineEmpty").hidden = true; $("#cineCtl").hidden = false;
  v.src = CLIPS[0]; v.loop = CLIPS.length === 1;
  v.addEventListener("ended", () => { i = (i + 1) % CLIPS.length; v.src = CLIPS[i]; v.play().catch(() => {}); });
  const pb = $("#cinePlay"), sb = $("#cineSnd");
  pb.onclick = () => (v.paused ? v.play() : v.pause());
  v.addEventListener("play", () => (pb.textContent = "Pause"));
  v.addEventListener("pause", () => (pb.textContent = "Play"));
  sb.onclick = () => { v.muted = !v.muted; sb.textContent = v.muted ? "Sound on" : "Sound off"; };
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? v.play().catch(() => {}) : v.pause())), { threshold: 0.4 }).observe(v);
  } else { pb.textContent = "Play"; }
})();

/* ---------- Landing background clips (silent) ----------
   Add paths such as ["video/hero-1.mp4"]. Several clips play one after another. */
const HERO_CLIPS = [];
(function () {
  const v = document.querySelector(".hero .bgv");
  if (!v || !HERO_CLIPS.length) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (navigator.connection && navigator.connection.saveData) return;
  let i = 0;
  v.muted = true; v.loop = HERO_CLIPS.length === 1; v.src = HERO_CLIPS[0];
  v.addEventListener("canplay", () => v.closest(".hero").classList.add("has-video"), { once: true });
  v.addEventListener("ended", () => { i = (i + 1) % HERO_CLIPS.length; v.src = HERO_CLIPS[i]; v.play().catch(() => {}); });
  v.play().catch(() => {});
})();

/* ---------- Image protection (deterrent only) ---------- */
document.addEventListener("contextmenu", e => { if (e.target.closest("#pgrid, #lb, .banner")) e.preventDefault(); });
document.addEventListener("dragstart", e => { if (e.target.tagName === "IMG") e.preventDefault(); });

/* ---------- Gentle reveals and scroll progress ---------- */
(function () {
  const els = document.querySelectorAll(".pm, section h2, .about-body p, .lead, .enq .sub, form.c .fld, form.c .types, form.c .btn, .screen, .cap2, .soon, .note");
  els.forEach(e => e.classList.add("rv"));
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(es => {
    es.forEach((e, k) => {
      if (!e.isIntersecting) return;
      e.target.style.transitionDelay = (k % 3) * 110 + "ms";
      e.target.classList.add("in"); io.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  els.forEach(e => io.observe(e));
})();
(function () {
  const top = document.querySelector(".top");
  if (!top) return;
  const set = () => {
    const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    top.style.setProperty("--p", max > 0 ? Math.min(1, h.scrollTop / max) : 0);
  };
  addEventListener("scroll", set, { passive: true }); addEventListener("resize", set); set();
})();

/* ---------- Contact sheet toggle ---------- */
(function () {
  const grid = $("#pgrid"), g = $("#vtG"), s = $("#vtS");
  if (!grid || !g || !s) return;
  shots.forEach((b, i) => b.setAttribute("data-n", String(i + 1).padStart(2, "0")));
  const set = sheet => {
    grid.classList.toggle("sheet", sheet);
    g.setAttribute("aria-pressed", String(!sheet)); s.setAttribute("aria-pressed", String(sheet));
  };
  g.onclick = () => set(false); s.onclick = () => set(true);
})();

/* ---------- F4s easter egg: type "f4s", or tap the version number three times ---------- */
(function () {
  const egg = document.createElement("div");
  egg.className = "egg"; egg.setAttribute("aria-hidden", "true");
  egg.innerHTML = "<span>F4s\u2122 superiority</span>";
  document.body.appendChild(egg);
  let t;
  const fire = () => { egg.classList.add("on"); clearTimeout(t); t = setTimeout(() => egg.classList.remove("on"), 2600); };
  let buf = "";
  addEventListener("keydown", e => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-3);
    if (buf === "f4s") { buf = ""; fire(); }
  });
  const ver = document.getElementById("ver");
  if (ver) { let n = 0, r; ver.style.cursor = "default"; ver.addEventListener("click", () => { n++; clearTimeout(r); r = setTimeout(() => (n = 0), 1200); if (n >= 3) { n = 0; fire(); } }); }
})();
