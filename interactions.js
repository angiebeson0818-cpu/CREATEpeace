/**
 * interactions.js
 * angieCREATEs — Positive Peace in Your Heart
 * Interactive component handlers: Mood Tracker + Breathing Widget
 *
 * FIXES from original:
 * - Removed gsap dependency (was causing ReferenceError since gsap is a global, not an ES module)
 *   Now uses pure CSS transitions for breathing widget
 * - Mood body-color side-effect removed (was permanently mutating body background)
 * - Added active state reset logic so clicking same button clears state
 * - Response area uses CSS class toggle instead of inline opacity (more reliable)
 */

'use strict';

// ─────────────────────────────────────────────────────────────
// PUBLIC API — called from app.js after DOMContentLoaded
// ─────────────────────────────────────────────────────────────

export function initInteractions() {
  setupMoodTracker();
  setupBreathingWidget();
}

// ─────────────────────────────────────────────────────────────
// MOOD TRACKER
// ─────────────────────────────────────────────────────────────

function setupMoodTracker() {
  const moodButtons   = document.querySelectorAll('.mood-btn');
  const responseArea  = document.getElementById('mood-response');

  // Guard: abort silently if elements not found on this page
  if (!moodButtons.length || !responseArea) return;

  /**
   * Responses keyed to the data-mood attribute on each button.
   * Original responses preserved; removed brand-prohibited words ("healing", "trauma" replaced).
   */
  const responses = {
    anxious: '"Be still, and know." Today your strength lives in your breath. Focus on one intentional movement at a time — that is enough.',
    heavy:   'Light follows the dawn. Allow yourself to rest without guilt. Your value is not in your production, but in your presence.',
    seeking: 'The answers are already within you, waiting for the noise to quiet. Curiosity is the first step to clarity.',
    still:   'Protect this space. You are currently in a state of Positive Peace. Carry this light into your next hour.',
  };

  let activeButton = null;

  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.dataset.mood;
      if (!mood || !(mood in responses)) return;

      // Reset all buttons
      moodButtons.forEach(b => b.classList.remove('active'));

      // If clicking the already-active button, deselect and clear
      if (activeButton === btn) {
        activeButton = null;
        responseArea.classList.remove('visible');
        // Small delay then clear text so fade-out completes first
        setTimeout(() => { responseArea.textContent = ''; }, 500);
        return;
      }

      // Activate selected button
      btn.classList.add('active');
      activeButton = btn;

      // Fade out → update text → fade in
      responseArea.classList.remove('visible');
      setTimeout(() => {
        responseArea.textContent = responses[mood];
        // Force reflow so transition fires
        void responseArea.offsetWidth;
        responseArea.classList.add('visible');
      }, 300);
    });
  });
}

// ─────────────────────────────────────────────────────────────
// BREATHING WIDGET
// Pure CSS-transition approach — no gsap dependency needed.
// ─────────────────────────────────────────────────────────────

function setupBreathingWidget() {
  const circle = document.getElementById('breathing-circle');
  const text   = document.getElementById('breathing-text');

  if (!circle || !text) return;

  /**
   * Breathing cycle:
   *   Inhale  → 4 s (expand)
   *   Hold    → 1 s
   *   Exhale  → 4 s (contract)
   *   Hold    → 1 s
   *   Repeat
   */
  const INHALE_MS  = 4000;
  const HOLD_MS    =  500;
  const EXHALE_MS  = 4000;

  // CSS transition is set on the element in styles.css.
  // We just toggle a class and update text.
  circle.style.transition = `transform ${INHALE_MS}ms cubic-bezier(0.45, 0, 0.55, 1)`;

  let running = true;

  const phases = [
    { label: 'Inhale',  scale: 1.4,  duration: INHALE_MS  },
    { label: 'Hold',    scale: 1.4,  duration: HOLD_MS    },
    { label: 'Exhale',  scale: 1.0,  duration: EXHALE_MS  },
    { label: 'Rest',    scale: 1.0,  duration: HOLD_MS    },
  ];

  let phaseIndex = 0;

  function runNextPhase() {
    if (!running) return;

    const phase = phases[phaseIndex % phases.length];
    text.textContent = phase.label;
    circle.style.transition = `transform ${phase.duration}ms cubic-bezier(0.45, 0, 0.55, 1)`;
    circle.style.transform   = `scale(${phase.scale})`;

    phaseIndex++;
    setTimeout(runNextPhase, phase.duration);
  }

  // Start after a short delay so the page settles
  setTimeout(runNextPhase, 800);

  // Pause when section is out of viewport (perf optimisation)
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      running = entry.isIntersecting;
      if (running) runNextPhase();
    });
  }, { threshold: 0.2 });

  const physicalSection = document.getElementById('physical');
  if (physicalSection) observer.observe(physicalSection);
}
