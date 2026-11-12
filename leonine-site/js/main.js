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
  view.replaceChildren(img);
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
