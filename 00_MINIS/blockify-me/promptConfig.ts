
export interface OverlayConfig {
  enabled: boolean;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size: number; // Percentage of the width (e.g. 0.15 for 15%)
  padding: number;
}

export interface PromptConfig {
  basePrompt: string;
  variants: string[];
  overlay: OverlayConfig;
}

export const promptConfig: PromptConfig = {
  basePrompt: "Transform this photo into a Minecraft/voxel portrait. Maintain facial feature recognition and core identity (hair color, glasses, clothing). Cubic blocky geometry. Centered composition. Professional voxel art photography style.",
  variants: [
    "Classic Minecraft Steve/Alex proportions, very blocky with visible chunky pixels and flat colors.",
    "Modern voxel art style, slightly smoother like Teardown or MagicaVoxel aesthetic with high-fidelity lighting.", 
    "Isometric view, character looks like a high-detail placeable game asset on a clean background.",
    "Nether theme with warm lighting, glowing embers, and crimson/warped forest colors in the background.",
    "Aether theme with bright, angelic colors, floating islands background, and soft glow.",
    "Village theme, cozy warm lighting, character in front of a blocky wooden house."
  ],
  overlay: {
    enabled: true,
    position: "bottom-right",
    size: 0.20, // 20%
    padding: 30
  }
};
