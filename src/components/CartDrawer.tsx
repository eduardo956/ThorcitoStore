import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Send, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CartItem } from '../types';
import { STORE_PHONE_NUMBER } from '../data/iphones';
import { logStoreInteraction } from '../lib/interactions';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const handleCheckoutWhatsApp = () => {
    if (cartItems.length === 0) return;

    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#0071E3', '#10b981', '#ffffff', '#f59e0b'],
    });

    // Asynchronously record cart checkout to Firestore
    const itemsSummary = cartItems
      .map((i) => `${i.quantity}x ${i.productName} (${i.color.name}, ${i.storage.size})`)
      .join(', ');

    logStoreInteraction({
      type: 'cart_checkout',
      productId: 'cart_bundle',
      productName: `Carrito (${cartItems.reduce((a, i) => a + i.quantity, 0)} ítems)`,
      color: 'Varios',
      storage: 'Varios',
      priceUsd: total,
      customerName: 'Cliente Carrito',
      customerPhone: 'N/A (WhatsApp Direct)',
      customerCity: 'N/A (Coordinación WhatsApp)',
      paymentMethod: 'Por coordinar',
      cartSummary: itemsSummary,
      notes: 'Checkout generado desde CartDrawer',
    });

    let msg = `*¡Hola Jorgito Store! 🛒 Quisiera realizar la compra de mi Carrito:*\n\n`;
    msg += `*RESUMEN DEL PEDIDO (${cartItems.reduce((a, i) => a + i.quantity, 0)} ítems):*\n`;

    cartItems.forEach((item, index) => {
      msg += `\n*${index + 1}. ${item.productName}*\n`;
      msg += `  • Color: ${item.color.name}\n`;
      msg += `  • Almacenamiento: ${item.storage.size}\n`;
      msg += `  • Cantidad: ${item.quantity}\n`;
      msg += `  • Precio Unitario: $${item.unitPrice} USD\n`;
      msg += `  • Subtotal: $${item.unitPrice * item.quantity} USD\n`;
    });

    msg += `\n*TOTAL GENERAL A PAGAR:* $${total} USD\n`;
    msg += `*ENVÍO:* Gratis Asegurado a todo el país 📦\n\n`;
    msg += `Quedo atento para coordinar la dirección de entrega y forma de pago. ¡Muchas gracias!`;

    const encodedUrl = `https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent(msg)}`;

    setTimeout(() => {
      window.open(encodedUrl, '_blank');
      onClearCart();
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Slide-over Drawer Panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-screen max-w-md bg-[#161617] text-[#F5F5F7] shadow-2xl flex flex-col border-l border-white/10"
          >
            {/* Drawer Header */}
            <div className="p-6 bg-[#161617] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Tu Carrito Apple
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                      {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  </h2>
                  <p className="text-xs text-[#86868B]">Jorgito Store — Apple Premium</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items Scroll Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                    <ShoppingBag className="w-10 h-10 text-neutral-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Tu carrito está vacío</h3>
                  <p className="text-xs text-[#86868B] max-w-xs mt-1">
                    Explora nuestro catálogo y añade los mejores iPhones con garantía oficial Apple.
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-4 relative group"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-24 rounded-xl bg-black p-1 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.color.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{item.productName}</h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20 inline-block"
                          style={{ backgroundColor: item.color.hex }}
                          title={item.color.name}
                        />
                        <span className="text-xs text-neutral-300 font-medium">{item.color.name}</span>
                        <span className="text-xs text-neutral-500">•</span>
                        <span className="text-xs font-mono font-semibold text-blue-400">{item.storage.size}</span>
                      </div>

                      {/* Quantity & Unit Price */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 bg-neutral-900 rounded-full border border-white/15 p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-neutral-300 font-bold"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-white px-1">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-neutral-300 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-sm font-black text-white">
                          ${item.unitPrice * item.quantity} <span className="text-[10px] text-[#86868B] font-normal">USD</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Drawer Footer Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 bg-[#161617] border-t border-white/10 space-y-4">
                
                {/* Free Shipping Badge */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Truck className="w-4 h-4 text-emerald-400" /> Envío Gratis Asegurado
                  </span>
                  <span className="font-bold text-emerald-400">$0 USD</span>
                </div>

                {/* Subtotal & Total */}
                <div className="space-y-1.5 text-xs text-[#86868B]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-white">${subtotal} USD</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10 text-base font-extrabold text-white">
                    <span>Total a Pagar:</span>
                    <span className="text-xl font-black text-blue-400">${total} USD</span>
                  </div>
                </div>

                {/* Checkout WhatsApp Button */}
                <button
                  onClick={handleCheckoutWhatsApp}
                  className="w-full py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-all shadow-xl shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5 fill-white" />
                  <span>Comprar Todo por WhatsApp</span>
                </button>

                <div className="flex items-center justify-center gap-3 text-[11px] text-[#86868B] pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Garantía de 1 Año
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Equipos 100% Sellados
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
