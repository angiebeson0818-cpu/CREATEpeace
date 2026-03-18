/**
 * app.js
 * angieCREATEs — Positive Peace in Your Heart
 * Main entry point: GSAP animations, scroll behavior, audio, mobile nav
 *
 * FIXES from original:
 * 1. gsap is used here as a GLOBAL (CDN) — not imported, which is correct for CDN scripts.
 *    interactions.js has been refactored to NOT use gsap to avoid the original bug.
 * 2. Mobile menu now fully implemented (was dead button before)
 * 3. Scroll dot logic rewritten: uses IntersectionObserver per-section instead of
 *    unreliable progress-fraction math
 * 4. Audio play() wrapped in Promise catch for browser autoplay policy
 * 5. Added header scroll-state styling
 * 6. All section animation selectors tightened to prevent GSAP matching parent containers
 */

import { initInteractions } from './interactions.js';

// ─────────────────────────────────────────────────────────────
// INIT ON DOM READY
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // Initialize Lucide icons (global from CDN)
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Register GSAP plugins (global from CDN)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initGSAPAnimations();
  }

  initHeader();
  initAudio();
  initScrollDots();
  initSmoothNavLinks();
  initMobileMenu();
  initScrollReveal();
  initInteractions();
});

// ─────────────────────────────────────────────────────────────
// GSAP ENTRANCE ANIMATIONS
// ─────────────────────────────────────────────────────────────

function initGSAPAnimations() {

  // Header entrance
  gsap.from('#site-header', {
    y: -80,
    opacity: 0,
    duration: 1,
    ease: 'power4.out',
    clearProps: 'transform',
  });

  // Process cards — target only the .process-card elements, not parent containers
  gsap.from('.process-card', {
    scrollTrigger: {
      trigger: '#process',
      start: 'top 70%',
      toggleActions: 'play none none reverse',
    },
    y: 60,
    opacity: 0,
    stagger: 0.15,
    duration: 0.9,
    ease: 'power3.out',
  });

  // Roadmap steps cascade in
  gsap.from('.roadmap-step', {
    scrollTrigger: {
      trigger: '#roadmap',
      start: 'top 75%',
      toggleActions: 'play none none reverse',
    },
    x: -30,
    opacity: 0,
    stagger: 0.12,
    duration: 0.8,
    ease: 'power2.out',
  });

  // CTA card
  gsap.from('.cta-card', {
    scrollTrigger: {
      trigger: '#cta-section',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
  });
}

// ─────────────────────────────────────────────────────────────
// HEADER — adds .scrolled class for styling change on scroll
// ─────────────────────────────────────────────────────────────

function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on init
}

// ─────────────────────────────────────────────────────────────
// AUDIO PLAYER
// FIX: audio.play() returns a Promise. Wrapped in .catch() to
// handle browser autoplay policy rejection gracefully.
// ─────────────────────────────────────────────────────────────

function initAudio() {
  const audio     = document.getElementById('bg-audio');
  const audioBtn  = document.getElementById('audio-toggle');
  const playIcon  = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');

  if (!audio || !audioBtn) return;

  let isPlaying = false;

  // Guard against state getting out of sync if audio ends unexpectedly
  audio.addEventListener('ended', () => {
    // audio has loop attribute — this fires only if loop is removed
    isPlaying = false;
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
  });

  audioBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      setPlayState(false);
    } else {
      audio.play()
        .then(() => setPlayState(true))
        .catch(err => {
          // Autoplay blocked or other error — show play icon, log quietly
          console.warn('[audio] play() rejected:', err.message);
          setPlayState(false);
        });
    }
  });

  function setPlayState(playing) {
    isPlaying = playing;
    playIcon.classList.toggle('hidden', playing);
    pauseIcon.classList.toggle('hidden', !playing);
  }
}

// ─────────────────────────────────────────────────────────────
// SCROLL DOTS
// FIX: Original used scroll progress fraction which was wrong for
// unequally-sized sections. Now uses IntersectionObserver per-section.
// ─────────────────────────────────────────────────────────────

function initScrollDots() {
  const dots    = document.querySelectorAll('.page-dot');
  const sections = ['#hero', '#process', '#emotional', '#physical', '#roadmap'];

  if (!dots.length) return;

  const sectionEls = sections
    .map(sel => document.querySelector(sel))
    .filter(Boolean);

  // Map element → dot index
  const sectionMap = new Map(sectionEls.map((el, i) => [el, i]));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = sectionMap.get(entry.target);
      if (idx === undefined) return;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
    });
  }, {
    root: null,
    rootMargin: '-40% 0px -40% 0px', // activates when section is near center viewport
    threshold: 0,
  });

  sectionEls.forEach(el => observer.observe(el));

  // Click dot to scroll to section
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const target = sectionEls[i];
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ─────────────────────────────────────────────────────────────
// SMOOTH NAV LINKS
// ─────────────────────────────────────────────────────────────

function initSmoothNavLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      // Close mobile nav if open
      const mobileNav = document.getElementById('mobile-nav');
      if (mobileNav) mobileNav.classList.remove('open');
    });
  });
}

// ─────────────────────────────────────────────────────────────
// MOBILE MENU
// FIX: Original had a button with no implementation. Now fully wired.
// ─────────────────────────────────────────────────────────────

function initMobileMenu() {
  const openBtn  = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-nav-close');
  const nav      = document.getElementById('mobile-nav');

  if (!openBtn || !nav) return;

  openBtn.addEventListener('click', () => {
    nav.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  const close = () => {
    nav.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', close);

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  // Close when clicking backdrop (outside the nav links)
  nav.addEventListener('click', e => {
    if (e.target === nav) close();
  });
}

// ─────────────────────────────────────────────────────────────
// SCROLL REVEAL (IntersectionObserver for .reveal elements)
// Lightweight alternative to GSAP for simple fade-in reveals
// ─────────────────────────────────────────────────────────────

function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // fire once only
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));
}
