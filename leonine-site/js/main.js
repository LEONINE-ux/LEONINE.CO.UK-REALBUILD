"use strict";
const $ = s => document.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const PROJECTS = (window.PROJECTS || []).filter(p => p && p.id).map(p => Object.assign({ photos: [] }, p));
const SHOWN = PROJECTS.filter(p => p.photos.length);
const pad = (n, l = 3) => String(n).padStart(l, "0");
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const exhibit = $("#exhibit"), cf = $("#cf"), cfn = $("#cfn"), cft = $("#cft");
let proj = null, frames = [], shots = [], litIO = null, midIO = null;

/* ---------- Build a project onto the page ---------- */
function photoOf(p, ph) {
  const o = typeof ph === "string" ? { f: ph } : ph;
  return { src: (p.folder || "") + o.f, w: o.w, h: o.h };
}
const numOf = p => pad(p.num != null ? p.num : PROJECTS.indexOf(p) + 1, 2);
function articleHTML(p) {
  const n = p.title || "";
  const metaBits = [p.state, p.ends ? "Ends " + p.ends : "", p.era ? "Era: " + p.era : p.year, p.place, p.photos.length ? pad(p.photos.length, 2) + " frames" : ""].filter(Boolean).map(esc).join("</span><span>");
  const head = `<header class="phead"><span class="plabel">Project</span>${p.title ? `<h2 class="ptitle">${esc(p.title)}</h2>` : ""}${p.tagline ? `<p class="ptag">${esc(p.tagline)}</p>` : ""}<div class="pmeta"><span>${metaBits}</span></div></header>`;
  const br = p.brief ? (() => {
    const row = (l, v) => v ? `<div class="brow"><dt>${esc(l)}</dt><dd>${esc(v)}</dd></div>` : "";
    const B = p.brief;
    return `<section class="brief"><dl>${row("Deadline", B.deadline)}${row("Progress", B.progress)}${row("Inspo", B.inspo)}</dl></section>`;
  })() : "";
  const inter = {}; (p.interludes || []).forEach(x => { inter[x.after] = x.text; });
  const body = p.photos.map((ph, i) => {
    const o = photoOf(p, ph), k = i + 1, side = k % 2 ? "l" : "r", nt = ph && ph.note ? ph.note : "";
    const dims = o.w && o.h ? ` width="${o.w}" height="${o.h}"` : "";
    return `<section class="frame ${side}${nt ? " has-note" : ""}" id="f${pad(k, 2)}" data-i="${k}"><figure><button class="ph" data-n="${pad(k, 2)}" aria-label="View frame ${k} larger"><img src="${esc(o.src)}"${dims} alt="Black and white 35mm film photograph, frame ${k}" loading="${k <= 2 ? "eager" : "lazy"}" decoding="async"></button><figcaption><span>No. ${pad(k, 2)}</span></figcaption></figure>${nt ? `<aside class="side">${ph.label ? `<span class="slabel">${esc(ph.label)}</span>` : ""}<p>${esc(nt)}</p></aside>` : ""}</section>${inter[k] ? `<section class="interlude"><p>${esc(inter[k])}</p></section>` : ""}`;
  }).join("");
  const note = p.note ? `<section class="pnote"><p>${esc(p.note)}</p></section>` : "";
  return `<article class="proj" aria-label="${esc(p.title || "Project " + n)}">${head}${br}${body}${note}</article>`;
}
function mount(p, scroll) {
  let shown = p, html = articleHTML(p);
  if (!p.photos.length) {
    const f = SHOWN.find(x => x.status !== "current") || SHOWN[0];
    if (f) { shown = f; html = articleHTML(f) + html; }
  }
  proj = shown;
  exhibit.innerHTML = html;
  frames = $$("#exhibit .frame"); shots = $$("#exhibit .ph");
  shots.forEach((b, i) => b.addEventListener("click", () => { showLB(i); lb.showModal(); }));
  cft.textContent = pad(frames.length);
  observe(); buildIndex(); markArchive();
  if (scroll) exhibit.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/* ---------- Lights come up, counter ---------- */
function observe() {
  if (litIO) litIO.disconnect(); if (midIO) midIO.disconnect();
  if (!("IntersectionObserver" in window)) { frames.forEach(f => f.classList.add("lit")); return; }
  litIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("lit"); litIO.unobserve(e.target); } }), { threshold: 0.15 });
  midIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) cfn.textContent = pad(e.target.dataset.i); }), { rootMargin: "-45% 0px -45% 0px" });
  frames.forEach(f => { litIO.observe(f); midIO.observe(f); });
}
function counterVisibility() {
  if (!frames.length) return;
  const a = frames[0].getBoundingClientRect().top, b = frames[frames.length - 1].getBoundingClientRect().bottom;
  cf.classList.toggle("on", a < innerHeight * 0.5 && b > innerHeight * 0.5);
}
(function () {
  const bar = $(".prog");
  const set = () => { const h = document.documentElement, m = h.scrollHeight - h.clientHeight; bar.style.setProperty("--p", m > 0 ? Math.min(1, h.scrollTop / m) : 0); counterVisibility(); };
  addEventListener("scroll", set, { passive: true }); addEventListener("resize", set); set();
})();

/* ---------- Archive ---------- */
function buildArchive() {
  if (SHOWN.length < 2) return;
  $("#archive").hidden = false; $("#navArchive").hidden = false;
  $("#arows").innerHTML = SHOWN.map(p => `<button class="arow" data-project="${esc(p.id)}"><span class="n">Project</span><span class="t">${esc(p.title || "Untitled")}</span><span class="y">${esc(p.year || "")}</span><span class="c">${pad(p.photos.length, 2)}</span></button>`).join("");
}
function markArchive() { $$(".arow").forEach(r => r.classList.toggle("on", proj && r.dataset.project === proj.id)); }
function openProject(id, scroll) {
  const p = PROJECTS.find(x => x.id === id); if (!p) return false;
  mount(p, scroll);
  try { history.replaceState(null, "", p.status === "current" ? location.pathname : "#p/" + p.id); } catch (_) {}
  return true;
}
$("#arows").addEventListener("click", e => { const r = e.target.closest("[data-project]"); if (r) openProject(r.dataset.project, true); });

/* ---------- Full-size viewer ---------- */
const lb = $("#lb"), view = $("#lbview"), counter = $("#lbcount");
let cur = 0;
function showLB(i) {
  cur = (i + shots.length) % shots.length;
  const src = shots[cur].querySelector("img");
  const img = new Image(); img.src = src.currentSrc || src.src; img.alt = src.alt;
  const fig = document.createElement("figure"); fig.appendChild(img); view.replaceChildren(fig);
  counter.textContent = pad(cur + 1) + " / " + pad(shots.length);
}
$("#lbx").onclick = () => lb.close();
$("#lbp").onclick = () => showLB(cur - 1);
$("#lbn").onclick = () => showLB(cur + 1);
lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
lb.addEventListener("close", () => { if (frames[cur]) frames[cur].scrollIntoView({ block: "center" }); });
lb.addEventListener("keydown", e => { if (e.key === "ArrowLeft") showLB(cur - 1); if (e.key === "ArrowRight") showLB(cur + 1); });
let sx = null;
view.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
view.addEventListener("touchend", e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) showLB(cur + (dx < 0 ? 1 : -1)); sx = null; });

/* ---------- Index ---------- */
const idx = $("#idx");
function buildIndex() {
  const links = [`<a href="#exhibit" data-go="exhibit">Photographs</a>`];
  if (SHOWN.length > 1) links.push(`<a href="#archive" data-go="archive">Archive</a>`);
  links.push(`<a href="#music" data-go="music">Music</a>`);
  if (!$("#about").hidden) links.push(`<a href="#about" data-go="about">About</a>`);
  links.push(`<a href="#contact" data-go="contact">Contact</a>`);
  $("#idxnav").innerHTML = links.join("");
  $("#idxgrid").innerHTML = proj.photos.map((ph, i) => { const o = photoOf(proj, ph); return `<button class="th" data-frame="${i + 1}" aria-label="Go to frame ${i + 1}"><img src="${esc(o.src)}" alt="" decoding="async"><span>${pad(i + 1, 2)}</span></button>`; }).join("");
}
$("#idxbtn").onclick = () => idx.showModal();
$("#idxx").onclick = () => idx.close();
idx.addEventListener("click", e => {
  if (e.target === idx) { idx.close(); return; }
  const go = e.target.closest("[data-go]"), fr = e.target.closest("[data-frame]");
  if (!go && !fr) return;
  e.preventDefault();
  const target = go ? document.getElementById(go.dataset.go) : document.getElementById("f" + pad(fr.dataset.frame, 2));
  idx.close();
  if (target) setTimeout(() => target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: fr ? "center" : "start" }), 60);
});

/* ---------- Keys: J / K or left / right arrows step between frames ---------- */
addEventListener("keydown", e => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable || document.querySelector("dialog[open]") || !frames.length) return;
  const next = e.key === "j" || e.key === "ArrowRight", prev = e.key === "k" || e.key === "ArrowLeft";
  if (!next && !prev) return;
  const mid = innerHeight / 2;
  let i = frames.findIndex(f => { const r = f.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
  if (i < 0) i = frames[0].getBoundingClientRect().top > mid ? -1 : frames.length - 1;
  const t = frames[Math.max(0, Math.min(frames.length - 1, i + (next ? 1 : -1)))];
  e.preventDefault(); t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
});

/* ---------- Contact form (Netlify Forms) ---------- */
const form = $("#enquiry");
form.addEventListener("submit", async e => {
  e.preventDefault();
  const out = form.querySelector("output"), btn = form.querySelector("button[type=submit]");
  btn.disabled = true; out.textContent = "Sending...";
  try {
    const r = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(form)).toString() });
    if (!r.ok) throw new Error(r.status);
    form.reset(); out.textContent = "Sent.";
  } catch (_) {
    out.innerHTML = 'Something went wrong. Email <a href="mailto:leornardo2007@gmail.com">leornardo2007@gmail.com</a> instead.';
  }
  btn.disabled = false;
});

/* ---------- Landing video wall (silent, behind the logo) ----------
   Add the paths of your clips below, e.g. ["video/wall-1.mp4", "video/wall-2.mp4"].
   They play one after another and loop. Leave the list empty to show plain concrete. */
const HERO_CLIPS = [];
(function () {
  const v = $(".intro .bgv");
  if (!v || !HERO_CLIPS.length || reduce) return;
  if (navigator.connection && navigator.connection.saveData) return;
  let i = 0;
  v.muted = true; v.loop = HERO_CLIPS.length === 1; v.src = HERO_CLIPS[0];
  v.addEventListener("canplay", () => v.closest(".intro").classList.add("has-video"), { once: true });
  v.addEventListener("ended", () => { i = (i + 1) % HERO_CLIPS.length; v.src = HERO_CLIPS[i]; v.play().catch(() => {}); });
  v.play().catch(() => {});
})();

/* ---------- Image protection (deterrent only) ---------- */
document.addEventListener("contextmenu", e => { if (e.target.closest(".frame, #lb, #idx")) e.preventDefault(); });
document.addEventListener("dragstart", e => { if (e.target.tagName === "IMG") e.preventDefault(); });

/* ---------- F4s easter egg: type "f4s", or tap the version number three times ---------- */
(function () {
  const egg = document.createElement("div");
  egg.className = "egg"; egg.setAttribute("aria-hidden", "true");
  egg.innerHTML = "<span>F4s™ superiority</span>";
  document.body.appendChild(egg);
  let t;
  const fire = () => { egg.classList.add("on"); clearTimeout(t); t = setTimeout(() => egg.classList.remove("on"), 2600); };
  let buf = "";
  addEventListener("keydown", e => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable || e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-3);
    if (buf === "f4s") { buf = ""; fire(); }
  });
  const ver = document.getElementById("ver");
  if (ver) { let n = 0, r; ver.addEventListener("click", () => { n++; clearTimeout(r); r = setTimeout(() => (n = 0), 1200); if (n >= 3) { n = 0; fire(); } }); }
})();

/* ---------- Start ---------- */
if (PROJECTS.length) {
  buildArchive();
  const m = location.hash.match(/^#p\/(.+)$/);
  const start = (m && PROJECTS.find(p => p.id === decodeURIComponent(m[1]))) || PROJECTS.find(p => p.status === "current") || PROJECTS[0];
  mount(start, !!m);
}

/* ---------- Safelight glow follows the cursor ---------- */
(function () {
  if (reduce || matchMedia("(hover: none)").matches) return;
  const root = document.documentElement; let raf = 0, x = 0, y = 0;
  addEventListener("pointermove", e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(() => { root.style.setProperty("--mx", x + "px"); root.style.setProperty("--my", y + "px"); raf = 0; }); }, { passive: true });
})();
/* ---------- Contact placeholder hints ---------- */
(function () {
  const H = { "A collaboration": "Tell me about the project.", "Press or a feature": "Where it is for, and what you need.", "A booking": "What it is, when and where.", "An event": "What the event is, when and where.", "Feedback": "What you noticed, and what would help.", "Just saying hi": "Say whatever you like." };
  const set = () => { const c = form.querySelector('input[name="topic"]:checked'); if (c) $("#rt").placeholder = H[c.value] || ""; };
  form.addEventListener("change", e => { if (e.target.name === "topic") set(); }); set();
})();
