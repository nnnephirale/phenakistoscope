# Tarot Reader App - Handover Document

**Last Updated:** December 28, 2025
**Current Version:** v7.12-mobile-spread
**Main File:** `tarot-reader-v7.12-mobile-spread.html`

---

## Project Overview

A single-file HTML/CSS/JS tarot card reading application with:
- 78-card Rider-Waite-Smith deck
- Multiple spread layouts (Single, 3-Card, 5-Card Spirit, 11-Card Tree of Life)
- Desktop and mobile responsive views
- Card placement via drag-and-drop (desktop) or tap-to-place (mobile)
- Card flip animations, reversals support
- Save/load readings to localStorage
- Dark/light theme toggle
- Text annotation boxes on reading surface
- Zoom/pan on reading surface

---

## Recent Development Focus: Mobile Spread System

### Goal
Create an intuitive mobile experience for following tarot spreads with guided step-by-step card placement.

### What's Implemented

1. **Mobile Card Picker Modal**
   - Tap deck → modal with 3 rows of fanned cards
   - Tap card to focus → navigation bar slides in (< ✓ >)
   - Tap again or press ✓ to select
   - Smooth animations with transform-based transitions

2. **Mobile Staged Card Flow** (when NO spread selected)
   - Selected card floats above dock with bobbing animation
   - Drag to reading surface to place
   - Tap reading surface to place at tap location
   - Position controlled via JS (not CSS) to avoid transform conflicts

3. **Mobile Spread Guided Mode** (when spread IS selected)
   - Auto-pans to first slot on spread selection
   - Step indicator: "1 of 5: Earth" floats above active slot
   - Active slot: grey glow effect
   - Future slots: dimmed opacity
   - Card selection places directly into active slot (skips staging)
   - Auto-advances to next slot
   - Ends when all slots filled

4. **Mobile-Specific Spread Positions**
   - Spreads have `mobilePositions` array with wider spacing
   - Helper: `getSpreadPositions(spread)` returns correct positions for viewport

---

## Known Issues / TODO

### Immediate Fixes Needed

1. **Position references not updated everywhere**
   - `updateMobileSpreadStep()`, `panToSpreadSlot()`, `placeCardInActiveSlot()` still use `currentSpread.positions` instead of `getSpreadPositions(currentSpread)`

2. **Spread preview panel improvements**
   - Make draggable (CSS has `cursor: move` but no JS handler)
   - Add minimize/collapse toggle with notch
   - Position above dock on mobile (z-index, bottom positioning)

### Future Enhancements

- Celtic Cross spread with mobile layout
- Undo last card placement
- Card position editing after placement
- Export reading as image
- Share reading via URL

---

## Code Architecture

### Key Sections (approximate line numbers in v7.12)

| Section | Lines | Description |
|---------|-------|-------------|
| CSS Variables | 20-30 | Card sizes, colors |
| Mobile Media Query | 400-500 | 600px breakpoint styles |
| Mobile Spread CSS | 1025-1075 | .active-slot, .future-slot, .spread-step-indicator |
| Spread Reference CSS | 1080-1122 | Preview panel styles |
| SPREADS Object | 4285-4355 | Spread definitions with positions/mobilePositions |
| getSpreadPositions() | 4358-4365 | Helper for viewport-aware positions |
| Mobile Spread Functions | 4370-4530 | startMobileSpreadMode, updateMobileSpreadStep, etc. |
| renderSpreadSlots() | 4638-4695 | Creates slot elements |
| Card Picker Functions | 2300-2600 | Modal, picker cards, selection |

### Key State Variables

```javascript
// Mobile spread guided mode
let mobileSpreadMode = false;
let currentSpreadStep = 0;
let spreadStepIndicator = null;

// General spread state
let currentSpread = null;
let spreadSlots = [];

// Staged card (non-spread mode)
let stagedCard = null;

// Reading surface
let currentZoom = 1;
let panX = 0, panY = 0;
let placedCards = [];
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `selectCardFromPicker(card, index)` | Handles card selection - routes to spread mode or staging |
| `placeCardInActiveSlot(card)` | Places card in current spread slot |
| `placeCardAtPosition(card, x, y)` | Creates placed card element |
| `startMobileSpreadMode()` | Initializes guided mode |
| `updateMobileSpreadStep()` | Updates visuals, indicator, pans to slot |
| `panToSpreadSlot(stepIndex)` | Smooth pan animation to center slot |
| `getSpreadPositions(spread)` | Returns mobile or desktop positions |
| `renderSpreadSlots()` | Creates slot DOM elements |
| `isMobileView()` | Returns true if viewport ≤ 600px |

---

## Design Decisions

1. **Single HTML file** - Keeps deployment simple, all code co-located
2. **CSS transforms for animations** - GPU-accelerated, smooth
3. **JS-controlled positioning for staged card** - Avoids CSS !important conflicts
4. **Mobile positions in spread definitions** - Clean separation, easy to adjust per-spread
5. **Step indicator near slot** - User's eye stays on action area
6. **Auto-advance after placement** - Reduces taps, feels guided

---

## User Preferences (from conversation)

- No horizontal scrolling (vertical OK)
- Sleek, smooth animations (0.25s ease-out)
- Cards sized so 4 fit side-by-side with gaps
- Preview panel: draggable, minimizable, above dock
- Step indicator shows position name
- Spread layouts should feel iconic/symbolic (preserve cross shape, etc.)

---

## File Locations

- **Working copy:** `/home/claude/tarot-clean-restore.html`
- **Output:** `/mnt/user-data/outputs/tarot-reader-v7.12-mobile-spread.html`
- **Transcripts:** `/mnt/transcripts/`
  - `2025-12-28-10-08-26-tarot-mobile-modal-fixes.txt`
  - `2025-12-27-*.txt` (earlier sessions)

---

## Testing Checklist

### Mobile Spread Mode
- [ ] Select Spirit Spread - does it pan to first slot?
- [ ] Is step indicator visible with "1 of 5: Earth"?
- [ ] Does active slot have grey glow?
- [ ] Are future slots dimmed?
- [ ] Do cards have proper spacing (no overlap)?
- [ ] Does card selection place directly in slot?
- [ ] Does it auto-advance to next slot?
- [ ] After all 5 cards, does guided mode end?

### Mobile Card Picker
- [ ] Tap deck opens modal
- [ ] Cards display in 3 fanned rows
- [ ] Tap card focuses it (lifts up)
- [ ] Navigation bar slides in smoothly
- [ ] < > buttons navigate between cards
- [ ] ✓ or double-tap selects card
- [ ] Tap outside cards deselects
- [ ] Swipe down on notch dismisses

### Mobile Staged Card (no spread)
- [ ] Selected card floats above dock with animation
- [ ] Drag moves card smoothly (both X and Y)
- [ ] Release on reading surface places card
- [ ] Release outside returns to floating position
- [ ] Tap on reading surface places at tap point
- [ ] Tap on deck area cancels

### Desktop
- [ ] Hover over deck card shows lift effect
- [ ] Drag card to surface places it
- [ ] Spread slots snap cards to positions
- [ ] All existing functionality preserved

---

# Update: UI Polish & Interaction Refinements (v7.13)

**Date:** December 29, 2025  
**Developer:** Second Developer (Gemini)  
**Focus:** Visual refinements to the deck docking experience and drag-and-drop layering mechanics.

### 1. Dock Visuals (Gradient Mask)
- **Change:** Replaced the hard `clip-path` on `.deck-area.docked .deck-container` with a CSS `mask-image` linear gradient.
- **Logic:** A solid white fill created a harsh visual cutoff. A gradient allows the cards to fade out smoothly, integrating better with the UI.
- **Critical Fix:** Applied `pointer-events: none` to the docked container.
    - **Reasoning:** The invisible part of the gradient mask still occupied DOM space, overlaying the control buttons (Shuffle, Reset, etc.) and causing UI flickering/unreachable buttons. Disabling pointer events on the docked state solves this. Events are re-enabled on hover of the parent container.

### 2. Layout Adjustments
- **Change:** Added `padding-top: 10px` to `.deck-controls`.
- **Logic:** Increased whitespace between the bottom of the recessed deck and the top of the buttons for better visual balance and touch target separation.
- **Change:** Added `position: relative` and `z-index: 20` to `.deck-controls`.
- **Logic:** Ensures buttons stack physically above the card deck container to prevent occlusion.

### 3. Drag-and-Drop Layering (Fixing "Snipped Off" Cards)
- **Change:** Updated `addPlacedCardHandlers` to append the dragged card to `document.body` during the drag operation.
- **Logic:** The `reading-surface` has `overflow: hidden`. When dragging a card out of this area (e.g., to return it to the deck), it was being visually clipped. Moving the DOM element to the `<body>` level allows it to float freely over the entire viewport without clipping.

### 4. Animation Fidelity ("Elegant Lift")
- **Change:** Refined `addPlacedCardHandlers` to separate **Click** logic from **Drag** logic.
    - **Old Logic:** Moved card to `<body>` immediately on `mousedown`. This destroyed the CSS context required for the hover/active transitions.
    - **New Logic:** Wait for a drag threshold (movement) before reparenting the card to `<body>`.
- **Logic:** If the user only clicks (to view meanings), the card remains in its original container, preserving the original CSS `transform` and `box-shadow` transitions ("The Elegant Lift"). If the user drags, the reparenting occurs to prevent clipping.

### 5. Z-Index Management (Bug Fix)
- **Change:** Explicitly clearing `el.style.zIndex` in the `handleEnd` function.
- **Logic:** During drag, we set an inline `z-index: 10000` to ensure visibility. We previously failed to clear this on drop, causing placed cards to obscure the modal overlay (which has a lower z-index). Clearing the inline style returns the card to the stylesheet's z-index stacking context.