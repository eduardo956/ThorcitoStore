import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Check,
  ShoppingCart,
  MessageCircle,
  Smartphone,
  Cpu,
  Camera,
  Battery,
  Scale,
  Award,
  Box,
  Truck,
} from 'lucide-react';
import type { iPhoneProduct, ColorOption, StorageOption, CartItem } from '../types';

interface ProductDetailModalProps {
  product: iPhoneProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onOpenOrderModal: (modelName: string, colorName: string, storageSize: string, calculatedPrice: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onOpenOrderModal,
}) => {
  if (!isOpen || !product) return null;

  const defaultColor = (product.colors && product.colors.length > 0)
    ? product.colors[0]
    : { id: 'default', name: 'Titanio Estándar', hex: '#9F9D98', bgGradient: 'from-neutral-700 to-black', imageUrl: product.image };

  const defaultStorage = (product.storageOptions && product.storageOptions.length > 0)
    ? product.storageOptions[0]
    : { size: '128 GB', priceDelta: 0 };

  const [selectedColor, setSelectedColor] = useState<ColorOption>(defaultColor);
  const [selectedStorage, setSelectedStorage] = useState<StorageOption>(defaultStorage);
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'features'>('specs');

  const currentPrice = product.basePrice + (selectedStorage?.priceDelta || 0);
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart({
      id: `${product.id}-${selectedColor.id}-${selectedStorage.size}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      color: selectedColor,
      storage: selectedStorage,
      unitPrice: currentPrice,
      quantity: 1,
    });
    onClose();
  };

  const handleWhatsAppBuy = () => {
    onOpenOrderModal(product.name, selectedColor.name, selectedStorage.size, currentPrice);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#161617] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-auto text-white flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">{product.name}</h3>
                <p className="text-xs font-mono text-blue-400">{product.tagline}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Scroll Area */}
          <div className="overflow-y-auto p-6 space-y-8 no-scrollbar">
            
            {/* Top Grid: Image + Main Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Image Preview & Swatches */}
              <div className="flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-black p-6 rounded-3xl border border-white/10 relative">
                {product.condition && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    ✨ {product.condition}
                  </span>
                )}
                {product.badge && (
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                    {product.badge}
                  </span>
                )}

                <div className="w-full aspect-square relative max-h-[320px] flex items-center justify-center p-2">
                  <motion.img
                    key={selectedColor.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={selectedColor.imageUrl || product.image}
                    alt={`${product.name} - ${selectedColor.name}`}
                    className="max-h-full max-w-full object-contain rounded-2xl drop-shadow-2xl"
                  />
                </div>

                {/* Color Selector */}
                <div className="w-full pt-4 border-t border-white/10 flex flex-col items-center gap-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Color: <span className="text-white">{selectedColor.name}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full transition-all border ${
                          selectedColor.id === color.id
                            ? 'ring-2 ring-blue-500 scale-110 border-white shadow-lg'
                            : 'border-white/20 opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Info & Storage Selector */}
              <div className="flex flex-col justify-between h-full space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-neutral-400 font-normal">({product.reviewsCount} opiniones)</span>
                    </div>

                    <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-full ${
                      isOutOfStock
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {isOutOfStock ? 'Sin Existencias' : `${product.stock ?? 15} disponibles`}
                    </span>
                  </div>

                  <h2 className="text-3xl font-extrabold text-white">{product.name}</h2>
                  <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                    {product.description || 'Equipo original Apple garantizado con prueba de funcionalidad completa y envío asegurado.'}
                  </p>
                </div>

                {/* Storage Selector Cards */}
                <div>
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                    Selecciona Capacidad:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {product.storageOptions.map((st) => (
                      <button
                        key={st.size}
                        onClick={() => setSelectedStorage(st)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedStorage.size === st.size
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                            : 'bg-neutral-900 border-white/10 text-neutral-300 hover:border-white/30'
                        }`}
                      >
                        <div className="text-sm font-bold">{st.size}</div>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          {st.priceDelta > 0 ? `+$${st.priceDelta} USD` : 'Incluido'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total Price Card */}
                <div className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-400 block">Precio Total Estimado</span>
                    <span className="text-2xl font-black text-white">${currentPrice} <span className="text-xs font-normal text-neutral-400">USD</span></span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Garantía Incluida
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`w-full py-3.5 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                      isOutOfStock
                        ? 'bg-neutral-900 text-neutral-600 border-white/5 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/30 shadow-lg shadow-blue-950/50'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isOutOfStock ? 'Agotado' : 'Añadir al Carrito'}
                  </button>

                  <button
                    onClick={handleWhatsAppBuy}
                    className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    Pedir por WhatsApp
                  </button>
                </div>

              </div>
            </div>

            {/* Spec Navigation Tabs */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-3">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`text-sm font-bold pb-2 transition-all border-b-2 ${
                    activeTab === 'specs'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  Especificaciones Técnicas
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`text-sm font-bold pb-2 transition-all border-b-2 ${
                    activeTab === 'features'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  Beneficios & Garantía
                </button>
              </div>

              {/* Specs Cards Grid */}
              {activeTab === 'specs' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                      <Smartphone className="w-4 h-4" /> Pantalla
                    </div>
                    <span className="text-sm font-bold text-white mt-1">{product.screenSize || 'Super Retina XDR'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                      <Cpu className="w-4 h-4" /> Chip / Procesador
                    </div>
                    <span className="text-sm font-bold text-white mt-1">{product.chip || 'Apple Silicon'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                      <Camera className="w-4 h-4" /> Cámaras
                    </div>
                    <span className="text-sm font-bold text-white mt-1">{product.camera || '48 MP Fusion'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <Battery className="w-4 h-4" /> Batería
                    </div>
                    <span className="text-sm font-bold text-white mt-1">{product.batteryLife || 'Hasta 27h video'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold">
                      <Scale className="w-4 h-4" /> Peso
                    </div>
                    <span className="text-sm font-bold text-white mt-1">{product.weight || '199 g'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                      <Award className="w-4 h-4" /> Estado
                    </div>
                    <span className="text-sm font-bold text-white mt-1">{product.condition || 'Nuevo (Sellado)'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                      <Box className="w-4 h-4" /> Stock
                    </div>
                    <span className="text-sm font-bold text-white mt-1">{product.stock ?? 15} Unidades</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                      <Truck className="w-4 h-4" /> Envío
                    </div>
                    <span className="text-sm font-bold text-white mt-1">Asegurado Gratis</span>
                  </div>
                </div>
              )}

              {/* Features List */}
              {activeTab === 'features' && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feat, i) => (
                    <li key={i} className="p-3.5 rounded-2xl bg-neutral-900 border border-white/10 flex items-start gap-3 text-xs text-neutral-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
