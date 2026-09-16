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

/* ---------------- LIQUID WAVE BACKGROUND (blue shader) ---------------- */
(function waveBackground(){
  const canvas = document.getElementById('waveBg');
  if(!canvas) return;
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if(!gl) return;

  const vertexSrc = `
    attribute vec2 aPosition;
    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentSrc = `
    precision highp float;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uMouse;

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
        float aspect = uResolution.x / uResolution.y;

        float time = uTime * 0.08;
        float scroll = uScroll;

        float angle1 = 0.6;
        float angle2 = -0.7;
        float angle3 = 1.2;

        float freq1 = 2.4;
        float freq2 = 3.2;
        float freq3 = 4.0;

        vec2 warpedUv = uv;
        float scrollDeform = scroll * 5.0;

        warpedUv.x += sin(uv.y * 2.5 + time * 0.2 + scrollDeform) * 0.35;
        warpedUv.y += cos(uv.x * 2.5 - time * 0.15 - scrollDeform * 0.8) * 0.35;

        warpedUv.x += sin(uv.y * 1.2 - time * 0.1 - scrollDeform * 1.5) * 0.25;
        warpedUv.y += cos(uv.x * 1.2 + time * 0.18 + scrollDeform * 1.2) * 0.25;

        vec2 scrollDrift = vec2(scroll * 0.04, -scroll * 0.02);
        vec2 mouseShift = vec2(uMouse.x * aspect * 0.05, uMouse.y * 0.05);
        warpedUv += scrollDrift + mouseShift;

        vec2 dir1 = vec2(cos(angle1), sin(angle1));
        vec2 dir2 = vec2(cos(angle2), sin(angle2));
        vec2 dir3 = vec2(cos(angle3), sin(angle3));

        float w1 = sin(dot(warpedUv, dir1) * freq1 + time * 1.0);
        float w2 = cos(dot(warpedUv, dir2) * freq2 - time * 1.4 + w1 * 0.4);
        float w3 = sin(dot(warpedUv, dir3) * freq3 + time * 1.8 + w2 * 0.5);

        float waveField = w1 * 0.50 + w2 * 0.35 + w3 * 0.15;

        float wideSheen = pow(max(0.0, 1.0 - abs(waveField - 0.1)), 2.5);
        float crispSpecular = pow(max(0.0, 1.0 - abs(waveField - 0.15)), 8.0);
        float crest = wideSheen * 0.5 + crispSpecular * 0.9;

        vec3 colShadow = vec3(0.004, 0.007, 0.014);
        vec3 colWave1  = vec3(0.024, 0.062, 0.150);
        vec3 colWave2  = vec3(0.012, 0.034, 0.090);
        vec3 colCrest  = vec3(0.28, 0.58, 0.95);

        vec3 color = colShadow;
        color = mix(color, colWave2, smoothstep(-0.6, 0.2, waveField));
        color = mix(color, colWave1, smoothstep(0.0, 0.8, waveField));
        color += colCrest * crest * 1.3;

        float vignette = 1.0 - dot(uv, uv) * 0.12;
        color *= vignette;

        gl_FragColor = vec4(color, 1.0);
    }
  `;

  function compile(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, vertexSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fragmentSrc);
  if(!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.error(gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, 'uResolution');
  const uTime = gl.getUniformLocation(program, 'uTime');
  const uScroll = gl.getUniformLocation(program, 'uScroll');
  const uMouse = gl.getUniformLocation(program, 'uMouse');

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e)=>{
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  const start = performance.now();
  function frame(now){
    const t = (now - start) / 1000;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scroll = maxScroll > 0 ? window.scrollY / maxScroll : 0;

    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uScroll, scroll);
    gl.uniform2f(uMouse, mouseX, -mouseY);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if(!reduceMotion) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
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
