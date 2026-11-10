"use strict";
const $ = s => document.querySelector(s);

/* ---------- Photo viewer ---------- */
const lb = $("#lb"), view = $("#lbview"), shots = [...document.querySelectorAll("#pgrid .ph")];
let cur = 0;
function show(i) {
  cur = (i + shots.length) % shots.length;
  const src = shots[cur].querySelector("img");
  const img = new Image(); img.src = src.currentSrc || src.src; img.alt = src.alt;
  view.replaceChildren(img);
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

/* ---------- Film section ----------
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

/* ---------- Booking form (Netlify Forms) ---------- */
const form = $("#book");
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
    form.reset(); out.textContent = "Thanks, got it. I\u2019ll get back to you soon.";
  } catch (_) {
    out.innerHTML = 'Something went wrong. Please email <a href="mailto:leornardo2007@gmail.com">leornardo2007@gmail.com</a> instead.';
  }
  btn.disabled = false;
});
