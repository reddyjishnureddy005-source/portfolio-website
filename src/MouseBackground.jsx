import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
//  HIGH-PERFORMANCE INTERACTIVE WATER FLUID SIMULATION
//  Algorithm: 2D discrete shallow-water wave equation with 3-buffer swap
//  Render:    ImageData pixel painting at reduced resolution → upscale via drawImage
//  Mouse:     Velocity-weighted disturbance injection via pointermove
// ─────────────────────────────────────────────────────────────────────────────

// ── Config ────────────────────────────────────────────────────────────────────
const SCALE         = 4;      // px per wave cell (4 = good perf / quality balance)
const DAMPING       = 0.972;  // energy per frame. 0.972^90 ≈ 8% → ~1.5s decay at 60fps
const MOUSE_RADIUS  = 7;      // disturbance radius in wave cells
const MOUSE_BASE    = 120;    // base strength when cursor is barely moving
const MOUSE_VEL_K   = 3.2;    // velocity multiplier: faster cursor → bigger splash
const MAX_STRENGTH  = 700;    // clamp to prevent grid explosion
const AMP_CLAMP     = 1200;   // hard clamp on wave amplitude
const RESIZE_DEBOUNCE = 180;  // ms to wait after resize before rebuilding grid

// ── Color palette (deep dark navy/indigo → luminescent blue-teal crests) ─────
//    All values are [R, G, B] in 0-255 range
const C_VOID   = [3,    4,  16];  // absolute deep background — near-black indigo
const C_DEEP   = [5,    9,  32];  // resting water surface
const C_TROUGH = [7,   14,  52];  // wave troughs — slightly lighter indigo
const C_MID    = [18,  62, 165];  // mid-amplitude blue
const C_CREST  = [52, 148, 255];  // bright luminescent blue crest
const C_FOAM   = [148, 212, 255]; // near-white blue-teal foam tip

// ── Fast integer linear interpolation ────────────────────────────────────────
function lerpColor(c1, c2, t) {
  return [
    (c1[0] + (c2[0] - c1[0]) * t) | 0,
    (c1[1] + (c2[1] - c1[1]) * t) | 0,
    (c1[2] + (c2[2] - c1[2]) * t) | 0,
  ];
}

// ── Map normalized wave height [-1,1] to RGB via multi-stop gradient ─────────
function heightToColor(hn) {
  if (hn >= 0) {
    if (hn < 0.25) return lerpColor(C_DEEP,   C_MID,   hn / 0.25);
    if (hn < 0.60) return lerpColor(C_MID,    C_CREST, (hn - 0.25) / 0.35);
                   return lerpColor(C_CREST,  C_FOAM,  Math.min((hn - 0.60) / 0.40, 1));
  } else {
    const t = Math.min(-hn, 1);
    if (t < 0.35) return lerpColor(C_DEEP,   C_TROUGH, t / 0.35);
                  return C_TROUGH;
  }
}

// ── React Component ───────────────────────────────────────────────────────────
export default function MouseBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    // Main ctx — for drawImage scaling
    const ctx = canvas.getContext('2d');

    // Offscreen canvas — pixel buffer painted at grid resolution, then upscaled
    const off    = document.createElement('canvas');
    const offCtx = off.getContext('2d');

    // ── State variables (mutable, no React state) ──────────────────────────
    let W, H, cols, rows, n;
    let buf0, buf1, buf2; // triple buffer: cur, prev, scratch
    let imgData, pix;     // ImageData and its Uint8ClampedArray view
    let rafId;
    let resizeTimer = null;

    // Mouse tracking: grid coords + velocity
    const mouse = {
      gx: -999, gy: -999,   // current grid pos
      pgx: -999, pgy: -999, // previous grid pos (for velocity)
      active: false,
    };

    // ── Grid initialisation ────────────────────────────────────────────────
    function buildGrid() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;

      // +2 border cells on each axis (edges stay at 0 — absorbing boundary)
      cols = Math.ceil(W / SCALE) + 2;
      rows = Math.ceil(H / SCALE) + 2;
      n    = cols * rows;

      buf0 = new Float32Array(n); // current heights
      buf1 = new Float32Array(n); // previous heights
      buf2 = new Float32Array(n); // scratch / next heights

      // Offscreen pixel buffer (1px per wave cell, upscaled later)
      off.width  = cols;
      off.height = rows;
      imgData    = offCtx.createImageData(cols, rows);
      pix        = imgData.data;

      // Pre-fill alpha channel to fully opaque (avoids per-pixel write)
      for (let i = 3; i < pix.length; i += 4) pix[i] = 255;
    }

    // ── Debounced resize handler ───────────────────────────────────────────
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Rebuild everything cleanly — old buffers are GC'd automatically
        buildGrid();
      }, RESIZE_DEBOUNCE);
    }

    // ── Inline cell index (no bounds check overhead on hot path) ──────────
    // Call only with c in [1, cols-2] and r in [1, rows-2]
    function at(c, r) { return r * cols + c; }

    // ── Inject disturbance at grid position (gcx, gcy) ────────────────────
    function disturb(gcx, gcy, strength, radius) {
      const ci = (gcx + 0.5) | 0; // +1 accounts for border offset since cols has +2
      const ri = (gcy + 0.5) | 0;
      const rad2 = radius * radius;

      for (let dr = -radius; dr <= radius; dr++) {
        const rr = ri + dr;
        if (rr < 1 || rr >= rows - 1) continue;
        const dr2 = dr * dr;

        for (let dc = -radius; dc <= radius; dc++) {
          const cc = ci + dc;
          if (cc < 1 || cc >= cols - 1) continue;
          const d2 = dc * dc + dr2;
          if (d2 > rad2) continue;

          // Gaussian-like falloff from centre of disturbance
          const falloff = 1 - Math.sqrt(d2) / radius;
          buf0[at(cc, rr)] += strength * falloff;
        }
      }
    }

    // ── Wave propagation step (shallow-water discrete equation) ───────────
    // Formula: next = (left + right + up + down) * 0.5 - prev  → then damp
    // This produces transverse wave propagation at c=0.5 (stability guaranteed)
    function stepWave() {
      for (let r = 1; r < rows - 1; r++) {
        const rOff  = r * cols;
        const rMOff = (r - 1) * cols;
        const rPOff = (r + 1) * cols;

        for (let c = 1; c < cols - 1; c++) {
          const i = rOff + c;
          let v = (
            buf0[rOff  + c - 1] +   // left
            buf0[rOff  + c + 1] +   // right
            buf0[rMOff + c    ] +   // up
            buf0[rPOff + c    ]     // down
          ) * 0.5 - buf1[i];

          // Damp to naturally fade ripples (1-2 second decay)
          v *= DAMPING;

          // Hard clamp prevents floating-point runaway from rapid mouse movement
          if (v >  AMP_CLAMP) v =  AMP_CLAMP;
          if (v < -AMP_CLAMP) v = -AMP_CLAMP;

          buf2[i] = v;
        }
      }

      // Rotate buffers: buf1 ← buf0, buf0 ← buf2, buf2 free for next frame
      const tmp = buf1;
      buf1 = buf0;
      buf0 = buf2;
      buf2 = tmp;
    }

    // ── Render wave grid → ImageData → upscale to canvas ──────────────────
    function renderFrame() {
      const normaliser = 1 / 480; // tuned so MAX_AMP ≈ 1.0 visible brightness

      for (let r = 0; r < rows; r++) {
        const rOff = r * cols;
        for (let c = 0; c < cols; c++) {
          const h  = buf0[rOff + c];

          // ── Normal-map specular highlight ──────────────────────────────
          // Approximate surface gradient for a rim-light sheen on crests
          let specular = 0;
          if (c > 0 && c < cols - 1 && r > 0 && r < rows - 1) {
            const dx = buf0[rOff + c + 1] - buf0[rOff + c - 1];
            const dy = buf0[(r + 1) * cols + c] - buf0[(r - 1) * cols + c];
            // Light direction: top-left (lx=0.4, ly=0.4, lz=0.82) normalised
            // dot(surface_normal, light) — surface normal = normalize(-dx, -dy, 50)
            const len = Math.sqrt(dx * dx + dy * dy + 2500);
            specular = Math.max(0, (-dx * 0.4 - dy * 0.4 + 50 * 0.82) / len);
            specular = specular * specular * specular; // sharpen specular lobe
          }

          // Normalise height to [-1, 1]
          const hn = Math.max(-1, Math.min(1, h * normaliser));

          const col = heightToColor(hn);

          // Add specular highlight (white-blue additive) on crests
          const specMag = specular * Math.max(0, hn) * 180;

          const pi      = (rOff + c) * 4;
          pix[pi    ]   = Math.min(255, col[0] + specMag * 0.6) | 0;
          pix[pi + 1]   = Math.min(255, col[1] + specMag * 0.8) | 0;
          pix[pi + 2]   = Math.min(255, col[2] + specMag * 1.0) | 0;
          // alpha already 255
        }
      }

      // Flush ImageData to offscreen canvas
      offCtx.putImageData(imgData, 0, 0);

      // Upscale: draw offscreen (small) onto main canvas (full viewport)
      // imageSmoothingEnabled=true gives bilinear interpolation — smooth wave edges
      ctx.imageSmoothingEnabled    = true;
      ctx.imageSmoothingQuality    = 'medium';

      // We draw from (-SCALE, -SCALE) to account for the 1-cell border padding
      ctx.drawImage(
        off,
        0, 0, cols, rows,           // source: full offscreen
        -SCALE, -SCALE,             // dest origin: hide the border row/col
        cols * SCALE, rows * SCALE  // dest size: fills viewport + bleed
      );
    }

    // ── Main animation loop ────────────────────────────────────────────────
    function loop() {
      stepWave();

      // Inject mouse disturbance every frame while active
      if (mouse.active) {
        // Velocity magnitude in grid-cell units per frame
        const vx  = mouse.gx - mouse.pgx;
        const vy  = mouse.gy - mouse.pgy;
        const spd = Math.sqrt(vx * vx + vy * vy);
        const str = Math.min(MOUSE_BASE + spd * MOUSE_VEL_K, MAX_STRENGTH);

        disturb(mouse.gx, mouse.gy, str, MOUSE_RADIUS);
      }

      renderFrame();
      rafId = requestAnimationFrame(loop);
    }

    // ── Pointer events ─────────────────────────────────────────────────────
    function onPointerMove(e) {
      // Convert viewport pixel to wave-grid coordinates
      // +1.5 offsets for the border cell padding
      const gx = e.clientX / SCALE + 1.5;
      const gy = e.clientY / SCALE + 1.5;

      mouse.pgx    = mouse.gx;
      mouse.pgy    = mouse.gy;
      mouse.gx     = gx;
      mouse.gy     = gy;
      mouse.active = true;
    }

    function onPointerLeave() {
      mouse.active = false;
      mouse.gx = mouse.gy = mouse.pgx = mouse.pgy = -999;
    }

    // ── Boot ──────────────────────────────────────────────────────────────
    buildGrid();
    loop();

    window.addEventListener('pointermove',  onPointerMove,  { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('resize',       onResize,       { passive: true });

    // ── Cleanup on unmount ─────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener('pointermove',  onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize',       onResize);
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
        zIndex:        -1,
        pointerEvents: 'auto',
        display:       'block',
      }}
      aria-hidden="true"
    />
  );
}
