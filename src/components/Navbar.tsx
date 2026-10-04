import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, Menu, X, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_PHONE_NUMBER } from '../data/iphones';

interface NavbarProps {
  onOpenOrderModal: (modelName?: string) => void;
  onOpenCartDrawer: () => void;
  cartCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOrderModal, onOpenCartDrawer, cartCount }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDirectWhatsApp = () => {
    const msg = encodeURIComponent("¡Hola Jorgito Store! 📱 Quisiera obtener información y asesoría sobre un iPhone.");
    window.open(`https://wa.me/${STORE_PHONE_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-xs py-2 px-4 text-center border-b border-white/10 text-neutral-300 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        <span>Equipos 100% Originales & Sellados — Envíos Asegurados Gratis a Todo el País</span>
        <span className="hidden md:inline text-blue-400 font-semibold cursor-pointer hover:underline" onClick={() => onOpenOrderModal()}>
          Pedir ahora por WhatsApp &rarr;
        </span>
      </div>

      {/* Main Apple Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'apple-subnav-glass py-3 shadow-2xl' : 'bg-black/90 py-4 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-800 to-black border border-white/20 flex items-center justify-center group-hover:border-blue-500/50 transition-all shadow-lg">
              <Smartphone className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1 font-sans">
                Jorgito <span className="text-blue-500 font-extrabold">Store</span>
              </span>
              <span className="text-[10px] tracking-widest text-[#86868B] uppercase -mt-1 font-mono">
                Apple Premium
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#86868B]">
            <a href="#hero" className="hover:text-white transition-colors">iPhone 16 Pro</a>
            <a href="#bento" className="hover:text-white transition-colors">Innovación</a>
            <a href="#catalog" className="hover:text-white transition-colors">Catálogo Store</a>
            <a href="#comparison" className="hover:text-white transition-colors">Comparar</a>
            <a href="#guarantee" className="hover:text-white transition-colors flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Garantía
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Drawer Trigger */}
            <button
              onClick={onOpenCartDrawer}
              className="relative p-2.5 rounded-full bg-[#161617] border border-white/10 hover:border-white/30 text-white transition-all hover:scale-105 active:scale-95 shadow-md"
              title="Ver Carrito de Compras"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Direct WhatsApp Button */}
            <button
              onClick={handleDirectWhatsApp}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium text-xs tracking-wide transition-all shadow-lg shadow-emerald-950/40 hover:scale-105 active:scale-95 border border-emerald-400/30"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Ventas</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#86868B] hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden apple-subnav-glass border-t border-white/10 px-6 py-5 flex flex-col gap-4 text-neutral-200 font-medium"
            >
              <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">iPhone 16 Pro</a>
              <a href="#bento" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Innovación</a>
              <a href="#catalog" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Catálogo Store</a>
              <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Comparar Modelos</a>
              
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCartDrawer();
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Ver Carrito ({cartCount})
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleDirectWhatsApp();
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  Escribir a WhatsApp
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
