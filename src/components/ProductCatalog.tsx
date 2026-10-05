import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, ShoppingCart, RefreshCw, CloudCheck, AlertCircle, Eye } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import type { iPhoneProduct, ColorOption, StorageOption, CartItem } from '../types';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductCatalogProps {
  onAddToCart: (item: CartItem) => void;
  onOpenOrderModal?: (modelName: string, colorName: string, storageSize: string, calculatedPrice: number) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onAddToCart, onOpenOrderModal }) => {
  const { products, isLoading, syncStatus } = useProducts();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [detailProduct, setDetailProduct] = useState<iPhoneProduct | null>(null);

  const seriesOf = (p: iPhoneProduct) => (p.specs?.series as string | undefined) || 'Otros';
  const seriesList = Array.from(new Set(products.map(seriesOf)));
  const categories = [
    { id: 'all', label: 'Todos los Modelos' },
    ...seriesList.map((s) => ({ id: s, label: s })),
  ];

  const filteredProducts = products.filter(
    (product) => activeCategory === 'all' || seriesOf(product) === activeCategory
  );

  return (
    <section id="catalog" className="py-24 bg-[#000000] text-[#F5F5F7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold">
              Apple Store Oficial — Jorgito Store
            </span>
            {/* Dynamic Status Indicator */}
            {isLoading && (
              <span data-testid="catalog-loading" className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-400" /> Sincronizando...
              </span>
            )}
            {!isLoading && syncStatus === 'live' && (
              <span data-testid="catalog-live" className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                <CloudCheck className="w-3 h-3 text-emerald-400" /> Firestore En Vivo
              </span>
            )}
            {!isLoading && syncStatus === 'error' && (
              <span data-testid="catalog-error" className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                <AlertCircle className="w-3 h-3 text-amber-400" /> Sin conexión
              </span>
            )}
          </div>
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
              onAddToCart={onAddToCart}
              onOpenDetails={() => setDetailProduct(product)}
            />
          ))}
        </div>

        {!isLoading && filteredProducts.length === 0 && (
          <p data-testid="catalog-empty" className="text-center text-[#86868B] text-sm py-16">
            {syncStatus === 'error'
              ? 'No pudimos cargar el catálogo. Intenta de nuevo en unos minutos.'
              : 'Por ahora no hay equipos disponibles. ¡Vuelve pronto!'}
          </p>
        )}

      </div>

      <ProductDetailModal
        product={detailProduct}
        isOpen={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={onAddToCart}
        onOpenOrderModal={onOpenOrderModal || (() => {})}
      />
    </section>
  );
};

interface ProductCardProps {
  product: iPhoneProduct;
  onAddToCart: (item: CartItem) => void;
  onOpenDetails: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onOpenDetails }) => {
  const defaultColor = (product.colors && product.colors.length > 0)
    ? product.colors[0]
    : { id: 'default', name: 'Color Estándar', hex: '#9F9D98', bgGradient: 'from-neutral-700 to-black', imageUrl: product.image };

  const defaultStorage = (product.storageOptions && product.storageOptions.length > 0)
    ? product.storageOptions[0]
    : { size: '128 GB', priceDelta: 0 };

  const [selectedColor, setSelectedColor] = useState<ColorOption>(defaultColor);
  const [selectedStorage, setSelectedStorage] = useState<StorageOption>(defaultStorage);

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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="apple-card apple-card-hover p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden bg-[#161617]"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        {/* Rating & Stock */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>{product.rating}</span>
            <span className="text-[#86868B] hidden sm:inline">({product.reviewsCount} reseñas)</span>
            <span className="text-[#86868B] sm:hidden">({product.reviewsCount})</span>
          </div>

          {product.stock !== undefined && (
            <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${
              product.stock > 5
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : product.stock > 0
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </span>
          )}
        </div>

      </div>

      <div>
        {/* Title */}
        <h3 className="text-3xl font-extrabold text-white">{product.name}</h3>
        <p className="text-xs font-mono text-blue-400 mt-0.5">{product.tagline}</p>

        {/* Product Preview Image & Color Selector */}
        <div className="my-6 relative flex flex-col items-center">
          <div className="relative w-full aspect-square max-h-[260px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-neutral-900 to-black p-4 border border-white/10 flex items-center justify-center">
            <motion.img
              key={selectedColor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={selectedColor.imageUrl || product.image}
              alt={`${product.name} - ${selectedColor.name}`}
              className="max-h-full max-w-full object-contain rounded-2xl drop-shadow-2xl"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={onOpenDetails}
            className="w-full py-3 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-white/15"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            Ver Detalles
          </button>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-3 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border ${
              isOutOfStock
                ? 'bg-neutral-900 text-neutral-500 border-white/5 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/30'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isOutOfStock ? 'Sin Existencias' : 'Añadir al Carrito'}
          </button>
        </div>

      </div>
    </motion.div>
  );
};
