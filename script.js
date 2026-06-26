const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add('is-visible');
}), { threshold: .15 });
reveals.forEach(el => io.observe(el));

function networkCanvas(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  let points = [];
  const color = opts.color || '243,152,0';

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const ww = canvas.offsetWidth;
    const hh = canvas.offsetHeight;
    canvas.width = ww * ratio;
    canvas.height = hh * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = opts.count || Math.min(110, Math.floor(ww * hh / 15000));
    points = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * ww,
      y: Math.random() * hh,
      vx: (Math.random() - .5) * (opts.speed || .45),
      vy: (Math.random() - .5) * (opts.speed || .45),
      r: Math.random() * 1.8 + .6,
      base: i / count * Math.PI * 2
    }));
  }

  function draw(t) {
    const ww = canvas.offsetWidth;
    const hh = canvas.offsetHeight;
    ctx.clearRect(0, 0, ww, hh);
    points.forEach((p, i) => {
      p.x += p.vx + Math.cos(t / 1600 + p.base) * .08;
      p.y += p.vy + Math.sin(t / 1500 + p.base) * .08;
      if (p.x < 0 || p.x > ww) p.vx *= -1;
      if (p.y < 0 || p.y > hh) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${opts.dotAlpha || .32})`;
      ctx.fill();
      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        const max = opts.distance || 145;
        if (d < max) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${color},${(1 - d / max) * (opts.lineAlpha || .14)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}

const bgCanvas = document.getElementById('aiCanvas');
if (bgCanvas) networkCanvas(bgCanvas, { count: 90, speed: .32, distance: 145, dotAlpha: .28, lineAlpha: .12 });

const heroCanvas = document.getElementById('heroCanvas');
if (heroCanvas) networkCanvas(heroCanvas, { count: 135, speed: .55, distance: 170, dotAlpha: .46, lineAlpha: .24 });

window.addEventListener('load', () => {
  document.body.classList.add('loaded', 'is-loaded');
  reveals.forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight * .9) el.classList.add('is-visible');
  });
});

// Fallback: start the first-view animation even if the video is still loading.
setTimeout(() => {
  document.body.classList.add('loaded', 'is-loaded');
}, 900);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// 2026-06-26 update: add glass header and switch logo on scroll
(() => {
  const header = document.querySelector('.site-header');
  const logo = document.querySelector('.site-header .brand img');
  if (!header || !logo) return;

  const defaultLogo = logo.getAttribute('src');
  const colorLogo = 'assets/logo-color-scroll.png';

  const updateHeader = () => {
    const isScrolled = window.scrollY > 40;
    header.classList.toggle('is-scrolled', isScrolled);
    logo.setAttribute('src', isScrolled ? colorLogo : defaultLogo);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
})();
