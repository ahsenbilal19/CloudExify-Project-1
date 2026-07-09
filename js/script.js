'use strict';

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const html = document.documentElement;
const siteHeader = qs('#siteHeader');
const hamburger = qs('#hamburger');
const navLinks = qs('#navLinks');
const themeToggle = qs('#themeToggle');
const typedEl = qs('#typedText');
const yearEl = qs('#year');
const pageLoader = qs('#pageLoader');
const contactForm = qs('#contactForm');
const formStatus = qs('#formStatus');
const easterEgg = qs('#easterEgg');

const ACCENT_RGB_MAP = {
  '#00d4ff': '0, 212, 255',
  '#a855f7': '168, 85, 247',
  '#22c55e': '34, 197, 94',
  '#fb7185': '251, 113, 133'
};

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
  if (themeToggle) {
    themeToggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '☾' : '☀';
  }
}

function setAccent(color) {
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-rgb', ACCENT_RGB_MAP[color] || '0, 212, 255');
  localStorage.setItem('portfolio-accent', color);
}

function initPreferences() {
  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  setTheme(savedTheme || (prefersLight ? 'light' : 'dark'));
  setAccent(localStorage.getItem('portfolio-accent') || '#00d4ff');
}

function initNavbar() {
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('active');
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  });

  qsa('a', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('menu-open');
    });
  });

  window.addEventListener('scroll', () => {
    siteHeader?.classList.toggle('scrolled', window.scrollY > 16);
  }, { passive: true });
}

function initTypewriter() {
  if (!typedEl) return;

  const phrases = [
    'Frontend Developer',
    'MERN Stack Developer',
    'QA Engineer',
    'Data Analyst'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function loop() {
    const current = phrases[phraseIndex];
    typedEl.textContent = current.slice(0, charIndex);

    if (!deleting && charIndex < current.length) {
      charIndex += 1;
      setTimeout(loop, 70);
      return;
    }

    if (!deleting && charIndex === current.length) {
      deleting = true;
      setTimeout(loop, 1300);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      setTimeout(loop, 38);
      return;
    }

    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    setTimeout(loop, 250);
  }

  loop();
}

function initSkillBars() {
  const skills = qsa('.skill');
  if (!skills.length) return;

  if (!('IntersectionObserver' in window)) {
    skills.forEach(skill => {
      const fill = qs('.fill', skill);
      if (fill) fill.style.width = `${skill.dataset.percent}%`;
    });
    return;
  }

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = qs('.fill', entry.target);
      if (fill) fill.style.width = `${entry.target.dataset.percent}%`;
      skillObserver.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  skills.forEach(skill => skillObserver.observe(skill));
}

function initProjectFilter() {
  const buttons = qsa('[data-filter]');
  const cards = qsa('.project-card');
  if (!buttons.length || !cards.length) return;

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      cards.forEach(card => {
        const tags = (card.dataset.tags || '').split(',').map(tag => tag.trim());
        const match = filter === 'all' || tags.includes(filter);
        card.classList.toggle('hide', !match);
      });
    });
  });
}

function initRevealAnimations() {
  const revealItems = qsa('.reveal');
  if (!revealItems.length) return;

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  revealItems.forEach(item => revealObserver.observe(item));
}

function initActiveNav() {
  const sections = qsa('main section[id]');
  const links = qsa('.nav-links a');
  if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0.1 });

  sections.forEach(section => sectionObserver.observe(section));
}

function setFieldError(field, message) {
  const group = field.closest('.form-group');
  const error = group ? qs('.error-text', group) : null;
  if (error) error.textContent = message;
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function validateContactForm() {
  const name = contactForm.elements.name;
  const email = contactForm.elements.email;
  const subject = contactForm.elements.subject;
  const message = contactForm.elements.message;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let valid = true;

  [[name, 'Name is required.'], [subject, 'Subject is required.'], [message, 'Message is required.']].forEach(([field, error]) => {
    if (!field.value.trim()) {
      setFieldError(field, error);
      valid = false;
    } else {
      setFieldError(field, '');
    }
  });

  if (!email.value.trim()) {
    setFieldError(email, 'Email is required.');
    valid = false;
  } else if (!emailPattern.test(email.value.trim())) {
    setFieldError(email, 'Please enter a valid email address.');
    valid = false;
  } else {
    setFieldError(email, '');
  }

  return valid;
}

function initContactForm() {
  if (!contactForm) return;

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formStatus.textContent = '';

    if (!validateContactForm()) {
      formStatus.textContent = 'Please fix the highlighted fields.';
      return;
    }

    formStatus.textContent = 'Thanks! Your message has been noted.';
    contactForm.reset();
  });

  qsa('input, textarea', contactForm).forEach(field => {
    field.addEventListener('input', () => setFieldError(field, ''));
  });
}

function initThemeControls() {
  themeToggle?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  qsa('[data-accent]').forEach(button => {
    button.addEventListener('click', () => setAccent(button.dataset.accent));
  });
}

function initEasterEgg() {
  const targetSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  const pressed = [];
  let logoClicks = 0;

  function showBadge() {
    if (!easterEgg) return;
    easterEgg.classList.add('show');
    setTimeout(() => easterEgg.classList.remove('show'), 4200);
  }

  window.addEventListener('keydown', (event) => {
    pressed.push(event.key);
    if (pressed.length > targetSequence.length) pressed.shift();
    if (targetSequence.every((key, index) => key === pressed[index])) showBadge();
  });

  qs('.logo')?.addEventListener('click', () => {
    logoClicks += 1;
    if (logoClicks === 5) {
      showBadge();
      logoClicks = 0;
    }
  });
}

function initLoader() {
  window.addEventListener('load', () => {
    setTimeout(() => pageLoader?.classList.add('hide'), 350);
  });
}

function initFooterYear() {
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

initPreferences();
initLoader();
initNavbar();
initThemeControls();
initTypewriter();
initSkillBars();
initProjectFilter();
initRevealAnimations();
initActiveNav();
initContactForm();
initEasterEgg();
initFooterYear();
