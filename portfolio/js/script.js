const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   Photo: assets/photo.png loads by convention. If it's not
   there yet, we fall back to the placeholder silhouette and
   show a small hint. No path-editing required just drop a
   file named exactly "photo.png" into /assets.
--------------------------------------------------------- */
const portraitImg = document.getElementById('portraitImg');
const photoHint = document.getElementById('photoHint');

function markPhotoLoaded(){
  portraitImg.classList.add('is-loaded');
  photoHint.classList.add('is-hidden');
}
function markPhotoMissing(){
  portraitImg.classList.remove('is-loaded');
  photoHint.classList.remove('is-hidden');
  photoHint.textContent = 'Portrait unavailable';
}
portraitImg.addEventListener('load', () => {
  // a 0-byte or broken placeholder can still "load" with 0 dimensions
  if (portraitImg.naturalWidth > 0) markPhotoLoaded();
  else markPhotoMissing();
});
portraitImg.addEventListener('error', markPhotoMissing);
if (portraitImg.complete) {
  if (portraitImg.naturalWidth > 0) markPhotoLoaded(); else markPhotoMissing();
}

/* ---------------------------------------------------------
   Resume link: if assets/resume.pdf 404s, swap the button
   label so it's honest instead of silently broken.
--------------------------------------------------------- */
async function checkResume(){
  try {
    const res = await fetch('assets/resume.pdf', { method: 'HEAD' });
    if (!res.ok) throw new Error('missing');
  } catch (e) {
    document.querySelectorAll('#navResumeBtn, a[href="assets/resume.pdf"]').forEach(el => {
      el.textContent = 'RESUME →';
      el.style.opacity = '0.6';
    });
  }
}
checkResume();

/* ---------------------------------------------------------
   Hero mouse-driven tilt (grid parallax + photo tilt)
--------------------------------------------------------- */
const heroEl = document.getElementById('hero');
const gridBg = document.getElementById('gridBg');
const portraitWrap = document.getElementById('portraitWrap');

if (!reduceMotion) {
  heroEl.addEventListener('mousemove', (e) => {
    const r = heroEl.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gridBg.style.transform = `translateZ(-200px) scale(1.2) translate(${px * -24}px, ${py * -24}px)`;
    portraitWrap.style.transform = `rotateY(${-6 + px * 14}deg) rotateX(${2 - py * 10}deg) translateZ(20px)`;
  });
  heroEl.addEventListener('mouseleave', () => {
    portraitWrap.style.transform = 'rotateY(-6deg) rotateX(2deg) translateZ(0)';
    gridBg.style.transform = 'translateZ(-200px) scale(1.2)';
  });
}

/* ---------------------------------------------------------
   Three.js node-graph the hero's signature 3D element,
   echoing the DAG orchestrator from AI_Agent.
--------------------------------------------------------- */
(function initGraph(){
  try {
  if (typeof THREE === 'undefined') throw new Error('THREE failed to load');
  const canvas = document.getElementById('graph-canvas');
  const stage = document.getElementById('stage');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 0, 9);

  function resize(){
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const group = new THREE.Group();
  scene.add(group);

  const nodeCount = 9;
  const positions = [];
  const geo = new THREE.SphereGeometry(0.05, 12, 12);
  const mat = new THREE.MeshBasicMaterial({ color: 0xF0A84E });

  for (let i = 0; i < nodeCount; i++){
    const theta = (i / nodeCount) * Math.PI * 2;
    const radius = 2.4 + Math.random() * 1.2;
    const x = Math.cos(theta) * radius * (0.5 + Math.random()*0.5);
    const y = (Math.random() - 0.5) * 4.5;
    const z = Math.sin(theta) * radius * 0.6;
    positions.push(new THREE.Vector3(x, y, z));
    const m = new THREE.Mesh(geo, mat.clone());
    m.material.opacity = 0.85; m.material.transparent = true;
    m.position.copy(positions[i]);
    group.add(m);
  }

  const lineMat = new THREE.LineBasicMaterial({ color: 0x3E5688, transparent:true, opacity:0.55 });
  for (let i = 0; i < nodeCount - 1; i++){
    if (Math.random() > 0.35) {
      const a = positions[i], b = positions[(i + 1 + Math.floor(Math.random()*2)) % nodeCount];
      const g = new THREE.BufferGeometry().setFromPoints([a, b]);
      group.add(new THREE.Line(g, lineMat));
    }
  }

  let mouseX = 0, mouseY = 0;
  if (!reduceMotion){
    heroEl.addEventListener('mousemove', (e) => {
      const r = heroEl.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width - 0.5;
      mouseY = (e.clientY - r.top) / r.height - 0.5;
    });
  }

  function animate(){
    requestAnimationFrame(animate);
    if (!reduceMotion){
      group.rotation.y += 0.0022 + mouseX * 0.001;
      group.rotation.x += (mouseY * 0.3 - group.rotation.x) * 0.02;
    }
    renderer.render(scene, camera);
  }
  animate();
  } catch (e) {
    // 3D graph is decorative only if it fails (no WebGL, CDN blocked, etc.)
    // hide the canvas and keep the rest of the page (About/Work/Stack/Contact) working.
    console.warn('Hero graph disabled:', e);
    const stage = document.getElementById('stage');
    if (stage) stage.classList.add('graph-disabled');
  }
})();

/* ---------------------------------------------------------
   Stack grouped by category. Edit this config to update
   what shows up on the site; nothing else needs to change.
   "note" is your honest comfort-level line for that group.
--------------------------------------------------------- */
const STACK_GROUPS = [
  {
    title: 'Languages',
    note: 'Write these daily Python for ML pipelines and backend logic, JavaScript for the frontend, C from coursework fundamentals.',
    items: [
      { label: 'Python', color: '#F0A84E' },
      { label: 'JavaScript', color: '#61DAFB' },
      { label: 'C', color: '#5B8DEF' },
    ],
  },
  {
    title: 'Frameworks',
    note: 'Comfortable building real features with these, not just following tutorials.',
    items: [
      { label: 'scikit-learn', color: '#5B8DEF' },
      { label: 'React', color: '#61DAFB' },
      { label: 'Streamlit', color: '#EB5757' },
      { label: 'Gradio', color: '#F0A84E' },
    ],
  },
  {
    title: 'Tools',
    note: 'Daily workflow version control, testing, CI, and caching layers.',
    items: [
      { label: 'Git / GitHub', color: '#6FCF97' },
      { label: 'GitHub Actions', color: '#5B8DEF' },
      { label: 'Redis', color: '#EB5757' },
      { label: 'pytest', color: '#F0A84E' },
    ],
  },
  {
    title: 'Currently learning',
    note: 'Actively leveling up evaluated both while building AI_Agent\'s orchestration layer.',
    items: [
      { label: 'LangGraph', color: '#6FCF97' },
      { label: 'CrewAI', color: '#F0A84E' },
    ],
  },
];

function scatterBadges(container, list, opts){
  const { count = list.length, minTop = 5, maxTop = 90, minLeft = 5, maxLeft = 90 } = opts || {};
  for (let i = 0; i < count; i++){
    const item = list[i % list.length];
    const el = document.createElement('span');
    el.className = 'float-badge';
    el.innerHTML = `<span class="dot" style="background:${item.color}"></span>${item.label}`;
    el.style.top = `${minTop + Math.random() * (maxTop - minTop)}%`;
    el.style.left = `${minLeft + Math.random() * (maxLeft - minLeft)}%`;
    el.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
    el.style.animationDuration = `${(6 + Math.random() * 3).toFixed(2)}s`;
    container.appendChild(el);
  }
}

// hero background field sparse sample pulled from every group
const ALL_STACK_ITEMS = STACK_GROUPS.flatMap(g => g.items);
scatterBadges(document.getElementById('badgeField'), ALL_STACK_ITEMS, { count:6, minLeft:58, maxLeft:96, minTop:6, maxTop:88 });

// dedicated Stack section one panel per category, badges floating within it
const stackGroupsEl = document.getElementById('stackGroups');
STACK_GROUPS.forEach(group => {
  const panel = document.createElement('div');
  panel.className = 'stack-group reveal';
  panel.innerHTML = `<h5>${group.title}</h5><p class="group-note">${group.note}</p><div class="badge-well"></div>`;
  stackGroupsEl.appendChild(panel);
  const well = panel.querySelector('.badge-well');
  scatterBadges(well, group.items, { count: group.items.length, minLeft:2, maxLeft:60, minTop:2, maxTop:70 });
  // .reveal class is picked up by the single scroll-reveal observer set up below,
  // since these panels are inserted before that observer runs.
});

/* ---------------------------------------------------------
   Project media screenshots or short clips, same drop-in
   convention as the photo/resume. For each project, save:
     assets/projects/<slug>.mp4   (preferred short clip)
     assets/projects/<slug>.png   (screenshot, used if no video)
   Nothing to edit in code the site checks both automatically
   and falls back to a placeholder if neither exists yet.
--------------------------------------------------------- */
async function loadProjectMedia(container){
  const slug = container.dataset.slug;
  const fallback = container.querySelector('.media-fallback');

  const videoPath = `assets/projects/${slug}.mp4`;
  const imgPath = `assets/projects/${slug}.png`;

  try {
    const res = await fetch(videoPath, { method: 'HEAD' });
    if (res.ok) {
      const video = document.createElement('video');
      video.src = videoPath;
      video.autoplay = true; video.loop = true; video.muted = true; video.playsInline = true;
      container.prepend(video);
      container.classList.add('has-media');
      return;
    }
  } catch (e) { /* fall through to image check */ }

  const img = new Image();
  img.onload = () => {
    img.className = 'media-real';
    img.alt = `${slug} screenshot`;
    container.prepend(img);
    container.classList.add('has-media');
  };
  img.onerror = () => { /* neither found leave the fallback visible */ };
  img.src = imgPath;
}

document.querySelectorAll('.project-media').forEach(loadProjectMedia);

/* ---------------------------------------------------------
   Scroll-reveal for section content
--------------------------------------------------------- */
if (!reduceMotion && 'IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
}

/* ---------------------------------------------------------
   Preview panel instant in-browser preview only.
   For the real deployed site, save the same files into
   /assets/photo.png and /assets/resume.pdf and redeploy.
--------------------------------------------------------- */
const previewToggle = document.getElementById('previewToggle');
const previewPanel = document.getElementById('previewPanel');
const closePreview = document.getElementById('closePreview');
const photoInput = document.getElementById('photoInput');
const resumeInput = document.getElementById('resumeInput');

previewToggle.addEventListener('click', () => previewPanel.classList.toggle('is-open'));
closePreview.addEventListener('click', () => previewPanel.classList.remove('is-open'));

photoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  portraitImg.src = url;
});

resumeInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  document.querySelectorAll('#navResumeBtn, a[href="assets/resume.pdf"]').forEach(el => {
    el.href = url;
    el.textContent = 'Download Resume ↓';
    el.style.opacity = '1';
    el.removeAttribute('download'); // blob download works without the attribute in most browsers
  });
});
