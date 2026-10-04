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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainProduct = IPHONE_PRODUCTS[0]; // iPhone 18 Pro Max / 16 Pro

  const [selectedColor, setSelectedColor] = useState(mainProduct.colors[0]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!video || !canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let targetTime = 0;
    let rafId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Ultra-smooth 60fps LERP Canvas Render Loop
    const renderLoop = () => {
      if (video.duration) {
        const current = video.currentTime;
        const diff = targetTime - current;

        // Smoothly interpolate time (18% step per frame for instant response)
        if (Math.abs(diff) > 0.003) {
          video.currentTime = current + diff * 0.18;
        }

        // Draw hardware-accelerated video frame onto Canvas
        try {
          // Maintain aspect ratio cover fill
          const vWidth = video.videoWidth || canvas.width;
          const vHeight = video.videoHeight || canvas.height;
          const scale = Math.max(canvas.width / vWidth, canvas.height / vHeight);
          const x = (canvas.width / 2) - (vWidth / 2) * scale;
          const y = (canvas.height / 2) - (vHeight / 2) * scale;

          ctx.drawImage(video, x, y, vWidth * scale, vHeight * scale);
        } catch {
          // Ignore transient decode frame pauses
        }
      }
      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    // GSAP ScrollTrigger Updates targetTime continuously as user scrolls
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      pin: true,
      onUpdate: (self) => {
        if (video.duration) {
          targetTime = self.progress * video.duration;
        }
      },
    });

    return () => {
      cancelAnimationFrame(rafId);
      trigger.kill();
      window.removeEventListener('resize', resizeCanvas);
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
    <section id="hero" ref={containerRef} className="relative min-h-[250vh] bg-black text-[#F5F5F7]">
      {/* Hidden Offscreen HTML5 Video Buffer */}
      <video
        ref={videoRef}
        src="/hero-video.mp4"
        muted
        playsInline
        preload="auto"
        className="hidden"
      />

      {/* Pinned Sticky Fullscreen Canvas & Overlay */}
      <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* Hardware-Accelerated 60fps Smooth Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0 w-full h-full object-cover filter brightness-[0.88] opacity-90"
        />

        {/* Apple Vignette Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none z-0" />

        {/* Foreground Content Overlays */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          
          {/* Flash Deals Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/30 to-orange-600/30 border border-amber-400/40 backdrop-blur-xl text-xs font-bold uppercase tracking-wider text-amber-300 mb-4 shadow-2xl"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>🔥 Oferta Especial — Video Avance 60FPS con Scroll</span>
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
          <p className="mt-4 text-xs sm:text-base text-neutral-200 max-w-xl font-medium drop-shadow-md">
            Desliza suavemente hacia abajo para controlar la reproducción del video en tiempo real.
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
            <span>Desliza para avanzar el video suavemente</span>
            <ArrowDown className="w-4 h-4" />
          </div>

        </div>
      </div>
    </section>
  );
};
