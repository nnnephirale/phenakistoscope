# TypeMaker - Development Decision Log

This document tracks all key decisions made during the TypeMaker project development.

---

## Project Overview

**Project Name:** TypeMaker
**Description:** Web-based custom typography/font creation tool with Illustrator-like UX
**Start Date:** 2026-01-13
**Status:** Planning Complete, Ready for Implementation

---

## Key Decisions

### 1. Architecture & Tech Stack

**Decision:** Single-file HTML application with vanilla JavaScript
**Date:** 2026-01-13
**Rationale:**
- Follows proven SSaved pattern from existing codebase
- Simple deployment (one file)
- No build process required
- Easy debugging
- Can refactor to modular later if needed

**Tech Stack Selected:**
- HTML/CSS/Vanilla JavaScript
- Tailwind CSS (CDN) - Styling
- Phosphor Icons (CDN) - Icon system
- Fabric.js (~200KB, CDN) - SVG manipulation
- opentype.js (~90KB, CDN) - Font generation
- LocalStorage - Data persistence

**Total Overhead:** ~300KB from CDN (acceptable for desktop app)

---

### 2. Rendering Engine: SVG vs Canvas

**Decision:** SVG-based rendering (NOT Canvas)
**Date:** 2026-01-13
**Rationale:**
- Vector-native (perfect for font work)
- Easier selection and transformation
- Better export compatibility (SVG → font formats)
- DOM-inspectable for debugging
- Fabric.js provides Canvas-like API on top of SVG
- Native Bezier curve support

**Alternative Considered:** HTML5 Canvas
- Would require custom hit detection
- More complex event handling
- Redraw on every change
- Less alignment with export formats

---

### 3. SVG Manipulation Library

**Decision:** Use Fabric.js from the start
**Date:** 2026-01-13
**Options Considered:**
1. Pure vanilla JS - More lightweight but slower development
2. Fabric.js - Built-in features, proven solution (SELECTED)
3. Paper.js - More artistic focused, 181KB

**Rationale for Fabric.js:**
- Mature library (10+ years)
- Built-in Bezier curve editing
- Transform operations (scale, rotate, skew)
- Selection system (bounding boxes, anchor points)
- Canvas serialization (save/load)
- Active community and documentation
- Size acceptable (~200KB)

---

### 4. Device Support

**Decision:** Desktop-only for MVP
**Date:** 2026-01-13
**Rationale:**
- Focus on mouse/keyboard UX (simpler, faster to build)
- Complex Illustrator-like tools work better on desktop
- Reduces initial complexity
- Mobile/tablet support can be added post-MVP

**Future:** Responsive design for tablets/mobile in later phase

---

### 5. Undo/Redo System

**Decision:** Global undo stack (across all characters)
**Date:** 2026-01-13
**Options Considered:**
1. Per-character undo - Simpler to implement but confusing UX
2. Global undo - Better UX, matches Illustrator behavior (SELECTED)

**Rationale:**
- More intuitive for users
- Consistent with Illustrator expectations
- Better UX when switching between characters
- Worth the extra implementation complexity

**Implementation:**
- History stack for all operations
- Limit: 50 operations (memory management)
- Operation labels for clarity

---

### 6. Development Strategy

**Decision:** Incremental milestones with independent releases
**Date:** 2026-01-13
**Options Considered:**
1. Build full MVP first - Better initial impression, longer wait
2. Incremental milestones - Faster feedback loops (SELECTED)

**Milestones:**
1. **Milestone 1 (Weeks 1-2):** Grid Designer standalone
2. **Milestone 2 (Weeks 3-4):** Font Making Workspace
3. **Milestone 3 (Weeks 5-6):** Export System

**Rationale:**
- Faster user feedback
- Can validate architecture early
- Each milestone is independently testable
- Reduces risk of building wrong thing

---

### 7. Color Support

**Decision:** Black fills only for MVP
**Date:** 2026-01-13
**Rationale:**
- Sufficient for initial launch
- Reduces complexity
- Display fonts can be single-color
- Color picker, gradients, patterns can be added later (Phase 7)

**Future Enhancement:** Color system post-v1.0

---

### 8. Grid Template & Font Project Relationship

**Decision:** 1:1 relationship (one grid template = one font project)
**Date:** 2026-01-13
**Rationale:**
- Simplifies mental model for users
- All characters in a project use the same grid
- Can be changed later if users request it
- Easier to implement initially

---

### 9. Data Persistence

**Decision:** LocalStorage for MVP
**Date:** 2026-01-13
**Options Considered:**
1. LocalStorage - Simple, client-side only (SELECTED)
2. Supabase - Cloud storage, collaboration features
3. IndexedDB - More storage, more complex

**Rationale:**
- Simple to implement
- No backend required
- 5-10MB typically sufficient for display fonts
- Fallback plan: Compress with LZ-string if quota issues
- Future: Migrate to IndexedDB or Supabase

**Risk Mitigation:**
- Warn user at 80% quota
- Export/import project files as JSON backup

---

### 10. Export Formats

**Decision:** Support 4 formats - SVG, PNG, OTF, TTF
**Date:** 2026-01-13
**Priority:**
1. SVG - Easiest, native format
2. PNG - Easy, using Fabric.js toDataURL()
3. OTF/TTF - Most complex, using opentype.js

**Rationale:**
- SVG: Web usage, vector editing
- PNG: Social media, presentations
- OTF/TTF: Professional design tools (Illustrator, Photoshop, Figma)

**Implementation Order:**
- Build SVG/PNG first (validate export system)
- Then tackle OTF/TTF (most complex)

---

### 11. Grid Visibility UI

**Decision:** Checkbox + Radio button approach
**Date:** 2026-01-13

**UI Structure:**
```
Layer 1 (Grid):
[✓] Grid Visible
    ○ Behind letters
    ○ In front of letters
```

**Rationale:**
- Simple and clear
- Radio buttons only enabled when checkbox is checked
- Default: Grid visible, behind letters
- Grid always hidden in exports (automatic)

---

### 12. Character Assignment

**Decision:** Alphabetical by default, editable via text field
**Date:** 2026-01-13
**Implementation:**
- Characters assigned in order (A-Z, 0-9, symbols)
- User can type in text field in side panel to change
- Dropdown per character for quick assignment
- Validation to prevent duplicates

---

### 13. Default Grid Options

**Decision:** Slider-based rows/columns only for MVP
**Date:** 2026-01-13
**Original Idea:** Include preset shapes (circles, honeycombs, tessellations)

**Rationale:**
- Shapes can be implemented later (post-MVP)
- Slider approach is simpler and more flexible
- Users can create custom grids with drawing tools
- Focus on core functionality first

**Future Enhancement:** Preset grid shapes library

---

### 14. Reference Image Layer

**Decision:** Character-agnostic (shared across workspace)
**Date:** 2026-01-13
**Rationale:**
- Floats on canvas, moveable independently
- Functions as visual reference for entire workspace
- Simpler implementation
- Per-character option can be added later if needed

---

### 15. Drawing Modes

**Decision:** Two modes with seamless switching
**Date:** 2026-01-13

**Mode 1 - Pure Color Fill:**
- Fill grid cells with black
- Adjacent cells remain separate shapes (no auto-merge)

**Mode 2 - Shape Manipulation:**
- Each fill = single shape object
- Select multiple adjacent shapes → merge tooltip appears
- Transform via Direct Selection (anchor points) or Selection tool (bounding box)

**Toggle:** Tab key to switch modes

---

### 16. Font File Generation

**Decision:** Client-side generation using opentype.js
**Date:** 2026-01-13
**Alternative Considered:** Backend service (Node.js + fontforge)

**Rationale:**
- Maintains "lightweight HTML/CSS/JS only" requirement
- No server infrastructure needed
- Instant generation (no upload/download delays)
- opentype.js is mature and well-documented

**Risk:** If opentype.js insufficient, may need backend fallback

---

### 17. File Structure

**Decision:** Single file initially, can refactor later
**Date:** 2026-01-13

**File:** `/Users/imac/.claude-worktrees/03_SSAVED/upbeat-liskov/typemaker.html`

**Rationale:**
- Consistent with SSaved architecture
- Faster initial development
- Can refactor to modular (separate JS/CSS files) later if needed

**Estimated Size:** 1500-2500 lines

---

### 18. Keyboard Shortcuts

**Decision:** Match Illustrator shortcuts exactly
**Date:** 2026-01-13

**Tools:**
- P: Pen tool
- V: Selection tool
- A: Direct Selection
- O: Reflect tool
- E: Eraser

**Edit:**
- Cmd-Z: Undo
- Cmd-Shift-Z: Redo
- Cmd-C/V: Copy/Paste
- Cmd-D: Duplicate
- Delete: Remove selected

**View:**
- Cmd-+/-: Zoom
- Cmd-0: Fit to screen
- Space-drag: Pan

**Rationale:**
- Feels familiar to Illustrator users (target audience)
- No learning curve for existing designers

---

### 19. Timeline

**Decision:** 6 weeks for full implementation
**Date:** 2026-01-13

**Breakdown:**
- Weeks 1-2: Milestone 1 (Grid Designer)
- Weeks 3-4: Milestone 2 (Font Making Workspace)
- Weeks 5-6: Milestone 3 (Export System)

**Note:** Solo developer working full-time estimate

---

## Design Decisions

### UI/UX Style

**Decision:** Shad CN / Tailwind aesthetic
**Date:** 2026-01-13
**Rationale:**
- Modern, clean design
- Matches user preference
- Tailwind makes rapid prototyping easy
- Professional look

---

### Side Panel Organization

**Contents:**
1. Tool palette (icons + labels)
2. Character assignment controls
3. Layer stack visualization
4. Transform controls (numeric inputs)
5. Grid controls (rows/columns sliders)
6. Drawing mode toggle
7. Collapsible sections for organization

---

### Font Progress Drawer

**Decision:** Pullable drawer (slider component)
**Date:** 2026-01-13
**Alternative Considered:** Always-visible panel

**Rationale:**
- Saves screen space
- User pulls up when needed
- CSS transform transitions for smooth animation
- Click character to jump to edit

**Contents:**
- Grid view of all characters
- Grid preview thumbnail
- Assigned character label
- Date created
- Progress indicator (empty/in-progress/complete)

---

## Technical Challenges Identified

### 1. Bezier Curve Editing
**Challenge:** Complex to implement from scratch
**Solution:** Use Fabric.js built-in Bezier editing

### 2. Font Coordinate System Transformation
**Challenge:** SVG uses top-left origin, fonts use bottom-left
**Solution:** Flip y-coordinates during export: `y' = fontHeight - y`

### 3. LocalStorage Quota Limits
**Challenge:** 5-10MB limit, complex fonts could exceed
**Solution:**
- Compress with LZ-string (50% reduction)
- Monitor storage, warn at 80%
- Fallback: Export/import project files as JSON
- Future: Migrate to IndexedDB

### 4. Multi-Character Undo/Redo
**Challenge:** Managing history across multiple characters
**Solution:** Global undo stack with character context

### 5. SVG Path Boolean Operations
**Challenge:** Merging/subtracting shapes requires complex algorithms
**Solution:** Use Fabric.js built-in boolean operations

### 6. Performance with Complex Paths
**Challenge:** 1000+ points can cause lag
**Solution:**
- Path simplification algorithms
- Lazy rendering (only render visible characters)
- Limit max points per path with warning

---

## Success Metrics

### Milestone 1 Success
- User can create and save custom grid templates
- All drawing tools work smoothly
- Undo/redo functions correctly

### Milestone 2 Success
- User can create a 26-character alphabet (A-Z)
- Layer system works correctly
- Character switching is seamless

### Milestone 3 Success
- Exported OTF/TTF installs successfully
- Font renders correctly in design tools (Illustrator, Photoshop, Figma)
- All 4 export formats work

---

## Future Enhancements (Post-MVP)

**Documented but deferred:**
1. Color support (picker, gradients, patterns)
2. Advanced shape tools (tessellated honeycombs)
3. Font variations (multiple weights)
4. Collaboration features
5. Community font library
6. Mobile/tablet support
7. Cloud storage (Supabase integration)
8. Ligatures and kerning
9. Font hinting
10. Per-character reference images

---

## Risk Mitigation Strategies

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Font export fails | Medium | High | Extensive testing with opentype.js, fallback to SVG-only |
| LocalStorage quota exceeded | Medium | Medium | Compression + IndexedDB fallback |
| SVG performance issues | Low | Medium | Path simplification, lazy rendering |
| Bezier editing complexity | Low | High | Use Fabric.js for proven solution |
| opentype.js limitations | Medium | High | Research alternatives early, backend fallback |
| Browser compatibility | Low | High | Test on Chrome/Firefox/Safari/Edge, polyfills |

---

## Questions Asked & Answered

### Q1: Fabric.js or vanilla JS?
**Answer:** Fabric.js from the start (recommended approach)
**Reason:** Built-in features worth the 200KB overhead

### Q2: Desktop-only or responsive?
**Answer:** Desktop-only for MVP
**Reason:** Focus on core functionality first, simpler implementation

### Q3: Global or per-character undo?
**Answer:** Global undo (recommended)
**Reason:** More intuitive, matches Illustrator behavior

### Q4: Full MVP or incremental milestones?
**Answer:** Incremental milestones
**Reason:** Faster feedback loops, validate architecture early

---

## Reference Files

**Main Implementation File:**
- `/Users/imac/.claude-worktrees/03_SSAVED/upbeat-liskov/typemaker.html` (TO BE CREATED)

**Reference Pattern File:**
- `/Users/imac/.claude-worktrees/03_SSAVED/upbeat-liskov/index.html` (SSaved app)
  - Lines 492-1591: State management patterns
  - LocalStorage persistence
  - Drag-and-drop handling
  - Undo functionality

**Plan File:**
- `/Users/imac/.claude/plans/enumerated-floating-flamingo.md`

---

### 20. User Flow & Project Start

**Decision:** Primary action is "+ New Project" with default grid
**Date:** 2026-01-13 (updated)

**User Flow:**
1. Landing → [+ New Project] (primary, prominent button)
2. Grid Designer opens with default grid (10×8 rows/columns)
3. [Load Custom Grid] button (small, top-right corner)
4. [Load Project] button (secondary, smaller, in top menu or corner)

**Rationale:**
- Reduces friction - user starts creating immediately
- Default grid is good starting point (can adjust with sliders)
- Load options available but not blocking primary flow
- Matches "create first, customize later" mental model

**Alternative Considered:** Grid selection modal first
- Would add extra step before creating
- Less immediate, more friction

---

### 21. Project Scope

**Decision:** Personal tool for now, not business-focused
**Date:** 2026-01-13 (updated)

**Rationale:**
- User creating for personal use/learning
- If well-developed, could be useful for others
- Removed business goals (user acquisition, retention, etc.)
- Focus on building great tool first, worry about scale later

---

## Change Log

### 2026-01-13 - Bug Fixes: Undo/Redo & Snap
- **Fixed undo/redo breaking after tool switch**
  - Selection and Direct Selection tools were removing ALL event listeners
  - This was breaking `object:modified` events needed for undo/redo
  - Now only removes specific mouse event listeners
  - Undo/redo now works consistently across all tools
- **Fixed snap-to-grid not working**
  - Event listeners were being prematurely removed
  - `object:moving` handler now properly persists
  - Snap-to-grid now works smoothly when toggle is ON

### 2026-01-13 - UX Improvements
- **Fixed pen tool path length limitation**
  - Removed overly aggressive `options.target` check
  - Now only ignores clicks on grid lines specifically
  - Pen tool can now draw paths of any length across entire canvas
  - Path building continues smoothly regardless of cursor position
- **Added snap-to-grid for Selection tool**
  - Implemented `object:moving` event handler
  - Objects now snap to grid in real-time when snap toggle is ON
  - Works for both single and multi-selection
  - Smooth dragging experience matching Illustrator UX
  - Grid lines remain protected from snapping/movement
- Both fixes prioritize easy, intuitive user experience

### 2026-01-13 - Phase 1 Fixes
- **Fixed pen tool selection conflict**
  - Pen tool was triggering selection on existing objects
  - Now properly disables all object selection when active
  - Clears all event listeners before enabling pen mode
  - Discards any active selection when clicking
- **Grid lines now fully protected**
  - Added complete lock properties: lockMovementX/Y, lockRotation, lockScaling
  - Grid lines cannot be selected, moved, rotated, or scaled
  - Added hasControls: false and hasBorders: false
  - Grid lines stay in exact position - no accidental shifts
- **Shape tools also fixed**
  - Same event listener cleanup as pen tool
  - Prevents selection conflicts
- Pen tool now draws cleanly without interference!

### 2026-01-13 - Phase 1 Complete: Drawing Tools
- **Pen Tool** implemented with snap-to-grid
  - Click to place points, builds path live
  - Shows preview line while moving cursor
  - Double-click or Escape to finish path
  - Paths saved to customPaths array
- **Shape Tools** fully functional
  - Circle: drag to create (uses max dimension for radius)
  - Square: drag to create rectangle
  - Rounded Square: drag with 10px corner radius
  - Live preview while dragging
  - Snap-to-grid support
- **Selection Tool (V)** enabled
  - Click objects to select with bounding box
  - 8 handles for scaling/transforming
  - Multi-select with Shift
  - Object modifications saved to history
- **Direct Selection Tool (A)** enabled
  - Selects path objects for editing
  - Note: Full Bezier anchor point editing requires plugin (future enhancement)
  - Currently enables selection and basic transforms
- **Eraser Tool** working
  - Hover shows red highlight on deletable objects
  - Click to delete custom paths/shapes
  - Grid lines protected from deletion
  - Removes from customPaths array
- **Snap-to-grid** function respects toggle state
- All tools save to undo/redo history
- Tool switching cleans up previous tool state
- Ready for Milestone 1 testing!

### 2026-01-13 - Phase 0 Complete
- **Created typemaker.html** - Foundation complete (800+ lines)
- Implemented basic structure with all CDN libraries
- State management system initialized
- LocalStorage persistence with auto-save (3s debounce)
- Grid rendering system (10×8 default)
- Undo/Redo system with 50-operation limit
- Tool switching UI (Pen, Select, Direct, Eraser, Shapes)
- Zoom controls (50%-400%)
- Template save/load modals
- Keyboard shortcuts (P, V, A, E, Cmd-Z, Cmd-Shift-Z)
- Flip transforms (horizontal/vertical)

### 2026-01-13 - Evening Update
- Updated PRD: Removed business goals section (personal tool focus)
- Updated user flow: "+ New Project" as primary action, load options secondary
- Simplified landing experience: Start with default grid immediately
- Added decisions #20 and #21 to decision log

### 2026-01-13 - Initial Planning
- Initial planning session completed
- All architectural decisions documented
- Tech stack finalized
- Development strategy agreed: 3 incremental milestones
- Ready to begin Phase 0: Foundation

---

## Notes

- User prefers lightweight solutions (vanilla JS, no heavy frameworks)
- User is familiar with Adobe Illustrator (target UX pattern)
- User wants incremental releases for faster feedback
- Black fills only for MVP (colors deferred)
- Desktop-only for MVP (mobile deferred)

---

**Last Updated:** 2026-01-13
**Next Review:** After Milestone 1 completion
