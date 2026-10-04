import React from 'react';
import { Smartphone, ShieldCheck, Truck, Sparkles, Heart } from 'lucide-react';
import { STORE_PHONE_NUMBER } from '../data/iphones';

export const Footer: React.FC = () => {
  return (
    <footer id="guarantee" className="bg-[#161617] text-[#86868B] border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Guarantee Banner Box */}
        <div className="apple-card p-8 bg-black/60 border border-white/10 mb-16 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">100% Originales & Sellados</h4>
                <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                  Todos los iPhones son importados directamente con 1 año de garantía oficial de Apple.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">Envíos Asegurados Gratis</h4>
                <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                  Despachamos tu pedido asegurado con seguimiento en tiempo real a todo el país.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">Regalos Exclusivos</h4>
                <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                  Incluye cubo cargador de carga rápida y protector cerámico de cortesía con tu compra.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Links & Branding */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/10 text-xs">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white">
                Jorgito <span className="text-blue-500">Store</span>
              </span>
            </div>
            <p className="text-[#86868B] max-w-sm leading-relaxed">
              Tu tienda de confianza para la compra de iPhone 18 Pro Max, iPhone 16 Pro y productos Apple con atención personalizada vía WhatsApp y entregas garantizadas.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Navegación</h5>
            <ul className="space-y-2 text-[#86868B] font-medium">
              <li><a href="#hero" className="hover:text-white">iPhone 16 Pro & 18 Pro</a></li>
              <li><a href="#catalog" className="hover:text-white">Catálogo Store</a></li>
              <li><a href="#bento" className="hover:text-white">Innovación Apple</a></li>
              <li><a href="#comparison" className="hover:text-white">Comparar Modelos</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Contacto Directo</h5>
            <p className="text-[#86868B] leading-relaxed mb-2 font-medium">
              Atención vía WhatsApp: <br />
              <span className="text-blue-400 font-bold text-sm">+57 300 123 4567</span>
            </p>
            <a
              href={`https://wa.me/${STORE_PHONE_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-[11px]"
            >
              Chatear en línea &rarr;
            </a>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 text-center text-xs text-[#86868B] font-medium flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Jorgito Store — Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-1 text-[#86868B]">
            Diseñado en estilo oficial Apple <Heart className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
          </div>
        </div>

      </div>
    </footer>
  );
};
