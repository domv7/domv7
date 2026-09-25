(() => {
  const head = document.querySelector('.ascii-art');
  const portrait = document.querySelector('.ascii-panel');
  const frames = window.NEUROMANCER_FRAMES;
  if (!head || !portrait || !frames || frames.length !== 17) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(any-pointer: fine)');
  let point = null;
  let queued = false;
  let current = 0;
  const draw = (pose) => {
    if (pose === current) return;
    current = pose;
    head.textContent = frames[pose];
    head.dataset.pose = pose ? String((pose - 1) * 22.5) : 'neutral';
  };
  const update = () => {
    queued = false;
    if (!point || reduced.matches || !fine.matches) { draw(0); return; }
    const r = portrait.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const dx = point.x - (r.left + r.width / 2);
    const dy = point.y - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < 35) { draw(0); return; }
    // Atlas directions start at up and advance clockwise in 22.5° steps.
    const angle = (Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2);
    draw(1 + Math.round(angle / (Math.PI / 8)) % 16);
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  document.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    point = { x: event.clientX, y: event.clientY };
    schedule();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { point = null; schedule(); });
  window.addEventListener('blur', () => { point = null; schedule(); });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', schedule);
  fine.addEventListener('change', schedule);
})();
