# Digital Phenakistoscope Maker — PRD v2

## Overview

A browser-based tool for creating phenakistoscope animations. Users draw or upload images across 13 frames, then view them as a spinning disc where all frames play simultaneously in radial arrangement.

---

## Views

### 1. Single Frame Editor (default)

- **Canvas**: 900×900px working area with transparent background
- **Wedge overlay**: 1/13th slice (≈27.7°) shown as positive space, outer arc at top, point at bottom. Area outside the wedge is visible but dimmed — drawable, but won't appear on final disc
- **Onion skinning layer**: Ghost canvas displays the previous frame on top of the current frame at adjustable opacity
  - Frame 1 has no ghost (nothing before it)
  - Frames 2-13 show previous frame as semi-transparent overlay
  - Toggle checkbox and opacity slider (5-50%) in side panel
  - Ghost layer sits above main canvas (critical for proper transparency handling), below UI overlay
  - Main canvas maintains full opacity drawing; only ghost layer is semi-transparent
- **Frame carousel below canvas**: All 13 frames in a horizontal row, active frame centered and largest, inactive frames smaller and lower opacity. Clicking an inactive frame slides it to center. Wraps around at edges. Arrow keys navigate.

### 2. Phenakistoscope View

- Fills viewport, side panel hidden
- 13 wedges arranged radially forming complete disc
- **Disc animation**: Rotates at 12 FPS, jumping exactly one wedge per frame
  - Each wedge lands in the same position as the previous one
  - Content changes while position stays fixed
  - Classic persistence of vision effect
- Cream background
- Exit via click anywhere or small corner button

---

## Side Panel (left)

### Drawing Tools

- **Selection tool (V)**: Default tool for selecting and manipulating images (active on load)
- **Brush (B)**: Draw black strokes (single size)
- **Eraser (E)**: Erase with true transparency (uses destination-out composite operation)
- Clear frame button (clears to transparent, not white)

**Auto-conversion behavior**: When switching from Brush/Eraser to Selection tool, drawn strokes automatically convert to a moveable image. The original strokes are cleared and replaced with a full-frame image (900×900px) that can be transformed like any uploaded image.

### History Controls

- Undo button (Cmd+Z / Ctrl+Z): Revert to previous state
- Redo button (Cmd+Shift+Z / Ctrl+Shift+Z): Restore undone state
- Maintains up to 50 history states
- Tracks both canvas drawing and image manipulations

### Onion Skinning

- Toggle checkbox: Show/hide previous frame overlay
- Opacity slider: 5-50% (default 20%)
- Only applies to frames 2-13 (frame 1 has no previous frame)
- Ghost canvas layer reads from stored frames, doesn't affect disc view

### Image Tools

- Upload button + drag-and-drop onto canvas
- **Apply to all frames** checkbox: When checked, uploaded images appear in all 13 frames at the same position
- Images appear at horizontal+vertical center by default
- Transform controls for selected image:
  - Drag to move with smart snapping:
    - Snaps to canvas center when near
    - Snaps to other images' centers when near (for alignment)
  - Arrow keys: nudge 1px (Shift+arrow: nudge 10px)
  - Side handles: pull outward to scale up, inward to scale down
  - Rotation handle (Figma-style, floating above selection)
- Multiple images can be layered per frame
- Copy/paste: Cmd+C/Ctrl+C to copy selected image, Cmd+V/Ctrl+V to paste in exact same position
- Delete: Delete/Backspace key removes selected image
- **Position tracker** (visible when image is selected):
  - Displays X and Y coordinates (top-left corner reference)
  - Copy X button: Copy X coordinate to clipboard
  - Copy Y button: Copy Y coordinate to clipboard
  - Paste X button: Apply copied X coordinate to selected image
  - Paste Y button: Apply copied Y coordinate to selected image

---

## Visual Design

**Palette:**

- Primary: Cream/off-white
- Borders/UI: Lighter cream (subtle, iOS-like)
- Accents: Mustard yellow, TE red (used sparingly)
- Drawing/content: Black

**Typography:**

- Headers: Blackletter
- Body/UI: Blocky, readable sans-serif

**Components:** shadcn/ui, styled to match

**Vibe:** Nu-medieval spirit — warm, geometric, crafted — but executed with restraint and subtlety

---

## Tech

- HTML, CSS, vanilla JS
- Canvas layers (bottom to top): main canvas (drawing/images) + ghost canvas (onion skin) + overlay canvas (wedge guide)
- Transparent backgrounds throughout — frames store only drawn content, no fill color
- Tool system: Selection (default), Brush, Eraser with keyboard shortcuts (V, B, E)
- Auto-conversion: Strokes convert to images when switching to selection tool
- Eraser uses `destination-out` composite operation for true alpha channel manipulation
- State management with history system:
  - Deep clones canvas elements and image arrays
  - Circular buffer limited to 50 states for memory management
  - Supports undo/redo through keyboard shortcuts and UI buttons
- No backend, no localStorage persistence (v2)
- Desktop-first

---

## Future Considerations (not v2)

- Adjustable frame count (slider, 8-16 range)
- Canvas size control
- localStorage persistence
- Export (GIF, video, image)
- More drawing tools (colors, brush sizes)
- Mobile/touch support
- Adjustable disc rotation speed
