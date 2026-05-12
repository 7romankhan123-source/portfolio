'use strict';

/* ── Preloader — 1s max ─────────────────────────── */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (pre) setTimeout(() => pre.remove(), 1600);
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration:600, easing:'cubic-bezier(.4,0,.2,1)', once:true, offset:55 });
  }
  initCounters();
});

/* ── Scroll progress + navbar ───────────────────── */
const spb    = document.getElementById('spb');
const navbar = document.getElementById('navbar');
let ticking  = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      if (spb) spb.style.width = (sy / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
      navbar?.classList.toggle('scrolled', sy > 55);
      highlightNav();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

/* ── Custom Cursor (desktop only) ───────────────── */
if (window.matchMedia('(pointer:fine)').matches) {
  const dot  = document.getElementById('curDot');
  const ring = document.getElementById('curRing');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (dot) { dot.style.left = mx+'px'; dot.style.top = my+'px'; }
  }, { passive: true });
  (function followRing() {
    rx += (mx-rx)*.12; ry += (my-ry)*.12;
    if (ring) { ring.style.left = rx+'px'; ring.style.top = ry+'px'; }
    requestAnimationFrame(followRing);
  })();
  document.querySelectorAll('a,button,.pcard,.tcard,.ch,.pillar').forEach(el => {
    el.addEventListener('mouseenter', () => ring?.classList.add('big'), { passive: true });
    el.addEventListener('mouseleave', () => ring?.classList.remove('big'), { passive: true });
  });
}

/* ── Navbar ─────────────────────────────────────── */
const burger  = document.getElementById('burger');
const navMenu = document.getElementById('navMenu');

burger?.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('click', e => {
  if (navMenu?.classList.contains('open') && !navMenu.contains(e.target) && !burger.contains(e.target)) closeMenu();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

function closeMenu() {
  burger?.classList.remove('open');
  navMenu?.classList.remove('open');
  burger?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function highlightNav() {
  const sy = window.scrollY + 130;
  document.querySelectorAll('section[id]').forEach(s => {
    const link = document.querySelector(`.nav-item[href="#${s.id}"]`);
    if (link) link.classList.toggle('active', sy >= s.offsetTop && sy < s.offsetTop + s.offsetHeight);
  });
}

/* ── Smooth scroll ──────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - 75, behavior: 'smooth' }); }
  });
});

/* ── Typing Effect ──────────────────────────────── */
const PHRASES = ['AI Developer','Python Expert','ML Engineer','Data Scientist','Problem Solver'];
let pi=0,ci=0,del=false;
function typeLoop() {
  const el = document.getElementById('typedEl');
  if (!el) return;
  del ? ci-- : ci++;
  el.textContent = PHRASES[pi].slice(0, ci);
  if (!del && ci === PHRASES[pi].length)  { del=true; setTimeout(typeLoop,1800); return; }
  if (del && ci === 0)                    { del=false; pi=(pi+1)%PHRASES.length; setTimeout(typeLoop,380); return; }
  setTimeout(typeLoop, del ? 42 : 80);
}
setTimeout(typeLoop, 800);

/* ── Hero Canvas — optimized ────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('hCanvas');
  if (!canvas || window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let nodes=[], raf, W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildNodes();
  }
  function buildNodes() {
    const n = Math.min(Math.floor(W*H/22000), 45); // fewer nodes = faster
    nodes = Array.from({length:n}, () => ({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.32, vy:(Math.random()-.5)*.32,
      r:Math.random()*1.5+.8, op:Math.random()*.4+.2
    }));
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    nodes.forEach(n => {
      n.x+=n.vx; n.y+=n.vy;
      if(n.x<0||n.x>W) n.vx*=-1;
      if(n.y<0||n.y>H) n.vy*=-1;
    });
    const MAX=130;
    for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) {
      const dx=nodes[j].x-nodes[i].x, dy=nodes[j].y-nodes[i].y, d=dx*dx+dy*dy;
      if (d<MAX*MAX) {
        ctx.beginPath();
        ctx.strokeStyle=`rgba(99,102,241,${(1-Math.sqrt(d)/MAX)*.18})`;
        ctx.lineWidth=.6;
        ctx.moveTo(nodes[i].x,nodes[i].y);
        ctx.lineTo(nodes[j].x,nodes[j].y);
        ctx.stroke();
      }
    }
    nodes.forEach(n => {
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(165,140,250,${n.op})`; ctx.fill();
    });
    raf=requestAnimationFrame(draw);
  }
  resize(); draw();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { cancelAnimationFrame(raf); resize(); draw(); }, 250);
  }, {passive:true});
})();

/* ── Skill Bars ─────────────────────────────────── */
const skillsEl = document.querySelector('.skills-layout');
if (skillsEl) {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.querySelectorAll('.bfill').forEach(b => b.classList.add('on'));
    });
  }, { threshold:.25 }).observe(skillsEl);
}

/* ── Accuracy Bar ───────────────────────────────── */
const pfcEl = document.querySelector('.pfc');
if (pfcEl) {
  new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.querySelectorAll('.accbar').forEach(b => b.classList.add('on')); });
  }, { threshold:.4 }).observe(pfcEl);
}

/* ── Number Counters ────────────────────────────── */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count;
      let cur=0; const step=target/48;
      const t = setInterval(() => {
        cur = Math.min(cur+step, target);
        el.textContent = Math.floor(cur);
        if (cur>=target) clearInterval(t);
      }, 24);
      obs.unobserve(el);
    });
  }, {threshold:.5});
  document.querySelectorAll('.nval[data-count]').forEach(el => obs.observe(el));
}

/* ── Card Tilt (desktop only) ───────────────────── */
if (window.matchMedia('(pointer:fine)').matches) {
  document.querySelectorAll('.pcard,.pfc').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r=card.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)/(r.width/2);
      const dy=(e.clientY-r.top-r.height/2)/(r.height/2);
      card.style.transform=`perspective(800px) rotateX(${dy*-3}deg) rotateY(${dx*3}deg) translateY(-4px)`;
    }, { passive: true });
    card.addEventListener('mouseleave', () => {
      card.style.transition='transform .35s cubic-bezier(.4,0,.2,1)';
      card.style.transform='';
      setTimeout(()=>card.style.transition='',380);
    });
  });
}

/* ── Contact Form ───────────────────────────────── */
const cfForm   = document.getElementById('contactForm');
const cfSubmit = document.getElementById('cfSubmit');
const cfStatus = document.getElementById('cfStatus');

cfForm?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!validateForm()) return;
  const body = {
    name:    document.getElementById('cf-name').value.trim(),
    email:   document.getElementById('cf-email').value.trim(),
    phone:   document.getElementById('cf-phone').value.trim(),
    subject: document.getElementById('cf-subject').value,
    message: document.getElementById('cf-message').value.trim(),
  };
  setBtnState('loading');
  try {
    const fd = new FormData();
    Object.entries(body).forEach(([k,v]) => fd.append(k,v));
    fd.append('_captcha', 'false');
    const res = await fetch('https://formsubmit.co/ajax/muhammadullah6401@gmail.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: fd
    });
    const data = await res.json();
    if (data.success === 'true' || data.success === true) {
      setBtnState('idle');
      showStatus('ok', '✅ Message sent! I\'ll reply within 24 hours.');
      cfForm.reset();
    } else throw new Error('Failed');
  } catch (err) {
    setBtnState('idle');
    const fb = 'muhammadullah6401@gmail.com';
    const mb = encodeURIComponent(`Name: ${body.name}\nEmail: ${body.email}\n\n${body.message}`);
    showStatus('err', `❌ Could not send. <a href="mailto:${fb}?subject=${encodeURIComponent('Portfolio contact from '+body.name)}&body=${mb}" style="color:#f87171;text-decoration:underline">Send via email instead →</a>`);
  }
});

function validateForm() {
  let ok=true;
  [{id:'cf-name',err:'err-name',fn:v=>v.length>=2,msg:'Name required (min 2 chars).'},
   {id:'cf-email',err:'err-email',fn:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),msg:'Valid email required.'},
   {id:'cf-message',err:'err-message',fn:v=>v.length>=10,msg:'Message too short (min 10 chars).'}
  ].forEach(({id,err,fn,msg}) => {
    const el=document.getElementById(id), e=document.getElementById(err);
    const v=(el?.value||'').trim();
    if (!fn(v)) { if(e)e.textContent=msg; el?.classList.add('invalid'); ok=false; }
    else        { if(e)e.textContent='';  el?.classList.remove('invalid'); }
  });
  if (!document.getElementById('cf-subject')?.value) { showStatus('err','⚠️ Please select a subject.'); ok=false; }
  return ok;
}

function setBtnState(state) {
  const inn  = cfSubmit?.querySelector('.cf-binn');
  const load = cfSubmit?.querySelector('.cf-bload');
  if (!inn||!load) return;
  if (state==='loading') { inn.style.display='none'; load.style.display='flex'; cfSubmit.disabled=true; }
  else                   { inn.style.display='flex'; load.style.display='none'; cfSubmit.disabled=false; }
}
function showStatus(type, html) {
  if (!cfStatus) return;
  cfStatus.innerHTML=html; cfStatus.className=`cf-status ${type}`;
  if (type==='ok') setTimeout(()=>{ cfStatus.textContent=''; cfStatus.className='cf-status'; },6000);
}
['cf-name','cf-email','cf-message'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', function() {
    this.classList.remove('invalid');
    const e=document.getElementById('err-'+id.replace('cf-',''));
    if(e) e.textContent='';
  }, { passive: true });
});
