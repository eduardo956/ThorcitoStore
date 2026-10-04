import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Send, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { IPHONE_PRODUCTS, STORE_PHONE_NUMBER } from '../data/iphones';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialModelName?: string;
  initialColorName?: string;
  initialStorageSize?: string;
  initialCalculatedPrice?: number;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  initialModelName,
  initialColorName,
  initialStorageSize,
}) => {
  const defaultProduct = IPHONE_PRODUCTS.find((p) => p.name === initialModelName) || IPHONE_PRODUCTS[0];

  const [selectedModel, setSelectedModel] = useState(defaultProduct.name);
  const [selectedColor, setSelectedColor] = useState(initialColorName || defaultProduct.colors[0].name);
  const [selectedStorage, setSelectedStorage] = useState(initialStorageSize || defaultProduct.storageOptions[0].size);
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Transferencia / Nequi');

  useEffect(() => {
    if (initialModelName) setSelectedModel(initialModelName);
    if (initialColorName) setSelectedColor(initialColorName);
    if (initialStorageSize) setSelectedStorage(initialStorageSize);
  }, [initialModelName, initialColorName, initialStorageSize]);

  const activeProduct = IPHONE_PRODUCTS.find((p) => p.name === selectedModel) || IPHONE_PRODUCTS[0];
  const activeStorage = activeProduct.storageOptions.find((s) => s.size === selectedStorage) || activeProduct.storageOptions[0];
  const totalPrice = activeProduct.basePrice + activeStorage.priceDelta;

  const buildFormattedMessage = () => {
    let msg = `*¡Hola Jorgito Store! 📱 Quisiera pedir un iPhone:*\n\n`;
    msg += `*EQUIPO:* ${selectedModel}\n`;
    msg += `• Color: ${selectedColor}\n`;
    msg += `• Capacidad: ${selectedStorage}\n`;
    msg += `• Precio Oferta: $${totalPrice} USD\n\n`;

    msg += `*DATOS DE CONTACTO:*\n`;
    msg += `• Nombre: ${fullName || '[Nombre no especificado]'}\n`;
    msg += `• WhatsApp: ${phone || '[No especificado]'}\n`;
    msg += `• Ciudad: ${city || '[No especificada]'}\n`;
    msg += `• Pago: ${paymentMethod}\n\n`;
    msg += `¿Tienen disponibilidad inmediata para envío gratis? Muchas gracias.`;
    return msg;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#0071E3', '#10b981', '#ffffff', '#f59e0b'],
    });

    const fullMsg = buildFormattedMessage();
    const encodedUrl = `https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent(fullMsg)}`;

    setTimeout(() => {
      window.open(encodedUrl, '_blank');
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#161617] text-[#F5F5F7] rounded-[28px] p-6 sm:p-8 border border-white/10 z-10 my-6 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-emerald-400 fill-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                Pedido Rápido por WhatsApp
                <Sparkles className="w-4 h-4 text-blue-400" />
              </h3>
              <p className="text-xs text-[#86868B]">Completa tus datos en 30 segundos y serás atendido de inmediato.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Selected Product Card Summary */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-white">{selectedModel}</div>
                <div className="text-xs text-blue-400 font-medium">{selectedColor} • {selectedStorage}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#86868B]">Precio Especial</div>
                <div className="text-lg font-black text-emerald-400">${totalPrice} USD</div>
              </div>
            </div>

            {/* 3 Essential Simple Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Tu Nombre *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Carlos Mendoza"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="ej. +57 300 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Ciudad de Envío *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Bogotá / Medellín"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-black/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Compact Payment Chips */}
            <div>
              <label className="text-xs font-semibold text-[#86868B] block mb-1.5">
                Método de Pago:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Transferencia / Nequi', 'Contraentrega', 'Tarjeta de Crédito'].map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2 rounded-xl border text-[10px] font-semibold transition-all text-center ${
                      paymentMethod === method
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-black/60 border-white/10 text-neutral-400 hover:border-white/30'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-950/50 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
            >
              <Send className="w-4 h-4 fill-white" />
              <span>Confirmar Pedido vía WhatsApp</span>
            </button>

            {/* Guarantee Footer */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-[#86868B] pt-2">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Envío Asegurado Gratis
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Garantía de 1 Año
              </span>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
