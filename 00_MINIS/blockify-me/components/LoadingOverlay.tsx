
import React from 'react';

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="blocky-border bg-[#7F7F7F] p-8 max-w-sm w-full text-center">
        <div className="mb-6 flex justify-center">
          {/* Simple CSS Pixel Loader */}
          <div className="grid grid-cols-3 gap-1 w-12 h-12">
            {[...Array(9)].map((_, i) => (
              <div 
                key={i} 
                className="w-full h-full bg-[#5D8C3E] animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
        <h3 className="pixel-font text-white text-xl mb-4">MINING BLOCKS...</h3>
        <p className="text-white text-lg">Gemini is carving your voxel character. Please wait.</p>
        
        <div className="mt-6 w-full bg-[#373737] h-6 border-2 border-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[#5D8C3E] animate-[loading_2s_infinite]"></div>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
