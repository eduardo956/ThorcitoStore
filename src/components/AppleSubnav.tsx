import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface AppleSubnavProps {
  onOpenOrderModal: (modelName?: string) => void;
}

export const AppleSubnav: React.FC<AppleSubnavProps> = ({ onOpenOrderModal }) => {
  return (
    <div className="sticky top-0 z-40 apple-subnav-glass py-3 px-4 sm:px-8 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Product Name */}
        <div className="flex items-center gap-3">
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
            iPhone 16 Pro & 18 Pro
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono uppercase font-bold tracking-widest">
            Apple Intelligence Ready
          </span>
        </div>

        {/* Right Links & Buy Button */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-[#86868B]">
          <a href="#hero" className="hover:text-white transition-colors hidden md:inline">
            Descripción general
          </a>
          <a href="#bento" className="hover:text-white transition-colors hidden sm:inline">
            Innovación
          </a>
          <a href="#catalog" className="hover:text-white transition-colors">
            Catálogo
          </a>
          <a href="#comparison" className="hover:text-white transition-colors hidden lg:inline">
            Especificaciones
          </a>

          {/* Apple Style Buy Button */}
          <button
            onClick={() => onOpenOrderModal()}
            className="apple-btn-blue px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Comprar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
