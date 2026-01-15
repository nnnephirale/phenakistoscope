
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Uploader } from './components/Uploader';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingOverlay } from './components/LoadingOverlay';
import { generateVoxelPortrait } from './services/geminiService';
import { fileToBase64, compositeLogo } from './utils/imageUtils';
import { promptConfig } from './promptConfig';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Convert uploaded file to base64
      const base64Input = await fileToBase64(file);
      
      // 2. Generate the voxel portrait using Gemini API
      const generatedUrl = await generateVoxelPortrait(base64Input);
      
      // 3. Composite the logo if enabled
      let finalImageUrl = generatedUrl;
      if (promptConfig.overlay.enabled) {
        try {
          // Note: In a real app, /logo.png should exist. For this demo, 
          // we use a placeholder if the local logo fails or isn't present.
          finalImageUrl = await compositeLogo(
            generatedUrl, 
            '/logo.png', // Or "https://picsum.photos/200" for a dynamic placeholder
            promptConfig.overlay
          );
        } catch (overlayErr) {
          console.error("Overlay failed, showing raw generation:", overlayErr);
        }
      }
      
      setResultImage(finalImageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate blockified image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResultImage(null);
    setError(null);
  };

  return (
    <Layout>
      <div className="space-y-8 py-8">
        {!resultImage && (
          <div className="animate-in slide-in-from-bottom-8 duration-700">
            <Uploader onUpload={handleUpload} isLoading={isLoading} />
            
            {error && (
              <div className="mt-6 p-4 blocky-border bg-red-100 border-red-500 text-red-700 text-xl text-center">
                <strong>CRITICAL ERROR:</strong> {error}
              </div>
            )}

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="blocky-border bg-[#7F7F7F] p-6 text-white text-center">
                <span className="text-4xl block mb-2">📸</span>
                <h3 className="pixel-font text-lg mb-2">UPLOAD</h3>
                <p>Pick a clear photo of your face.</p>
              </div>
              <div className="blocky-border bg-[#5D8C3E] p-6 text-white text-center">
                <span className="text-4xl block mb-2">⚡</span>
                <h3 className="pixel-font text-lg mb-2">GENERATE</h3>
                <p>Gemini transforms you into blocks.</p>
              </div>
              <div className="blocky-border bg-[#8B6914] p-6 text-white text-center">
                <span className="text-4xl block mb-2">💎</span>
                <h3 className="pixel-font text-lg mb-2">DOWNLOAD</h3>
                <p>Save and share your new blocky skin.</p>
              </div>
            </div>
          </div>
        )}

        {resultImage && (
          <ResultDisplay imageUrl={resultImage} onReset={reset} />
        )}
      </div>

      {isLoading && <LoadingOverlay />}
    </Layout>
  );
};

export default App;
