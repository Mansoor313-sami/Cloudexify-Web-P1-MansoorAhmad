'use strict';

const root = document.documentElement;
const header = document.querySelector('.site-header');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');
const themeLabel = themeToggle.querySelector('.theme-label');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pageLoader = document.getElementById('pageLoader');

function hidePageLoader() {
  if (!pageLoader || document.body.classList.contains('is-loaded')) return;
  document.body.classList.add('is-loaded');
  pageLoader.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => pageLoader.remove(), reducedMotion ? 0 : 500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.setTimeout(hidePageLoader, 350), { once: true });
} else {
  window.setTimeout(hidePageLoader, 350);
}
window.setTimeout(hidePageLoader, 1600);

function setTheme(theme) {
  const isDark = theme === 'dark';
  root.dataset.theme = theme;
  try { localStorage.setItem('portfolio-theme', theme); } catch { /* Theme still works for this visit. */ }
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
  themeLabel.textContent = isDark ? 'Light' : 'Dark';
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#151713' : '#f3f1eb';
}

setTheme(root.dataset.theme || 'light');
themeToggle.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

function closeMenu() {
  navLinks.classList.remove('active');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open navigation menu');
}

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('active');
  hamburger.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', `${open ? 'Close' : 'Open'} navigation menu`);
});

navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 10), { passive: true });

const phrases = ['building responsive interfaces.', 'creating React Native apps.', 'learning full-stack development.'];
const typedEl = document.getElementById('typedText');
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  const phrase = phrases[phraseIndex];
  typedEl.textContent = phrase.slice(0, charIndex);
  if (!deleting && charIndex < phrase.length) {
    charIndex += 1;
    setTimeout(typeLoop, 55);
  } else if (!deleting) {
    deleting = true;
    setTimeout(typeLoop, 1500);
  } else if (charIndex > 0) {
    charIndex -= 1;
    setTimeout(typeLoop, 28);
  } else {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    setTimeout(typeLoop, 250);
  }
}

if (reducedMotion) typedEl.textContent = phrases[0];
else typeLoop();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelector('.fill').style.width = `${entry.target.dataset.percent}%`;
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.skill').forEach(skill => skillObserver.observe(skill));

const filterButtons = document.querySelectorAll('[data-filter]');
const projectCards = document.querySelectorAll('.project-card');
const filterStatus = document.getElementById('filterStatus');
const filterTimers = new WeakMap();
const filterDelay = reducedMotion ? 0 : 280;

projectCards.forEach(card => card.setAttribute('aria-hidden', 'false'));

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    let visibleCount = 0;
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    projectCards.forEach(card => {
      const matches = filter === 'all' || card.dataset.tags.split(',').includes(filter);
      const pendingTimer = filterTimers.get(card);
      if (pendingTimer) clearTimeout(pendingTimer);

      if (matches) {
        visibleCount += 1;
        card.hidden = false;
        card.setAttribute('aria-hidden', 'false');
        card.classList.remove('is-filtering-out');
        card.classList.add('is-filtering-in');
        window.setTimeout(() => card.classList.remove('is-filtering-in'), 360);
      } else {
        card.setAttribute('aria-hidden', 'true');
        card.classList.add('is-filtering-out');
        const timer = window.setTimeout(() => {
          card.hidden = true;
          card.classList.remove('is-filtering-out');
        }, filterDelay);
        filterTimers.set(card, timer);
      }
    });

    const filterName = filter === 'all' ? 'all' : button.textContent.trim();
    filterStatus.textContent = filter === 'all'
      ? `Showing all ${visibleCount} projects.`
      : `Showing ${visibleCount} ${filterName} project${visibleCount === 1 ? '' : 's'}.`;
  });
});

const sections = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });
sections.forEach(section => sectionObserver.observe(section));

const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showFieldError(field, message) {
  const row = field.closest('.form-row');
  row.classList.toggle('invalid', Boolean(message));
  row.querySelector('.field-error').textContent = message;
  field.setAttribute('aria-invalid', String(Boolean(message)));
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = form.elements.name;
  const email = form.elements.email;
  const message = form.elements.message;
  showFieldError(name, name.value.trim() ? '' : 'Please enter your name.');
  showFieldError(email, emailPattern.test(email.value.trim()) ? '' : 'Please enter a valid email address.');
  showFieldError(message, message.value.trim().length >= 10 ? '' : 'Please add at least 10 characters.');

  const invalid = form.querySelector('[aria-invalid="true"]');
  if (invalid) {
    status.textContent = '';
    invalid.focus();
    return;
  }

  status.textContent = `Thanks, ${name.value.trim()}! Your message has been noted.`;
  form.reset();
  form.querySelectorAll('[aria-invalid]').forEach(field => field.setAttribute('aria-invalid', 'false'));
});

form.querySelectorAll('input, textarea').forEach(field => {
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') showFieldError(field, '');
  });
});

const easterEgg = document.getElementById('easterEgg');
const easterEggClose = document.getElementById('easterEggClose');
const logo = document.querySelector('.logo');
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiPosition = 0;
let logoClicks = [];

function revealEasterEgg() {
  easterEgg.hidden = false;
  easterEggClose.focus({ preventScroll: true });
}

easterEggClose.addEventListener('click', () => {
  easterEgg.hidden = true;
  logo.focus({ preventScroll: true });
});

document.addEventListener('keydown', event => {
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
  const expectedKey = konamiCode[konamiPosition];
  if (event.key.toLowerCase() === expectedKey.toLowerCase()) {
    konamiPosition += 1;
    if (konamiPosition === konamiCode.length) {
      revealEasterEgg();
      konamiPosition = 0;
    }
  } else {
    konamiPosition = event.key.toLowerCase() === konamiCode[0].toLowerCase() ? 1 : 0;
  }
});

logo.addEventListener('click', () => {
  const now = Date.now();
  logoClicks = logoClicks.filter(time => now - time < 15000);
  logoClicks.push(now);
  if (logoClicks.length === 5) {
    revealEasterEgg();
    logoClicks = [];
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
