/**
 * The Meridian — the hero's signature element.
 *
 * A hairline globe, oriented so Dhaka sits on the visible hemisphere, with
 * great-circle routes running from Dhaka to each delivery hub. Cities are
 * plotted at their real coordinates, the routes are real great circles, and
 * the globe rocks slowly rather than spinning so the origin node never leaves
 * the front face. The three arcs at the upper right are the signal arcs from
 * the company mark.
 */

const DEG = Math.PI / 180;

const ORIGIN = { name: 'Dhaka', lat: 23.78, lon: 90.4 };

const CITIES = {
  London: { lat: 51.51, lon: -0.13 },
  'New York': { lat: 40.71, lon: -74.01 },
  Dubai: { lat: 25.2, lon: 55.27 },
  Singapore: { lat: 1.35, lon: 103.82 },
  Sydney: { lat: -33.87, lon: 151.21 },
};

const COLOR = {
  wireFront: 'rgba(146, 190, 219, 0.20)',
  wireBack: 'rgba(146, 190, 219, 0.06)',
  rim: 'rgba(35, 185, 221, 0.38)',
  routeFront: 'rgba(35, 185, 221, 0.62)',
  routeBack: 'rgba(35, 185, 221, 0.10)',
  node: '#6fdcf5',
  label: 'rgba(150, 174, 196, 0.9)',
};

/* -------------------------------------------------------------------------- */
/* Vector maths                                                               */

function toVector({ lat, lon }) {
  const phi = lat * DEG;
  const theta = lon * DEG;
  return {
    x: Math.cos(phi) * Math.sin(theta),
    y: Math.sin(phi),
    z: Math.cos(phi) * Math.cos(theta),
  };
}

function rotate(v, yaw, pitch) {
  // Yaw around the vertical axis, then pitch to tip the north pole toward us.
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = v.x * cy - v.z * sy;
  const z1 = v.x * sy + v.z * cy;

  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const y2 = v.y * cp - z1 * sp;
  const z2 = v.y * sp + z1 * cp;

  return { x: x1, y: y2, z: z2 };
}

/** Spherical interpolation — gives a true great-circle path between cities. */
function slerp(a, b, t) {
  let dot = a.x * b.x + a.y * b.y + a.z * b.z;
  dot = Math.min(1, Math.max(-1, dot));
  const omega = Math.acos(dot);

  if (omega < 1e-6) return { ...a };

  const s = Math.sin(omega);
  const wa = Math.sin((1 - t) * omega) / s;
  const wb = Math.sin(t * omega) / s;

  return {
    x: a.x * wa + b.x * wb,
    y: a.y * wa + b.y * wb,
    z: a.z * wa + b.z * wb,
  };
}

/* -------------------------------------------------------------------------- */

export function initMeridian(root) {
  const canvas = root.querySelector('[data-meridian-canvas]');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let hubs = [];
  try {
    hubs = JSON.parse(root.dataset.hubs || '[]');
  } catch {
    hubs = [];
  }

  const origin = toVector(ORIGIN);

  const routes = hubs
    .filter((hub) => CITIES[hub.name])
    .map((hub, index) => ({
      name: hub.name,
      target: toVector(CITIES[hub.name]),
      // Stagger the pulses so they never read as a single synchronised wave.
      phase: (index * 0.37) % 1,
      speed: 0.13 + index * 0.021,
    }));

  const countEl = root.querySelector('[data-meridian-count]');
  if (countEl) countEl.textContent = String(routes.length);

  let width = 0;
  let height = 0;
  let radius = 0;
  let cx = 0;
  let cy = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Leave headroom on the right and top for the signal arcs.
    radius = Math.min(width, height) * 0.325;
    cx = width * 0.46;
    cy = height * 0.52;
  }

  const project = (v) => ({
    x: cx + v.x * radius,
    y: cy - v.y * radius,
    front: v.z > 0,
  });

  /** Draws a polyline, splitting it wherever it crosses the horizon. */
  function strokeSplit(points, frontStyle, backStyle, lineWidth) {
    let run = [];
    let runFront = null;

    const flush = () => {
      if (run.length > 1) {
        ctx.beginPath();
        ctx.moveTo(run[0].x, run[0].y);
        for (let i = 1; i < run.length; i += 1) ctx.lineTo(run[i].x, run[i].y);
        ctx.strokeStyle = runFront ? frontStyle : backStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
      run = [];
    };

    for (const point of points) {
      if (runFront === null || point.front === runFront) {
        run.push(point);
        runFront = point.front;
      } else {
        run.push(point);
        flush();
        run = [point];
        runFront = point.front;
      }
    }
    flush();
  }

  function drawWireframe(yaw, pitch) {
    // Latitude rings every 30°.
    for (let lat = -60; lat <= 60; lat += 30) {
      const points = [];
      for (let lon = -180; lon <= 180; lon += 6) {
        points.push(project(rotate(toVector({ lat, lon }), yaw, pitch)));
      }
      strokeSplit(points, COLOR.wireFront, COLOR.wireBack, 1);
    }

    // Longitude meridians every 30°.
    for (let lon = -180; lon < 180; lon += 30) {
      const points = [];
      for (let lat = -90; lat <= 90; lat += 4) {
        points.push(project(rotate(toVector({ lat, lon }), yaw, pitch)));
      }
      strokeSplit(points, COLOR.wireFront, COLOR.wireBack, 1);
    }

    // Rim.
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = COLOR.rim;
    ctx.lineWidth = 1.25;
    ctx.stroke();
  }

  function drawRoute(route, yaw, pitch, time) {
    const steps = 72;
    const points = [];

    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const base = slerp(origin, route.target, t);
      // Lift the path off the surface so the arc reads as a route, not a line
      // drawn on the sphere.
      const lift = 1 + 0.11 * Math.sin(Math.PI * t);
      const rotated = rotate(base, yaw, pitch);
      points.push(
        project({ x: rotated.x * lift, y: rotated.y * lift, z: rotated.z }),
      );
    }

    strokeSplit(points, COLOR.routeFront, COLOR.routeBack, 1.35);

    // Travelling pulse.
    const t = (time * route.speed + route.phase) % 1;
    const index = Math.round(t * steps);
    const head = points[index];
    if (!head) return;

    const trail = points.slice(Math.max(0, index - 9), index + 1);
    if (trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i += 1) ctx.lineTo(trail[i].x, trail[i].y);
      ctx.strokeStyle = head.front ? 'rgba(111, 220, 245, 0.85)' : 'rgba(111, 220, 245, 0.18)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(head.x, head.y, head.front ? 2.6 : 1.4, 0, Math.PI * 2);
    ctx.fillStyle = head.front ? COLOR.node : 'rgba(111, 220, 245, 0.25)';
    ctx.fill();
  }

  function drawCity(name, vector, yaw, pitch) {
    const p = project(rotate(vector, yaw, pitch));
    if (!p.front) return;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = COLOR.node;
    ctx.fill();

    ctx.font = '500 9px "IBM Plex Mono", ui-monospace, monospace';
    ctx.fillStyle = COLOR.label;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.toUpperCase(), p.x + 7, p.y);
  }

  function drawOrigin(yaw, pitch, time) {
    const p = project(rotate(origin, yaw, pitch));
    if (!p.front) return;

    // Breathing halo — the same pulse the header clock uses.
    const t = (time * 0.55) % 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4 + t * 16, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(35, 185, 221, ${0.4 * (1 - t)})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#04162a';
    ctx.fill();
    ctx.strokeStyle = COLOR.node;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.font = '600 9.5px "IBM Plex Mono", ui-monospace, monospace';
    ctx.fillStyle = '#6fdcf5';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('DHAKA', p.x + 10, p.y);
  }

  /** The three signal arcs lifted straight from the company mark. */
  function drawSignalArcs(time) {
    const radii = [1.09, 1.22, 1.35];
    radii.forEach((factor, index) => {
      const cycle = (time * 0.45 - index * 0.16) % 1;
      const alpha = cycle < 0 ? 0 : 0.42 * Math.max(0, Math.sin(Math.PI * cycle));
      if (alpha <= 0.01) return;

      ctx.beginPath();
      ctx.arc(cx, cy, radius * factor, -76 * DEG, -18 * DEG);
      ctx.strokeStyle = `rgba(35, 185, 221, ${alpha})`;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.stroke();
    });
  }

  function frame(time) {
    ctx.clearRect(0, 0, width, height);

    // Rock between ±38° of Dhaka's meridian rather than spinning, so the
    // origin node never rotates out of view.
    const yaw = ORIGIN.lon * DEG + Math.sin(time * 0.16) * 34 * DEG;
    const pitch = (-16 + Math.sin(time * 0.11) * 4) * DEG;

    drawWireframe(yaw, pitch);
    drawSignalArcs(time);

    for (const route of routes) {
      drawRoute(route, yaw, pitch, time);
      drawCity(route.name, route.target, yaw, pitch);
    }

    drawOrigin(yaw, pitch, time);
  }

  let running = false;
  let rafId = 0;
  let start = 0;

  function loop(now) {
    if (!running) return;
    if (!start) start = now;
    frame((now - start) / 1000);
    rafId = requestAnimationFrame(loop);
  }

  function play() {
    if (running || reduced) return;
    running = true;
    start = 0;
    rafId = requestAnimationFrame(loop);
  }

  function pause() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  resize();
  frame(0);

  if (reduced) {
    // One static, fully-drawn frame is the whole animation.
    frame(1.6);
    return;
  }

  // Only animate while the hero is actually on screen.
  const observer = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? play() : pause()),
    { threshold: 0 },
  );
  observer.observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else if (canvas.getBoundingClientRect().bottom > 0) play();
  });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      if (!running) frame(0);
    }, 150);
  });
}
