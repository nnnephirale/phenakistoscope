# Product Requirements Document: Social Media Grid Visualizer

## 1. Product Vision
A lightweight web-based tool for art directors to rapidly visualize and arrange social media content in customizable masonry-style grids, with clean export for presentations and stakeholder reviews.

---

## 2. Core Features

### 2.1 Grid System
**Masonry Layout Engine**
- Dynamic grid that adjusts to viewport size (responsive)
- Grid size control: slider/input that adjusts number of columns (e.g., 2-8 columns)
- Automatic row flow based on content and cell sizes
- Cells default to uniform size within current grid scale

**Cell Sizing**
- Individual cells can be expanded to occupy multiple grid units (1x1, 2x1, 2x2, etc.)
- Similar to Carl Hauser's varied-size project grid
- Click/drag to resize individual cells while maintaining grid alignment

**Spacing Controls**
- Adjustable gap between cells (e.g., 0-40px)
- Uniform spacing throughout grid

**Visual Styling**
- Adjustable corner radius for all cells (0px = square → full squircle)
- No visible grid container border
- Customizable background color (default: grey similar to Mobbin)

### 2.2 Image Management
**Drag & Drop**
- Drag images from desktop/finder directly into grid cells
- Visual placeholder states for empty cells
- Replace existing images by dropping new ones

**Image Scaling & Positioning**
- Global scale slider: affects all images uniformly (e.g., 80%-120%)
- Per-image adjustments:
  - Fine-tune scale within individual cells
  - Reposition focal point (pan within cell boundary)
  - Individual adjustments preserve when global scale changes

**Rearrangement**
- Drag existing images between cells to reorder
- Swap positions seamlessly

### 2.3 Interactions
**Hover States**
- Subtle lift effect on individual cells
  - Transform: `translateY(-2px)` or similar
  - Shadow: soft, barely perceptible depth
  - Smooth transition (~200ms)

**Preview Mode**
- Toggle to hide all UI controls
- Clean view of grid only
- Keyboard shortcut for quick preview (e.g., spacebar hold or 'P' key)

---

## 3. Technical Approach

### 3.1 Stack
- **HTML5** for structure
- **CSS3** for grid layout (CSS Grid with masonry behavior via grid-template-rows: masonry when supported, fallback to calculated positioning)
- **Vanilla JavaScript** for all interactions
- No frameworks, no build process
- Single HTML file architecture

### 3.2 Key Libraries (if needed)
- Consider: Muuri.js or Packery for masonry + drag/drop (evaluate weight vs. vanilla approach)
- Alternative: Pure CSS Grid with manual JS positioning

---

## 4. User Workflow

### 4.1 Primary Flow
1. Open tool → see empty grid with default settings (e.g., 4 columns, 16px gap)
2. Adjust grid columns, gap, corner radius via controls
3. Drag images from desktop into cells
4. Resize specific cells to emphasize key visuals (1x1 → 2x2)
5. Adjust global image scale if needed
6. Fine-tune individual image positioning/scale
7. Toggle preview mode to review
8. Export clean HTML (future)

### 4.2 Export Flow (Future State)
- "Export" button generates clean HTML file
- Strips all UI controls and related JS
- Preserves grid layout, images, and styling
- Downloadable as standalone file

---

## 5. UI Controls Panel

### Layout Controls
- **Grid Columns**: Slider (2-8) + numeric input
- **Gap**: Slider (0-40px) + numeric input  
- **Corner Radius**: Slider (0-50%) + numeric input
- **Background**: Color picker

### Image Controls
- **Global Scale**: Slider (80%-120%)
- **Per-cell controls** (on cell selection):
  - Scale fine-tune
  - Position X/Y sliders or drag-to-pan

### Mode Toggle
- **Preview Mode**: Button or checkbox

---

## 6. Visual Design

### Aesthetics
- Control panel: minimal, sidebar or top bar
- Grid: clean, no borders on container
- Cells: grey background (customizable), subtle rounded corners
- Hover: barely-there lift + shadow
- Typography: system fonts, clean sans-serif

### Inspiration Mapping
- **Mobbin**: Grey background, hover states, grid rhythm
- **Carl Hauser**: Variable cell sizes, clean layout, visual hierarchy

---

## 7. Success Metrics
- **Speed**: Can arrange 12-20 posts in under 3 minutes
- **Flexibility**: Easy iteration on grid layouts without starting over
- **Cleanliness**: Preview mode feels presentation-ready
- **Performance**: Smooth interactions even with 30+ images

---

## 8. Future Considerations (Out of Scope for V1)
- Save/load layouts to localStorage
- Preset grid templates
- Batch image upload
- Animation controls for hover effects
- Social platform aspect ratio presets (IG square, story, etc.)

---

## 9. Technical Implementation Notes

### 9.1 Grid Behavior
- Grid adjusts number of columns automatically based on slider value
- Not entirely uniform - individual cells can span multiple grid units
- Responsive to viewport changes
- Images scale together globally, with option for individual adjustments

### 9.2 Cell Styling
- Adjustable corner radius applied to cells only
- Grid container has no visible border
- Background is customizable (default grey)

### 9.3 Hover Effects
- Applies to individual cells, not entire grid
- Subtle shadow with barely perceptible transform
- Smooth transitions for polished feel

### 9.4 Preview & Export
- Preview mode: clean UI toggle, hides controls
- Export (future): generates standalone HTML file without UI code or controls
- Final form is presentation-ready

---

## 10. Design References

### Primary Inspiration
- **Mobbin** (mobbin.com/discover/sites/latest)
  - Masonry-style layout
  - Grey background with hover states
  - Clean, modern aesthetic

- **Carl Hauser** (carlhauser.com)
  - Variable grid unit sizes
  - Individual cell emphasis through sizing
  - Minimal, professional presentation

---

## Version History
- **v1.0** - Initial PRD (January 2026)
