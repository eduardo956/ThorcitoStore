import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, ArrowDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useProducts } from '../hooks/useProducts';
import type { CartItem } from '../types';

gsap.registerPlugin(ScrollTrigger);
// Evita recálculos cuando la barra de direcciones del móvil aparece/desaparece
ScrollTrigger.config({ ignoreMobileResize: true });

// Secuencia extraída de hero-video.mp4 (8 s × 24 fps) con ffmpeg
const FRAME_COUNT = 192;
const frameSrc = (i: number) => `/hero-frames/frame_${String(i + 1).padStart(4, '0')}.webp`;

interface HeroScrollProps {
  onAddToCart: (item: CartItem) => void;
}

export const HeroScroll: React.FC<HeroScrollProps> = ({ onAddToCart }) => {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { products } = useProducts();
  const mainProduct = [...products].sort((a, b) => b.basePrice - a.basePrice)[0];

  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const selectedColor = mainProduct?.colors.find((c) => c.id === selectedColorId) ?? mainProduct?.colors[0];
  const [loadedPct, setLoadedPct] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !container || !overlay) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    const ready: boolean[] = new Array(FRAME_COUNT).fill(false);
    const state = { frame: 0 };
    let lastDrawn = -1;
    let loaded = 0;
    let cancelled = false;

    // Dibuja el frame con ajuste "cover"; si aún no cargó, usa el más cercano anterior
    const render = (force = false) => {
      let i = Math.round(state.frame);
      while (i > 0 && !ready[i]) i--;
      if (!ready[i] || (i === lastDrawn && !force)) return;
      const img = images[i];
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      lastDrawn = i;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      render(true);
    };

    const loadFrame = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = frameSrc(i);
        images[i] = img;
        const done = () => {
          if (cancelled) return resolve();
          ready[i] = !!img.naturalWidth;
          loaded++;
          if (loaded % 8 === 0 || loaded === FRAME_COUNT) {
            setLoadedPct(Math.round((loaded / FRAME_COUNT) * 100));
          }
          render(i === 0);
          resolve();
        };
        img.decode().then(done, done);
      });

    // Primero el frame inicial (para pintar de inmediato), luego el resto en lotes
    (async () => {
      await loadFrame(0);
      resize();
      const BATCH = 12;
      for (let start = 1; start < FRAME_COUNT && !cancelled; start += BATCH) {
        const batch: Promise<void>[] = [];
        for (let i = start; i < Math.min(start + BATCH, FRAME_COUNT); i++) batch.push(loadFrame(i));
        await Promise.all(batch);
      }
    })();

    const gctx = gsap.context(() => {
      // El scroll controla el índice del frame (scrub suave pero inmediato)
      gsap.to(state, {
        frame: FRAME_COUNT - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.4,
        },
        onUpdate: () => render(),
      });

      // El texto se desvanece al inicio para dejar ver el video
      gsap.to(overlay, {
        autoAlpha: 0,
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '30% top',
          scrub: true,
        },
      });
    }, container);

    window.addEventListener('resize', resize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', resize);
      gctx.revert();
    };
  }, []);

  const handleQuickAdd = () => {
    if (!mainProduct) return;
    const color = selectedColor ?? {
      id: 'default',
      name: 'Color Estándar',
      hex: '#9F9D98',
      bgGradient: 'from-neutral-700 to-black',
      imageUrl: mainProduct.image,
    };
    const storage = mainProduct.storageOptions[0] ?? { size: 'Único', priceDelta: 0 };
    onAddToCart({
      id: `${mainProduct.id}-${color.id}-${storage.size}-${Date.now()}`,
      productId: mainProduct.id,
      productName: mainProduct.name,
      color,
      storage,
      unitPrice: mainProduct.basePrice + storage.priceDelta,
      quantity: 1,
    });
  };


  return (
    <section id="hero" ref={containerRef} className="relative h-[300vh] bg-black text-[#F5F5F7]">
      {/* Escena fija mientras se recorre la sección (sticky, sin pin de GSAP) */}
      <div className="sticky top-0 w-full h-[100svh] overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />

        {/* Barra de carga de la secuencia */}
        {loadedPct < 100 && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-[width] duration-300" style={{ width: `${loadedPct}%` }} />
        )}

        <div
          ref={overlayRef}
          className="relative z-10 h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center"
        >
          {mainProduct ? (
            <>
              <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tight max-w-5xl leading-tight">
                <span className="apple-titanium-gradient block">{mainProduct.name}</span>
                <span className="text-2xl sm:text-4xl lg:text-5xl font-bold mt-2 block text-emerald-400">
                  Desde ${mainProduct.basePrice} USD
                </span>
              </h1>

              <p className="mt-4 text-sm sm:text-base text-neutral-200 max-w-xl">
                Sellado, con 1 año de garantía Apple y envío gratis.
              </p>

              {mainProduct.colors.length > 0 && selectedColor && (
                <div className="mt-6 flex items-center gap-3 bg-[#161617]/90 p-2.5 rounded-full border border-white/15 backdrop-blur-xl">
                  <span className="text-xs font-semibold text-[#86868B] pl-3 pr-1">Color:</span>
                  {mainProduct.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColorId(color.id)}
                      aria-label={color.name}
                      className={`relative w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                        selectedColor.id === color.id ? 'ring-2 ring-blue-500 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor.id === color.id && <span className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                  ))}
                  <span className="text-xs font-bold text-white pr-3 pl-1">{selectedColor.name}</span>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleQuickAdd}
                  className="px-6 py-3.5 rounded-full bg-[#161617]/90 backdrop-blur-md border border-white/20 hover:border-white/40 text-white font-bold text-sm transition-all flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 text-blue-400" />
                  Añadir al carrito
                </button>
              </div>
            </>
          ) : (
            <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tight max-w-5xl leading-tight">
              <span className="apple-titanium-gradient block">Jorgito Store</span>
            </h1>
          )}


          <div className="mt-8 flex items-center gap-2 text-xs text-neutral-400">
            <span>Desliza para ver el video</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};
