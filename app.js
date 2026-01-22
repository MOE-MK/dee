const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    const isHidden = mobileMenu.hasAttribute("hidden");
    if (isHidden) mobileMenu.removeAttribute("hidden");
    else mobileMenu.setAttribute("hidden", "");
  });

  mobileMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => mobileMenu.setAttribute("hidden", ""));
  });
}

document.getElementById("year").textContent = new Date().getFullYear();


/* =========================
   Lightbox (click-to-zoom)
   ========================= */
function initLightbox(){
  const lightbox = document.getElementById("lightbox");
  const imgEl = document.getElementById("lightboxImg");
  const capEl = document.getElementById("lightboxCaption");

  if (!lightbox || !imgEl) return;

  function open(src, alt, caption){
    imgEl.src = src;
    imgEl.alt = alt || "Screenshot";
    capEl.textContent = caption || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function close(){
    lightbox.hidden = true;
    imgEl.src = "";
    document.body.style.overflow = "";
  }

  // click any gallery screenshot
  document.querySelectorAll(".gallery .shot img").forEach((img) => {
    img.addEventListener("click", (e) => {
      const figure = img.closest("figure");
      const caption = figure ? (figure.querySelector(".cap-title")?.textContent + " — " + figure.querySelector(".cap-sub")?.textContent).trim() : "";
      open(img.getAttribute("src"), img.getAttribute("alt"), caption);
    });
  });

  // close: backdrop, button, ESC
  lightbox.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute("data-close") === "1") close();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.hidden && e.key === "Escape") close();
  });
}
initLightbox();

/* =========================
   Over-engineered background:
   canvas particles + mouse parallax
   ========================= */
(function initBgCanvas(){
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let mx = 0, my = 0; // mouse normalized [-0.5..0.5]
  let running = true;

  const prefersReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduce) return; // keep things calm

  function resize(){
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  window.addEventListener("mousemove", (e) => {
    mx = (e.clientX / w) - 0.5;
    my = (e.clientY / h) - 0.5;
  }, { passive: true });

  // particles (slow, glassy)
  const count = Math.round(Math.min(120, Math.max(60, (w*h) / 18000)));
  const parts = Array.from({length: count}).map(() => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.8 + Math.random() * 2.2,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    hue: 210 + Math.random() * 90, // blue -> violet
    a: 0.08 + Math.random() * 0.12
  }));

  function step(){
    if (!running) return;

    ctx.clearRect(0, 0, w, h);

    // gentle gradient wash
    const g = ctx.createRadialGradient(w*0.65, h*0.1, 40, w*0.5, h*0.2, Math.max(w,h));
    g.addColorStop(0, "rgba(140,190,255,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // particles
    for (const p of parts){
      p.x += p.vx;
      p.y += p.vy;

      // wrap
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      const px = p.x + mx * 14; // parallax
      const py = p.y + my * 10;

      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.a})`;
      ctx.fill();
    }

    // soft connecting lines (only nearby)
    for (let i=0; i<parts.length; i++){
      const a = parts[i];
      for (let j=i+1; j<parts.length; j++){
        const b = parts[j];
        const dx = (a.x - b.x);
        const dy = (a.y - b.y);
        const dist = Math.hypot(dx, dy);
        if (dist < 120){
          const alpha = (1 - dist/120) * 0.06;
          ctx.strokeStyle = `rgba(190, 210, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x + mx*14, a.y + my*10);
          ctx.lineTo(b.x + mx*14, b.y + my*10);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  // pause if tab hidden
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(step);
  });

  requestAnimationFrame(step);
})();
