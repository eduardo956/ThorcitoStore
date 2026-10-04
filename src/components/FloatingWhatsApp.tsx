import React from 'react';
import { MessageCircle } from 'lucide-react';
import { STORE_PHONE_NUMBER } from '../data/iphones';

export const FloatingWhatsApp: React.FC = () => {
  const handleClick = () => {
    const msg = encodeURIComponent("¡Hola Jorgito Store! 📱 Me gustaría hacer una consulta en vivo sobre los modelos de iPhone disponibles.");
    window.open(`https://wa.me/${STORE_PHONE_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip Badge */}
      <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full glass-nav border border-emerald-500/30 text-xs text-emerald-300 font-medium shadow-2xl animate-bounce">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>¿Dudas? Chatea en vivo con Jorgito</span>
      </div>

      {/* Pulsating Floating Button */}
      <button
        onClick={handleClick}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-900/60 transition-all hover:scale-110 active:scale-90 border-2 border-emerald-300/40 relative group"
        title="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-black animate-pulse" />
      </button>
    </div>
  );
};
