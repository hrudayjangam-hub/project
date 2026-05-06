/* ── DASHBOARD SIMULATION ── */
function animateValues() {
    const values = document.querySelectorAll('.metric-card .value');
    
    values.forEach(val => {
        const originalText = val.textContent;
        const isCurrency = originalText.startsWith('$');
        const numericValue = parseFloat(originalText.replace(/[$,]/g, ''));
        
        let start = numericValue * 0.9;
        const end = numericValue;
        const duration = 2000;
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            
            if (isCurrency) {
                val.textContent = '$' + current.toLocaleString();
            } else {
                val.textContent = originalText.replace(/[0-9.]+/, current.toLocaleString());
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                val.textContent = originalText; // Snap back to precise original
            }
        }

        window.requestAnimationFrame(step);
    });
}

/* ── SIDEBAR NAVIGATION ── */
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

/* ── SPARKLINE ANIMATION ── */
function animateSparklines() {
    const sparklines = document.querySelectorAll('.sparkline');
    sparklines.forEach((spark, index) => {
        spark.style.opacity = '0';
        spark.style.transform = 'scaleX(0.8)';
        spark.style.transition = `all 1s ease ${index * 0.2}s`;
        
        setTimeout(() => {
            spark.style.opacity = '1';
            spark.style.transform = 'scaleX(1)';
        }, 100);
    });
}

/* ── DONUT CHART REVEAL ── */
function revealChart() {
    const donut = document.querySelector('.donut-chart');
    if (donut) {
        donut.style.opacity = '0';
        donut.style.transform = 'rotate(-90deg) scale(0.8)';
        donut.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        setTimeout(() => {
            donut.style.opacity = '1';
            donut.style.transform = 'rotate(0deg) scale(1)';
        }, 500);
    }
}

/* ── SEARCH FOCUS SHORTCUT ── */
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        document.querySelector('.search-bar input').focus();
    }
});

/* ── INITIALIZE ── */
window.addEventListener('DOMContentLoaded', () => {
    animateValues();
    animateSparklines();
    revealChart();
    
    console.log('%c Vortex Finance Interface Loaded 🚀 ', 'color: #6366f1; font-weight: bold; font-size: 1.2rem;');
});
