# Product Requirement Document: High-Fidelity Sticker Book App

## 1. Overview
The Sticker Book App is a web-based interactive canvas that simulates the physical sensation of placing, peeling, and manipulating stickers. Unlike standard 2D drag-and-drop interfaces, this application utilizes WebGL to render stickers as 3D geometries that react to user interaction with realistic physics, lighting, and material properties.

## 2. Technical Architecture
* **Core Rendering Engine:** Raw WebGL (no external 3D engine libraries like Three.js).
* **Shader Language:** GLSL (OpenGL Shading Language).
* **Language:** Vanilla JavaScript (ES6+), HTML5, CSS3.
* **State Management:** Reactive state object for sticker data, gallery, and configuration settings.

## 3. WebGL & Shader Features
The core differentiation of this app is the use of custom GLSL shaders to handle image deformation and rendering.

### 3.1. Vertex Shader Requirements
* **3D Peel Physics ("Page Curl"):**
    * The vertex shader must calculate a "curl line" based on user interaction (hover or drag).
    * Vertices past the curl line must be projected into 3D space (Z-axis lift) and rotated back towards the origin to simulate rolling paper.
    * **Curl Logic:** Must support dynamic `curlAmount` (how much is peeled) and `curlRadius` (how tight the roll is).
* **Normals Calculation:**
    * Surface normals must be recalculated dynamically based on the curl curve to support realistic lighting reflection.

### 3.2. Fragment Shader Requirements
* **Back-face Texturing:**
    * The shader must detect when a pixel is on the "back" side of the curl (using the curl angle).
    * **Adhesive Simulation:** The back face must render as a paper/adhesive texture (mix of white and the original image color) rather than a solid color.
    * **Transparency Handling:** The back face must respect the original PNG alpha channel. If the sticker is star-shaped, the peel must also be star-shaped. *No solid rectangular bounding boxes.*
* **Dynamic Lighting & Shadows:**
    * **Self-Shadowing:** The shader must render a shadow gradient on the flat part of the sticker immediately preceding the curl to simulate the peel casting a shadow on itself.
    * **Diffuse Lighting:** Lighting intensity must vary based on the angle of the curled surface relative to a fixed light source.
* **Shader-Based Outlines (Strokes):**
    * Outlines must be generated procedurally within the fragment shader by sampling neighboring pixels.
    * Must support variable `Stroke Width` and `Stroke Color`.
    * Must be anti-aliased and robust enough to handle high-resolution textures without artifacts.

## 4. Functional Features

### 4.1. Sticker Management
* **Upload:** Support for dragging and dropping files or using a file picker.
* **Formats:** Support for PNG (with transparency) and SVG.
* **High Resolution Support:** Internal rendering resolution cap set to **1200px** (or higher) to prevent blurriness when stickers are scaled up (`scale > 1.0`).

### 4.2. Canvas Interaction
* **Placement:** Stickers dropped from the gallery are placed with:
    * **Organic Randomization:** A random initial rotation (-15° to +15°) and slight scale variance (0.8x to 1.0x) to feel natural.
* **Selection:** Clicking a sticker selects it, updating the sidebar controls to reflect that specific sticker's properties.
* **Layering:** Selected stickers must visually pop to the front (`z-index`).
* **Drag & Drop:**
    * Movement is 1:1 with mouse cursor.
    * **Active Peel:** While dragging, the sticker should curl significantly (e.g., 65%) to simulate being held by a corner.
* **Hover Effects:**
    * On mouse enter, the sticker should subtly curl (e.g., 25%) to indicate interactivity.

### 4.3. Deletion Workflow (Mac-Style Trash)
* A "Trash Dock" is hidden at the bottom of the screen.
* **Trigger:** When a user starts dragging a sticker, the dock slides up.
* **Interaction:** Dragging a sticker over the dock highlights the dock and fades the sticker.
* **Action:** Dropping the sticker on the dock triggers a "suck-in" animation and deletes the object.

## 5. Configuration & Controls
A sidebar panel provides real-time, two-way binding control over the **currently selected sticker**:

* **Transform:**
    * **Rotation:** -180° to 180°.
    * **Scale:** 0.2x to 3.0x.
* **Physics Parameters:**
    * **Hover Peel:** % of curl when hovering.
    * **Active Peel:** % of curl when dragging.
    * **Curl Radius:** The tightness of the paper roll.
* **Style:**
    * **Stroke Width:** Thickness of the white outline (0px to 50px).
    * **Stroke Color:** Hex color picker.
* **Global Actions:**
    * **Clear All:** Removes all stickers.
    * **Export:** Generates a PNG of the entire composition, respecting current rotations, scales, and z-indexes.

## 6. Constraints & Optimization
* **Padding:** WebGL canvases for individual stickers must include significant padding (e.g., 60px-100px) to ensure curled geometry and thick strokes do not get clipped at the edges of the bounding box.
* **Texture Filtering:** Must use Linear interpolation for smooth scaling.