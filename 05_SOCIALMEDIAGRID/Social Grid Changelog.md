# Grid Visualizer — Development Changelog

A lightweight web-based tool for art directors to rapidly visualize and arrange social media content in customizable masonry-style grids.

**Inspiration**: Mobbin (mobbin.com), Carl Hauser (carlhauser.com)

---

## Current State (v1.1)

### Architecture
- Single HTML file, no build process
- Vanilla JavaScript, CSS3 Grid
- No external dependencies

---

## Features Implemented

### Grid System
| Feature | Status | Notes |
|---------|--------|-------|
| Dynamic column control | ✅ | 2-8 columns via slider |
| Adjustable gap | ✅ | 0-40px, also acts as image padding |
| Corner radius | ✅ | 0-32px for cells |
| Cell height | ✅ | 80-400px |
| Variable cell sizes | ✅ | Click to select → resize handles (1x1, 2x1, 2x2) |
| Background color | ✅ | Color picker, default #f5f5f5 (Mobbin grey) |

### Image Management
| Feature | Status | Notes |
|---------|--------|-------|
| Drag & drop upload | ✅ | Drop images directly into cells |
| Image containment | ✅ | `object-fit: contain` — images show in full, no cropping |
| Global scale | ✅ | 50-150%, default 80% |
| Per-image scale | ✅ | Via cell modal when selected |
| Per-image X/Y position | ✅ | With reset buttons to return to 0 |
| Cell count control | ✅ | Slider (1-50) + number input (up to 100) |
| Drag to reorder | ✅ | Swap images between cells |

### Hover Effects
| Feature | Status | Notes |
|---------|--------|-------|
| Subtle scale up | ✅ | 2% increase on hover |
| Drop shadow | ✅ | Intensity controllable (0-40%, default 7%) |
| Directional tilt | ✅ | Mouse-position sensitive, intensity 0-25° (default 6°) |
| Delayed tilt activation | ✅ | 0.4s delay before tilt engages |
| Smooth tilt transitions | ✅ | Lerp interpolation for gradual movement |

### UI/Controls
| Feature | Status | Notes |
|---------|--------|-------|
| Horizontal toolbar | ✅ | 3-column layout at top |
| Resizable toolbar | ✅ | Drag bottom edge (80-280px) |
| Auto-hide on scroll | ✅ | Hides when scrolling down, shows on scroll up |
| Preview mode | ✅ | `P` key or button, completely hides toolbar |
| Cell selection modal | ✅ | Appears below cell (not overlapping) |
| Keyboard shortcuts | ✅ | P=preview, Delete=remove cell, Esc=deselect |

---

## Design Decisions

### Image Display (No Cropping)
**Decision**: Images display in full with `object-fit: contain` rather than `cover`.

**Rationale**: For art direction review, seeing the complete composition matters more than filling the cell. Gap between image and cell edge provides visual breathing room.

### Padding X/Y Removed
**Decision**: Removed separate padding controls; gap slider handles spacing.

**Rationale**: The gap value effectively creates padding between cells. Separate padding controls added complexity without clear benefit, and the implementation had issues.

### Tilt Effect Delay (0.4s)
**Decision**: Directional tilt activates 0.4 seconds after cursor enters cell.

**Rationale**: Immediate tilt felt jumpy and distracting. The delay allows quick browsing without triggering effects, while lingering reveals the interaction. Originally tested at 1s (too long).

### Tilt Smoothing (Lerp)
**Decision**: Tilt uses linear interpolation (lerp factor 0.08) for gradual transitions.

**Rationale**: Direct mouse-to-rotation mapping felt mechanical. Lerping creates organic, fluid movement that eases both into and out of tilt positions.

### Default Values
| Setting | Default | Rationale |
|---------|---------|-----------|
| Global Scale | 80% | Gives images breathing room in cells |
| Tilt Intensity | 6° | Noticeable but subtle |
| Shadow Intensity | 7% | Perceptible depth without heaviness |
| Columns | 4 | Common social grid layout |
| Gap | 16px | Standard spacing |
| Cell Height | 180px | Good for landscape/portrait mix |

### Toolbar Position
**Decision**: Horizontal toolbar at top instead of vertical sidebar.

**Rationale**: Maximizes horizontal space for the grid (critical for wide layouts). 3-column layout keeps controls organized and scannable.

### Cell Count via Slider + Input
**Decision**: Replaced "Add cell" button with slider (1-50) and number input (1-100).

**Rationale**: Faster iteration. Can quickly set exact count or scrub to approximate. Number input allows exceeding slider max for larger grids.

---

## Known Issues

### Padding X/Y Not Working
The dedicated padding controls were removed due to CSS issues with the implementation. Gap currently serves as the primary spacing mechanism.

### .ai File Support
Adobe Illustrator files cannot be loaded directly. Users must export artboards as PNG/JPG first. Native .ai support would require server-side conversion.

---

## Technical Notes

### Hover Effect Architecture
```
mouseenter → apply scale + shadow immediately
           → start 0.4s timer for tilt
           
mousemove  → update target rotation values
           → if tilt active: lerp toward target
           
mouseleave → cancel timer
           → deactivate tilt (lerps back to 0)
           → remove scale + shadow
```

### Cell Modal Positioning
Modal uses `position: absolute; top: 100%` to appear below the cell. Parent cell has `overflow: visible` when selected to allow this.

### Toolbar Scroll Behavior
Tracks `scrollDelta` on main container. Threshold of 10px prevents micro-movements from triggering. Separate `hidden` class (slide up) vs `preview-hidden` class (display none).

---

## File Structure
```
grid-visualizer.html    # Single-file application
GRID-VISUALIZER-CHANGELOG.md  # This file
```

---

## Future Considerations (from original PRD)
- [ ] Save/load layouts to localStorage
- [ ] Preset grid templates
- [ ] Batch image upload
- [ ] Export clean HTML (strips UI)
- [ ] Social platform aspect ratio presets

---

## Version History

### v1.1 (Current)
- Horizontal 3-column toolbar with resize handle
- Cell count slider + input control
- Reset buttons for X/Y positioning
- Delayed + smoothed tilt effect (0.4s, lerp)
- Updated defaults (80% scale, 6° tilt, 7% shadow)
- Removed padding X/Y controls
- Auto-hide toolbar on scroll

### v1.0
- Initial implementation
- Vertical sidebar
- Basic grid controls
- Drag & drop images
- Cell resizing
- Hover effects (immediate tilt)
- Preview mode
