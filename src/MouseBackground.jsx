import { useEffect, useRef } from 'react';

// ─── Fluid / Water Config ───────────────────────────────────────────────────
const COLS = 80;           // grid columns for velocity field
const ROWS = 50;           // grid rows  for velocity field
const RIPPLE_COUNT = 6;    // max concurrent ripple rings
const BLOB_COUNT = 5;      // floating metaball blobs
const DAMPING = 0.97;      // ripple energy damping
const SPREAD = 0.22;       // wave spread speed

// Dark-navy + indigo/violet water palette
const DEEP_COLOR   = [8,   10,  30];   // very deep water
const MID_COLOR    = [18,  22,  60];   // mid depth
const SURF_COLOR   = [40,  55, 130];   // surface highlight
const FOAM_COLOR   = [99, 130, 255];   // bright foam / crest
const CAUSTIC_HUE  = [120, 160, 255];  // caustic light scatter

// ─── Helpers ────────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function lerpColor(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function MouseBackground() {
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    // ── resize ────────────────────────────────────────────────────────────
    let W = 0, H = 0;
    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initGrid();
    }

    // ── wave grid (simple 2-buffer shallow water) ──────────────────────────
    let cur, prv;
    function initGrid() {
      const n = COLS * ROWS;
      cur = new Float32Array(n);
      prv = new Float32Array(n);
    }

    function idx(c, r) {
      c = ((c % COLS) + COLS) % COLS;
      r = clamp(r, 0, ROWS - 1);
      return r * COLS + c;
    }

    function disturb(xn, yn, strength) {
      // xn, yn in [0,1]
      const c = Math.round(xn * (COLS - 1));
      const r = Math.round(yn * (ROWS - 1));
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dist = Math.sqrt(dr * dr + dc * dc);
          if (dist <= 2) {
            cur[idx(c + dc, r + dr)] += strength * (1 - dist / 2.5);
          }
        }
      }
    }

    function stepWave() {
      const next = new Float32Array(COLS * ROWS);
      for (let r = 1; r < ROWS - 1; r++) {
        for (let c = 1; c < COLS - 1; c++) {
          const i = idx(c, r);
          next[i] =
            SPREAD * (
              cur[idx(c - 1, r)] + cur[idx(c + 1, r)] +
              cur[idx(c, r - 1)] + cur[idx(c, r + 1)] -
              4 * cur[i]
            ) * 2
            + 2 * cur[i] - prv[i];
          next[i] *= DAMPING;
        }
      }
      prv = cur;
      cur = next;
    }

    // ── metaball blobs (slowly drift across the canvas) ───────────────────
    const blobs = Array.from({ length: BLOB_COUNT }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      r: 0.08 + Math.random() * 0.12,
      phase: (i / BLOB_COUNT) * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.004,
    }));

    function updateBlobs(t) {
      for (const b of blobs) {
        b.x += b.vx + Math.cos(t * b.speed + b.phase) * 0.0003;
        b.y += b.vy + Math.sin(t * b.speed + b.phase + 1) * 0.0003;
        // wrap
        if (b.x < -0.1) b.x = 1.1;
        if (b.x >  1.1) b.x = -0.1;
        if (b.y < -0.1) b.y = 1.1;
        if (b.y >  1.1) b.y = -0.1;
      }
    }

    // Compute metaball field value at (xn, yn) in [0,1]
    function metafield(xn, yn) {
      let v = 0;
      for (const b of blobs) {
        const dx = (xn - b.x) * (W / H); // aspect correct
        const dy = yn - b.y;
        const d2 = dx * dx + dy * dy;
        v += (b.r * b.r) / Math.max(d2, 0.0001);
      }
      return v;
    }

    // ── ripple rings spawned by mouse clicks / movement ───────────────────
    const ripples = [];
    function addRipple(xn, yn) {
      if (ripples.length >= RIPPLE_COUNT) ripples.shift();
      ripples.push({ x: xn, y: yn, age: 0, life: 80 + Math.random() * 40 });
    }

    // ── mouse / touch ──────────────────────────────────────────────────────
    const mouse = { x: -9999, y: -9999, xn: -1, yn: -1, moved: false };
    let lastDisturbTime = 0;

    function onMouseMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.xn = mouse.x / W;
      mouse.yn = mouse.y / H;
      mouse.moved = true;
    }

    function onClick(e) {
      const xn = e.clientX / W;
      const yn = e.clientY / H;
      disturb(xn, yn, 12);
      addRipple(xn, yn);
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('click',     onClick,     { passive: true });
    window.addEventListener('resize',    resize);

    // ── smoothed spotlight position ────────────────────────────────────────
    const spot = { x: 0.5, y: 0.5 };

    // ── ImageData pixel painting ───────────────────────────────────────────
    function sampleWave(xn, yn) {
      const c = Math.floor(xn * (COLS - 1));
      const r = Math.floor(yn * (ROWS - 1));
      return cur[idx(clamp(c, 0, COLS - 1), clamp(r, 0, ROWS - 1))];
    }

    // ── draw frame ────────────────────────────────────────────────────────
    let frame = 0;

    function draw() {
      frame++;
      const t = frame * 0.016;

      // ── wave step ───────────────────────────────────────────────────────
      stepWave();

      // disturb wave from mouse movement (throttled)
      if (mouse.moved && frame - lastDisturbTime > 4) {
        disturb(mouse.xn, mouse.yn, 3.5 + Math.sin(t * 3) * 1.5);
        if (Math.random() < 0.15) addRipple(mouse.xn, mouse.yn);
        lastDisturbTime = frame;
        mouse.moved = false;
      }

      // smooth spotlight
      if (mouse.x > -100) {
        spot.x += (mouse.xn - spot.x) * 0.07;
        spot.y += (mouse.yn - spot.y) * 0.07;
      }

      // ── update blobs ────────────────────────────────────────────────────
      updateBlobs(t);

      // ── pixel-paint water surface ────────────────────────────────────────
      // Use a smaller offscreen resolution for speed
      const SCALE = 4;
      const pw = Math.ceil(W / SCALE);
      const ph = Math.ceil(H / SCALE);
      const imgData = ctx.createImageData(pw, ph);
      const pix = imgData.data;

      for (let py = 0; py < ph; py++) {
        for (let px = 0; px < pw; px++) {
          const xn = px / pw;
          const yn = py / ph;

          // wave height at this pixel
          const wh = sampleWave(xn, yn);

          // metaball depth  [0 .. ~2+]
          const meta = clamp(metafield(xn, yn), 0, 3);
          const metaN = meta / 3;

          // distance from spot for proximity glow
          const sdx = xn - spot.x;
          const sdy = yn - spot.y;
          const spotDist = Math.sqrt(sdx * sdx + sdy * sdy * 1.5);
          const spotGlow = Math.max(0, 1 - spotDist / 0.45);

          // wave brightness
          const waveBright = clamp(wh * 0.18, -0.3, 0.8);

          // combine depth layers
          let col;
          if (metaN < 0.25) {
            col = lerpColor(DEEP_COLOR, MID_COLOR, metaN / 0.25);
          } else if (metaN < 0.6) {
            col = lerpColor(MID_COLOR, SURF_COLOR, (metaN - 0.25) / 0.35);
          } else {
            col = lerpColor(SURF_COLOR, FOAM_COLOR, (metaN - 0.6) / 0.4);
          }

          // add wave crests
          if (waveBright > 0.1) {
            col = lerpColor(col, FOAM_COLOR, clamp(waveBright * 1.8, 0, 1));
          } else if (waveBright < -0.05) {
            col = lerpColor(col, DEEP_COLOR, clamp(-waveBright * 1.2, 0, 1));
          }

          // caustic scatter near mouse + wave peaks
          const causticStrength = spotGlow * 0.55 + clamp(waveBright * 0.6, 0, 0.4);
          col = lerpColor(col, CAUSTIC_HUE, clamp(causticStrength, 0, 1));

          // shimmer from sine waves
          const shimmer = (Math.sin(xn * 18 + t * 1.4) * Math.cos(yn * 14 - t * 1.1) + 1) * 0.5;
          const shimmerMask = clamp(spotGlow * 0.35 + waveBright * 0.3, 0, 0.4);
          col[0] = clamp(col[0] + shimmer * shimmerMask * 60, 0, 255);
          col[1] = clamp(col[1] + shimmer * shimmerMask * 80, 0, 255);
          col[2] = clamp(col[2] + shimmer * shimmerMask * 120, 0, 255);

          const pi = (py * pw + px) * 4;
          pix[pi]     = col[0];
          pix[pi + 1] = col[1];
          pix[pi + 2] = col[2];
          pix[pi + 3] = 255;
        }
      }

      // put pixel data then scale up via canvas transform
      const offscreen = document.createElement('canvas');
      offscreen.width  = pw;
      offscreen.height = ph;
      offscreen.getContext('2d').putImageData(imgData, 0, 0);

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(offscreen, 0, 0, W, H);

      // ── draw ripple rings ───────────────────────────────────────────────
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.age++;
        if (rp.age >= rp.life) { ripples.splice(i, 1); continue; }

        const progress = rp.age / rp.life;
        const radius   = progress * Math.min(W, H) * 0.28;
        const alpha    = (1 - progress) * 0.55;
        const width    = (1 - progress) * 2.5 + 0.5;

        // outer ring
        const grad = ctx.createRadialGradient(
          rp.x * W, rp.y * H, radius * 0.85,
          rp.x * W, rp.y * H, radius
        );
        grad.addColorStop(0, `rgba(100,140,255,0)`);
        grad.addColorStop(0.6, `rgba(140,180,255,${alpha * 0.7})`);
        grad.addColorStop(1, `rgba(180,210,255,${alpha})`);

        ctx.beginPath();
        ctx.arc(rp.x * W, rp.y * H, radius, 0, Math.PI * 2);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = width;
        ctx.stroke();

        // secondary inner ring (trailing)
        if (progress > 0.12) {
          const r2 = radius * 0.6;
          const a2 = (1 - progress) * 0.3;
          ctx.beginPath();
          ctx.arc(rp.x * W, rp.y * H, r2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(120,160,255,${a2})`;
          ctx.lineWidth   = width * 0.5;
          ctx.stroke();
        }
      }

      // ── mouse proximity glow lens ───────────────────────────────────────
      if (mouse.x > -100) {
        const gx = mouse.x;
        const gy = mouse.y;
        const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, 220);
        gr.addColorStop(0,   'rgba(80,120,255,0.12)');
        gr.addColorStop(0.35,'rgba(60, 90,220,0.07)');
        gr.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(gx, gy, 220, 0, Math.PI * 2);
        ctx.fill();

        // bright specular highlight dot
        const sg = ctx.createRadialGradient(gx, gy, 0, gx, gy, 28);
        sg.addColorStop(0,   'rgba(200,220,255,0.28)');
        sg.addColorStop(0.5, 'rgba(140,180,255,0.1)');
        sg.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(gx, gy, 28, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    // ── boot ──────────────────────────────────────────────────────────────
    resize();
    // seed a few initial disturbances so it doesn't look static on load
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        disturb(Math.random(), Math.random(), 8);
        addRipple(Math.random(), Math.random());
      }, i * 300);
    }
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click',     onClick);
      window.removeEventListener('resize',    resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        top:           0,
        left:          0,
        width:         '100vw',
        height:        '100vh',
        pointerEvents: 'none',
        zIndex:        0,
        opacity:       1,
      }}
      aria-hidden="true"
    />
  );
}
