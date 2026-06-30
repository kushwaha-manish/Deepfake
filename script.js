// Custom cursor
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
if (cursorDot && cursorRing && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
  });
  function animateRing(){
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();
  document.querySelectorAll('a, button, .skill-card, .project-card, .about-card, .contact-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
  });
}

// Constellation animated background (hero)
const canvas = document.getElementById('constellation');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let w, h, points;
  function resizeCanvas(){
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  function initPoints(){
    const count = Math.floor((w * h) / 18000);
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3
    }));
  }
  function drawConstellation(){
    ctx.clearRect(0, 0, w, h);
    points.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    });
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(59,110,240,${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59,110,240,0.45)';
      ctx.fill();
    });
    requestAnimationFrame(drawConstellation);
  }
  resizeCanvas();
  initPoints();
  drawConstellation();
  window.addEventListener('resize', () => {
    resizeCanvas();
    initPoints();
  });
}

// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Active link on scroll
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === '#' + current) item.classList.add('active');
  });
});

// Navbar shadow on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  else navbar.style.boxShadow = 'none';
});

// Resume buttons - placeholder alert
document.getElementById('resumeBtn').addEventListener('click', () => {
  window.open('resume.pdf', '_blank');
});
document.getElementById('downloadResume').addEventListener('click', (e) => {
  e.preventDefault();
  window.open('resume.pdf', '_blank');
});
document.getElementById('resumeCard2').addEventListener('click', (e) => {
  e.preventDefault();
  window.open('resume.pdf', '_blank');
});

// Contact form (front-end only demo)
document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  alert('Thanks for reaching out! This form is currently a front-end demo — connect it to a service like Formspree or EmailJS to receive real messages.');
  this.reset();
});

// Animated stat counters (used in hero + matrix section)
const animateCounter = (el) => {
  const target = parseFloat(el.getAttribute('data-target'));
  const isDecimal = el.getAttribute('data-decimal') === 'true';
  const duration = 1400;
  const start = performance.now();
  function step(now){
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    el.textContent = isDecimal ? value.toFixed(2) : Math.round(value);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = isDecimal ? target.toFixed(2) : target;
  }
  requestAnimationFrame(step);
};
const countersRunFlags = new WeakMap();
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num');
      nums.forEach(n => {
        if (!countersRunFlags.get(n)) {
          countersRunFlags.set(n, true);
          animateCounter(n);
        }
      });
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.stat-row, .matrix-stats').forEach(row => statObserver.observe(row));

// 3D tilt effect on hover for cards
const tiltCards = document.querySelectorAll('.about-card, .skill-card, .project-card');
tiltCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
  });
});

// Reveal animation on scroll
const revealEls = document.querySelectorAll('.about-card, .skill-card, .project-card, .milestone-card, .contact-card, .process-card, .scan-card, .matrix-stat');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  revealObserver.observe(el);
});

// Terminal typing animation (Explore section)
const terminalBody = document.getElementById('terminalBody');
let terminalRun = false;
function typeTerminal(){
  if (terminalRun) return;
  terminalRun = true;
  const lines = terminalBody.querySelectorAll('.t-line');
  let lineIndex = 0;

  function typeLine(){
    if (lineIndex >= lines.length) {
      const fill = document.getElementById('confidenceFill');
      if (fill) fill.style.width = '92%';
      return;
    }
    const line = lines[lineIndex];
    const text = line.getAttribute('data-text');
    let charIndex = 0;
    line.classList.add('typing');
    line.textContent = '';
    const typeChar = setInterval(() => {
      line.textContent = text.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex >= text.length) {
        clearInterval(typeChar);
        line.classList.remove('typing');
        lineIndex++;
        setTimeout(typeLine, 220);
      }
    }, 18);
  }
  typeLine();
}
const terminalObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) typeTerminal();
  });
}, { threshold: 0.4 });
if (terminalBody) terminalObserver.observe(terminalBody);

// Skill bars fill on scroll
const skillFills = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const level = entry.target.getAttribute('data-level');
      entry.target.style.width = level + '%';
    }
  });
}, { threshold: 0.3 });
skillFills.forEach(fill => skillObserver.observe(fill));

// Live activity grid (matrix section)
const liveGrid = document.getElementById('liveGrid');
if (liveGrid) {
  const cellCount = 84;
  for (let i = 0; i < cellCount; i++) {
    const cell = document.createElement('div');
    cell.className = 'live-cell';
    cell.style.animationDelay = (Math.random() * 3) + 's';
    liveGrid.appendChild(cell);
  }
}
