/* Static technical field for the hero. One canvas, drawn once; no animation loop. */
const canvas = document.getElementById('heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let frozen = false;

  function draw() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, w, h);

    // Deep ground with two controlled light fields. No page-length canvas.
    ctx.fillStyle = '#050914';
    ctx.fillRect(0, 0, w, h);

    let g = ctx.createRadialGradient(w * .23, h * .2, 10, w * .23, h * .2, w * .52);
    g.addColorStop(0, 'rgba(31, 128, 172, .24)');
    g.addColorStop(.46, 'rgba(17, 63, 112, .12)');
    g.addColorStop(1, 'rgba(5, 9, 20, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    g = ctx.createRadialGradient(w * .82, h * .18, 4, w * .82, h * .18, w * .42);
    g.addColorStop(0, 'rgba(64, 103, 255, .13)');
    g.addColorStop(1, 'rgba(5, 9, 20, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Faint metric grid, fading at the edges.
    ctx.save();
    ctx.strokeStyle = 'rgba(115, 171, 255, .055)';
    ctx.lineWidth = 1;
    const step = 64;
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();

    // Thin orbital traces around the copy axis.
    ctx.save();
    ctx.translate(w * .5, h * .45);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, w * (.18 + i * .075), h * (.07 + i * .035), -.16, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(98, 231, 255, ${.13 - i * .018})`;
      ctx.lineWidth = 1;
      ctx.setLineDash(i === 2 ? [2, 10] : []);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    // Circuit traces at the left/right edges.
    ctx.save();
    ctx.strokeStyle = 'rgba(98, 231, 255, .18)';
    ctx.lineWidth = 1;
    const traces = [
      [[-.02, .18], [.1, .18], [.16, .26], [.27, .26]],
      [[-.02, .38], [.12, .38], [.2, .32], [.3, .32]],
      [[.73, .68], [.82, .68], [.88, .75], [1.03, .75]],
      [[.7, .84], [.82, .84], [.9, .9], [1.03, .9]]
    ];
    for (const trace of traces) {
      ctx.beginPath();
      trace.forEach(([x, y], i) => {
        const px = x * w, py = y * h;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }
    ctx.restore();

    // Nodes, deliberately uneven rather than a decorative particle field.
    const nodes = [
      [.12, .18, 2.2], [.26, .26, 1.5], [.18, .38, 1.6], [.3, .32, 1.2],
      [.78, .68, 1.3], [.88, .75, 1.5], [.82, .84, 2], [.94, .9, 1.2],
      [.5, .1, 1.3], [.63, .15, 1.8], [.36, .74, 1.2], [.58, .81, 1.4]
    ];
    for (const [x, y, rad] of nodes) {
      ctx.beginPath();
      ctx.arc(x * w, y * h, rad + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(98, 231, 255, .045)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x * w, y * h, rad, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(196, 250, 255, .65)';
      ctx.fill();
    }

    // Hairline seam at the base of the first screen.
    const seam = ctx.createLinearGradient(w * .1, 0, w * .9, 0);
    seam.addColorStop(0, 'rgba(98, 231, 255, 0)');
    seam.addColorStop(.5, 'rgba(98, 231, 255, .34)');
    seam.addColorStop(1, 'rgba(98, 231, 255, 0)');
    ctx.fillStyle = seam;
    ctx.fillRect(w * .1, h - 1, w * .8, 1);
  }

  function scheduleDraw() {
    if (frozen) return;
    frozen = true;
    requestAnimationFrame(() => {
      draw();
      frozen = false;
    });
  }

  scheduleDraw();
  window.addEventListener('resize', scheduleDraw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleDraw);
}
