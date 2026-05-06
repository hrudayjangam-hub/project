/* ══════════════════════════════════════
   PixelMind AI – app.js
   Full application logic
══════════════════════════════════════ */

'use strict';

/* ─── STATE ─── */
let currentPrompt = '';
let templatePrompt = '';
let currentSlide = 0;
const TOTAL_SLIDES = 10;
let generatedImageUrl = '';

/* ─── PRELOADER ─── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('hidden');
    setTimeout(() => preloader.remove(), 700);
    initParticles();
    initSlides();
    buildPrompt();
  }, 1800);
});

/* ─── NAVBAR SCROLL ─── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 60) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

/* ─── SMOOTH SCROLL ─── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ═══════════════════════════════════════
   PARTICLES CANVAS
═══════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const COUNT = 80;
  const particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.8 + 0.3,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.1,
    color: ['#a855f7', '#6366f1', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 4)]
  }));

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(168,85,247,' + (0.08 * (1 - dist / 100)) + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
}

/* ═══════════════════════════════════════
   PROMPT BUILDER
═══════════════════════════════════════ */
function buildPrompt() {
  const subject = document.getElementById('subject-input').value.trim() || '[your subject]';
  const style = document.getElementById('style-select').value;
  const lighting = document.getElementById('lighting-select').value;
  const mood = document.getElementById('mood-select').value;
  const quality = document.getElementById('quality-select').value;
  const env = document.getElementById('environment-input').value.trim();
  const extra = document.getElementById('extra-input').value.trim();

  // --- PROMPT BOOSTER ---
  // We add high-quality keywords to ensure the AI produces elite results
  const qualityBooster = ', masterpiece, highly detailed, sharp focus, intricate textures, professional lighting, 8k resolution, ray tracing, volumetric lighting';
  
  let prompt = 'Create an elite image of ' + subject;
  if (env) prompt += ' in ' + env;
  prompt += ', style: ' + style + ', lighting: ' + lighting + ' lighting, mood: ' + mood + ', ' + quality + qualityBooster;
  if (extra) prompt += ', ' + extra;
  
  // --- NEGATIVE PROMOTING ---
  // This tells the AI what NOT to create to avoid distorted images
  prompt += ' --no blurry, deformed, low quality, distorted hands, extra fingers, messy face, text, watermark, grainy, bad anatomy';

  currentPrompt = prompt;
  document.getElementById('generated-prompt-text').textContent = prompt;
  return prompt;
}

['subject-input', 'environment-input', 'extra-input'].forEach(function(id) {
  var el = document.getElementById(id);
  if (el) el.addEventListener('input', buildPrompt);
});
['style-select', 'lighting-select', 'mood-select', 'quality-select'].forEach(function(id) {
  var el = document.getElementById(id);
  if (el) el.addEventListener('change', buildPrompt);
});

/* ─── COPY PROMPT ─── */
function copyPrompt() {
  if (!currentPrompt || currentPrompt.includes('[your subject]')) {
    showToast('Please build a prompt first!', 'error');
    return;
  }
  navigator.clipboard.writeText(currentPrompt).then(function() {
    showToast('Prompt copied to clipboard!', 'success');
    var btn = document.getElementById('copy-btn');
    btn.textContent = 'Copied';
    setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
  });
}

/* ═══════════════════════════════════════
   IMAGE GENERATION via Pollinations AI
═══════════════════════════════════════ */
function generateImage(promptOverride) {
  var prompt = promptOverride || buildPrompt();

  if (!prompt || prompt.includes('[your subject]')) {
    showToast('Please enter a subject first!', 'error');
    document.getElementById('subject-input').focus();
    return;
  }

  document.getElementById('output-placeholder').style.display = 'none';
  document.getElementById('generated-image').style.display = 'none';
  document.getElementById('output-actions').style.display = 'none';
  document.getElementById('prompt-used-box').style.display = 'none';
  document.getElementById('image-loader').style.display = 'flex';

  var fill = document.getElementById('progress-fill');
  fill.style.width = '0%';
  fill.style.animation = 'none';
  void fill.offsetWidth;
  fill.style.animation = 'progress-anim 10s ease forwards';

  var encoded = encodeURIComponent(prompt);
  var seed = Math.floor(Math.random() * 999999);
  var imageUrl = 'https://image.pollinations.ai/prompt/' + encoded + '?width=1024&height=768&seed=' + seed + '&nologo=true&enhance=true';

  generatedImageUrl = imageUrl;

  var img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = function() {
    document.getElementById('image-loader').style.display = 'none';
    var displayImg = document.getElementById('generated-image');
    displayImg.src = imageUrl;
    displayImg.style.display = 'block';
    document.getElementById('output-actions').style.display = 'flex';
    document.getElementById('prompt-used-box').style.display = 'block';
    var promptText = prompt.substring(0, 120) + (prompt.length > 120 ? '...' : '');
    document.getElementById('prompt-used-text').textContent = promptText;
    showToast('Image generated successfully!', 'success');
  };

  img.onerror = function() {
    document.getElementById('image-loader').style.display = 'none';
    var ph = document.getElementById('output-placeholder');
    ph.style.display = 'flex';
    ph.querySelector('p').textContent = 'Generation failed. Try again!';
    ph.querySelector('span').textContent = 'Check your connection or change the prompt.';
    showToast('Generation failed. Try a different prompt.', 'error');
  };

  img.src = imageUrl;
}

/* ─── DOWNLOAD ─── */
function downloadImage() {
  if (!generatedImageUrl) { showToast('No image to download!', 'error'); return; }
  var a = document.createElement('a');
  a.href = generatedImageUrl;
  a.download = 'pixelmind-ai-' + Date.now() + '.jpg';
  a.target = '_blank';
  a.click();
  showToast('Download started!', 'success');
}

/* ─── SHARE ─── */
function shareImage() {
  if (!generatedImageUrl) { showToast('Generate an image first!', 'error'); return; }
  navigator.clipboard.writeText(generatedImageUrl).then(function() {
    showToast('Image URL copied to clipboard!', 'success');
  });
}

/* ═══════════════════════════════════════
   TEMPLATE PROMPTS
═══════════════════════════════════════ */
var TEMPLATES = {
  universal: function(s) {
    return 'Create a high-quality image of ' + s + ' in a stunning environment, ' +
      'style: realistic, lighting: dramatic, mood: aesthetic, ' +
      'ultra-detailed, 4K resolution, sharp focus, professional quality ' +
      '--no blur, distortion, low quality';
  },
  realistic: function(s) {
    return 'Create a hyper-realistic image of ' + s + ', natural lighting, ' +
      'photography style, DSLR quality, depth of field, ultra-detailed skin texture, ' +
      '8K resolution, bokeh background, professional photograph';
  },
  anime: function(s) {
    return 'Create an anime-style illustration of ' + s + ', vibrant colors, ' +
      'detailed background, soft lighting, studio-quality, ' +
      'trending anime art style, 4K, Makoto Shinkai inspired';
  },
  logo: function(s) {
    return 'Design a modern minimalist logo for ' + s + ', clean typography, ' +
      'vector design, professional branding, white background, ' +
      'high resolution, scalable design, flat icon style';
  },
  cyberpunk: function(s) {
    return 'Create a futuristic cyberpunk scene with ' + s + ', neon lights, ' +
      'dark dystopian city, glowing holographic elements, ' +
      'cinematic lighting, ultra-detailed, 4K, blade runner aesthetic';
  },
  fantasy: function(s) {
    return 'Create a fantasy scene of ' + s + ', magical enchanted environment, ' +
      'glowing mystical effects, epic cinematic lighting, ' +
      'highly detailed, concept art style, ultra HD, digital painting';
  }
};

function useTemplate(type) {
  var subjectEl = document.getElementById('template-subject');
  var subject = subjectEl.value.trim();

  if (!subject) {
    subjectEl.focus();
    subjectEl.style.borderColor = '#f97316';
    setTimeout(function() { subjectEl.style.borderColor = ''; }, 1500);
    showToast('Enter your subject first!', 'error');
    return;
  }

  var prompt = TEMPLATES[type](subject);
  templatePrompt = prompt;

  var resultBox = document.getElementById('template-result-box');
  document.getElementById('template-result-text').textContent = prompt;
  resultBox.style.display = 'block';
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  document.querySelectorAll('.template-card').forEach(function(c) { c.classList.remove('active-tc'); });
  var activeCard = document.querySelector('[data-type="' + type + '"]');
  if (activeCard) activeCard.classList.add('active-tc');

  var typeName = type.charAt(0).toUpperCase() + type.slice(1);
  showToast(typeName + ' template applied!', 'success');
}

function copyTemplatePrompt() {
  if (!templatePrompt) return;
  navigator.clipboard.writeText(templatePrompt).then(function() {
    showToast('Template prompt copied!', 'success');
  });
}

function generateFromTemplate() {
  if (!templatePrompt) { showToast('Select a template first!', 'error'); return; }
  var sub = document.getElementById('template-subject').value.trim();
  document.getElementById('subject-input').value = sub;
  scrollToSection('generator');
  setTimeout(function() { generateImage(templatePrompt); }, 600);
}

/* ═══════════════════════════════════════
   EDITOR PROMPTS
═══════════════════════════════════════ */
function buildEditorPrompt(type) {
  var prompt = '';
  var resultId = 'result-' + type;

  if (type === 'background') {
    var subject = document.getElementById('bg-subject').value.trim() || 'the subject';
    var newBg = document.getElementById('bg-new').value.trim() || 'a beautiful natural environment';
    prompt = 'Take ' + subject + ' and replace the background with ' + newBg + '. ' +
      'Match the original lighting and shadows naturally, make it photorealistic and seamless, ' +
      'maintain original subject quality, professional composite photography';
  } else if (type === 'removal') {
    var obj = document.getElementById('obj-remove').value.trim() || 'unwanted objects';
    var preserve = document.getElementById('obj-preserve').value.trim() || 'the background';
    prompt = 'Remove ' + obj + ' from the image. Fill the removed area naturally with ' + preserve + '. ' +
      'Maintain original image quality, background consistency, photorealistic inpainting, ' +
      'seamless blending, ultra-detailed restoration';
  } else if (type === 'enhance') {
    var desc = document.getElementById('enh-desc').value.trim() || 'the image';
    var level = document.getElementById('enh-level').value;
    prompt = 'Enhance ' + desc + ': increase sharpness and clarity, improve colors and lighting, ' +
      'convert to ' + level + ', reduce noise, restore fine details, professional photo enhancement, ' +
      'ultra-detailed, crisp and vivid output';
  } else if (type === 'style') {
    var stSubject = document.getElementById('st-subject').value.trim() || 'the subject';
    var style = document.getElementById('st-style').value;
    prompt = 'Convert ' + stSubject + ' into ' + style + ' style. Keep all subject details intact, ' +
      'enhance visual appeal with the new style, professional artistic conversion, ' +
      'ultra-detailed, vibrant colors, high resolution output';
  }

  var resultEl = document.getElementById(resultId);
  resultEl.innerHTML = '<span class="ec-prompt-label">YOUR AI EDITING PROMPT</span>' + prompt;
  resultEl.classList.add('visible');

  var copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy Prompt';
  copyBtn.style.cssText = 'margin-top:12px;width:100%;padding:10px;background:rgba(168,85,247,0.2);border:1px solid rgba(168,85,247,0.3);color:#a855f7;border-radius:8px;cursor:pointer;font-family:Outfit,sans-serif;font-weight:600;font-size:0.85rem;transition:all 0.2s;';
  var capturedPrompt = prompt;
  copyBtn.onclick = function() {
    navigator.clipboard.writeText(capturedPrompt);
    showToast('Editing prompt copied!', 'success');
  };

  var oldBtn = resultEl.querySelector('button');
  if (oldBtn) oldBtn.remove();
  resultEl.appendChild(copyBtn);

  showToast('Editing prompt built!', 'success');
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ═══════════════════════════════════════
   SLIDES / PRESENTATION
═══════════════════════════════════════ */
function initSlides() {
  var dotsContainer = document.getElementById('slide-dots');
  dotsContainer.innerHTML = '';
  for (var i = 0; i < TOTAL_SLIDES; i++) {
    var dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.id = 'dot-' + i;
    (function(idx) {
      dot.onclick = function() { goToSlide(idx); };
    })(i);
    dotsContainer.appendChild(dot);
  }
  updateSlideUI();
}

function changeSlide(direction) {
  var newSlide = currentSlide + direction;
  if (newSlide < 0 || newSlide >= TOTAL_SLIDES) return;
  goToSlide(newSlide);
}

function goToSlide(index) {
  var slides = document.querySelectorAll('.slide');
  slides[currentSlide].classList.remove('active');
  var prevDot = document.getElementById('dot-' + currentSlide);
  if (prevDot) prevDot.classList.remove('active');

  currentSlide = index;
  slides[currentSlide].classList.add('active');
  var nextDot = document.getElementById('dot-' + currentSlide);
  if (nextDot) nextDot.classList.add('active');

  updateSlideUI();
}

function updateSlideUI() {
  document.getElementById('prev-btn').disabled = currentSlide === 0;
  document.getElementById('next-btn').disabled = currentSlide === TOTAL_SLIDES - 1;
  document.getElementById('next-btn').textContent = currentSlide === TOTAL_SLIDES - 1 ? 'Finish' : 'Next';
}

document.addEventListener('keydown', function(e) {
  var prt = document.getElementById('presentation');
  var rect = prt.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') changeSlide(1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') changeSlide(-1);
  }
});

/* ═══════════════════════════════════════
   TOAST
═══════════════════════════════════════ */
var toastTimer;
function showToast(message, type) {
  type = type || '';
  var toast = document.getElementById('toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = 'toast ' + type + ' show';
  toastTimer = setTimeout(function() { toast.className = 'toast'; }, 3200);
}

/* ─── EXTRA STYLES ─── */
var extraStyles = document.createElement('style');
extraStyles.textContent = [
  '.template-card.active-tc { border-color: rgba(168,85,247,0.6) !important; box-shadow: 0 0 30px rgba(168,85,247,0.2); }',
  '.step-num { display: flex !important; }'
].join('\n');
document.head.appendChild(extraStyles);

/* ═══════════════════════════════════════
   SCROLL ANIMATION
═══════════════════════════════════════ */
var observerOpts = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
var scrollObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      scrollObserver.unobserve(entry.target);
    }
  });
}, observerOpts);

document.querySelectorAll('.glass-card, .template-card, .editor-card, .slide-content').forEach(function(el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  scrollObserver.observe(el);
});

console.log('%c PixelMind AI Loaded ', 'color:#a855f7;font-size:1.2rem;font-weight:bold;background:#06060f;padding:8px;border-radius:6px;');

/* ═══════════════════════════════════════
   AUTH MANAGER
═══════════════════════════════════════ */
var AuthManager = {
  SESSION_KEY: 'pm_session',
  USERS_KEY: 'pm_users',

  getUsers: function() {
    try { return JSON.parse(localStorage.getItem(this.USERS_KEY) || '{}'); } catch(e) { return {}; }
  },
  saveUsers: function(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },
  getSession: function() {
    try { return JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null'); } catch(e) { return null; }
  },
  saveSession: function(user) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  },
  clearSession: function() {
    localStorage.removeItem(this.SESSION_KEY);
  },
  register: function(name, username, password) {
    if (!name || !username || !password) return { ok: false, msg: 'All fields are required.' };
    var users = this.getUsers();
    if (users[username]) return { ok: false, msg: 'Username already taken.' };
    users[username] = { name: name, username: username, password: password };
    this.saveUsers(users);
    this.saveSession({ name: name, username: username });
    return { ok: true };
  },
  login: function(username, password) {
    if (!username || !password) return { ok: false, msg: 'Enter username and password.' };
    var users = this.getUsers();
    var user = users[username];
    if (!user) return { ok: false, msg: 'User not found.' };
    if (user.password !== password) return { ok: false, msg: 'Incorrect password.' };
    this.saveSession({ name: user.name, username: username });
    return { ok: true, user: user };
  }
};

function openAuthModal() {
  document.getElementById('auth-modal').style.display = 'flex';
}
function closeAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
}
function switchTab(tab) {
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('tab-login').className = 'auth-tab' + (tab === 'login' ? ' active' : '');
  document.getElementById('tab-register').className = 'auth-tab' + (tab === 'register' ? ' active' : '');
}
function doLogin() {
  var username = document.getElementById('login-username').value.trim();
  var password = document.getElementById('login-password').value;
  var result = AuthManager.login(username, password);
  if (!result.ok) { showToast(result.msg, 'error'); return; }
  closeAuthModal();
  updateNavAuth();
  showToast('Welcome back, ' + username + '! 👋', 'success');
}
function doRegister() {
  var name = document.getElementById('reg-name').value.trim();
  var username = document.getElementById('reg-username').value.trim();
  var password = document.getElementById('reg-password').value;
  var result = AuthManager.register(name, username, password);
  if (!result.ok) { showToast(result.msg, 'error'); return; }
  closeAuthModal();
  updateNavAuth();
  showToast('Account created! Welcome, ' + name + ' 🚀', 'success');
}
function doLogout() {
  AuthManager.clearSession();
  updateNavAuth();
  showToast('Logged out successfully.', 'success');
}
function updateNavAuth() {
  var session = AuthManager.getSession();
  var userInfo = document.getElementById('nav-user-info');
  var loginBtn = document.getElementById('nav-login-btn');
  if (session) {
    document.getElementById('nav-username').textContent = '👤 ' + session.username;
    userInfo.style.display = 'flex';
    loginBtn.style.display = 'none';
  } else {
    userInfo.style.display = 'none';
    loginBtn.style.display = 'inline-flex';
  }
}
// Close modal on overlay click
document.getElementById('auth-modal').addEventListener('click', function(e) {
  if (e.target === this) closeAuthModal();
});
// Init auth state on load
updateNavAuth();

/* ═══════════════════════════════════════
   HISTORY MANAGER
═══════════════════════════════════════ */
var HistoryManager = {
  KEY: 'pm_history',
  getAll: function() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch(e) { return []; }
  },
  save: function(entry) {
    var list = this.getAll();
    list.unshift(entry); // newest first
    if (list.length > 50) list = list.slice(0, 50); // cap at 50
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },
  deleteItem: function(id) {
    var list = this.getAll().filter(function(e) { return e.id !== id; });
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },
  clear: function() { localStorage.removeItem(this.KEY); }
};

function renderHistory() {
  var list = HistoryManager.getAll();
  var grid = document.getElementById('history-grid');
  var empty = document.getElementById('history-empty');
  var countEl = document.getElementById('history-count');
  countEl.textContent = list.length + ' image' + (list.length !== 1 ? 's' : '') + ' saved';
  // Remove old cards (keep empty placeholder)
  Array.from(grid.querySelectorAll('.history-card')).forEach(function(c) { c.remove(); });
  if (list.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.forEach(function(entry) {
    var card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML =
      '<img class="history-thumb" src="' + entry.url + '" alt="Generated image" loading="lazy" />' +
      '<div class="history-info">' +
        '<div class="history-prompt">' + entry.prompt + '</div>' +
        '<div class="history-meta">' + entry.date + '</div>' +
        '<div class="history-actions">' +
          '<button class="history-btn" onclick="reuseHistory(\'' + entry.id + '\')">♻️ Reuse</button>' +
          '<button class="history-btn" onclick="downloadHistoryItem(\'' + entry.url + '\')">⬇️ Save</button>' +
          '<button class="history-btn del" onclick="deleteHistoryItem(\'' + entry.id + '\')">🗑️</button>' +
        '</div>' +
      '</div>';
    grid.appendChild(card);
  });
}

function saveToHistory(url, prompt) {
  var entry = {
    id: 'h_' + Date.now(),
    url: url,
    prompt: prompt,
    date: new Date().toLocaleString()
  };
  HistoryManager.save(entry);
  renderHistory();
}

function reuseHistory(id) {
  var entry = HistoryManager.getAll().find(function(e) { return e.id === id; });
  if (!entry) return;
  document.getElementById('subject-input').value = entry.prompt.substring(0, 80);
  scrollToSection('generator');
  showToast('Prompt loaded from history!', 'success');
}

function downloadHistoryItem(url) {
  var a = document.createElement('a');
  a.href = url; a.download = 'pixelmind-' + Date.now() + '.jpg';
  a.target = '_blank'; a.click();
}

function deleteHistoryItem(id) {
  HistoryManager.deleteItem(id);
  renderHistory();
  showToast('Removed from history.', 'success');
}

function clearHistory() {
  if (!confirm('Clear all history? This cannot be undone.')) return;
  HistoryManager.clear();
  renderHistory();
  showToast('History cleared.', 'success');
}

// Patch generateImage to save to history after load
var _origGenImg = generateImage;
generateImage = function(promptOverride) {
  // Hide filter/variations panels on new generate
  document.getElementById('filter-panel').style.display = 'none';
  document.getElementById('variations-panel').style.display = 'none';
  resetFilters();
  _origGenImg(promptOverride);
};

// Hook into img.onload to save to history
var _origImgLoad = null;
var _patchApplied = false;
function patchGenerateImage() {
  if (_patchApplied) return;
  _patchApplied = true;
  var origGen = window._origGenImg || window.generateImage;
  // Watch for generated-image src changes via MutationObserver
  var imgEl = document.getElementById('generated-image');
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      if (m.attributeName === 'src' && imgEl.src && imgEl.style.display !== 'none') {
        // Wait a tick to ensure image is actually displayed
        setTimeout(function() {
          if (imgEl.style.display !== 'none' && imgEl.src && generatedImageUrl) {
            document.getElementById('filter-panel').style.display = 'block';
            saveToHistory(generatedImageUrl, currentPrompt || '(no prompt)');
          }
        }, 200);
      }
    });
  });
  observer.observe(imgEl, { attributes: true });
}
// Also patch the actual img onload via event delegation on the output area
document.getElementById('image-output-area').addEventListener('load', function(e) {
  if (e.target && e.target.id === 'generated-image') {
    document.getElementById('filter-panel').style.display = 'block';
    if (generatedImageUrl && currentPrompt) {
      saveToHistory(generatedImageUrl, currentPrompt);
    }
  }
}, true);

// Render history on load
renderHistory();
patchGenerateImage();

/* ═══════════════════════════════════════
   IMAGE VARIATIONS
═══════════════════════════════════════ */
function generateVariations() {
  if (!currentPrompt || currentPrompt.includes('[your subject]')) {
    showToast('Build a prompt first!', 'error'); return;
  }
  var panel = document.getElementById('variations-panel');
  var grid = document.getElementById('variations-grid');
  panel.style.display = 'block';
  grid.innerHTML = '';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showToast('Generating 3 variations...', 'success');

  [1,2,3].forEach(function(n) {
    var seed = Math.floor(Math.random() * 999999);
    var encoded = encodeURIComponent(currentPrompt);
    var url = 'https://image.pollinations.ai/prompt/' + encoded +
      '?width=800&height=600&seed=' + seed + '&nologo=true&enhance=true';

    var item = document.createElement('div');
    item.className = 'variation-item';
    item.innerHTML =
      '<div class="var-loader"><div class="loader-spinner"></div></div>' +
      '<div class="variation-label">Variation ' + n + '</div>';
    grid.appendChild(item);

    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      item.innerHTML =
        '<img src="' + url + '" alt="Variation ' + n + '" />' +
        '<div class="variation-label">Variation ' + n + ' ✦</div>';
      item.onclick = function() {
        document.getElementById('generated-image').src = url;
        document.getElementById('generated-image').style.display = 'block';
        document.getElementById('output-placeholder').style.display = 'none';
        document.getElementById('output-actions').style.display = 'flex';
        document.getElementById('filter-panel').style.display = 'block';
        generatedImageUrl = url;
        saveToHistory(url, currentPrompt);
        showToast('Variation ' + n + ' selected!', 'success');
        resetFilters();
        scrollToSection('generator');
      };
    };
    img.onerror = function() {
      item.innerHTML = '<div style="padding:20px;text-align:center;color:#f87171;font-size:0.8rem;">Failed</div>';
    };
    img.src = url;
  });
}

/* ═══════════════════════════════════════
   FILTER MANAGER
═══════════════════════════════════════ */
function applyFilters() {
  var img = document.getElementById('generated-image');
  var b  = document.getElementById('f-brightness').value;
  var c  = document.getElementById('f-contrast').value;
  var s  = document.getElementById('f-saturation').value;
  var bl = document.getElementById('f-blur').value;
  document.getElementById('v-brightness').textContent = b;
  document.getElementById('v-contrast').textContent = c;
  document.getElementById('v-saturation').textContent = s;
  document.getElementById('v-blur').textContent = bl;
  img.style.filter =
    'brightness(' + b + '%) contrast(' + c + '%) saturate(' + s + '%) blur(' + bl + 'px)';
}

function resetFilters() {
  ['f-brightness','f-contrast','f-saturation'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) { el.value = 100; }
  });
  var blurEl = document.getElementById('f-blur');
  if (blurEl) blurEl.value = 0;
  ['v-brightness','v-contrast','v-saturation'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '100';
  });
  var vb = document.getElementById('v-blur');
  if (vb) vb.textContent = '0';
  var img = document.getElementById('generated-image');
  if (img) img.style.filter = 'none';
}

function downloadFiltered() {
  var img = document.getElementById('generated-image');
  if (!img || img.style.display === 'none') {
    showToast('No image to download!', 'error'); return;
  }
  var b  = document.getElementById('f-brightness').value;
  var c  = document.getElementById('f-contrast').value;
  var s  = document.getElementById('f-saturation').value;
  var bl = document.getElementById('f-blur').value;
  var isDefault = b==='100' && c==='100' && s==='100' && bl==='0';

  if (isDefault) {
    // Direct download without canvas
    var a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = 'pixelmind-ai-' + Date.now() + '.jpg';
    a.target = '_blank'; a.click();
    showToast('Download started!', 'success');
    return;
  }
  // Canvas download with filters applied
  var canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || 1024;
  canvas.height = img.naturalHeight || 768;
  var ctx = canvas.getContext('2d');
  ctx.filter = 'brightness(' + b + '%) contrast(' + c + '%) saturate(' + s + '%) blur(' + bl + 'px)';
  try {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(function(blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'pixelmind-filtered-' + Date.now() + '.png';
      a.click();
      setTimeout(function() { URL.revokeObjectURL(url); }, 2000);
      showToast('Filtered image downloaded!', 'success');
    }, 'image/png');
  } catch(e) {
    // CORS fallback
    var a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = 'pixelmind-ai-' + Date.now() + '.jpg';
    a.target = '_blank'; a.click();
    showToast('Download started (filters not embedded due to CORS).', 'success');
  }
}

/* ═══════════════════════════════════════
   IMAGE UPLOAD PREVIEW
═══════════════════════════════════════ */
function triggerUpload(inputId) {
  document.getElementById(inputId).click();
}

function previewUpload(input, zoneId) {
  var file = input.files && input.files[0];
  if (!file) return;
  var zone = document.getElementById(zoneId);
  var reader = new FileReader();
  reader.onload = function(e) {
    // Remove existing preview
    var existing = zone.querySelector('.upload-preview');
    if (existing) existing.remove();
    var img = document.createElement('img');
    img.className = 'upload-preview';
    img.src = e.target.result;
    img.alt = 'Uploaded preview';
    zone.appendChild(img);
    zone.querySelector('span').textContent = '✅ ' + file.name;
    showToast('Image uploaded for reference!', 'success');
  };
  reader.readAsDataURL(file);
}
/* ═══════════════════════════════════════
   HERO COMMAND BAR LOGIC
═══════════════════════════════════════ */
function generateFromHero() {
  const heroInput = document.getElementById('hero-prompt-input');
  let prompt = heroInput.value.trim();
  
  if (!prompt) {
    showToast('What should I create? Enter a prompt first!', 'error');
    heroInput.focus();
    return;
  }

  // --- HERO AUTO-EXPANSION ---
  // If the user types a simple word, we make it professional
  if (prompt.split(' ').length < 4) {
    prompt = 'A stunning ' + prompt + ' in a cinematic environment with epic detail';
  }

  // Update the generator section's input so the user sees it there too
  document.getElementById('subject-input').value = prompt;
  
  // Build and generate
  scrollToSection('generator');
  setTimeout(() => {
    generateImage(buildPrompt());
  }, 600);
}

// Add Enter key listener for hero input
document.getElementById('hero-prompt-input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    generateFromHero();
  }
});
