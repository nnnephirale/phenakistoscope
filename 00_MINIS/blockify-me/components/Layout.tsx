
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex-grow flex flex-col">
      <header className="grass-top py-6 px-4 shadow-lg text-center">
        <h1 className="pixel-font text-white text-3xl md:text-5xl drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] tracking-widest">
          BLOCKIFY ME
        </h1>
        <p className="text-white text-xl md:text-2xl mt-2 drop-shadow-md">
          Convert your face into a voxel masterpiece
        </p>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>

      <footer className="dirt-bottom py-8 px-4 text-center border-t-8 border-[#634b0e]">
        <div className="text-white text-lg space-y-2">
          <p>© 2024 Voxel Labs - Built with Gemini API</p>
          <div className="flex justify-center space-x-4">
            <div className="w-8 h-8 bg-[#7f7f7f] border-2 border-[#373737]"></div>
            <div className="w-8 h-8 bg-[#5D8C3E] border-2 border-[#373737]"></div>
            <div className="w-8 h-8 bg-[#8B6914] border-2 border-[#373737]"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};
