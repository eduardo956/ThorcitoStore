import React, { useState } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';

interface Iphone18ProMax3DProps {
  scrollYProgress: MotionValue<number>;
}

export const Iphone18ProMax3D: React.FC<Iphone18ProMax3DProps> = ({ scrollYProgress }) => {
  const [dragY, setDragY] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Scroll Transforms
  const rotateYScroll = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0, 180, 360, 540]);
  const rotateXScroll = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [12, -15, 10, 0]);
  const scaleScroll = useTransform(scrollYProgress, [0, 0.4, 0.75, 1], [0.88, 1.05, 1.3, 1.5]);
  const translateYScroll = useTransform(scrollYProgress, [0, 0.5, 1], [0, 40, 120]);
  const backgroundZoom = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.15, 1.35]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8], [0.35, 0.85, 1]);

  return (
    <div className="relative w-full max-w-5xl mx-auto min-h-[600px] sm:min-h-[750px] flex items-center justify-center overflow-hidden rounded-[36px] bg-gradient-to-b from-orange-50/50 via-white to-orange-100/40 border border-orange-200/50 shadow-2xl">
      
      {/* Bed / Bedroom Lifestyle Background (Zooms in on scroll) */}
      <motion.div
        style={{ scale: backgroundZoom, opacity: backgroundOpacity }}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1540518614846-7ede433c5163?auto=format&fit=crop&w=2000&q=80"
          alt="Bedroom Lifestyle Background"
          className="w-full h-full object-cover filter brightness-[0.92] contrast-[1.05]"
        />
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/40 via-transparent to-white/60" />
      </motion.div>

      {/* Floating Badge overlay */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-orange-200 shadow-lg text-xs font-bold text-orange-900">
        <Sparkles className="w-4 h-4 text-orange-500 animate-spin" />
        <span>iPhone 18 Pro Max — Edición Naranja Cósmico 3D</span>
      </div>

      <div className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-gray-200 text-[11px] text-gray-700 font-medium">
        <RefreshCw className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
        <span>Gira en 3D mientras scrolleas o arrastra</span>
      </div>

      {/* 3D Scene Viewport Container */}
      <motion.div
        className="relative z-10 w-full h-[520px] sm:h-[650px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        style={{ perspective: 1400 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setDragX(0);
          setDragY(0);
        }}
        onMouseMove={(e) => {
          if (!isHovered) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
          const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
          setDragX(x * 35);
          setDragY(-y * 25);
        }}
      >
        {/* 3D iPhone Object */}
        <motion.div
          style={{
            scale: scaleScroll,
            y: translateYScroll,
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateY: (rotateYScroll.get() || 0) + dragX,
            rotateX: (rotateXScroll.get() || 0) + dragY,
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          className="relative w-[270px] sm:w-[320px] h-[540px] sm:h-[640px] rounded-[52px] shadow-[0_30px_90px_rgba(235,94,0,0.35)]"
        >
          {/* Metallic Orange Chassis Rim Outer */}
          <div
            className="absolute inset-0 rounded-[52px] p-[5px] bg-gradient-to-tr from-[#CC5200] via-[#FF7A00] to-[#FFA852] shadow-2xl"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Inner Phone Frame */}
            <div className="relative w-full h-full rounded-[47px] bg-[#1A0B02] overflow-hidden flex flex-col justify-between p-3 border border-orange-500/40">
              
              {/* Dynamic Island Header */}
              <div className="relative z-30 w-full flex items-center justify-center pt-2">
                <div className="w-28 h-7 bg-black rounded-full flex items-center justify-between px-3 shadow-md border border-orange-500/20">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-orange-500/40" />
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                </div>
              </div>

              {/* Front Screen Display Wallpaper */}
              <div className="absolute inset-0 rounded-[47px] overflow-hidden bg-gradient-to-br from-orange-600 via-amber-700 to-black flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80"
                  alt="iPhone 18 Pro Max Cosmic Orange Screen"
                  className="w-full h-full object-cover mix-blend-overlay opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-orange-950/40" />

                {/* Lockscreen Time & iOS 18 Widgets */}
                <div className="absolute top-16 text-center text-white z-20">
                  <div className="text-xs font-semibold uppercase tracking-widest text-orange-200">iOS 18 Pro</div>
                  <div className="text-5xl font-black tracking-tight font-mono mt-1 text-white">09:41</div>
                  <div className="text-xs font-medium text-orange-100/90 mt-1">Jorgito Store — Naranja Cósmico</div>
                </div>

                {/* Bottom Lock Icon / Camera Controls */}
                <div className="absolute bottom-8 left-6 right-6 flex items-center justify-between text-white/80 z-20">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-xs">
                    📷
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-xs">
                    🔦
                  </div>
                </div>
              </div>

              {/* Back Camera Module (Rendered on 3D turn around back face) */}
              <div
                className="absolute inset-0 rounded-[47px] bg-gradient-to-br from-[#FF6B00] via-[#E05200] to-[#802B00] p-4 flex flex-col justify-between overflow-hidden shadow-inner"
                style={{
                  transform: 'rotateY(180deg) translateZ(1px)',
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Metallic Orange Glass Back texture */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#FFA04D,transparent_60%)] opacity-60" />

                {/* Triple Pro Camera Island Bump */}
                <div className="relative w-36 h-36 rounded-[32px] bg-gradient-to-br from-[#FF7A00] to-[#B33C00] p-3 border border-orange-300/40 shadow-2xl flex flex-wrap gap-2 items-center justify-center z-10">
                  {/* Lens 1 */}
                  <div className="w-12 h-12 rounded-full bg-black border-2 border-[#FF8800] p-1 flex items-center justify-center shadow-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 to-black border border-orange-400" />
                  </div>
                  {/* Lens 2 */}
                  <div className="w-12 h-12 rounded-full bg-black border-2 border-[#FF8800] p-1 flex items-center justify-center shadow-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 to-black border border-orange-400" />
                  </div>
                  {/* Lens 3 */}
                  <div className="w-12 h-12 rounded-full bg-black border-2 border-[#FF8800] p-1 flex items-center justify-center shadow-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 to-black border border-orange-400" />
                  </div>
                  {/* LiDAR & Flash */}
                  <div className="w-8 h-8 rounded-full bg-white/90 border border-orange-300 shadow-md flex items-center justify-center text-[10px]">
                    ⚡
                  </div>
                </div>

                {/* Metallic Apple Logo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 opacity-80 text-4xl">
                  
                </div>

                {/* Bottom iPhone 18 Pro Max Inscription */}
                <div className="relative z-10 text-center pb-4 text-[10px] font-mono font-bold tracking-widest text-orange-200 uppercase">
                  iPhone 18 Pro Max • Cosmic Orange Titanium
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Specs Banner at Bottom of Hero Scene */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-xl p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-orange-200/80 shadow-xl flex items-center justify-between gap-4 text-gray-900">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600">Pro 3D Showcase</div>
          <div className="text-sm font-extrabold">iPhone 18 Pro Max Naranja Cósmico</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 font-mono">Desde</div>
          <div className="text-lg font-black text-orange-600">$1,299 USD</div>
        </div>
      </div>
    </div>
  );
};
