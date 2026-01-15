# Tarot Reader App - Handover Document

## Overview

A web-based tarot reading application built with vanilla HTML, CSS, and JavaScript. The app provides an interactive digital tarot experience with a 78-card Rider-Waite-Smith deck, multiple spread layouts, drag-and-drop card placement, and persistent storage.

**Live file:** `tarot-reader.html` (single combined file for distribution)
**Development files:** `index.html` + `tarot.js` (separate for easier editing)

---

## Architecture

### Single-Page Application
- **No frameworks** - Pure vanilla JS for maximum portability and zero dependencies
- **Single HTML file** - Combined for easy sharing/hosting (build script merges index.html + tarot.js)
- **CSS-in-HTML** - All styles in `<style>` tags within the head
- **LocalStorage persistence** - Readings, preferences, and history saved client-side

### Build Process
```bash
cd /home/claude/tarot-app
head -n -1 index.html | sed '/<script src="tarot.js"><\/script>/d' > tarot-combined.html
echo "<script>" >> tarot-combined.html
cat tarot.js >> tarot-combined.html
echo "</script></body></html>" >> tarot-combined.html
cp tarot-combined.html /mnt/user-data/outputs/tarot-reader.html
```

---

## File Structure

```
/home/claude/tarot-app/
├── index.html          # Main HTML with all CSS
├── tarot.js            # All JavaScript logic
└── HANDOVER.md         # This document

/mnt/user-data/outputs/
└── tarot-reader.html   # Combined distribution file
```

---

## Key Features

### 1. Card Deck System
- **78-card Rider-Waite-Smith deck** with Major and Minor Arcana
- **Card images** from `https://steve-p.org/cards/` (webp format, Pam-A scans)
- **Fan layout** - Cards spread horizontally with slight arc (In mobile mode: cards break into 2 parallel rows, fanned in an arc shape)
- **Shuffle animation** - Multi-phase scatter/chaos/settle animation

### 2. Drag and Drop
- **Deck to surface** - Drag cards from bottom dock to reading surface
- **Surface repositioning** - Hold-and-drag placed cards (150ms threshold distinguishes click from drag)
- **Return to deck** - Drag card back to deck area to return it
- **Snap to slots** - Cards snap to spread positions when dropped nearby

### 3. Card Interactions
- **First click** - Flips card with animation (lift + rotate)
- **Second click** - Opens meaning modal
- **Reversals** - Toggle-able; 50% chance when flipping. IMPORTANT: reversals switched off by default
- **Dev mode** - Shows card IDs for debugging

### 4. Spread System
Four built-in spreads with ghost card slots:

| Spread | Cards | Description |
|--------|-------|-------------|
| Single Card | 1 | Quick insight or daily guidance |
| Three Card | 3 | Past, Present, Future |
| Spirit | 5 | Elemental cross (Earth, Air, Fire, Water, Spirit) |
| Tree of Life | 11 | Mary K. Greer's practical version with Da'at |

**Ghost slots** show:
- Position name as pill-shaped label above slot
- Tooltip with prompt on hover (e.g., "Past influences that led to this moment")
- Ghost slots should not overlap to keep the layout clean

### 5. Dock System (macOS-style)
The card deck behaves like a macOS dock:
- **Full height** when no cards placed on surface
- **Collapsed to 78px** after first card placed (shows card tops)
- **Expands on hover** - Cards rise up, overlapping the reading surface
- **Canvas stays fixed** - Reading surface never moves

**Technical implementation:**
- `deck-area` = 78px fixed height anchor with `overflow: visible`
- `deck-container` = Full height, positioned at `bottom: 0`, extends upward
- `transform: translateY()` + `clip-path` for show/hide animation
- `clip-path` prevents expanded dock from blocking buttons below
- Cards moved to `document.body` during drag to escape clip-path

### 6. Reading Surface
- **Gradient fade** at bottom - Elegant transition to dock area
- **Border fades** with gradient using CSS mask
- **Zoom/Pan controls:**
  - Cmd/Ctrl + scroll = cursor-centered zoom (50%-300%)
  - Space + drag = pan
  - Arrow keys = pan 30px
  - Scroll wheel = pan
  - Cmd/Ctrl + 0 = reset
- **Auto-zoom** - Fits spread to viewport when selected

### 7. Text Annotations
- **Aa button** - Click reading surface to add text box
- **Draggable/resizable** text boxes
- **Font controls** - Aa/+/- buttons (hidden when dragging)
- **Auto-height** - Textarea grows with content
- **No spellcheck** - Disabled for cleaner appearance

### 8. Spread Reference Panel
- **Procreate-style** floating panel showing spread layout
- **Draggable** - Move anywhere on surface
- **Resizable** - Drag edges to resize
- **Real-time updates** - Shows which positions are filled
- **Auto-hide** - Hidden when no spread selected or on reset

### 9. Card Meaning Modal
- **Large format** - 520px max-width, 220×352px card image
- **Position context** - Shows spread position name and prompt when applicable
- **Expandable meanings** - Keywords (upright/reversed) + full interpretation
- **No motion** - Simple fade-in for clean UX

### 10. Persistence (LocalStorage)
- **Current reading** - Auto-saves card positions, flipped state, text boxes
- **Preferences** - Theme, reversals toggle, dev mode
- **Reading history** - Save/name readings, browse/restore later

---

## Design Decisions & Rationale

### Why Vanilla JS?
- **Portability** - Single HTML file works anywhere
- **No build tools** - Edit and run immediately
- **Learning** - Clear, readable code without framework abstractions
- **Performance** - No framework overhead

### Why CSS Variables?
```css
:root {
    --deck-card-width: clamp(40px, 5vw, 60px);
    --placed-card-width: clamp(100px, 12vw, 150px);
}
```
- **Responsive** - Card sizes adapt to viewport
- **Consistent** - Single source of truth for dimensions
- **Themeable** - Easy dark/light mode via HSL variables

### Why Transform-Based Positioning?
Cards use `transform: translate(-50%, -50%)` for centering:
- **Percentage-based** - Position stored as % for responsive scaling
- **GPU-accelerated** - Smooth animations
- **Caveat** - Drag calculations must account for this offset

### Why Dock Slides Up (Not Height Animation)?
Previous attempts to animate `height` caused:
- Reading surface to resize (flex recalculation)
- Cards to shift position
- Layout instability

**Solution:** Fixed-height anchor with `translateY` + `clip-path`:
- Canvas never moves
- Buttons never blocked
- Smooth animation

### Why Move Dragged Card to Body?
The dock's `clip-path` clips all children, including dragged cards.
Moving to `document.body` escapes this:
```javascript
document.body.appendChild(draggedCard);
// ... on drop, either place on surface or return to deckContainer
```

### Why Gradient Fade on Reading Surface?
Hard borders looked dated. The gradient:
- Fades background from solid to transparent
- Fades border using CSS `mask-image`
- Creates seamless transition to dock below

### Why 78px Dock Height?
Experimented with various heights:
- 36px - Too hidden, couldn't see cards
- 48px - Still too hidden
- **78px** - Shows roughly half of card, clearly indicates more content


---

## CSS Architecture

### Color System (shadcn-inspired)
```css
:root {
    --background: 0 0% 100%;      /* White */
    --foreground: 222 47% 11%;    /* Near black */
    --card: 0 0% 100%;            /* Card backgrounds */
    --muted: 210 40% 96%;         /* Subtle backgrounds */
    --primary: 222 47% 11%;       /* Accent color */
    --border: 214 32% 91%;        /* Borders */
    --radius: 0.5rem;             /* Border radius */
}
```

### Dark Mode
```css
body.dark-mode {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    /* ... inverted values */
}
```

### Z-Index Layers
| Layer | Z-Index | Purpose |
|-------|---------|---------|
| Reading surface content | 1 | Base layer |
| Gradient fade | 5 | Above content |
| Border fade | 6 | Above gradient |
| Deck area | 10 | Above surface |
| Placed cards | 50-100 | Interactive |
| Text boxes | 55-70 | Editable |
| Spread reference | 100 | Floating panel |
| Spread slot labels | 200 | Always visible |
| Modal | 1000 | Overlay |
| Dragged card | 10000 | Top-most |

---

## JavaScript Architecture

### Global State
```javascript
let deck = [...];              // Cards remaining in deck
let placedCards = [];          // { card, element } on surface
let textBoxes = [];            // Text annotation elements
let currentSpread = null;      // Active spread template
let spreadSlots = [];          // Ghost slot elements
let currentZoom = 1;           // Zoom level (0.5-3)
let panX = 0, panY = 0;        // Pan offset
let reversalsEnabled = false;  // Reversals toggle
let devMode = false;           // Show card IDs
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `initializeDeck()` | Create/reset 78-card deck |
| `renderDeck()` | Display cards in fan layout |
| `startDrag()` / `endDrag()` | Handle deck card dragging |
| `placeCard()` | Add card to reading surface |
| `addPlacedCardHandlers()` | Click/drag for placed cards |
| `showCardModal()` | Display card meaning popup |
| `renderSpreadSlots()` | Create ghost card positions |
| `autoZoomToFitSpread()` | Zoom to show all positions |
| `saveCurrentReading()` | Persist to localStorage |
| `restoreReading()` | Load from localStorage |

### Event Flow: Dragging a Card

1. `mousedown` on deck card → `startDrag()`
2. Card moved to `document.body` (escape clip-path)
3. Card set to `position: fixed`
4. `mousemove` → `drag()` updates position
5. `mouseup` → `endDrag()`
   - If over surface: `placeCard()`, remove from deck
   - Else: return to `deckContainer`

### Event Flow: Clicking a Placed Card

1. `mousedown` → record time, position
2. `mouseup` within 150ms without movement = click
3. If not flipped: play flip animation, maybe reverse
4. If flipped: `showCardModal()`

---

## Spread Data Structure

```javascript
const SPREADS = {
    threeCard: {
        id: 'threeCard',
        name: 'Three Card',
        description: 'Past, Present, and Future...',
        positions: [
            { 
                id: 1, 
                name: 'Past', 
                percentX: 35,      // Horizontal position (%)
                percentY: 45,      // Vertical position (%)
                prompt: 'Past influences and foundations...'
            },
            // ...
        ]
    }
};
```

---

## Card Data Structure

```javascript
const TAROT_DECK = [
    { id: 'major-0', name: 'The Fool', arcana: 'Major', value: 0 },
    { id: 'wands-01', name: 'Ace of Wands', arcana: 'Minor', suit: 'Wands', value: 1 },
    // ...
];

const TAROT_MEANINGS = {
    'major-0': {
        keywords: {
            upright: ['new beginnings', 'innocence', ...],
            reversed: ['recklessness', 'risk-taking', ...]
        },
        upright: 'The Fool represents new beginnings...',
        reversed: 'Reversed, The Fool suggests...'
    }
};
```

---

## localStorage Keys

| Key | Content |
|-----|---------|
| `tarot-current-reading` | Current session (cards, text, spread) |
| `tarot-preferences` | Theme, reversals, dev mode |
| `tarot-reading-history` | Array of saved readings |

---

## Known Limitations & Future Considerations

### Current Limitations
1. **No multi-touch** - Single touch only on mobile
2. **No undo** - Can't undo card placements
3. **Fixed card images** - External dependency on steve-p.org
4. **No export** - Can't export reading as image/PDF

### Potential Enhancements
1. **Custom spreads** - User-defined spread templates
2. **Reading notes** - Rich text with formatting
3. **Card journal** - Track which cards appear frequently
4. **Print view** - Optimized layout for printing
5. **Offline support** - Service worker + cached images
6. **Keyboard shortcuts** - Full keyboard navigation

---

## Browser Support

Tested and working in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires:
- CSS `clamp()`
- CSS `backdrop-filter`
- CSS `clip-path`
- CSS Custom Properties
- ES6+ JavaScript

---

## Quick Reference: Common Tasks

### Add a new spread
1. Add entry to `SPREADS` object in tarot.js
2. Define `positions` array with percentX, percentY, name, prompt

### Change card dimensions
Edit CSS variables in `:root`:
```css
--deck-card-width: clamp(40px, 5vw, 60px);
--placed-card-width: clamp(100px, 12vw, 150px);
```

### Adjust dock peek height
In `.deck-area.docked .deck-container`:
```css
transform: translateY(calc(100% - 78px));
clip-path: inset(0 0 calc(100% - 78px) 0);
```
Also update `.deck-area { height: 78px; }`

### Change animation timing
- Card appear: `.placed-card` animation property
- Card flip: `@keyframes cardFlip`
- Modal: `.card-modal` transition property

---

---

## Future Changes

1. When overwriting session, clicking on reading history > that particular session would yield the latest overwritten session by default. however, there's also a dropdown menu included of all the past session(s) that one can hop into
2. escape does not result in pop up window closing. would like escape to also result in reading history, save reading, and text mode to be exited, depending on the situation
3. text boxes are not responsive (i dont need them to shrink in size, but keep the positions relative to the rest of the cards/viewport the same at least) (fixed in v7_6)
4. low priority: when shifting the text boxes, sometimes they kind of...in a seamless way? lose their anchor position relative to the cursor so i'm still shifting the text box but the cursor looks so far away from the textbox, if that makes sense (fixed in v7_6)

---

*Document created: December 26, 2025*
*Last updated: December 26, 2025*
