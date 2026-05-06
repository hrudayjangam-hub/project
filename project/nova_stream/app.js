/* ── HERO ZOOM EFFECT ── */
const hero = document.querySelector('.hero');
window.addEventListener('load', () => {
    hero.style.transition = 'background-size 20s linear';
    setTimeout(() => {
        hero.style.backgroundSize = '110%';
    }, 100);
});

/* ── HORIZONTAL SCROLL ENHANCEMENT ── */
const grids = document.querySelectorAll('.rail-grid');
grids.forEach(grid => {
    grid.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
            e.preventDefault();
            grid.scrollLeft += e.deltaY;
        }
    });
});

/* ── CARD REVEALS ── */
const cards = document.querySelectorAll('.movie-card');
cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `all 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${0.1 + index * 0.05}s`;
    
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 500);
});

/* ── NAVIGATION ── */
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Mock switch effect
        document.querySelector('.content').scrollTo({ top: 0, behavior: 'smooth' });
    });
});

/* ── MOCK PLAY BUTTON ── */
const playBtn = document.querySelector('.btn-play');
playBtn.addEventListener('click', () => {
    const originalText = playBtn.textContent;
    playBtn.textContent = '⌛ Buffering...';
    playBtn.style.background = '#e50914';
    playBtn.style.color = 'white';
    
    setTimeout(() => {
        playBtn.textContent = '📺 Playing Now';
        setTimeout(() => {
            playBtn.textContent = originalText;
            playBtn.style.background = '';
            playBtn.style.color = '';
        }, 2000);
    }, 1500);
});

console.log('%c Nova Stream Cinematic Interface Active 🎬 ', 'color: #e50914; font-weight: bold; font-size: 1.2rem;');
