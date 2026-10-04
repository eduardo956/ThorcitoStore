import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, MessageCircle, ShoppingCart } from 'lucide-react';
import { IPHONE_PRODUCTS } from '../data/iphones';
import type { iPhoneProduct, ColorOption, StorageOption, CartItem } from '../types';

interface ProductCatalogProps {
  onOpenOrderModal: (modelName: string, colorName: string, storageSize: string, calculatedPrice: number) => void;
  onAddToCart: (item: CartItem) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onOpenOrderModal, onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todos los Modelos' },
    { id: '18', label: 'Serie 18 Pro' },
    { id: '16-pro', label: 'Serie 16 Pro' },
    { id: '16', label: 'iPhone 16' },
    { id: '15', label: 'Serie 15' },
  ];

  const filteredProducts = IPHONE_PRODUCTS.filter((product) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === '18') return product.id.includes('18');
    if (activeCategory === '16-pro') return product.id.includes('16-pro');
    if (activeCategory === '16') return product.id === 'iphone-16';
    if (activeCategory === '15') return product.id.includes('15');
    return true;
  });

  return (
    <section id="catalog" className="py-24 bg-[#000000] text-[#F5F5F7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">Apple Store Oficial — Jorgito Store</span>
          <h2 className="text-4xl sm:text-7xl font-extrabold tracking-tight mt-2">
            <span className="apple-titanium-gradient">Elige tu nuevo iPhone.</span>
          </h2>
          <p className="mt-4 text-[#86868B] text-base sm:text-lg">
            Todos los equipos incluyen 1 año de garantía oficial Apple, cargador de regalo y envío asegurado en caja sellada.
          </p>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center justify-center gap-2.5 mb-16 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                  : 'bg-[#161617] text-[#86868B] hover:text-white border border-white/10 hover:border-white/25'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenOrderModal={onOpenOrderModal}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface ProductCardProps {
  product: iPhoneProduct;
  onOpenOrderModal: (modelName: string, colorName: string, storageSize: string, calculatedPrice: number) => void;
  onAddToCart: (item: CartItem) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenOrderModal, onAddToCart }) => {
  const [selectedColor, setSelectedColor] = useState<ColorOption>(product.colors[0]);
  const [selectedStorage, setSelectedStorage] = useState<StorageOption>(product.storageOptions[0]);

  const currentPrice = product.basePrice + selectedStorage.priceDelta;

  const handleAddToCart = () => {
    onAddToCart({
      id: `${product.id}-${selectedColor.id}-${selectedStorage.size}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      color: selectedColor,
      storage: selectedStorage,
      unitPrice: currentPrice,
      quantity: 1,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="apple-card apple-card-hover p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden bg-[#161617]"
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-6 right-6 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide">
          {product.badge}
        </div>
      )}

      <div>
        {/* Rating */}
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-2">
          <Star className="w-4 h-4 fill-amber-400" />
          <span>{product.rating}</span>
          <span className="text-[#86868B]">({product.reviewsCount} opiniones verificadas)</span>
        </div>

        {/* Title */}
        <h3 className="text-3xl font-extrabold text-white">{product.name}</h3>
        <p className="text-xs font-mono text-blue-400 mt-0.5">{product.tagline}</p>

        {/* Product Preview Image & Color Selector */}
        <div className="my-6 relative flex flex-col items-center">
          <div className="relative w-48 sm:w-60 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-neutral-900 to-black p-3 border border-white/10">
            <motion.img
              key={selectedColor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={selectedColor.imageUrl}
              alt={`${product.name} - ${selectedColor.name}`}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          {/* Color Swatches */}
          <div className="mt-4 flex items-center gap-3">
            {product.colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color)}
                className={`w-7 h-7 rounded-full transition-all border ${
                  selectedColor.id === color.id
                    ? 'ring-2 ring-blue-500 scale-110 border-white shadow-md'
                    : 'border-white/20 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            <span className="text-xs font-bold text-neutral-300 ml-1">
              {selectedColor.name}
            </span>
          </div>
        </div>

        {/* Storage Capacity Selector */}
        <div className="mb-6">
          <label className="text-xs font-bold text-[#86868B] uppercase tracking-wider block mb-2">
            Almacenamiento:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {product.storageOptions.map((storage) => (
              <button
                key={storage.size}
                onClick={() => setSelectedStorage(storage)}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                  selectedStorage.size === storage.size
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                    : 'bg-black/60 border-white/10 text-neutral-300 hover:border-white/30'
                }`}
              >
                <div>{storage.size}</div>
                {storage.priceDelta > 0 && (
                  <div className="text-[10px] opacity-80 mt-0.5">+${storage.priceDelta} USD</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Key Features List */}
        <ul className="space-y-2 mb-8 text-xs text-[#86868B]">
          {product.features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 font-bold" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Price & Action Buttons */}
      <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#86868B] font-medium">Precio Total Estimado:</span>
          <span className="text-3xl font-black text-white">${currentPrice} <span className="text-xs text-[#86868B] font-normal">USD</span></span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            className="w-full py-3.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/15"
          >
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            Añadir al Carrito
          </button>

          <button
            onClick={() => onOpenOrderModal(product.name, selectedColor.name, selectedStorage.size, currentPrice)}
            className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            Comprar por WhatsApp
          </button>
        </div>
      </div>
    </motion.div>
  );
};
