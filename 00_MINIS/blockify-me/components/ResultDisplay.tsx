
import React from 'react';

interface ResultDisplayProps {
  imageUrl: string;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl, onReset }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `blockified-me-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'blockified.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'Blockify Me',
          text: 'Check out my Minecraft-style portrait!',
          files: [file],
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Sharing is not supported in this browser.');
    }
  };

  return (
    <div className="blocky-border bg-white p-6 md:p-8 animate-in fade-in duration-500">
      <div className="relative group">
        <img 
          src={imageUrl} 
          alt="Generated Voxel Character" 
          className="w-full h-auto aspect-square object-cover border-4 border-[#373737]"
        />
        <div className="absolute top-2 right-2 pixel-font bg-[#5D8C3E] text-white px-3 py-1 text-xs border-2 border-white shadow-md">
          NEW SKIN!
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <button 
          onClick={handleDownload}
          className="minecraft-btn flex items-center justify-center gap-2 px-6 py-4 text-white text-xl font-bold uppercase transition-transform active:scale-95 bg-[#5D8C3E!important]"
          style={{ backgroundColor: '#5D8C3E' }}
        >
          <span className="text-2xl">💾</span> Save Image
        </button>
        <button 
          onClick={handleShare}
          className="minecraft-btn flex items-center justify-center gap-2 px-6 py-4 text-white text-xl font-bold uppercase transition-transform active:scale-95 bg-[#87CEEB!important]"
          style={{ backgroundColor: '#87CEEB' }}
        >
          <span className="text-2xl">🔗</span> Share Result
        </button>
      </div>

      <button 
        onClick={onReset}
        className="w-full mt-4 text-[#7f7f7f] hover:text-[#373737] text-2xl uppercase underline font-bold transition-colors"
      >
        Create Another
      </button>
    </div>
  );
};
