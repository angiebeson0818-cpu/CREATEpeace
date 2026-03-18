# Oracle Rewrite — Bug Report & Upgrade Summary
## angieCREATEs | Positive Peace in Your Heart
### Prepared March 2026

---

## 🐛 BUGS FOUND & FIXED

### BUG 1 — CRITICAL: Breathing Widget Crashes (Runtime Error)
**File:** `interactions.js`  
**Problem:** `setupBreathingWidget()` called `gsap.to()` directly. But `gsap` is loaded as a CDN global via `<script>` tag — it is NOT importable as an ES module. Inside an ES module file like `interactions.js`, `gsap` would be `undefined`, causing a silent crash that killed the entire breathing animation.  
**Fix:** Rewrote `setupBreathingWidget()` using pure CSS transitions (`element.style.transition` + `element.style.transform`). Zero dependencies, full browser support.

---

### BUG 2 — CRITICAL: Mobile Menu Was Dead (No Implementation)
**File:** `app.js`  
**Problem:** The hamburger button (`#mobile-menu-btn`) existed in the HTML and had an icon, but had zero click handler in any JS file. On mobile, the nav was completely inaccessible.  
**Fix:** Added `initMobileMenu()` — opens/closes `#mobile-nav` drawer, locks body scroll, closes on Escape key, closes on backdrop click.

---

### BUG 3 — HIGH: Missing `#roadmap` Section
**File:** `index.html`  
**Problem:** The nav linked to `#roadmap`. `content.json` defined a roadmap section. But no `<section id="roadmap">` existed in the HTML. Clicking "Roadmap" in the nav scrolled nowhere.  
**Fix:** Built the full 5-step Peace Roadmap section with timeline layout, gold connector line, and scroll-reveal animations. Content sourced from the `Digital Publishing Success Roadmap` markdown file in agent-files.

---

### BUG 4 — HIGH: Scroll Dot Logic Was Wrong
**File:** `app.js`  
**Problem:** Dot activation used `Math.floor(progress * sections.length)` — this assumes all sections have equal height, which they don't. Dots were always off by 1–2 sections.  
**Fix:** Replaced with `IntersectionObserver` — one observer per section, fires when section occupies the center 20% of the viewport. Accurate regardless of section height. Dots are also clickable to navigate.

---

### BUG 5 — HIGH: Audio Play Promise Not Caught
**File:** `app.js`  
**Problem:** `audio.play()` was called without handling the Promise it returns. All modern browsers block autoplay and `play()` throws a rejected Promise when blocked. This caused unhandled Promise rejection errors in console, and the play/pause icon state could desync.  
**Fix:** Wrapped `audio.play()` in `.then()` / `.catch()`. State only updates if play succeeds. Error is caught silently with a console warning.

---

### BUG 6 — MEDIUM: Mood Tracker Permanently Mutated Body Background
**File:** `interactions.js`  
**Problem:** Clicking "Restless" called `gsap.to('body', { backgroundColor: '#E8F1F2' })`. This permanently changed the body background color. There was no reset on clicking "Still" (which only set it to `#F5F5DC`, not the original `#000000`). This also conflicted with Tailwind's inline `bg-[#F5F5DC]` class.  
**Fix:** Removed all body background mutation from the mood tracker entirely. Color state belongs in CSS, not runtime JS. Mood feedback is now handled purely through the `#mood-response` text area.

---

### BUG 7 — MEDIUM: GSAP Process Card Selector Too Broad
**File:** `app.js`  
**Problem:** `gsap.from('#process .relative.bg-white', ...)` matched NOT just the three step cards but also the outer container `div.relative.bg-white` wrapping the entire section. This caused the whole section to animate as a block instead of each card staggering in separately.  
**Fix:** Changed selector to `.process-card` — targets exactly the three cards and nothing else.

---

### BUG 8 — MEDIUM: `content.json` Was Completely Unused
**File:** `content.json`, `app.js`  
**Problem:** `content.json` existed and defined sections, but was never fetched or imported anywhere in the codebase. It was decorative dead weight — and worse, its section list did NOT match the actual HTML sections, making it actively misleading.  
**Fix:** Updated `content.json` to accurately reflect all 5 sections, theme palette, audio, social links, and CTA. Added `_comment` and `_note` fields explaining its purpose for future CMS integration.

---

### BUG 9 — LOW: No SEO Meta Tags
**File:** `index.html`  
**Problem:** Zero `og:*`, `twitter:card`, `description`, or `canonical` tags. When shared on social or indexed by Google, the page would show no image, no description, no title.  
**Fix:** Added full Open Graph block, Twitter Card, meta description, and canonical URL.

---

### BUG 10 — DESIGN: Wrong Color Theme Throughout
**File:** `styles.css`, `index.html`  
**Problem:** Entire site was navy (`#002366`) and beige (`#F5F5DC`). The Onyx spec calls for `#1A1A1A` background, `#C9A84C` gold accent, `#FDF8F0` cream text.  
**Fix:** Complete palette replacement. All four brand colors applied system-wide as CSS custom properties. Shimmer gold button implemented as specified in the prompt.

---

## ✅ MISSING PIECES ADDED

| Feature | Status |
|---|---|
| `#roadmap` section (5-step Peace Roadmap) | ✅ Built |
| Mobile menu drawer | ✅ Implemented |
| SEO meta / Open Graph / Twitter Card | ✅ Added |
| Shimmer gold button (`.btn-primary`) | ✅ Implemented |
| Logo gold shimmer animation | ✅ Implemented |
| Onyx theme throughout | ✅ Complete |
| Header scroll state (`.scrolled`) | ✅ Added |
| Page dot click-to-navigate | ✅ Added |
| IntersectionObserver scroll reveal | ✅ Added |
| Breathing widget pause when off-screen | ✅ Added (perf) |
| Audio error handling | ✅ Added |
| ARIA roles & semantic HTML | ✅ Added |
| Video poster fallback | ✅ Added |

---

## 📁 FILE STRUCTURE

```
oracle-rewrite/
├── index.html        — Main HTML (full semantic structure, Onyx theme, roadmap section)
├── styles.css        — Complete CSS (Onyx palette, all components, responsive)
├── app.js            — Main JS entry (GSAP, audio, scroll dots, mobile menu, scroll reveal)
├── interactions.js   — Interactive components (mood tracker, breathing widget)
└── content.json      — Publication metadata (matches actual HTML structure)
```

---

## 🚀 DEPLOYMENT NOTES

1. All 5 files go in the same folder (or your Elementor child theme's directory)
2. `app.js` loads as `type="module"` — requires a web server (not `file://`)
3. Replace QR code SVG with a real QR generator pointed at your live URL
4. Update `content.json` social links with actual platform URLs
5. The audio and video CDN URLs (fal.media) should be migrated to your own hosting for production reliability

---

*Prepared by Claude for angieCREATEs | angiecreates.pro*
