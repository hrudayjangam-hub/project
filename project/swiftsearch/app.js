/* ── SEARCH REDIRECTION ── */
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    
    if (query) {
        // Redirect to Google search
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
});

/* ── CLOCK & GREETING ── */
function updateWidgets() {
    const clockEl = document.getElementById('clock');
    const greetingEl = document.getElementById('greeting');
    
    const now = new Date();
    
    // Update Clock
    const timeString = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    });
    clockEl.textContent = timeString;
    
    // Update Greeting
    const hour = now.getHours();
    if (hour < 12) greetingEl.textContent = 'Good Morning';
    else if (hour < 18) greetingEl.textContent = 'Good Afternoon';
    else greetingEl.textContent = 'Good Evening';
}

// Initial call and set interval
updateWidgets();
setInterval(updateWidgets, 1000);

/* ── SHORTCUTS ── */
// Focus search on 's' or '/' keypress
document.addEventListener('keydown', (e) => {
    // Only focus if not already focused or typing in another input
    if (e.target.tagName !== 'INPUT' && (e.key === 's' || e.key === '/')) {
        e.preventDefault();
        searchInput.focus();
    }
});

console.log('%c SwiftSearch Portal Active 🔍 ', 'color: #3d5afe; font-weight: bold; font-size: 1.2rem;');
