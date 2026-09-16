/* ---------------- BOOT LOADER ---------------- */
(function bootLoader(){
  const log = document.getElementById('loaderLog');
  const fill = document.getElementById('loaderFill');
  const loader = document.getElementById('loader');
  const lines = [
    'booting portfolio.exe',
    'loading model weights',
    'connecting datasets',
    'rendering interface',
    'ready.'
  ];
  let i = 0;
  const step = () => {
    if(i < lines.length){
      log.textContent = '> ' + lines[i];
      fill.style.width = ((i+1)/lines.length*100) + '%';
      i++;
      setTimeout(step, 260);
    } else {
      setTimeout(()=> loader.classList.add('done'), 250);
    }
  };
  step();
})();

/* ---------------- CURSOR GLOW ---------------- */
(function cursorGlow(){
  const glow = document.getElementById('cursorGlow');
  if(!glow) return;
  window.addEventListener('mousemove', (e)=>{
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });
})();

/* ---------------- PARTICLE NETWORK BACKGROUND ---------------- */
(function particleNet(){
  const canvas = document.getElementById('net');
  const ctx = canvas.getContext('2d');
  let w, h, points = [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(70, Math.floor((w*h)/22000));
    points = Array.from({length: count}, ()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-0.5)*0.3,
      vy: (Math.random()-0.5)*0.3
    }));
  }

  function frame(){
    ctx.clearRect(0,0,w,h);
    for(const p of points){
      p.x += p.vx; p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;
    }
    for(let a=0; a<points.length; a++){
      for(let b=a+1; b<points.length; b++){
        const dx = points[a].x - points[b].x;
        const dy = points[a].y - points[b].y;
        const dist = Math.hypot(dx,dy);
        if(dist < 140){
          ctx.strokeStyle = `rgba(110,163,255,${0.12 * (1 - dist/140)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[a].x, points[a].y);
          ctx.lineTo(points[b].x, points[b].y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = 'rgba(150,190,255,0.5)';
    for(const p of points){
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.4, 0, Math.PI*2);
      ctx.fill();
    }
    if(!reduceMotion) requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  frame();
})();

/* ---------------- TYPEWRITER ---------------- */
(function typewriter(){
  const el = document.getElementById('typewriter');
  if(!el) return;
  const phrases = [
    'AI & Data Science Student',
    'Machine Learning Enthusiast',
    'Turning Data Into Decisions'
  ];
  let p = 0, c = 0, deleting = false;

  function tick(){
    const current = phrases[p];
    el.textContent = deleting ? current.slice(0, c--) : current.slice(0, c++);

    let delay = deleting ? 35 : 55;
    if(!deleting && c === current.length + 1){ delay = 1400; deleting = true; }
    if(deleting && c === 0){ deleting = false; p = (p+1) % phrases.length; delay = 400; }

    setTimeout(tick, delay);
  }
  tick();
})();

/* ---------------- SCROLL REVEAL ---------------- */
(function scrollReveal(){
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(item=> io.observe(item));
})();

/* ---------------- PIPELINE TIMELINE ---------------- */
(function timeline(){
  const dot = document.getElementById('timelineDot');
  const track = document.querySelector('.timeline');
  const stages = document.querySelectorAll('.tl-stage');
  if(!dot || !track || !stages.length) return;

  let started = false;
  function playStages(){
    if(started) return;
    started = true;
    let i = 0;
    const positions = ['0%','33.33%','66.66%','100%'];
    function step(){
      stages.forEach(s => s.classList.remove('active'));
      stages[i].classList.add('active');
      dot.style.left = positions[i];
      i = (i+1) % stages.length;
    }
    step();
    setInterval(step, 2200);
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        playStages();
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  io.observe(track);
})();

/* ---------------- LIVE TERMINAL TYPING ---------------- */
(function terminalDemo(){
  const codeEl = document.getElementById('terminalCode');
  const outputEl = document.getElementById('terminalOutput');
  const section = document.querySelector('.terminal-section');
  if(!codeEl || !section) return;

  const code = `>>> import pandas as pd
>>> from sklearn.ensemble import RandomForestClassifier
>>>
>>> df = pd.read_csv("customers.csv")
>>> X_train, X_test, y_train, y_test = split(df)
>>>
>>> model = RandomForestClassifier()
>>> model.fit(X_train, y_train)
>>> print(f"Accuracy: {model.score(X_test, y_test):.2f}")
Accuracy: 0.92`;

  let played = false;
  function typeCode(){
    if(played) return;
    played = true;
    let i = 0;
    function tick(){
      if(i <= code.length){
        codeEl.textContent = code.slice(0, i);
        i += 2;
        setTimeout(tick, 12);
      } else {
        outputEl.classList.add('show');
        document.querySelectorAll('.chart-bar i').forEach(bar=>{
          bar.style.width = bar.dataset.val + '%';
        });
      }
    }
    tick();
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        typeCode();
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  io.observe(section);
})();

/* ---------------- ANIMATED COUNTERS ---------------- */
(function counters(){
  const nums = document.querySelectorAll('.mnum-val');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const target = parseInt(entry.target.dataset.count, 10);
        const duration = 1200;
        const start = performance.now();
        function step(now){
          const progress = Math.min((now - start)/duration, 1);
          const eased = 1 - Math.pow(1-progress, 3);
          entry.target.textContent = Math.round(eased * target);
          if(progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  nums.forEach(n=> io.observe(n));
})();

/* ---------------- PROJECT CARD TILT ---------------- */
(function tiltCards(){
  const cards = document.querySelectorAll('[data-tilt]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion) return;

  cards.forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotX = ((y / rect.height) - 0.5) * -6;
      const rotY = ((x / rect.width) - 0.5) * 6;
      card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.setProperty('--mx', `${(x/rect.width)*100}%`);
      card.style.setProperty('--my', `${(y/rect.height)*100}%`);
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = 'perspective(700px) rotateX(0) rotateY(0)';
    });
  });
})();

/* ---------------- NAV: ACTIVE LINK + MOBILE MENU ---------------- */
(function nav(){
  const links = document.querySelectorAll('.nav-link');
  const sections = Array.from(links).map(l => document.getElementById(l.dataset.target));
  const menuBtn = document.getElementById('menuBtn');
  const navList = document.getElementById('navList');

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const id = entry.target.id;
      const link = document.querySelector(`.nav-link[data-target="${id}"]`);
      if(entry.isIntersecting && link){
        links.forEach(l=> l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s=> s && io.observe(s));

  menuBtn.addEventListener('click', ()=>{
    navList.classList.toggle('open');
  });
  links.forEach(l => l.addEventListener('click', ()=> navList.classList.remove('open')));
})();
