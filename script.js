/**
 * TruthLens — script.js v3
 * NEW: 3D Rotating Globe, Matrix Rain, Radar Chart,
 * Particle Morphing, Parallax Layers, Type Cycling,
 * Magnetic cursor, Page flash, 3D Stats canvas,
 * All previous features enhanced.
 */

/* ============================================================
   1. CUSTOM CURSOR — Enhanced
   ============================================================ */
(function initCursor() {
  const outer = document.getElementById('cursorOuter');
  const dot   = document.getElementById('cursorDot');
  if (!outer || !dot) return;

  let mx = 0, my = 0, ox = 0, oy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  (function lerp() {
    ox += (mx - ox) * 0.10;
    oy += (my - oy) * 0.10;
    outer.style.left = ox + 'px'; outer.style.top = oy + 'px';
    requestAnimationFrame(lerp);
  })();

  document.querySelectorAll('a, button, .tilt-card, .upload-zone, .help-option, .btn-connect, .nav-link, .step-card, .feature-card, .helper-card, .student-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();


/* ============================================================
   2. NAVBAR
   ============================================================ */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 12);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
})();


/* ============================================================
   3. HERO CANVAS — Neural net particles
   ============================================================ */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes, mouse = { x: -999, y: -999 };
  const NODE_COUNT = 60, CONNECT_DIST = 150;

  function resize() {
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
  }

  function randomNode() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.4 + 0.8,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function init() { resize(); nodes = Array.from({ length: NODE_COUNT }, randomNode); }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.14;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(59,126,246,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
      // Mouse connections
      const dxm = nodes[i].x - mouse.x, dym = nodes[i].y - mouse.y;
      const dm = Math.sqrt(dxm*dxm + dym*dym);
      if (dm < 220) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(59,126,246,${(1 - dm/220) * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    nodes.forEach(n => {
      n.pulse += 0.03;
      const pulsedR = n.r + Math.sin(n.pulse) * 0.4;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulsedR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59,126,246,${n.opacity})`;
      ctx.fill();
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', init, { passive: true });
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  init(); draw();
})();


/* ============================================================
   4. 3D ROTATING GLOBE
   ============================================================ */
(function initGlobe() {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, frame = 0;

  // Generate random lat/lon points for "cities"
  const POINTS = [];
  for (let i = 0; i < 160; i++) {
    const lat = (Math.random() - 0.5) * Math.PI;
    const lon = Math.random() * Math.PI * 2;
    POINTS.push({ lat, lon, size: Math.random() * 1.6 + 0.5 });
  }

  // Generate arcs (connections between random points)
  const ARCS = [];
  for (let i = 0; i < 18; i++) {
    const p1 = POINTS[Math.floor(Math.random() * POINTS.length)];
    const p2 = POINTS[Math.floor(Math.random() * POINTS.length)];
    ARCS.push({ p1, p2, progress: Math.random(), speed: 0.003 + Math.random() * 0.004, opacity: Math.random() * 0.5 + 0.2 });
  }

  // Latitude lines
  const LAT_LINES = [-60, -40, -20, 0, 20, 40, 60].map(d => d * Math.PI / 180);
  // Longitude lines
  const LON_LINES = Array.from({ length: 12 }, (_, i) => i * Math.PI / 6);

  function resize() {
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function latLonToXY(lat, lon, rotation, R, cx, cy) {
    const x3 = R * Math.cos(lat) * Math.sin(lon + rotation);
    const y3 = R * Math.sin(lat);
    const z3 = R * Math.cos(lat) * Math.cos(lon + rotation);
    const visible = z3 > -R * 0.1;
    return { x: cx + x3, y: cy - y3, visible, z: z3 };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const rotation = frame * 0.004;
    const R = Math.min(W, H) * 0.42;
    const cx = W / 2, cy = H / 2;

    // Globe base glow
    const grd = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.1);
    grd.addColorStop(0, 'rgba(59,126,246,0.08)');
    grd.addColorStop(1, 'rgba(59,126,246,0.0)');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.fillStyle = grd; ctx.fill();

    // Outline
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(59,126,246,0.2)'; ctx.lineWidth = 1; ctx.stroke();

    // Latitude lines
    LAT_LINES.forEach(lat => {
      ctx.beginPath();
      let first = true;
      for (let lon = 0; lon <= Math.PI * 2; lon += 0.06) {
        const { x, y, visible } = latLonToXY(lat, lon, rotation, R, cx, cy);
        if (visible) { first ? ctx.moveTo(x, y) : ctx.lineTo(x, y); first = false; }
        else { first = true; }
      }
      ctx.strokeStyle = 'rgba(59,126,246,0.08)'; ctx.lineWidth = 0.5; ctx.stroke();
    });

    // Longitude lines
    LON_LINES.forEach(lon => {
      ctx.beginPath();
      let first = true;
      for (let lat = -Math.PI/2; lat <= Math.PI/2; lat += 0.05) {
        const { x, y, visible } = latLonToXY(lat, lon, rotation, R, cx, cy);
        if (visible) { first ? ctx.moveTo(x, y) : ctx.lineTo(x, y); first = false; }
        else { first = true; }
      }
      ctx.strokeStyle = 'rgba(59,126,246,0.06)'; ctx.lineWidth = 0.5; ctx.stroke();
    });

    // Points
    POINTS.forEach(p => {
      const { x, y, visible, z } = latLonToXY(p.lat, p.lon, rotation, R, cx, cy);
      if (!visible) return;
      const alpha = 0.3 + 0.7 * ((z / R + 1) / 2);
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96,165,250,${alpha * 0.9})`;
      ctx.fill();
    });

    // Arcs
    ARCS.forEach(arc => {
      arc.progress += arc.speed;
      if (arc.progress > 1) arc.progress = 0;

      const { x: x1, y: y1, visible: v1 } = latLonToXY(arc.p1.lat, arc.p1.lon, rotation, R, cx, cy);
      const { x: x2, y: y2, visible: v2 } = latLonToXY(arc.p2.lat, arc.p2.lon, rotation, R, cx, cy);
      if (!v1 || !v2) return;

      const t = arc.progress;
      const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2 - 30;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      const tx = x1 + (midX - x1) * t * 2, ty = y1 + (midY - y1) * t * 2;
      const tx2 = x2 + (midX - x2) * (1 - t) * 2, ty2 = y2 + (midY - y2) * (1 - t) * 2;
      ctx.quadraticCurveTo(midX, midY, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
      ctx.strokeStyle = `rgba(59,126,246,${arc.opacity * (1 - Math.abs(t - 0.5) * 2) * 0.7})`;
      ctx.lineWidth = 1; ctx.stroke();

      // Moving dot on arc
      const dotX = x1 + (x2 - x1) * t, dotY = y1 + (y2 - y1) * t;
      ctx.beginPath(); ctx.arc(dotX, dotY, 2, 0, Math.PI*2);
      ctx.fillStyle = `rgba(147,197,253,${arc.opacity})`;
      ctx.fill();
    });

    frame++;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
  }, { passive: true });

  resize(); draw();
})();


/* ============================================================
   5. HERO TYPE CYCLE
   ============================================================ */
(function initTypeCycle() {
  const words = document.querySelectorAll('.tw');
  if (!words.length) return;
  let current = 0;

  setInterval(() => {
    words[current].classList.remove('active');
    words[current].classList.add('exit');
    const prev = current;
    current = (current + 1) % words.length;
    words[current].classList.add('active');
    setTimeout(() => words[prev].classList.remove('exit'), 500);
  }, 2200);
})();


/* ============================================================
   6. COUNTER ANIMATION
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.dec) || 0;
      const sfx = el.dataset.suffix || '';
      const dur = 1600;
      const start = performance.now();

      function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = (ease * end).toFixed(dec) + sfx;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


/* ============================================================
   7. 3D TILT CARDS
   ============================================================ */
(function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2), dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = -dy * 9, rotY = dx * 9;
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
      card.style.boxShadow = `${-rotY * 2.5}px ${rotX * 2.5}px 32px rgba(59,126,246,0.14)`;
      const shine = card.querySelector('.tilt-shine');
      if (shine) {
        const mx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
        const my = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
        shine.style.setProperty('--mx', mx + '%');
        shine.style.setProperty('--my', my + '%');
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = ''; card.style.boxShadow = '';
    });
  });
})();


/* ============================================================
   8. MAGNETIC BUTTONS
   ============================================================ */
(function initMagnetic() {
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.4, dy = (e.clientY - cy) * 0.4;
      btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
})();


/* ============================================================
   9. ABOUT CARD 3D MOUSE FOLLOW
   ============================================================ */
(function initAbout3D() {
  const wrap = document.getElementById('aboutVisual');
  const stack = document.getElementById('astack');
  if (!wrap || !stack) return;

  wrap.addEventListener('mousemove', e => {
    const rect = wrap.getBoundingClientRect();
    const rx = ((e.clientY - rect.top - rect.height/2) / rect.height) * -16;
    const ry = ((e.clientX - rect.left - rect.width/2) / rect.width) * 16;
    stack.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });

  wrap.addEventListener('mouseleave', () => { stack.style.transform = ''; });
})();


/* ============================================================
   10. HOLOGRAM CANVAS
   ============================================================ */
function startHologram() {
  const canvas = document.getElementById('holoCanvas');
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  let frame = 0, alive = true;

  function drawHolo() {
    if (!alive) return;
    ctx.clearRect(0, 0, 130, 130);
    const cx = 65, cy = 65, t = frame / 60;

    // Outer glow ring
    const grd = ctx.createRadialGradient(cx, cy, 40, cx, cy, 65);
    grd.addColorStop(0, 'rgba(59,126,246,0)');
    grd.addColorStop(1, `rgba(59,126,246,${0.06 + Math.sin(t) * 0.02})`);
    ctx.beginPath(); ctx.arc(cx, cy, 65, 0, Math.PI*2);
    ctx.fillStyle = grd; ctx.fill();

    // Base circle
    ctx.beginPath(); ctx.arc(cx, cy, 58, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(59,126,246,0.14)'; ctx.lineWidth = 1; ctx.stroke();

    // Animated arcs
    for (let i = 0; i < 5; i++) {
      const off = (i / 5) * Math.PI * 2 + t * 1.5;
      const fade = 0.25 + i * 0.08;
      ctx.beginPath();
      ctx.arc(cx, cy, 58, off, off + Math.PI * 0.35);
      ctx.strokeStyle = `rgba(59,126,246,${fade})`;
      ctx.lineWidth = 2; ctx.stroke();
    }

    // Scanning line
    const scanY = cy - 42 + ((frame % 90) / 90) * 84;
    const scanGrad = ctx.createLinearGradient(cx - 42, 0, cx + 42, 0);
    scanGrad.addColorStop(0, 'transparent');
    scanGrad.addColorStop(0.5, 'rgba(59,126,246,0.6)');
    scanGrad.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.moveTo(cx - 42, scanY); ctx.lineTo(cx + 42, scanY);
    ctx.strokeStyle = scanGrad; ctx.lineWidth = 2.5; ctx.stroke();

    // Glow on scan line
    ctx.beginPath(); ctx.moveTo(cx - 42, scanY); ctx.lineTo(cx + 42, scanY);
    ctx.strokeStyle = `rgba(147,197,253,0.2)`; ctx.lineWidth = 6; ctx.stroke();

    // Orbiting dots
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + t * 0.9;
      const x = cx + Math.cos(angle) * 58, y = cy + Math.sin(angle) * 58;
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI*2);
      ctx.fillStyle = `rgba(96,165,250,${0.4 + Math.sin(t*2 + i) * 0.25})`;
      ctx.fill();
    }

    frame++;
    requestAnimationFrame(drawHolo);
  }

  drawHolo();
  return () => { alive = false; };
}


/* ============================================================
   11. STATS 3D SECTION — dark particle canvas
   ============================================================ */
(function initStats3DCanvas() {
  const canvas = document.getElementById('stats3dCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], frame = 0;

  function resize() {
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
  }

  function genParticle() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: -Math.random() * 0.5 - 0.1,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      life: 0, maxLife: 200 + Math.random() * 200,
    };
  }

  function init() { resize(); particles = Array.from({ length: 80 }, genParticle); }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Moving aurora at top
    const t = frame * 0.005;
    for (let i = 0; i < 3; i++) {
      const x = W * (0.2 + i * 0.3 + Math.sin(t + i * 1.5) * 0.1);
      const grd = ctx.createRadialGradient(x, H * 0.3, 0, x, H * 0.3, W * 0.28);
      grd.addColorStop(0, `rgba(59,126,246,${0.08 + i * 0.02})`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

    particles.forEach(p => {
      p.life++;
      if (p.life > p.maxLife || p.y < -10) { Object.assign(p, genParticle(), { y: H + 5 }); return; }
      const alpha = p.opacity * Math.sin((p.life / p.maxLife) * Math.PI);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96,165,250,${alpha})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
    });

    frame++;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', init, { passive: true });
  init(); draw();

  // Trigger bar animations when section is visible
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.s3d-bar').forEach(bar => {
          bar.style.width = bar.style.getPropertyValue('--w') || bar.parentElement.dataset.w || '80%';
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  const section = document.getElementById('stats3d');
  if (section) observer.observe(section);
})();


/* ============================================================
   12. DETECTION MATRIX — scrolling code-rain
   ============================================================ */
(function initMatrix() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLS = Math.floor(canvas.width / 14);
  const drops = Array.from({ length: COLS }, () => Math.floor(Math.random() * 8));
  const chars = '01GANRFQ24EXIFPRNU86DCTZAB';

  let alive = false;

  function draw() {
    if (!alive) return;
    ctx.fillStyle = 'rgba(17,24,39,0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '11px monospace';
    drops.forEach((y, x) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const alpha = Math.random() < 0.05 ? 1 : 0.45;
      ctx.fillStyle = `rgba(96,165,250,${alpha})`;
      ctx.fillText(char, x * 14, y * 14);
      if (y * 14 > canvas.height && Math.random() > 0.97) drops[x] = 0;
      drops[x]++;
    });

    requestAnimationFrame(draw);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !alive) {
        alive = true; draw();
      }
    });
  }, { threshold: 0.3 });
  obs.observe(canvas);
})();


/* ============================================================
   13. FILE UPLOAD & PREVIEW
   ============================================================ */
(function initUpload() {
  const uploadZone   = document.getElementById('uploadZone');
  const fileInput    = document.getElementById('fileInput');
  const browseBtn    = document.getElementById('browseBtn');
  const previewArea  = document.getElementById('previewArea');
  const previewImg   = document.getElementById('previewImg');
  const previewVideo = document.getElementById('previewVideo');
  const previewFname = document.getElementById('previewFilename');
  const previewBadge = document.getElementById('previewBadge');
  const fileMeta     = document.getElementById('fileMeta');
  const removeFile   = document.getElementById('removeFile');
  const analyzeBtn   = document.getElementById('analyzeBtn');
  const scanLine     = document.getElementById('previewScanLine');

  browseBtn.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
  uploadZone.addEventListener('click', () => fileInput.click());

  uploadZone.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
  uploadZone.addEventListener('dragleave', ()  => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault(); uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
  removeFile.addEventListener('click', resetUpload);

  function handleFile(file) {
    const validTypes = ['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/quicktime','video/webm'];
    if (!validTypes.includes(file.type)) { showToast('Unsupported file type.', 'error'); return; }
    if (file.size > 50 * 1024 * 1024) { showToast('File exceeds 50MB limit.', 'error'); return; }

    window._currentFile = file;
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');

    uploadZone.style.display  = 'none';
    previewArea.style.display = 'block';
    previewFname.textContent  = file.name;

    if (isVideo) {
      previewImg.style.display = 'none';
      previewVideo.style.display = 'block';
      previewVideo.src = url;
    } else {
      previewVideo.style.display = 'none';
      previewImg.style.display = 'block';
      previewImg.src = url;
    }

    previewBadge.textContent = 'Ready to analyze';
    fileMeta.innerHTML = `
      <span><strong>Type:</strong> ${isVideo ? 'Video' : 'Image'}</span>
      <span><strong>Size:</strong> ${fmtSize(file.size)}</span>
      <span><strong>Format:</strong> ${file.name.split('.').pop().toUpperCase()}</span>
    `;

    analyzeBtn.disabled = false;
    resetResults();
  }

  function resetUpload() {
    window._currentFile = null;
    uploadZone.style.display = 'block';
    previewArea.style.display = 'none';
    previewImg.src = ''; previewVideo.src = '';
    fileInput.value = '';
    analyzeBtn.disabled = true;
    const sp = analyzeBtn.querySelector('span:not(.analyze-icon):not(.analyze-shine)');
    if (sp) sp.textContent = 'Analyze for Deepfake';
    if (scanLine) { scanLine.classList.remove('scanning'); }
    resetResults();
  }

  function fmtSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
    return (b/1048576).toFixed(2) + ' MB';
  }
})();


/* ============================================================
   14. DETECTION ENGINE
   ============================================================ */
(function initDetection() {
  const analyzeBtn   = document.getElementById('analyzeBtn');
  const previewBadge = document.getElementById('previewBadge');
  const scanLine     = document.getElementById('previewScanLine');
  let stopHologram = null;

  analyzeBtn.addEventListener('click', () => {
    const file = window._currentFile;
    if (!file) return;

    analyzeBtn.disabled = true;
    const span = analyzeBtn.querySelector('span:not(.analyze-icon):not(.analyze-shine)');
    if (span) span.textContent = 'Analyzing…';
    if (previewBadge) previewBadge.textContent = '🔍 Scanning…';
    if (scanLine) scanLine.classList.add('scanning');

    showLoading();
    stopHologram = startHologram();

    simulateAnalysis(file, result => {
      if (stopHologram) stopHologram();
      if (scanLine) scanLine.classList.remove('scanning');
      showResults(result);
      if (previewBadge) {
        previewBadge.textContent = result.isFake ? '⚠ Deepfake Detected' : '✓ Appears Authentic';
      }
      analyzeBtn.disabled = false;
      if (span) span.textContent = 'Analyze Again';
      window._lastResult = result;
    });
  });

  function simulateAnalysis(file, cb) {
    const seed = file.size + file.name.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
    const rand = seededRng(seed);
    const isFake = rand() < 0.65;
    const isVideo = file.type.startsWith('video/');
    const conf = isFake ? Math.round(72 + rand() * 26) : Math.round(74 + rand() * 24);

    const fakeObs = isVideo ? [
      'Unnatural eye-blinking pattern (avg. ~80ms vs typical 150–400ms)',
      'Facial boundary artifacts visible along jaw and hairline',
      'GAN fingerprint signature in high-frequency DCT coefficients',
      'Temporal inconsistency: microexpressions misaligned with audio',
      'Skin texture rendered with synthetic smoothness (pore density anomaly)',
      'Illumination mismatch between face and scene background',
    ] : [
      'GAN-generated texture artifacts detected in skin region',
      'Facial geometry inconsistencies around nose-mouth boundary',
      'Frequency-domain analysis reveals non-natural spectral pattern',
      'Eye reflection asymmetry inconsistent with single light source',
      'PRNU noise residual indicates frame synthesis',
      'Stripped EXIF metadata — likely post-processed',
    ];

    const realObs = isVideo ? [
      'Eye-blinking pattern within natural range (150–380ms per blink)',
      'Facial geometry consistent across all frames — no warping',
      'Frequency spectrum shows natural noise residuals, no GAN artifacts',
      'Temporal microexpression alignment matches audio cues',
      'PRNU noise consistent with camera sensor signature',
    ] : [
      'Facial geometry shows natural proportional consistency',
      'Frequency analysis reveals natural camera noise pattern',
      'PRNU fingerprint matches typical optical sensor profile',
      'EXIF metadata present and consistent with capture device',
      'No spectral anomalies in high-frequency band',
    ];

    const pool = shuffle([...(isFake ? fakeObs : realObs)], rand).slice(0, 3);

    // Radar data
    const radarData = isFake ? {
      'GAN': Math.round(70 + rand()*28),
      'Facial': Math.round(60 + rand()*35),
      'Frequency': Math.round(65 + rand()*30),
    } : {
      'GAN': Math.round(8 + rand()*22),
      'Facial': Math.round(5 + rand()*18),
      'Frequency': Math.round(10 + rand()*20),
    };

    const result = {
      verdict: isFake ? 'DEEPFAKE' : 'AUTHENTIC',
      isFake, conf, isVideo,
      filename: file.name, filesize: file.size, filetype: file.type,
      observations: pool, radarData,
      explanation: isFake
        ? 'Our AI forensic model detected signatures consistent with AI-generated media. Key indicators include unnatural texture patterns and GAN-specific frequency anomalies. We recommend treating this media with caution and seeking expert review for legal or personal matters.'
        : 'Our AI forensic model found no significant indicators of AI manipulation. The media shows natural noise patterns, consistent facial geometry, and authentic sensor-level signatures. While no tool is 100% certain, this media appears unmodified.',
      model: 'TruthLens Forensics v2.1',
      analyzedAt: new Date().toLocaleString(),
    };

    const stepIds = ['step1','step2','step3','step4'];
    const interval = 650;

    stepIds.forEach((id, i) => {
      setTimeout(() => {
        if (i > 0) {
          const prev = document.getElementById(stepIds[i-1]);
          prev.classList.remove('active'); prev.classList.add('done');
          const fill = prev.querySelector('.ls-fill');
          if (fill) { fill.style.width = '100%'; fill.style.background = 'var(--safe)'; }
        }
        document.getElementById(id).classList.add('active');
      }, i * interval);
    });

    setTimeout(() => {
      const last = document.getElementById(stepIds[stepIds.length-1]);
      last.classList.remove('active'); last.classList.add('done');
      const fill = last.querySelector('.ls-fill');
      if (fill) { fill.style.width = '100%'; fill.style.background = 'var(--safe)'; }
      cb(result);
    }, stepIds.length * interval + 380);
  }

  function seededRng(seed) {
    let s = (seed % 2147483647) || 1;
    return () => { s = s * 16807 % 2147483647; return (s-1)/2147483646; };
  }

  function shuffle(arr, rand) {
    for (let i = arr.length-1; i > 0; i--) {
      const j = Math.floor(rand() * (i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
})();


/* ============================================================
   15. RESULTS STATE MANAGEMENT
   ============================================================ */
function resetResults() {
  document.getElementById('resultsIdle').style.display    = 'flex';
  document.getElementById('resultsLoading').style.display = 'none';
  document.getElementById('resultsOutput').style.display  = 'none';

  ['step1','step2','step3','step4'].forEach(id => {
    const el = document.getElementById(id);
    el.className = 'loading-step';
    const fill = el.querySelector('.ls-fill');
    if (fill) { fill.style.width = '0%'; fill.style.background = ''; }
  });

  const dot = document.getElementById('resDot');
  if (dot) { dot.style.background = ''; dot.style.animation = ''; }
  const label = document.getElementById('resPanelLabel');
  if (label) label.textContent = 'Analysis Results';
}

function showLoading() {
  document.getElementById('resultsIdle').style.display    = 'none';
  document.getElementById('resultsLoading').style.display = 'flex';
  document.getElementById('resultsOutput').style.display  = 'none';
  document.getElementById('step1').classList.add('active');
}

function showResults(result) {
  document.getElementById('resultsLoading').style.display = 'none';

  const output       = document.getElementById('resultsOutput');
  const verdictEl    = document.getElementById('resultVerdict');
  const verdictIcon  = document.getElementById('verdictIcon');
  const verdictLabel = document.getElementById('verdictLabel');
  const verdictDesc  = document.getElementById('verdictDesc');
  const confVal      = document.getElementById('confidenceVal');
  const confFill     = document.getElementById('confidenceFill');
  const reportList   = document.getElementById('reportList');

  const resDot = document.getElementById('resDot');
  if (resDot) {
    resDot.style.background = result.isFake ? 'var(--danger)' : 'var(--safe)';
    resDot.style.animation  = result.isFake ? 'none' : 'livePulse 2s ease infinite';
    resDot.style.boxShadow  = result.isFake
      ? '0 0 0 3px rgba(220,38,38,0.2)' : '0 0 0 3px rgba(22,163,74,0.2)';
  }
  const panelLabel = document.getElementById('resPanelLabel');
  if (panelLabel) panelLabel.textContent = result.isFake ? 'Deepfake Detected' : 'Media Authentic';

  if (result.isFake) {
    verdictEl.className = 'result-verdict fake';
    verdictIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="var(--danger-light)" stroke="var(--danger)" stroke-width="1.5"/><line x1="12" y1="9" x2="12" y2="13" stroke="var(--danger)" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="var(--danger)" stroke-width="2.5" stroke-linecap="round"/></svg>`;
    verdictLabel.textContent = 'DEEPFAKE DETECTED';
    verdictDesc.textContent  = `High-confidence AI manipulation found in this ${result.isVideo ? 'video' : 'image'}.`;
  } else {
    verdictEl.className = 'result-verdict real';
    verdictIcon.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="var(--safe-light)" stroke="var(--safe)" stroke-width="1.5"/><path d="M9 12l2 2 4-4" stroke="var(--safe)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    verdictLabel.textContent = 'APPEARS AUTHENTIC';
    verdictDesc.textContent  = `No significant AI manipulation detected in this ${result.isVideo ? 'video' : 'image'}.`;
  }

  confVal.textContent = result.conf + '%';
  confFill.className  = 'conf-fill ' + (result.isFake ? 'high' : 'low');
  setTimeout(() => { confFill.style.width = result.conf + '%'; }, 80);

  reportList.className = 'report-list ' + (result.isFake ? 'fake-list' : 'real-list');
  reportList.innerHTML = result.observations
    .map((o, i) => `<li style="animation-delay:${i * 0.12}s">${o}</li>`)
    .join('');

  // Draw radar
  if (result.radarData) drawRadar(result.radarData, result.isFake);

  output.style.display = 'flex';
}


/* ============================================================
   16. MINI RADAR CHART
   ============================================================ */
function drawRadar(data, isFake) {
  const canvas = document.getElementById('radarChart');
  const legend = document.getElementById('radarLegend');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const labels = Object.keys(data);
  const values = Object.values(data).map(v => v / 100);
  const N = labels.length;
  const cx = W / 2 - 10, cy = H / 2;
  const R = Math.min(cx, cy) * 0.75;

  function angleFor(i) { return (i / N) * Math.PI * 2 - Math.PI / 2; }

  // Grid rings
  [0.25, 0.5, 0.75, 1].forEach(t => {
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = angleFor(i);
      const x = cx + Math.cos(a) * R * t;
      const y = cy + Math.sin(a) * R * t;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(107,114,128,0.2)'; ctx.lineWidth = 1; ctx.stroke();
  });

  // Axes
  for (let i = 0; i < N; i++) {
    const a = angleFor(i);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    ctx.strokeStyle = 'rgba(107,114,128,0.2)'; ctx.lineWidth = 1; ctx.stroke();
  }

  // Filled polygon
  const color = isFake ? '220,38,38' : '22,163,74';
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const a = angleFor(i);
    const x = cx + Math.cos(a) * R * values[i];
    const y = cy + Math.sin(a) * R * values[i];
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle   = `rgba(${color},0.14)`;
  ctx.strokeStyle = `rgba(${color},0.8)`;
  ctx.lineWidth = 2;
  ctx.fill(); ctx.stroke();

  // Dots
  for (let i = 0; i < N; i++) {
    const a = angleFor(i);
    const x = cx + Math.cos(a) * R * values[i];
    const y = cy + Math.sin(a) * R * values[i];
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${color},1)`; ctx.fill();
  }

  // Labels
  ctx.font = '10px Sora, sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.textAlign = 'center';
  for (let i = 0; i < N; i++) {
    const a = angleFor(i);
    const x = cx + Math.cos(a) * (R + 14);
    const y = cy + Math.sin(a) * (R + 14);
    ctx.fillText(labels[i], x, y + 3);
  }

  // Legend
  if (legend) {
    legend.innerHTML = labels.map((l, i) => `
      <div class="rl-item">
        <span class="rl-dot" style="background:rgba(${color},0.9)"></span>
        <span>${l}: ${Math.round(values[i]*100)}%</span>
      </div>
    `).join('');
  }
}


/* ============================================================
   17. REPORT MODAL
   ============================================================ */
(function initModal() {
  const modal      = document.getElementById('reportModal');
  const modalClose = document.getElementById('modalClose');
  const viewReport = document.getElementById('viewReportBtn');
  const getHelpBtn = document.getElementById('getHelpResult');

  const open  = () => { buildModal(window._lastResult); modal.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };

  viewReport && viewReport.addEventListener('click', open);
  modalClose.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  getHelpBtn && getHelpBtn.addEventListener('click', () => {
    document.getElementById('get-help').scrollIntoView({ behavior: 'smooth' });
  });

  function buildModal(result) {
    if (!result) return;
    const mb = document.getElementById('modalBody');
    const vcl = result.isFake ? 'fake' : 'real';
    const vic = result.isFake ? '⚠' : '✓';

    mb.innerHTML = `
      <div class="modal-section">
        <div class="modal-section-title">Analysis Summary</div>
        <div class="modal-row"><span class="modal-row-label">Verdict</span><span class="modal-verdict-badge ${vcl}">${vic} ${result.verdict}</span></div>
        <div class="modal-row"><span class="modal-row-label">Confidence</span><span class="modal-row-val">${result.conf}%</span></div>
        <div class="modal-row"><span class="modal-row-label">Media Type</span><span class="modal-row-val">${result.isVideo ? 'Video' : 'Image'}</span></div>
        <div class="modal-row"><span class="modal-row-label">File</span><span class="modal-row-val" style="font-size:0.8rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(result.filename)}</span></div>
        <div class="modal-row"><span class="modal-row-label">Model</span><span class="modal-row-val">${result.model}</span></div>
        <div class="modal-row"><span class="modal-row-label">Analyzed</span><span class="modal-row-val" style="font-weight:400;color:var(--n500);font-size:0.8rem">${result.analyzedAt}</span></div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">Forensic Observations</div>
        <div class="modal-obs-list">
          ${result.observations.map(o => `<div class="modal-obs-item ${result.isFake ? 'fake-obs' : 'real-obs'}">${esc(o)}</div>`).join('')}
        </div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">What This Means</div>
        <div class="modal-explanation">${esc(result.explanation)}</div>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">Recommended Next Steps</div>
        <div class="modal-obs-list">
          ${nextSteps(result).map(s => `<div class="modal-obs-item">${esc(s)}</div>`).join('')}
        </div>
      </div>
      <p style="font-size:0.7rem;color:var(--n400);margin-top:8px;line-height:1.5">⚠ This report is generated by a simulated AI for educational purposes only.</p>
    `;
  }

  function nextSteps(r) {
    return r.isFake
      ? ['Do not share or distribute this media further.',
         'If this involves your identity, document it and contact a legal professional.',
         'Report the content to the platform or site where it was found.',
         'Use "Get Help" below to connect with a student expert for guidance.']
      : ['No immediate action required — media appears unmodified.',
         'If context suggests otherwise, seek a second forensic opinion.',
         'Keep a copy of this report for your records.',
         'Stay informed about deepfake threats through our resources.'];
  }

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
})();


/* ============================================================
   18. GET HELP FLOW
   ============================================================ */
(function initHelpFlow() {
  const step1 = document.getElementById('helpStep1');
  const step2 = document.getElementById('helpStep2');
  const back  = document.getElementById('helpBack');
  const gc    = document.getElementById('guidanceContent');

  const data = {
    understand: {
      title: 'Understanding Your Result',
      steps: [
        '"Deepfake Detected" means our AI found manipulation patterns — not a guarantee, but a strong signal requiring caution.',
        'The confidence score indicates certainty. Above 85% is high confidence; 70–85% moderate; below 70% is uncertain.',
        'Forensic observations list the specific signals detected. These are starting points, not definitive proof.',
        'For a definitive answer, consult a human forensic expert. Use Connect below to reach a student with forensics training.',
      ],
    },
    affected: {
      title: "If You Think You're Affected",
      steps: [
        "Don't panic. Document everything — save links, screenshots, and file copies with timestamps.",
        'Report the content to the platform where it appears (look for "Report" or "Flag" options).',
        'Contact a cyber law student or professional for guidance on legal options in your region.',
        'If the content is sensitive or intimate, organizations like CCRI (US) or Revenge Porn Helpline (UK) can help.',
      ],
    },
    guidance: {
      title: 'General Deepfake Guidance',
      steps: [
        'Deepfakes are increasingly used for fraud, harassment, and misinformation — awareness is your first shield.',
        'Always verify media from unusual sources. Check if the original clip exists elsewhere using reverse search.',
        'Tools like Google Reverse Image Search and TinEye help locate original media sources.',
        'Connect with our student helpers below for personalized, expert guidance at no cost.',
      ],
    },
  };

  document.querySelectorAll('.help-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = data[btn.dataset.type];
      if (!d) return;

      gc.innerHTML = `
        <h4>${d.title}</h4>
        <div class="guidance-steps">
          ${d.steps.map((s, i) => `
            <div class="guidance-step">
              <div class="gs-num">${i+1}</div><p>${s}</p>
            </div>`).join('')}
        </div>
      `;

      Object.assign(step1.style, { opacity: '0', transform: 'translateX(-18px)', transition: 'all 0.22s ease' });
      setTimeout(() => {
        step1.style.display = 'none';
        step2.style.display = 'block';
        Object.assign(step2.style, { opacity: '0', transform: 'translateX(18px)', transition: 'all 0.22s ease' });
        requestAnimationFrame(() => { step2.style.opacity = '1'; step2.style.transform = 'translateX(0)'; });
      }, 200);
    });
  });

  back.addEventListener('click', () => {
    Object.assign(step2.style, { opacity: '0', transform: 'translateX(18px)' });
    setTimeout(() => {
      step2.style.display = 'none';
      step1.style.display = 'block';
      Object.assign(step1.style, { opacity: '0', transform: 'translateX(-18px)' });
      requestAnimationFrame(() => { step1.style.opacity = '1'; step1.style.transform = 'translateX(0)'; });
    }, 200);
  });
})();


/* ============================================================
   19. SCROLL REVEAL — enhanced with stagger
   ============================================================ */
(function initReveal() {
  const selectors = [
    '.detect-wrapper > *', '.step-card', '.feature-card',
    '.helper-card', '.student-card', '.mission-card',
    '.astack', '.students-copy', '.students-cards-col',
    '.about-copy', '.about-visual', '.section-title',
    '.section-sub', '.help-flow', '.hero-stats',
    '.s3d-card', '.detection-matrix',
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal', 'reveal-stagger');
      el.style.transitionDelay = `${i * 0.055}s`;
    });
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();


/* ============================================================
   20. STATS3D BAR FILL ON SCROLL
   ============================================================ */
(function initS3dBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.s3d-bar').forEach(bar => {
          const w = getComputedStyle(bar).getPropertyValue('--w').trim() || '80%';
          setTimeout(() => { bar.style.width = w; }, 200);
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  const section = document.getElementById('stats3d');
  if (section) obs.observe(section);
})();


/* ============================================================
   21. PARALLAX — hero floaters and orbs
   ============================================================ */
(function initParallax() {
  const hero = document.getElementById('home');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const orbs = hero.querySelectorAll('.hero-orb');
    orbs.forEach((orb, i) => {
      const speed = 0.04 + i * 0.02;
      orb.style.transform = `translate(0, ${scrollY * speed}px)`;
    });
    const floaters = hero.querySelectorAll('.float-card');
    floaters.forEach((f, i) => {
      const speed = 0.06 + i * 0.01;
      f.style.transform = f.style.transform.includes('3d')
        ? f.style.transform
        : `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });
})();


/* ============================================================
   22. CONNECT BUTTONS
   ============================================================ */
(function initConnect() {
  document.querySelectorAll('.btn-connect').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[class*="card"]');
      const name = card ? card.querySelector('h4')?.textContent : 'helper';
      showToast(`Connection request sent to ${name}!`, 'success');
      btn.textContent = 'Requested ✓';
      btn.style.background = 'var(--safe-light)';
      btn.style.color = 'var(--safe)';
      btn.disabled = true;
    });
  });
})();


/* ============================================================
   23. ACTIVE NAV LINK
   ============================================================ */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  const navObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      links.forEach(l => {
        const active = l.getAttribute('href') === `#${id}`;
        l.style.color      = active ? 'var(--accent)' : '';
        l.style.background = active ? 'var(--accent-light)' : '';
      });
    });
  }, { threshold: 0.45 });

  sections.forEach(s => navObs.observe(s));
})();


/* ============================================================
   TOAST UTILITY
   ============================================================ */
function showToast(msg, type = 'info') {
  document.querySelectorAll('.toast-tl').forEach(t => t.remove());
  const c = { success: ['var(--safe)', '✓'], error: ['var(--danger)', '✕'], info: ['var(--accent)', 'ℹ'] }[type] || ['var(--accent)', 'ℹ'];

  const t = document.createElement('div');
  t.className = 'toast-tl';
  t.innerHTML = `
    <div style="width:24px;height:24px;border-radius:50%;background:${c[0]};color:#fff;font-size:0.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${c[1]}</div>
    <span>${msg}</span>
  `;
  Object.assign(t.style, {
    position:'fixed', bottom:'28px', left:'50%',
    transform:'translateX(-50%) translateY(14px)',
    background:'#fff', border:'1.5px solid var(--n200)',
    borderRadius:'50px', padding:'9px 20px 9px 9px',
    display:'flex', alignItems:'center', gap:'10px',
    fontFamily:'var(--body)', fontSize:'0.86rem', color:'var(--n800)',
    boxShadow:'0 12px 40px rgba(0,0,0,0.14)', zIndex:'9999',
    transition:'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
    opacity:'0', whiteSpace:'nowrap', maxWidth:'calc(100vw - 48px)',
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}