// index.js — Tesla Colombia Landing Page
'use strict';

const nav       = document.getElementById('main-nav');
const userBtn   = document.getElementById('user-btn');
const drawer    = document.getElementById('user-drawer');
const backdrop  = document.getElementById('drawer-backdrop');
const drawerClose = document.getElementById('drawer-close');
const viewLogin = document.getElementById('view-login');
const viewUser  = document.getElementById('view-user');
const loginForm = document.getElementById('login-form');
const loginErr  = document.getElementById('login-error');
const btnLogout = document.getElementById('btn-logout');
const toastsEl  = document.getElementById('toasts');
const mobileMenu = document.getElementById('mobile-menu');
const mobileBackdrop = document.getElementById('mobile-backdrop');
const mobileClose = document.getElementById('mobile-close');
const hamburger = document.getElementById('nav-hamburger');

// ── NAV SCROLL ───────────────────────────────────────────────
const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 60);
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ── TOASTS ───────────────────────────────────────────────────
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' toast--' + type : '');
  el.textContent = msg;
  toastsEl.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ── MOBILE MENU ──────────────────────────────────────────────
function openMobileMenu() {
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openMobileMenu);
if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);

// Mobile account link opens drawer
const mobileAccountLink = document.getElementById('mobile-account-link');
if (mobileAccountLink) {
  mobileAccountLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeMobileMenu();
    setTimeout(openDrawer, 200);
  });
}

// ── DRAWER ───────────────────────────────────────────────────
function openDrawer() {
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  renderDrawer();
}
function closeDrawer() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

userBtn.addEventListener('click', openDrawer);
backdrop.addEventListener('click', closeDrawer);
drawerClose.addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); closeMobileMenu(); } });

// ── RENDER DRAWER ────────────────────────────────────────────
function renderDrawer() {
  const user = Store.getCurrentUser();
  if (!user) {
    viewLogin.hidden = false;
    viewUser.hidden  = true;
    loginErr.textContent = '';
    loginForm.reset();
  } else {
    viewLogin.hidden = true;
    viewUser.hidden  = false;
    document.getElementById('user-avatar').textContent = user.name.trim()[0].toUpperCase();
    document.getElementById('user-name').textContent   = user.name;
    document.getElementById('user-email').textContent  = user.email;
    renderReservation(user.email);
  }
}

function renderReservation(email) {
  const box = document.getElementById('user-reservation');
  const res = Store.getUserReservation(email);

  if (res) {
    const modelName = res.modelId === 'model3' ? 'Model 3' : 'Model Y';
    const modelHref = res.modelId === 'model3'
      ? 'pages/model3/model3.html'
      : 'pages/modely/modely.html';

    box.innerHTML = `
      <div class="res-card">
        <div class="res-card__model">Tesla ${modelName}</div>
        <div class="res-card__detail">${res.variantName}</div>
        <div class="res-card__detail">${res.colorName} · ${res.wheelName}</div>
        <div class="res-card__price">${Store.formatPrice(res.totalPrice)}</div>
        <div class="res-card__date">Reservado el ${Store.formatDate(res.fecha)}</div>
        <span class="res-card__badge">✓ Activa</span>
      </div>
      <a href="pages/confirmacion/confirmacion.html" class="res-link">Administrar reserva</a>
    `;
  } else {
    box.innerHTML = `
      <div class="no-res">
        <span class="no-res-icon">⚡</span>
        <p>No tienes ninguna reserva activa.</p>
        <p>Configura tu Model 3 o Model Y.</p>
      </div>
    `;
  }
}

// ── LOGIN ────────────────────────────────────────────────────
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  loginErr.textContent = '';
  const name  = document.getElementById('inp-name').value.trim();
  const email = document.getElementById('inp-email').value.trim().toLowerCase();

  if (!name || name.length < 2) { loginErr.textContent = 'Ingresa tu nombre completo.'; return; }
  if (!email || !email.includes('@') || !email.includes('.')) {
    loginErr.textContent = 'Ingresa un correo electrónico válido.'; return;
  }

  Store.setCurrentUser({ name, email });
  toast(`¡Bienvenido, ${name.split(' ')[0]}!`, 'success');
  renderDrawer();
});

// ── LOGOUT ───────────────────────────────────────────────────
btnLogout.addEventListener('click', () => {
  const user = Store.getCurrentUser();
  Store.logout();
  toast(`¡Hasta pronto${user ? ', ' + user.name.split(' ')[0] : ''}!`);
  renderDrawer();
});

// ── PARALLAX-LIKE HERO CONTENT FADE ──────────────────────────
const heroes = document.querySelectorAll('.hero');
function heroParallax() {
  const scrollY = window.scrollY;
  heroes.forEach((hero, i) => {
    const top = hero.offsetTop;
    const h   = hero.offsetHeight;
    const diff = scrollY - top;
    const content = hero.querySelector('.hero__content');
    if (content && diff > 0 && diff < h) {
      const pct = diff / h;
      content.style.opacity = 1 - pct * 1.5;
      content.style.transform = `translateY(${pct * -30}px)`;
    } else if (content) {
      content.style.opacity = '';
      content.style.transform = '';
    }
  });
}
window.addEventListener('scroll', heroParallax, { passive: true });

// ── FEATURES INTERSECTION OBSERVER ───────────────────────────
const features = document.querySelectorAll('.feature');
const featureObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${i * 0.1}s`;
      entry.target.classList.add('feature--visible');
    }
  });
}, { threshold: 0.2 });
features.forEach(f => {
  f.style.opacity = '0';
  f.style.transform = 'translateY(20px)';
  f.style.transition = 'opacity .6s ease, transform .6s ease';
  featureObserver.observe(f);
});

// Add feature--visible class style dynamically
const style = document.createElement('style');
style.textContent = '.feature--visible { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);

// ── INIT ─────────────────────────────────────────────────────
renderDrawer();
