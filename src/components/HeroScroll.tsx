import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ShoppingCart, ArrowDown, Clock, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IPHONE_PRODUCTS } from '../data/iphones';
import type { CartItem } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface HeroScrollProps {
  onOpenOrderModal: (modelName?: string) => void;
  onAddToCart: (item: CartItem) => void;
}

export const HeroScroll: React.FC<HeroScrollProps> = ({ onOpenOrderModal, onAddToCart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainProduct = IPHONE_PRODUCTS[0]; // iPhone 18 Pro Max / 16 Pro

  const [selectedColor, setSelectedColor] = useState(mainProduct.colors[0]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Load video metadata to get duration
    const setupScrollTrigger = () => {
      if (!video.duration) return;

      const ctx = gsap.context(() => {
        // GSAP ScrollTrigger to scrub video.currentTime frame-by-frame
        gsap.to(video, {
          currentTime: video.duration,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2, // Smooth catch-up scrub animation
            pin: true,  // Pin video during scroll progression
          },
        });
      }, container);

      return () => ctx.revert();
    };

    if (video.readyState >= 1) {
      setupScrollTrigger();
    } else {
      video.addEventListener('loadedmetadata', setupScrollTrigger);
    }

    return () => {
      video.removeEventListener('loadedmetadata', setupScrollTrigger);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const handleQuickAdd = () => {
    onAddToCart({
      id: `${mainProduct.id}-${selectedColor.id}-256gb-${Date.now()}`,
      productId: mainProduct.id,
      productName: mainProduct.name,
      color: selectedColor,
      storage: mainProduct.storageOptions[0],
      unitPrice: mainProduct.basePrice,
      quantity: 1,
    });
  };

  return (
    <section id="hero" ref={containerRef} className="relative min-h-[220vh] bg-black text-[#F5F5F7]">
      {/* Pinned Sticky Fullscreen Video Showcase */}
      <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background GSAP Scroll-Scrubbed Video */}
        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src="/hero-video.mp4"
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover filter brightness-[0.9] opacity-90 transition-all"
          />
          {/* Apple Gradient Vignette Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* Foreground Content Overlays */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          
          {/* Flash Deals Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/30 to-orange-600/30 border border-amber-400/40 backdrop-blur-xl text-xs font-bold uppercase tracking-wider text-amber-300 mb-4 shadow-xl"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>🔥 Ofertas Especiales — Scrollea para ver el video avance</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-7xl lg:text-9xl font-black tracking-tight max-w-5xl leading-tight"
          >
            <span className="apple-titanium-gradient block">{mainProduct.name}</span>
            <span className="text-2xl sm:text-5xl lg:text-6xl font-black mt-2 block text-emerald-400">
              Desde ${mainProduct.basePrice} USD <span className="text-base text-neutral-400 line-through font-normal">${mainProduct.basePrice + 200} USD</span>
            </span>
          </motion.h1>

          {/* Tagline */}
          <p className="mt-4 text-xs sm:text-base text-neutral-300 max-w-xl font-medium drop-shadow-md">
            Video interactivo avance con scroll (GSAP ScrollTrigger). Equipos 100% sellados con 1 año de garantía oficial Apple.
          </p>

          {/* Interactive Color Selector */}
          <div className="mt-6 flex items-center gap-3 bg-[#161617]/90 p-2.5 rounded-full border border-white/15 backdrop-blur-xl shadow-2xl">
            <span className="text-xs font-semibold text-[#86868B] pl-3 pr-1">Color:</span>
            {mainProduct.colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color)}
                className={`relative w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                  selectedColor.id === color.id
                    ? 'ring-2 ring-blue-500 scale-110 shadow-md'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {selectedColor.id === color.id && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-md" />
                )}
              </button>
            ))}
            <span className="text-xs font-bold text-white pr-3 pl-1">
              {selectedColor.name}
            </span>
          </div>

          {/* Direct Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 z-20">
            <button
              onClick={() => onOpenOrderModal(mainProduct.name)}
              className="apple-btn-blue px-7 py-3.5 text-sm font-extrabold flex items-center gap-2 shadow-xl shadow-blue-900/50"
            >
              <ShoppingBag className="w-4 h-4" />
              Comprar por WhatsApp
            </button>

            <button
              onClick={handleQuickAdd}
              className="px-6 py-3.5 rounded-full bg-[#161617]/90 backdrop-blur-md border border-white/20 hover:border-white/40 text-white font-bold text-sm transition-all hover:scale-105 shadow-md flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              Añadir al Carrito
            </button>
          </div>

          {/* Scroll Down Indicator */}
          <div className="mt-8 flex items-center gap-2 text-xs font-bold text-amber-400 tracking-wider animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>Desliza para avanzar el video cuadro a cuadro</span>
            <ArrowDown className="w-4 h-4" />
          </div>

        </div>
      </div>
    </section>
  );
};
