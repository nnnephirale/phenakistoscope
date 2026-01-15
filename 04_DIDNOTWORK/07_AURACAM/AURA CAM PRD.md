# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## 1. Executive Summary
**Product:** A mobile selfie application that generates "Aura Photographs" based on the user's vocal energy.
**Core Value:** Provides a modernized, highly shareable, and "accurate-feeling" energy reading by analyzing voice data rather than random generation.
**Key Differentiator:** 1. **Sonic Input:** Uses audio frequency analysis as a proxy for "energy."
2. **The 5-Minute Rule:** A session caching system that guarantees consistency. If a user retakes a photo within 5 minutes, they get the *exact same* result, preventing the app from feeling "random" or "fake."

---

## 2. User Flow
1.  **Onboarding:** User grants Camera and Microphone permissions.
2.  **Input Phase:** * Camera view opens (Selfie mode).
    * Overlay prompt: "Press and hold to capture your energy. Speak your intention."
    * User holds capture button + speaks for ~3 seconds.
3.  **Processing:**
    * App captures specific frame (image).
    * App analyzes audio clip.
    * **Logic Check:** Is this the same person as <5 mins ago?
4.  **Result:** * Displays processed image with Aura Overlay.
    * Displays text interpretation below image (Scrollable).
5.  **Action:** Save Image, Share, or Retake.

---

## 3. Functional Specifications

### 3.1 The Input Analysis (Audio)
The audio buffer is analyzed for three key metrics. These metrics drive the visual rendering.

| Audio Metric | Mapped Visual Property | Logic |
| :--- | :--- | :--- |
| **Pitch (Frequency)** | **Color Palette (Hue)** | High Pitch = Upper Chakras (Violet, White, Gold)<br>Mid Pitch = Heart/Throat (Green, Pink, Blue)<br>Low Pitch = Root/Sacral (Red, Orange, Clay) |
| **Intensity (Decibels)** | **Saturation/Opacity** | Loud/Strong = High Saturation, Vibrant<br>Quiet/Soft = Pale, Washed-out, Pastel |
| **Variance (Dynamic Range)** | **Texture/Gradient** | Dynamic (Sing-songy) = Streaky, varied gradients<br>Monotone = Smooth, even radial gradients |

### 3.2 The "Anti-Fake" Logic (Session Caching)
To maintain immersion, the app must not produce different results for the same person instantly.

* **Step 1:** On capture, generate `currentFaceHash` (using lightweight local face detection/geometry landmarks).
* **Step 2:** Query local storage for `lastSession`.
* **Step 3:** ```javascript
    const TIME_WINDOW = 5 * 60 * 1000; // 5 minutes
    
    if (lastSession && 
        lastSession.faceHash === currentFaceHash && 
        (Date.now() - lastSession.timestamp < TIME_WINDOW)) {
        
        // REUSE PREVIOUS AURA
        return renderAura(originalImage, lastSession.auraData);
        
    } else {
        // GENERATE NEW AURA
        const newAuraData = generateAuraFromAudio(currentAudio);
        saveSession(currentFaceHash, newAuraData);
        return renderAura(originalImage, newAuraData);
    }
    ```

### 3.3 Visual Rendering (The Aesthetic)
* **Style:** Modern Ethereal (Reference: Soft gradients, no retro grain).
* **Layers:**
    1.  **Base:** User Selfie (High Res).
    2.  **Subject Glow:** Slight "bloom" or "diffuse" filter applied only to the segmented person to blend them with the aura.
    3.  **Aura Mesh:** A multi-point gradient overlay.
    4.  **Blend Mode:** `Screen` or `Linear Dodge` (Add) to make colors glow against the background.

---

## 4. Interpretation Logic (The "Reading")

The app must generate a text description based on the dominant colors and their position.

### 4.1 Zoning Logic
The visual overlay is divided into 3 zones. The generator assigns colors to these zones based on the audio analysis segments.

* **Zone A (Head):** Mental State (Focus, Clarity, Stress).
* **Zone B (Heart/Chest):** Emotion (Openness, Grief, Warmth).
* **Zone C (Gut/Solar Plexus):** Willpower (Drive, Anxiety, Stability).

### 4.2 Color Legend (Lookup Table)
Use this map to generate the textual "Reading":

* **Red:** Vitality, Passion, Urgency, "Running Hot."
* **Orange:** Creativity, Social Energy, Sensuality.
* **Yellow:** Intellect, Optimism, Nervous Energy.
* **Green:** Healing, Balance, Growth, People-pleasing.
* **Blue:** Communication, Calm, Steadiness.
* **Violet:** Intuition, Imagination, Spiritual Awareness.
* **Pink:** Tenderness, Romance, Empathy.
* **White:** Clarity, High Energy, New Beginnings.

---

## 5. Technical Stack Recommendations (Agent Discretion)
* **Mobile Framework:** React Native (Expo) OR Swift/Kotlin.
* **Image Processing:** * Face Detection: `Google ML Kit` (Vision) or `react-native-vision-camera`.
    * Image Manipulation: `Skia` (React Native Skia) or `CoreImage` (iOS) for performant gradient blending.
* **Audio Analysis:** `react-native-audio-recorder-player` or Native AVFoundation for FFT (Fast Fourier Transform) data.