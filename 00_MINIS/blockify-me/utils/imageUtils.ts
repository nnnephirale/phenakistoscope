
import { OverlayConfig } from '../promptConfig';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the prefix (e.g., "data:image/png;base64,")
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const compositeLogo = async (
  baseImageUrl: string,
  logoUrl: string,
  config: OverlayConfig
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject('Could not get canvas context');

    const baseImg = new Image();
    const logoImg = new Image();

    baseImg.crossOrigin = "anonymous";
    logoImg.crossOrigin = "anonymous";

    baseImg.onload = () => {
      canvas.width = baseImg.width;
      canvas.height = baseImg.height;
      ctx.drawImage(baseImg, 0, 0);

      logoImg.onload = () => {
        const logoWidth = canvas.width * config.size;
        const aspectRatio = logoImg.height / logoImg.width;
        const logoHeight = logoWidth * aspectRatio;

        let x = 0;
        let y = 0;

        switch (config.position) {
          case 'top-left':
            x = config.padding;
            y = config.padding;
            break;
          case 'top-right':
            x = canvas.width - logoWidth - config.padding;
            y = config.padding;
            break;
          case 'bottom-left':
            x = config.padding;
            y = canvas.height - logoHeight - config.padding;
            break;
          case 'bottom-right':
            x = canvas.width - logoWidth - config.padding;
            y = canvas.height - logoHeight - config.padding;
            break;
        }

        ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
        resolve(canvas.toDataURL('image/png'));
      };

      logoImg.onerror = () => {
        console.warn("Logo failed to load, returning base image only.");
        resolve(canvas.toDataURL('image/png'));
      };
      
      // Use a generic logo if the specific one isn't found
      logoImg.src = logoUrl;
    };

    baseImg.onerror = reject;
    baseImg.src = baseImageUrl;
  });
};
