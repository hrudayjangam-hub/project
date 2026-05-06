/* ── CART FUNCTIONALITY ── */
const cartBtn = document.getElementById('cart-btn');
const closeCart = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartCount = document.getElementById('cart-count');
const addToCartBtns = document.querySelectorAll('.add-to-cart');

let count = 0;

cartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cartSidebar.classList.add('open');
});

closeCart.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
});

addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        count++;
        cartCount.textContent = count;
        
        // Button animation
        const originalText = btn.textContent;
        btn.textContent = 'Added to Bag ✨';
        btn.style.background = '#b08d57';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1500);
        
        // Auto open cart on first add
        if (count === 1) {
            setTimeout(() => cartSidebar.classList.add('open'), 500);
        }
    });
});

/* ── NAVBAR SCROLL ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

/* ── PRODUCT REVEAL ── */
const products = document.querySelectorAll('.product-card');
const revealProducts = () => {
    products.forEach((product, index) => {
        const top = product.getBoundingClientRect().top;
        if (top < window.innerHeight - 50) {
            setTimeout(() => {
                product.style.opacity = '1';
                product.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
};

// Initial state
products.forEach(p => {
    p.style.opacity = '0';
    p.style.transform = 'translateY(30px)';
    p.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
});

window.addEventListener('scroll', revealProducts);
window.addEventListener('load', revealProducts);

/* ── HERO ZOOM ── */
const heroBg = document.querySelector('.hero-bg');
window.addEventListener('load', () => {
    heroBg.style.transition = 'transform 10s ease-out';
    setTimeout(() => {
        heroBg.style.transform = 'scale(1.1)';
    }, 100);
});

console.log('%c Vogue Vault Luxury Interface Active 👗 ', 'color: #b08d57; font-weight: bold; font-size: 1.2rem;');
