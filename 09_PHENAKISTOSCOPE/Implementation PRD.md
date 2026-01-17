# Digital Phenakistoscope Maker — Implementation PRD

**Purpose**: This document provides complete implementation specifications for rebuilding the phenakistoscope tool from scratch. It includes all technical details, exact behavior specifications, and code architecture requirements.

---

## Project Overview

A single-page HTML application for creating 13-frame phenakistoscope animations. Users draw or upload images across frames, then view them as an animated spinning disc. No backend required - pure client-side HTML/CSS/JS.

**Tech Stack**:
- Vanilla JavaScript (ES6+)
- HTML5 Canvas API
- CSS3 with CSS variables
- No external libraries or frameworks

---

## Application Architecture

### State Management

Single global state object:

```javascript
const state = {
  currentFrame: 0,           // 0-12
  tool: 'selection',         // 'selection' | 'brush' | 'eraser'
  isDrawing: false,
  frames: [],                // Array of 13 canvas elements (900×900px each)
  images: [],                // Array of 13 arrays, each containing image objects
  selectedImage: null,       // Currently selected image object or null
  copiedImage: null,         // Copied image object or null
  copiedPosition: null,      // {x, y} or null
  view: 'editor',            // 'editor' | 'disc'
  ghostEnabled: true,
  ghostOpacity: 0.2,         // 0.05 to 0.5
  uploadToAllFrames: false,
  history: [],               // Array of state snapshots (max 50)
  historyIndex: -1           // Current position in history
};
```

### Canvas Layer Architecture

Four canvas elements, stacked (bottom to top):

1. **Main canvas** (`#main-canvas`): Drawing and image rendering
2. **Ghost canvas** (`#ghost-canvas`): Onion skinning overlay (previous frame)
3. **Overlay canvas** (`#overlay-canvas`): Wedge guide (dimmed area outside 1/13 slice)
4. **Disc canvas** (`#disc-canvas`): Full disc view (hidden in editor mode)

All editor canvases: 900×900px, absolutely positioned in container.

### Image Object Structure

```javascript
{
  img: Image,        // HTMLImageElement
  x: Number,         // Center X coordinate (0-900)
  y: Number,         // Center Y coordinate (0-900)
  width: Number,     // Scaled width in pixels
  height: Number,    // Scaled height in pixels
  rotation: Number   // Rotation in radians
}
```

---

## Core Constants

```javascript
const CANVAS_SIZE = 900;
const FRAME_COUNT = 13;
const WEDGE_ANGLE = (Math.PI * 2) / FRAME_COUNT;  // ≈27.7°
const SNAP_THRESHOLD = 30;  // pixels
const FRAMES_PER_SECOND = 12;  // For disc animation
```

---

## UI Layout

### Main Structure

```
┌─────────────────────────────────────────────┐
│ Side Panel │  Canvas Area                   │
│            │                                 │
│ Tools      │  ┌──────────────────────┐      │
│ History    │  │                      │      │
│ Image      │  │   900×900 Canvas     │      │
│ Ghost      │  │                      │      │
│ View       │  └──────────────────────┘      │
│            │                                 │
│            │  Frame Carousel (13 thumbs)    │
└─────────────────────────────────────────────┘
```

### Side Panel Sections (top to bottom)

1. **Drawing Tools**
   - Brush button (default active)
   - Eraser button
   - Clear frame button (trash icon)

2. **History**
   - Undo button (disabled when historyIndex ≤ 0)
   - Redo button (disabled when historyIndex ≥ history.length - 1)

3. **Image**
   - Upload button
   - "Apply to all frames" checkbox
   - Position tracker (visible only when image selected):
     - Display: "Position (top-left): X: [value]px, Y: [value]px"
     - Copy Pos button
     - Paste Pos button

4. **Ghost**
   - "Show previous frame" checkbox (default checked)
   - Opacity slider: 5-50%, default 20%

5. **View**
   - "View Disc" button

---

## Detailed Feature Specifications

### 1. Frame Storage System

**Transparent Background Requirement**:
- Frames MUST store only drawn content with alpha channel
- Never initialize with white background
- Use `clearRect()` for clearing, never `fillRect()` with white

**Implementation**:
```javascript
function init() {
  for (let i = 0; i < FRAME_COUNT; i++) {
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = CANVAS_SIZE;
    frameCanvas.height = CANVAS_SIZE;
    // DO NOT fill with white - leave transparent
    state.frames.push(frameCanvas);
    state.images.push([]);
  }
}
```

### 2. Tool System and Drawing

**Selection Tool** (default):
- Keyboard shortcut: V
- Cursor: `default` (normal pointer)
- Allows clicking and manipulating images
- Does NOT allow drawing strokes
- Active on application load

**Brush**:
- Keyboard shortcut: B
- Cursor: `crosshair`
- Color: `#1A1A1A` (near black)
- Line width: 4px
- Composite operation: `source-over`
- Line cap/join: `round`
- When switching TO Selection from Brush, strokes auto-convert to image

**Eraser**:
- Keyboard shortcut: E
- Cursor: `crosshair`
- Composite operation: `destination-out` (true transparency)
- Line width: 20px
- Line cap/join: `round`
- When switching TO Selection from Eraser, strokes auto-convert to image

**Clear Button**:
- Clears main canvas: `ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)`
- Clears all images: `state.images[state.currentFrame] = []`
- Deselects image, saves to history

**Drawing Logic**:
```javascript
function startDrawing(e) {
  // Only allow drawing with brush/eraser tools
  if (state.tool === 'selection') return;

  if (state.selectedImage) return;  // Don't draw if image selected
  state.isDrawing = true;
  const pos = getCanvasPosition(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);

  if (state.tool === 'brush') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 4;
  } else {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 20;
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function stopDrawing() {
  if (state.isDrawing) {
    state.isDrawing = false;
    saveCurrentFrame();
    updateCarouselThumbnails();
    saveHistory();
  }
}
```

### 3. Onion Skinning (Ghost Layer)

**Behavior**:
- Frame 1: No ghost (nothing before it)
- Frames 2-13: Show previous frame at specified opacity

**Implementation**:
```javascript
function drawGhost() {
  ghostCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  if (!state.ghostEnabled || state.currentFrame === 0) return;

  const prevFrame = state.frames[state.currentFrame - 1];
  ghostCtx.globalAlpha = state.ghostOpacity;
  ghostCtx.drawImage(prevFrame, 0, 0);
  ghostCtx.globalAlpha = 1.0;

  // Draw previous frame's images
  const prevImages = state.images[state.currentFrame - 1];
  prevImages.forEach(img => {
    ghostCtx.save();
    ghostCtx.globalAlpha = state.ghostOpacity;
    ghostCtx.translate(img.x, img.y);
    ghostCtx.rotate(img.rotation);
    ghostCtx.drawImage(img.img, -img.width / 2, -img.height / 2, img.width, img.height);
    ghostCtx.restore();
  });
}
```

**Critical**: Ghost canvas MUST be on top of main canvas (z-index or DOM order). This ensures proper transparency handling with images.

### 4. Wedge Overlay

**Geometry**:
- Wedge angle: 360° / 13 ≈ 27.69°
- Outer arc at top, point at center-bottom
- Area outside wedge dimmed to 60% opacity gray

**Implementation**:
```javascript
function drawWedgeOverlay() {
  overlayCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const centerX = CANVAS_SIZE / 2;
  const centerY = CANVAS_SIZE / 2;
  const radius = CANVAS_SIZE / 2;

  // Dim everything first
  overlayCtx.fillStyle = 'rgba(200, 200, 200, 0.6)';
  overlayCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Cut out the wedge (1/13 slice, top-centered)
  overlayCtx.globalCompositeOperation = 'destination-out';
  overlayCtx.beginPath();
  overlayCtx.moveTo(centerX, centerY);
  overlayCtx.arc(centerX, centerY, radius, -Math.PI / 2 - WEDGE_ANGLE / 2, -Math.PI / 2 + WEDGE_ANGLE / 2);
  overlayCtx.closePath();
  overlayCtx.fill();
  overlayCtx.globalCompositeOperation = 'source-over';
}
```

### 5. Image Upload

**Upload Behavior**:
- Accepts: `image/*`
- Default position: Canvas center (450, 450)
- Default size: Min(original width, 60% of canvas) maintaining aspect ratio
- Auto-select uploaded image

**Apply to All Frames**:
- When checked: Upload image to all 13 frames simultaneously
- Creates independent image object for each frame
- **Critical**: Must render to each frame's canvas, not just add to state arrays

**Implementation**:
```javascript
function handleImageUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let width = Math.min(img.width, CANVAS_SIZE * 0.6);
      let height = width / aspectRatio;

      const imageObj = {
        img,
        x: CANVAS_SIZE / 2,
        y: CANVAS_SIZE / 2,
        width,
        height,
        rotation: 0
      };

      if (state.uploadToAllFrames) {
        // Add to all frames
        for (let i = 0; i < FRAME_COUNT; i++) {
          const imgCopy = {
            img: imageObj.img,
            x: imageObj.x,
            y: imageObj.y,
            width: imageObj.width,
            height: imageObj.height,
            rotation: imageObj.rotation
          };
          state.images[i].push(imgCopy);
          if (i === state.currentFrame) {
            state.selectedImage = imgCopy;
          }
        }

        // CRITICAL: Render to each frame's canvas
        const currentFrame = state.currentFrame;
        for (let i = 0; i < FRAME_COUNT; i++) {
          state.currentFrame = i;
          const frameCanvas = state.frames[i];
          const frameCtx = frameCanvas.getContext('2d');
          frameCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

          state.images[i].forEach(imgObj => {
            frameCtx.save();
            frameCtx.translate(imgObj.x, imgObj.y);
            frameCtx.rotate(imgObj.rotation);
            frameCtx.drawImage(imgObj.img, -imgObj.width / 2, -imgObj.height / 2, imgObj.width, imgObj.height);
            frameCtx.restore();
          });
        }
        state.currentFrame = currentFrame;
      } else {
        state.images[state.currentFrame].push(imageObj);
        state.selectedImage = imageObj;
      }

      redrawWithImages();
      updateImageControls();
      updatePositionTracker();
      saveCurrentFrame();
      updateCarouselThumbnails();
      saveHistory();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
```

### 5a. Stroke-to-Image Auto-Conversion

**Trigger**: Automatically when switching from Brush/Eraser to Selection tool

**Implementation**:
```javascript
function convertStrokesToImage() {
  // Check if main canvas has any content
  const imageData = mainCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const hasContent = imageData.data.some(channel => channel !== 0);

  // If no strokes drawn, nothing to convert
  if (!hasContent) {
    return;  // Silent return, no alert needed
  }

  const frameCanvas = state.frames[state.currentFrame];

  // Create image from current drawing
  const img = new Image();
  img.onload = () => {
    const imageObj = {
      img,
      x: CANVAS_SIZE / 2,
      y: CANVAS_SIZE / 2,
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      rotation: 0
    };

    // Clear the drawing from main canvas
    mainCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Clear the stored frame canvas
    const frameCtx = frameCanvas.getContext('2d');
    frameCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Add as image to current frame
    state.images[state.currentFrame].push(imageObj);
    state.selectedImage = imageObj;

    // Redraw everything
    redrawWithImages();
    updateImageControls();
    updatePositionTracker();
    saveCurrentFrame();
    updateCarouselThumbnails();
    saveHistory();
  };

  // Convert frame canvas to image data URL
  img.src = frameCanvas.toDataURL('image/png');
}
```

**Tool Switch Handler Integration**:
```javascript
document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
  btn.addEventListener('click', () => {
    const previousTool = state.tool;
    const newTool = btn.dataset.tool;

    // Check if switching TO selection FROM a drawing tool
    if (newTool === 'selection' && (previousTool === 'brush' || previousTool === 'eraser')) {
      // Attempt to convert strokes to image before switching
      convertStrokesToImage();
    }

    // Deselect image when switching TO drawing tools
    if ((newTool === 'brush' || newTool === 'eraser') && state.selectedImage) {
      state.selectedImage = null;
      imageControls.classList.add('hidden');
      redrawWithImages();
    }

    // Update active button
    document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update state
    state.tool = newTool;

    // Update cursor
    updateCanvasCursor();
  });
});
```

**Key Behaviors**:
- Silent operation: No alert if canvas is empty
- Auto-select: Converted image is immediately selected for manipulation
- Full frame size: 900×900px (entire canvas)
- Clears strokes: Original drawing removed after conversion
- Saves to history: Can be undone/redone
- Transparency preserved: Alpha channel maintained in conversion

### 6. Image Transformation

**Selection**:
- Click on image to select
- Only one image can be selected at a time
- Show bounding box with 8 handles + rotation handle

**Dragging**:
- Drag from center to move
- Snap to canvas center (450, 450) when within 30px
- Snap to other images' centers when within 30px
- Apply snapping independently for X and Y axes

**Snapping Implementation**:
```javascript
// During drag
let nx = imgStart.x + pos.x - dragStart.x;
let ny = imgStart.y + pos.y - dragStart.y;

// Snap to canvas center
if (Math.abs(nx - CANVAS_SIZE/2) < SNAP_THRESHOLD) nx = CANVAS_SIZE/2;
if (Math.abs(ny - CANVAS_SIZE/2) < SNAP_THRESHOLD) ny = CANVAS_SIZE/2;

// Snap to other images' centers
const imgs = state.images[state.currentFrame];
for (let i = 0; i < imgs.length; i++) {
  const otherImg = imgs[i];
  if (otherImg !== state.selectedImage) {
    if (Math.abs(nx - otherImg.x) < SNAP_THRESHOLD) nx = otherImg.x;
    if (Math.abs(ny - otherImg.y) < SNAP_THRESHOLD) ny = otherImg.y;
  }
}

state.selectedImage.x = nx;
state.selectedImage.y = ny;
```

**Scaling**:
- 4 corner handles: Scale proportionally from opposite corner
- 4 side handles: Scale along that axis only
- Maintain aspect ratio for corner handles

**Rotation**:
- Rotation handle floats above top edge
- Drag to rotate around center point
- Calculate angle from center to mouse position

**Arrow Key Nudging**:
- Arrow keys: Move 1px in direction
- Shift + Arrow keys: Move 10px in direction
- Apply same snapping logic as drag
- Only works when image is selected
- When no image selected, arrows navigate frames

### 7. Position Tracker

**Display**:
- Shows X, Y coordinates of selected image's **top-left corner**
- Top-left = (centerX - width/2, centerY - height/2)
- Round to nearest pixel

**Copy/Paste Position**:
- Copy Pos: Stores `{x: centerX, y: centerY}` to `state.copiedPosition`
- Paste Pos: Applies stored position to selected image, then:
  - Apply snapping logic
  - Redraw
  - Save to history

**Implementation**:
```javascript
function updatePositionTracker() {
  const tracker = document.getElementById('position-tracker');
  if (state.selectedImage) {
    tracker.classList.remove('hidden');
    const topLeftX = Math.round(state.selectedImage.x - state.selectedImage.width / 2);
    const topLeftY = Math.round(state.selectedImage.y - state.selectedImage.height / 2);
    document.getElementById('pos-x').textContent = topLeftX;
    document.getElementById('pos-y').textContent = topLeftY;
  } else {
    tracker.classList.add('hidden');
  }
}
```

### 8. Copy/Paste Images

**Copy (Cmd/Ctrl+C)**:
- Only works when image is selected
- Stores all image properties: `{img, x, y, width, height, rotation}`
- Shares same `img` reference (memory efficient)

**Paste (Cmd/Ctrl+V)**:
- Creates new image object with same properties
- Adds to current frame
- Auto-selects pasted image
- Saves to history

**Implementation**:
```javascript
// Copy
if ((e.metaKey || e.ctrlKey) && e.key === 'c' && state.selectedImage) {
  e.preventDefault();
  state.copiedImage = {
    img: state.selectedImage.img,
    x: state.selectedImage.x,
    y: state.selectedImage.y,
    width: state.selectedImage.width,
    height: state.selectedImage.height,
    rotation: state.selectedImage.rotation
  };
}

// Paste
if ((e.metaKey || e.ctrlKey) && e.key === 'v' && state.copiedImage) {
  e.preventDefault();
  const newImage = { ...state.copiedImage };
  state.images[state.currentFrame].push(newImage);
  state.selectedImage = newImage;
  redrawWithImages();
  updateImageControls();
  saveCurrentFrame();
  updateCarouselThumbnails();
  saveHistory();
}
```

### 9. Delete Images

**Delete/Backspace Key**:
- Only works when image is selected
- Removes from current frame's image array
- Clears selection
- Redraws and saves to history

### 10. Undo/Redo System

**History Snapshots**:
- Each snapshot stores:
  - Deep clone of all 13 frame canvases
  - Deep clone of all image arrays
- Max 50 snapshots (circular buffer)
- Truncate future history when new action taken

**When to Save**:
- After drawing (mouseup)
- After image upload
- After image deletion
- After image transformation (drag/rotate/scale mouseup)
- After arrow key nudging
- After copy/paste
- After position paste
- After clear button

**Implementation**:
```javascript
function saveHistory() {
  // Truncate future
  state.history = state.history.slice(0, state.historyIndex + 1);

  // Create snapshot
  const snapshot = {
    frames: state.frames.map(f => {
      const c = document.createElement('canvas');
      c.width = CANVAS_SIZE;
      c.height = CANVAS_SIZE;
      c.getContext('2d').drawImage(f, 0, 0);
      return c;
    }),
    images: state.images.map(frameImgs => frameImgs.map(img => ({...img})))
  };

  state.history.push(snapshot);
  state.historyIndex++;

  // Limit to 50
  if (state.history.length > 50) {
    state.history.shift();
    state.historyIndex--;
  }

  updateHistoryButtons();
}

function undo() {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    restoreHistory();
  }
}

function redo() {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex++;
    restoreHistory();
  }
}

function restoreHistory() {
  const snapshot = state.history[state.historyIndex];

  // Deep clone back
  state.frames = snapshot.frames.map(f => {
    const c = document.createElement('canvas');
    c.width = CANVAS_SIZE;
    c.height = CANVAS_SIZE;
    c.getContext('2d').drawImage(f, 0, 0);
    return c;
  });
  state.images = snapshot.images.map(frameImgs => frameImgs.map(img => ({...img})));

  drawCurrentFrame();
  redrawWithImages();
  updateCarouselThumbnails();
  updateHistoryButtons();
}
```

**Keyboard Shortcuts**:
- Undo: Cmd+Z / Ctrl+Z
- Redo: Cmd+Shift+Z / Ctrl+Shift+Z

### 11. Frame Carousel

**Layout**:
- 13 thumbnails in horizontal row
- Active frame: Larger, centered, full opacity
- Inactive frames: Smaller, lower opacity
- Wraps around at edges

**Thumbnail Generation**:
- Each thumbnail is a small canvas (e.g., 80×80px)
- Draws frame content scaled down
- Updates after any frame modification

**Navigation**:
- Click thumbnail to switch frames
- Arrow keys (when no image selected):
  - Left: Previous frame (wraps to 12)
  - Right: Next frame (wraps to 0)

### 12. Disc View

**Animation**:
- Rotates at 12 FPS
- Each frame, rotation increases by `WEDGE_ANGLE`
- Each wedge lands in same position (persistence of vision)

**Rendering**:
```javascript
function renderDisc() {
  const centerX = discCanvas.width / 2;
  const centerY = discCanvas.height / 2;
  const radius = Math.min(centerX, centerY);

  discCtx.clearRect(0, 0, discCanvas.width, discCanvas.height);

  // Cream background
  discCtx.fillStyle = '#F5F1E8';
  discCtx.fillRect(0, 0, discCanvas.width, discCanvas.height);

  for (let i = 0; i < FRAME_COUNT; i++) {
    discCtx.save();
    discCtx.translate(centerX, centerY);
    discCtx.rotate(discRotation + i * WEDGE_ANGLE);

    // Clip to wedge
    discCtx.beginPath();
    discCtx.moveTo(0, 0);
    discCtx.arc(0, 0, radius, -WEDGE_ANGLE / 2, WEDGE_ANGLE / 2);
    discCtx.closePath();
    discCtx.clip();

    // Draw frame content
    discCtx.translate(-CANVAS_SIZE / 2, -CANVAS_SIZE / 2);
    discCtx.drawImage(state.frames[i], 0, 0);

    // Draw images
    state.images[i].forEach(img => {
      discCtx.save();
      discCtx.translate(img.x, img.y);
      discCtx.rotate(img.rotation);
      discCtx.drawImage(img.img, -img.width / 2, -img.height / 2, img.width, img.height);
      discCtx.restore();
    });

    discCtx.restore();
  }
}

function animateDisc(timestamp) {
  if (!lastFrameTime || timestamp - lastFrameTime >= 1000 / FRAMES_PER_SECOND) {
    discRotation += WEDGE_ANGLE;  // Jump exactly one wedge
    renderDisc();
    lastFrameTime = timestamp;
  }

  if (state.view === 'disc') {
    discAnimationId = requestAnimationFrame(animateDisc);
  }
}
```

**View Toggle**:
- "View Disc" button switches to disc view
- Click anywhere in disc view to return to editor
- Small "Exit" button in corner

---

## Visual Design Specifications

### Color Palette

```css
:root {
  --cream: #F5F1E8;
  --cream-dark: #E8E4D8;
  --border: #D8D4C8;
  --text: #1A1A1A;
  --accent-mustard: #E6B800;
  --accent-red: #CC3333;
  --gray-light: #F0F0F0;
}
```

### Typography

- Headers: Blackletter font (e.g., "UnifrakturMaguntia", fallback to serif)
- Body/UI: Sans-serif (e.g., "Inter", "system-ui", fallback to sans-serif)
- Font sizes:
  - Panel headers: 14px, uppercase, letter-spacing: 0.5px
  - Body: 13px
  - Position tracker: 10px

### Component Styling

**Buttons**:
- Width: 44px, Height: 44px (square for icon buttons)
- Border-radius: 6px
- Background: --cream when inactive, --accent-mustard when active
- Border: 1px solid --border
- Hover: Slight darkening
- Disabled: 50% opacity, no hover effect

**Checkboxes**:
- Custom styled to match palette
- Accent color: --accent-mustard

**Sliders**:
- Track: --border
- Thumb: --accent-mustard
- Height: 4px

**Canvas Container**:
- Background: white
- Border-radius: 8px
- Box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06)

---

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| V | Switch to Selection tool |
| B | Switch to Brush tool (auto-converts strokes to image) |
| E | Switch to Eraser tool |
| Arrow keys | Navigate frames (no image selected) OR nudge image 1px (image selected) |
| Shift + Arrows | Nudge image 10px |
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z | Redo |
| Cmd/Ctrl + C | Copy selected image |
| Cmd/Ctrl + V | Paste image |
| Delete/Backspace | Delete selected image |

---

## Critical Implementation Notes

### 1. Transparency System

**Never use white fills**:
```javascript
// ❌ WRONG
frameCtx.fillStyle = '#FFFFFF';
frameCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

// ✅ CORRECT
frameCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
```

**Eraser must use destination-out**:
```javascript
// ❌ WRONG
ctx.strokeStyle = '#FFFFFF';

// ✅ CORRECT
ctx.globalCompositeOperation = 'destination-out';
```

### 2. Layer Stacking Order

**DOM order (bottom to top)**:
```html
<div id="canvas-container">
  <canvas id="main-canvas"></canvas>
  <canvas id="ghost-canvas"></canvas>
  <canvas id="overlay-canvas"></canvas>
  <!-- Image controls positioned absolutely on top -->
</div>
```

Ghost canvas MUST be above main canvas for proper transparency with images.

### 3. Upload to All Frames

Must explicitly render to each frame's canvas:

```javascript
// After adding image objects to all frames
for (let i = 0; i < FRAME_COUNT; i++) {
  const frameCanvas = state.frames[i];
  const frameCtx = frameCanvas.getContext('2d');
  frameCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  state.images[i].forEach(imgObj => {
    frameCtx.save();
    frameCtx.translate(imgObj.x, imgObj.y);
    frameCtx.rotate(imgObj.rotation);
    frameCtx.drawImage(imgObj.img, -imgObj.width / 2, -imgObj.height / 2, imgObj.width, imgObj.height);
    frameCtx.restore();
  });
}
```

### 4. History Integration

Every user action that modifies state must call `saveHistory()`:
- Drawing (on mouseup)
- Upload
- Delete
- Transform (on mouseup)
- Copy/paste
- Position paste
- Clear button
- Arrow nudge

### 5. Coordinate Systems

**Internal (center-based)**:
- All image positions stored as center coordinates
- Canvas center: (450, 450)

**Display (top-left for position tracker)**:
- Convert for display: `topLeft = center - size/2`
- Convert back when pasting: `center = topLeft + size/2`

---

## File Structure

Single HTML file containing:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Phenakistoscope Maker</title>
  <style>
    /* All CSS here */
  </style>
</head>
<body>
  <!-- All HTML structure here -->

  <script>
    /* All JavaScript here */
  </script>
</body>
</html>
```

Total file size target: < 50KB uncompressed

---

## Testing Checklist

- [ ] Drawing with brush creates black strokes
- [ ] Eraser creates true transparency (not white)
- [ ] Clear button removes everything, maintains transparency
- [ ] Frame 1 shows no ghost
- [ ] Frames 2-13 show previous frame ghost
- [ ] Ghost opacity slider works (5-50%)
- [ ] Upload centers images at (450, 450)
- [ ] "Apply to all frames" uploads to all 13 frames
- [ ] Images visible in all frames when "apply to all" used
- [ ] Dragging snaps to canvas center
- [ ] Dragging snaps to other images' centers
- [ ] Arrow keys nudge 1px
- [ ] Shift+arrows nudge 10px
- [ ] Corner handles scale proportionally
- [ ] Side handles scale along axis
- [ ] Rotation handle rotates around center
- [ ] Position tracker shows top-left coordinates
- [ ] Copy Pos / Paste Pos works
- [ ] Cmd+C / Cmd+V copies/pastes images
- [ ] Delete key removes selected image
- [ ] Undo/redo works for all operations
- [ ] Undo/redo limited to 50 states
- [ ] Frame carousel shows all 13 frames
- [ ] Clicking carousel switches frames
- [ ] Arrow keys navigate frames (no image selected)
- [ ] Disc view shows 13 wedges
- [ ] Disc rotates at 12 FPS
- [ ] Each wedge lands in same position
- [ ] Click disc view to exit

---

## Performance Considerations

- History limited to 50 states to prevent memory bloat
- Image objects share same `img` reference when copied
- Frame canvases only redrawn when necessary
- Disc animation uses `requestAnimationFrame` throttled to 12 FPS
- No DOM manipulation during animation

---

## Browser Compatibility

Target: Modern browsers supporting:
- ES6+ JavaScript
- HTML5 Canvas API
- CSS Grid/Flexbox
- CSS Variables
- FileReader API
- Async/await

Minimum versions:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Known Limitations (v2)

- No persistence (no localStorage or backend)
- No export functionality (GIF, video, image)
- No adjustable frame count (fixed at 13)
- No adjustable canvas size (fixed at 900×900)
- No color picker (black only)
- No brush size options
- Desktop-only (no touch support)
- No adjustable disc rotation speed

These are intentionally out of scope for v2.

---

## Success Criteria

A successful implementation will:

1. Allow users to draw across 13 frames with brush/eraser
2. Support uploading and transforming images (move, rotate, scale)
3. Display onion skinning for frames 2-13
4. Provide full undo/redo for all operations
5. Animate the complete disc at 12 FPS with proper wedge rotation
6. Maintain transparency throughout all operations
7. Run smoothly in modern browsers without external dependencies
8. Match the visual design specifications (nu-medieval aesthetic)

The tool should feel responsive, intuitive, and allow rapid iteration on phenakistoscope animations.
