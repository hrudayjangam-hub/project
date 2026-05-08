/* PixelMind AI – app.js */
'use strict';

/* STATE */
let generatedImageUrl = '';
let selectedSize = '1024x1024';
let selectedQuality = 'standard';
let selectedFrames = 6;
let selectedRes = 720;
let isGenerating = false;
let videoBlob = null;
let currentMediaType = 'image';
let voiceEnabled = false;

/* PRELOADER */
window.addEventListener('load', () => {
  setTimeout(() => {
    const pre = document.getElementById('preloader');
    if (pre) { pre.classList.add('hidden'); setTimeout(() => pre.remove(), 700); }
    initParticles();
    renderHistory();
    const inp = document.getElementById('main-input');
    if (inp) inp.focus();
  }, 1000);
});

/* PARTICLES */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
  const pts = Array.from({ length: 55 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.5 + 0.3,
    dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
    a: Math.random() * 0.4 + 0.1,
    c: ['#a855f7', '#6366f1', '#ec4899'][Math.floor(Math.random() * 3)]
  }));
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  })();
}

/* NAV */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* MODE SWITCHING */
function switchMode(mode) {
  document.getElementById('mode-image').style.display = mode === 'image' ? 'flex' : 'none';
  document.getElementById('mode-video').style.display = mode === 'video' ? 'flex' : 'none';
  document.getElementById('tab-img').classList.toggle('active', mode === 'image');
  document.getElementById('tab-vid').classList.toggle('active', mode === 'video');
}

function switchStudio(panel) {
  document.getElementById('studio-generate').style.display = panel === 'generate' ? 'flex' : 'none';
  document.getElementById('studio-edit').style.display = panel === 'edit' ? 'flex' : 'none';
  document.getElementById('stab-gen').classList.toggle('active', panel === 'generate');
  document.getElementById('stab-edit').classList.toggle('active', panel === 'edit');
}

/* CHIP SELECTION */
function selectChip(el, type) {
  el.closest('.chip-row').querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  if (type === 'size') selectedSize = el.dataset.size;
  if (type === 'quality') selectedQuality = el.dataset.quality;
  if (type === 'frames') selectedFrames = parseInt(el.dataset.frames);
  if (type === 'res') selectedRes = parseInt(el.dataset.res);
}

/* MAGIC EXPAND */
const MAGIC = [
  'cinematic lighting, 8k, masterpiece',
  'hyper-realistic, ray tracing, sharp focus',
  'cyberpunk aesthetic, neon glows',
  'ethereal fantasy, concept art',
  'studio photography, soft bokeh',
  'analog film, vintage 35mm'
];
async function magicExpand() {
  const inp = document.getElementById('main-input');
  if (!inp || !inp.value.trim()) { showToast('Type a prompt first!', 'error'); return; }
  if (getOpenRouterKey()) {
    try {
      showToast('✦ AI enhancing prompt...', 'success');
      const enhanced = await callOpenRouter([
        { role: 'system', content: 'You are a prompt engineering expert. Enhance the given image prompt with cinematic details, lighting, mood, and style. Reply ONLY with the enhanced prompt, no explanation.' },
        { role: 'user', content: inp.value.trim() }
      ]);
      if (enhanced) { inp.value = enhanced; showToast('✦ AI-enhanced prompt ready!', 'success'); return; }
    } catch { /* fallback to basic */ }
  }
  inp.value = inp.value.trim() + ', ' + MAGIC[Math.floor(Math.random() * MAGIC.length)];
  showToast('✦ Prompt enhanced!', 'success');
}
async function magicExpandVideo() {
  const inp = document.getElementById('video-prompt');
  if (!inp || !inp.value.trim()) { showToast('Type a prompt first!', 'error'); return; }
  if (getOpenRouterKey()) {
    try {
      showToast('✦ AI enhancing prompt...', 'success');
      const enhanced = await callOpenRouter([
        { role: 'system', content: 'You are a prompt engineering expert. Enhance the given video/animation prompt with cinematic details, lighting, mood transitions, and style. Reply ONLY with the enhanced prompt, no explanation.' },
        { role: 'user', content: inp.value.trim() }
      ]);
      if (enhanced) { inp.value = enhanced; showToast('✦ AI-enhanced prompt ready!', 'success'); return; }
    } catch { /* fallback to basic */ }
  }
  inp.value = inp.value.trim() + ', ' + MAGIC[Math.floor(Math.random() * MAGIC.length)];
  showToast('✦ Prompt enhanced!', 'success');
}

/* ── AUTO SUGGEST ── */
const SUGGESTIONS = [
  'A floating city in the clouds with waterfalls of light',
  'Cyberpunk street market at night, rain, neon signs',
  'Interstellar journey through a nebula of glowing stars',
  'Medieval castle carved into a giant redwood tree',
  'Ancient ruins of a futuristic civilization in a desert',
  'Underwater bioluminescent forest with alien sea life',
  'Steampunk airship fleet sailing over a snowy peak',
  'Minimalist zen garden on the moon with earth in background',
  'Epic dragon made of volcanic glass and flowing lava',
  'Time-traveler portal opening in a 1920s jazz club'
];
function suggestPrompt(type) {
  const prompt = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
  const id = type === 'image' ? 'main-input' : 'video-prompt';
  const inp = document.getElementById(id);
  if (inp) {
    inp.value = prompt;
    showToast('✦ Suggested a cool idea!', 'success');
    if (voiceEnabled) speak(`How about: ${prompt}`);
  }
}

/* ── AI VOICE ── */
function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  const btn = document.getElementById('voice-btn');
  if (btn) btn.classList.toggle('active', voiceEnabled);
  showToast(voiceEnabled ? '🎙️ AI Voice Enabled' : '🎙️ AI Voice Disabled', 'success');
  if (voiceEnabled) speak("AI Voice active. I will narrate your creations.");
}

function speak(text) {
  if (!voiceEnabled || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.0; u.pitch = 1.1;
  const voices = window.speechSynthesis.getVoices();
  // Try to find a premium neural-sounding voice
  u.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
  window.speechSynthesis.speak(u);
}

/* ── IMAGE GENERATION ── */
function generateImage() {
  if (isGenerating) { showToast('Still generating...', 'error'); return; }
  const inp = document.getElementById('main-input');
  const text = inp ? inp.value.trim() : '';
  if (!text) { showToast('Enter a prompt first!', 'error'); if (inp) inp.focus(); return; }

  isGenerating = true;
  const prompt = text + ', masterpiece, highly detailed, sharp focus, professional lighting, 8k';
  const [w, h] = selectedSize.split('x').map(Number);
  const seed = Math.floor(Math.random() * 999999);
  const enhance = selectedQuality === 'ultra' ? 'true' : 'false';
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${seed}&nologo=true&enhance=${enhance}&t=${Date.now()}`;
  generatedImageUrl = url;

  const loaderEl = document.getElementById('output-loader');
  const phEl     = document.getElementById('output-placeholder');
  const imgEl    = document.getElementById('output-img');
  const refEl    = document.getElementById('refine-panel');
  const bar      = document.getElementById('progress-bar');

  if (loaderEl) loaderEl.style.display = 'block';
  if (phEl)     phEl.style.display = 'none';
  if (imgEl)    imgEl.style.display = 'none';
  if (refEl)    refEl.style.display = 'none';

  if (bar) {
    bar.style.transition = 'none'; bar.style.width = '0%';
    void bar.offsetWidth;
    bar.style.transition = 'width 20s linear'; bar.style.width = '85%';
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    isGenerating = false;
    if (loaderEl) loaderEl.style.display = 'none';
    if (imgEl)  { imgEl.src = url; imgEl.style.display = 'block'; }
    if (refEl)    refEl.style.display = 'block';
    if (bar)    { bar.style.transition = 'width 0.3s'; bar.style.width = '100%'; }
    showToast('✦ Image ready!', 'success');
    saveToHistory(url, text);
  };
  img.onerror = () => {
    isGenerating = false;
    if (loaderEl) loaderEl.style.display = 'none';
    if (phEl)     phEl.style.display = 'block';
    showToast('Generation failed. Try again.', 'error');
  };
  img.src = url;
}

function downloadImage() {
  if (!generatedImageUrl) { showToast('No image to download!', 'error'); return; }
  const a = document.createElement('a');
  a.href = generatedImageUrl; a.download = 'pixelmind-' + Date.now() + '.jpg'; a.target = '_blank'; a.click();
  showToast('Download started!', 'success');
}

function shareImage() {
  if (!generatedImageUrl) { showToast('No image yet!', 'error'); return; }
  navigator.clipboard.writeText(generatedImageUrl).then(() => showToast('URL copied!', 'success'));
}

/* ── AI VIDEO GENERATOR ── */
async function generateAnimation() {
  const inp = document.getElementById('video-prompt');
  const text = inp ? inp.value.trim() : '';
  if (!text) { showToast('Enter a prompt!', 'error'); if (inp) inp.focus(); return; }

  const btn = document.getElementById('anim-btn');
  btn.disabled = true; btn.textContent = 'Generating...';
  videoBlob = null;

  const loaderEl = document.getElementById('anim-loader');
  const phEl     = document.getElementById('anim-placeholder');
  const playerEl = document.getElementById('anim-player');
  const msgEl    = document.getElementById('anim-loader-msg');
  const bar      = document.getElementById('anim-progress');
  const vidEl    = document.getElementById('anim-video');

  if (loaderEl) loaderEl.style.display = 'block';
  if (phEl)     phEl.style.display = 'none';
  if (playerEl) playerEl.style.display = 'none';

  const total = selectedFrames;
  const W = Math.round(selectedRes * (16 / 9));
  const H = selectedRes;

  if (voiceEnabled) speak(`Generating video in ${H}p.`);

  const styleShifts = [
    'dawn light, mist rising', 'golden hour glow, warm tones',
    'dramatic clouds, cinematic', 'ethereal atmosphere, glowing',
    'epic wide angle, sweeping', 'ultra detailed, breathtaking',
    'deep shadows, high contrast', 'soft morning light, serene',
    'vibrant colors, vivid', 'moody blue hour, atmospheric'
  ];

  const frames = [];
  if (msgEl) msgEl.textContent = 'Generating video...';
  if (bar) { bar.style.transition = 'none'; bar.style.width = '5%'; void bar.offsetWidth; }

  function loadImg(i) {
    return new Promise(resolve => {
      const prompt = `${text}, ${styleShifts[i % styleShifts.length]}, masterpiece, cinematic, ultra-detailed, 8k`;
      const seed = Math.floor(Math.random() * 999999) + i * 1337;
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${W}&height=${H}&seed=${seed}&nologo=true&t=${Date.now() + i}`;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { frames[i] = img; resolve(); };
      img.onerror = () => {
        const altUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text + ', cinematic, masterpiece')}?width=${W}&height=${H}&seed=${seed + 9999}&nologo=true`;
        const img2 = new Image();
        img2.crossOrigin = 'anonymous';
        img2.onload = () => { frames[i] = img2; resolve(); };
        img2.onerror = () => { resolve(); };
        img2.src = altUrl;
      };
      img.src = url;
    });
  }

  let done = 0;
  for (let i = 0; i < total; i += 3) {
    const batch = [];
    for (let j = i; j < Math.min(i + 3, total); j++) batch.push(loadImg(j));
    await Promise.all(batch);
    done += batch.length;
    if (bar) bar.style.width = Math.round((done / total) * 40) + '%';
  }

  const valid = frames.filter(Boolean);
  if (valid.length === 0) {
    if (loaderEl) loaderEl.style.display = 'none';
    if (phEl) phEl.style.display = 'block';
    showToast('Failed to generate frames. Try again.', 'error');
    btn.disabled = false; btn.textContent = 'Animate ▶';
    return;
  }

  const TOTAL_MS = 10000;
  if (msgEl) msgEl.textContent = `Building ${Math.round(TOTAL_MS/1000)}s video...`;
  if (bar) { bar.style.transition = 'none'; bar.style.width = '45%'; void bar.offsetWidth; }

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) { showToast('Canvas error', 'error'); btn.disabled = false; btn.textContent = 'Animate ▶'; return; }

  const mimes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  const mime = mimes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
  const totalFrames = Math.round(30 * TOTAL_MS / 1000);
  let chunks = [];
  let frameIndex = 0;

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3000000 });
  recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mime });
    videoBlob = blob;
    const url = URL.createObjectURL(blob);
    if (loaderEl) loaderEl.style.display = 'none';
    if (playerEl) playerEl.style.display = 'flex';
    if (bar) { bar.style.transition = 'width 0.3s'; bar.style.width = '100%'; }
    if (vidEl) { vidEl.src = url; vidEl.play(); }
    showToast(`✦ ${Math.round(TOTAL_MS/1000)}s AI video ready!`, 'success');
    if (voiceEnabled) speak("Your AI video is ready.");
    btn.disabled = false; btn.textContent = 'Animate ▶';
  };

  recorder.start(100);

  const tick = setInterval(() => {
    const progress = frameIndex / totalFrames;
    if (bar) bar.style.width = Math.round(45 + progress * 55) + '%';
    const fpv = totalFrames / valid.length;
    const curIdx = Math.min(Math.floor(frameIndex / fpv), valid.length - 1);
    const nextIdx = Math.min(curIdx + 1, valid.length - 1);
    const alpha = ((frameIndex % fpv) / fpv) * (valid.length > 1 ? 1 : 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(valid[curIdx], 0, 0, W, H);
    if (alpha > 0 && curIdx !== nextIdx) {
      ctx.globalAlpha = Math.min(alpha * 2, 1);
      ctx.drawImage(valid[nextIdx], 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    frameIndex++;
    if (frameIndex >= totalFrames) {
      clearInterval(tick);
      setTimeout(() => recorder.stop(), 200);
    }
  }, 1000 / 30);
}

function downloadVideoFile() {
  if (!videoBlob) { showToast('No video to download!', 'error'); return; }
  const ext = videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(videoBlob);
  a.download = 'pixelmind-ai-video-' + Date.now() + '.' + ext;
  a.click();
  showToast('Video downloading!', 'success');
}

function togglePlay() {
  const vid = document.getElementById('anim-video');
  if (!vid) return;
  const btn = document.getElementById('play-btn');
  if (vid.paused) { vid.play(); if (btn) btn.textContent = '⏸ Pause'; }
  else { vid.pause(); if (btn) btn.textContent = '▶ Play'; }
}

/* ── UPLOAD & EDIT ── */
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) loadMediaFile(file);
}
function handleFileSelect(input) {
  if (input.files[0]) loadMediaFile(input.files[0]);
}

function loadMediaFile(file) {
  const type = file.type.startsWith('video') ? 'video' : 'image';
  currentMediaType = type;
  const url = URL.createObjectURL(file);
  document.getElementById('editor-panel').style.display = 'block';
  document.getElementById('upload-zone').style.display = 'none';
  const badge = document.getElementById('media-type-badge');
  if (badge) badge.textContent = type === 'video' ? '🎬 Video' : '🖼 Image';
  const canvas = document.getElementById('edit-canvas');
  const video  = document.getElementById('edit-video');
  if (type === 'image') {
    if (video) video.style.display = 'none';
    if (canvas) canvas.style.display = 'block';
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvas._srcImg = img;
      applyFilters();
    };
    img.src = url;
  } else {
    if (canvas) canvas.style.display = 'none';
    if (video) { video.style.display = 'block'; video.src = url; }
    applyFilters();
  }
  showToast('Media loaded!', 'success');
}

function applyFilters() {
  const b  = (document.getElementById('f-brightness') || {value:100}).value;
  const c  = (document.getElementById('f-contrast')   || {value:100}).value;
  const s  = (document.getElementById('f-saturation') || {value:100}).value;
  const h  = (document.getElementById('f-hue')        || {value:0}).value;
  const bl = (document.getElementById('f-blur')       || {value:0}).value;
  const sp = (document.getElementById('f-sepia')      || {value:0}).value;
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('v-brightness', b); setText('v-contrast', c); setText('v-saturation', s);
  setText('v-hue', h); setText('v-blur', bl); setText('v-sepia', sp);
  const f = `brightness(${b}%) contrast(${c}%) saturate(${s}%) hue-rotate(${h}deg) blur(${bl}px) sepia(${sp}%)`;
  const canvas = document.getElementById('edit-canvas');
  const video  = document.getElementById('edit-video');
  if (canvas && canvas.style.display !== 'none') canvas.style.filter = f;
  if (video  && video.style.display  !== 'none') video.style.filter  = f;
}

function applyPreset(name) {
  const P = {
    cinematic: [90,120,80,0,0,0],  vintage: [90,90,70,15,1,35],
    cyberpunk: [110,130,140,200,0,0], bw: [100,110,0,0,0,0],
    warm: [105,105,110,20,0,10],   cool: [100,105,100,200,0,0],
    reset: [100,100,100,0,0,0]
  };
  const p = P[name]; if (!p) return;
  const ids = ['f-brightness','f-contrast','f-saturation','f-hue','f-blur','f-sepia'];
  ids.forEach((id, i) => { const el = document.getElementById(id); if (el) el.value = p[i]; });
  applyFilters();
}

function downloadEdited() {
  const canvas = document.getElementById('edit-canvas');
  if (currentMediaType === 'image' && canvas && canvas.style.display !== 'none' && canvas._srcImg) {
    const off = document.createElement('canvas');
    off.width = canvas.width; off.height = canvas.height;
    const ctx = off.getContext('2d');
    const b = document.getElementById('f-brightness').value;
    const c = document.getElementById('f-contrast').value;
    const s = document.getElementById('f-saturation').value;
    const h = document.getElementById('f-hue').value;
    const bl = document.getElementById('f-blur').value;
    const sp = document.getElementById('f-sepia').value;
    ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) hue-rotate(${h}deg) blur(${bl}px) sepia(${sp}%)`;
    ctx.drawImage(canvas._srcImg, 0, 0);
    off.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'pixelmind-edited-' + Date.now() + '.png';
      a.click();
    });
  }
}

/* HISTORY */
const HistoryManager = {
  KEY: 'pm_history',
  getAll()   { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch { return []; } },
  save(e)    { let l = this.getAll(); l.unshift(e); if (l.length > 50) l = l.slice(0, 50); localStorage.setItem(this.KEY, JSON.stringify(l)); },
  remove(id) { localStorage.setItem(this.KEY, JSON.stringify(this.getAll().filter(e => e.id !== id))); },
  clear()    { localStorage.removeItem(this.KEY); }
};

function saveToHistory(url, prompt) {
  HistoryManager.save({ id: 'h_' + Date.now(), url, prompt, date: new Date().toLocaleString() });
  renderHistory();
}

function renderHistory() {
  const list  = HistoryManager.getAll();
  const grid  = document.getElementById('history-grid');
  const count = document.getElementById('history-count');
  if (!grid) return;
  if (count) count.textContent = list.length + ' image' + (list.length !== 1 ? 's' : '');
  grid.innerHTML = list.length === 0 ? '<div class="history-empty">No images yet.</div>' : '';
  list.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <img src="${entry.url}" alt="AI image" loading="lazy" onclick="reuseFromHistory('${entry.id}')" />
      <div class="history-info">
        <p class="history-prompt">${entry.prompt.substring(0, 60)}...</p>
        <div class="history-actions">
          <button onclick="reuseFromHistory('${entry.id}')">♻️ Reuse</button>
          <button onclick="HistoryManager.remove('${entry.id}');renderHistory()">🗑️</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

function reuseFromHistory(id) {
  const entry = HistoryManager.getAll().find(e => e.id === id);
  if (!entry) return;
  const inp = document.getElementById('main-input');
  if (inp) inp.value = entry.prompt;
  switchMode('image');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearHistory() { if (confirm('Clear all?')) { HistoryManager.clear(); renderHistory(); } }

function showToast(msg, type = '') {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg; t.className = 'toast ' + type + ' show';
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

/* ════════════════════════════════════════
   OPENROUTER AI INTEGRATION
   ════════════════════════════════════════ */

const OR_KEY = 'pm_openrouter_key';
const OR_MODEL = 'pm_openrouter_model';

function getOpenRouterKey() {
  return localStorage.getItem(OR_KEY) || '';
}

function getOpenRouterModel() {
  return localStorage.getItem(OR_MODEL) || 'mistralai/mistral-7b-instruct:free';
}

function openSettings() {
  const modal = document.getElementById('settings-modal');
  if (!modal) return;
  const keyInput = document.getElementById('or-api-key');
  const modelSelect = document.getElementById('or-model');
  if (keyInput) keyInput.value = getOpenRouterKey();
  if (modelSelect) modelSelect.value = getOpenRouterModel();
  modal.style.display = 'flex';
}

function closeSettings() {
  document.getElementById('settings-modal').style.display = 'none';
}

function saveOpenRouterSettings() {
  const key = document.getElementById('or-api-key').value.trim();
  const model = document.getElementById('or-model').value;
  localStorage.setItem(OR_KEY, key);
  localStorage.setItem(OR_MODEL, model);
  document.getElementById('or-status').textContent = key ? '✓ Settings saved!' : '✓ API key cleared';
  showToast('⚙️ OpenRouter settings saved!', 'success');
}

async function callOpenRouter(messages) {
  const key = getOpenRouterKey();
  if (!key) {
    showToast('Set your OpenRouter API key in Settings (⚙️)', 'error');
    return null;
  }
  const model = getOpenRouterModel();
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'X-Title': 'PixelMind AI'
      },
      body: JSON.stringify({ model, messages, max_tokens: 300, temperature: 0.8 })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    showToast('OpenRouter API error: ' + e.message, 'error');
    return null;
  }
}

/* ── AI ASSISTANT CHAT ── */
let chatHistory = [];

function openAIAssistant() {
  const modal = document.getElementById('ai-assistant-modal');
  if (modal) modal.style.display = 'flex';
}

function closeAIAssistant() {
  document.getElementById('ai-assistant-modal').style.display = 'none';
}

function addChatMessage(text, role) {
  const box = document.getElementById('chat-box');
  if (!box) return;
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  if (!getOpenRouterKey()) {
    showToast('Set your OpenRouter API key in Settings (⚙️)', 'error');
    return;
  }
  input.value = '';
  addChatMessage(text, 'user');
  chatHistory.push({ role: 'user', content: text });

  const systemMsg = { role: 'system', content: 'You are a creative AI assistant for PixelMind AI Studio. Help users brainstorm and refine image/video generation prompts. Be concise, imaginative, and practical. Suggest specific visual details, styles, and techniques.' };
  const msgs = [systemMsg, ...chatHistory.slice(-10)];

  addChatMessage('Thinking...', 'bot');
  const reply = await callOpenRouter(msgs);
  const botMsgs = document.querySelectorAll('.chat-msg.bot');
  if (botMsgs.length > 0) botMsgs[botMsgs.length - 1].remove();

  if (reply) {
    addChatMessage(reply, 'bot');
    chatHistory.push({ role: 'assistant', content: reply });
  } else {
    addChatMessage('Sorry, I hit an error. Check your API key and try again.', 'bot');
  }
}

function useChatPrompt() {
  const lastBotMsg = document.querySelector('.chat-box .chat-msg.bot:last-child');
  if (!lastBotMsg) { showToast('No AI response to use!', 'error'); return; }
  const text = lastBotMsg.textContent;
  const inp = document.getElementById('main-input');
  if (inp) inp.value = text;
  document.getElementById('ai-assistant-modal').style.display = 'none';
  switchMode('image');
  showToast('📋 Prompt loaded from AI!', 'success');
}

function clearChat() {
  chatHistory = [];
  const box = document.getElementById('chat-box');
  if (box) box.innerHTML = '<div class="chat-msg bot"><span>Hi! I\'m your AI assistant. Tell me what you want to create and I\'ll help craft the perfect prompt.</span></div>';
}

/* ── AI AUTO-SUGGEST (replaces random suggestions when API key is set) ── */
async function suggestPrompt(type) {
  if (getOpenRouterKey()) {
    try {
      showToast('🤖 AI generating suggestion...', 'success');
      const reply = await callOpenRouter([
        { role: 'system', content: 'You are a creative prompt suggester for an AI image generator. Suggest one short, vivid, imaginative image prompt (max 15 words). Reply ONLY with the prompt, no quotes or explanation.' },
        { role: 'user', content: `Suggest a ${type === 'image' ? 'stunning image' : 'cinematic animation'} prompt` }
      ]);
      if (reply) {
        const id = type === 'image' ? 'main-input' : 'video-prompt';
        const inp = document.getElementById(id);
        if (inp) { inp.value = reply; showToast('✦ AI suggested a prompt!', 'success'); return; }
      }
    } catch { /* fallback */ }
  }
  const prompt = SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
  const id = type === 'image' ? 'main-input' : 'video-prompt';
  const inp = document.getElementById(id);
  if (inp) {
    inp.value = prompt;
    showToast('✦ Suggested a cool idea!', 'success');
    if (voiceEnabled) speak(`How about: ${prompt}`);
  }
}

document.getElementById('media-upload')?.addEventListener('change', (e) => handleFileSelect(e.target));
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (document.getElementById('mode-image').style.display !== 'none') generateImage();
    else if (document.getElementById('mode-video').style.display !== 'none') generateAnimation();
  }
});
