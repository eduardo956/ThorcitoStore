import React from 'react';
import { IPHONE_PRODUCTS } from '../data/iphones';
import { Check, X, Smartphone, Cpu, Camera, Battery, Shield } from 'lucide-react';

export const SpecComparison: React.FC = () => {
  return (
    <section id="comparison" className="py-24 bg-black text-[#F5F5F7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold">Comparativa Técnica Oficial</span>
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mt-2">
            <span className="apple-titanium-gradient">Compara los modelos.</span>
          </h2>
          <p className="mt-4 text-[#86868B] text-base">
            Encuentra el iPhone perfecto para tus necesidades y presupuesto con garantía oficial Apple.
          </p>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto no-scrollbar rounded-[28px] apple-card p-6 bg-[#161617] border border-white/10 shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-4 text-xs font-bold text-[#86868B] uppercase tracking-wider w-1/6">
                  Especificación
                </th>
                {IPHONE_PRODUCTS.map((p) => (
                  <th key={p.id} className="py-4 px-4 text-center w-1/5">
                    <div className="text-base font-extrabold text-white">{p.name}</div>
                    <div className="text-xs text-blue-400 font-mono mt-0.5">Desde ${p.basePrice} USD</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
              {/* Screen */}
              <tr>
                <td className="py-4 px-4 font-bold text-neutral-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" /> Pantalla
                </td>
                {IPHONE_PRODUCTS.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-center text-neutral-200">
                    {p.screenSize}
                  </td>
                ))}
              </tr>

              {/* Chip */}
              <tr>
                <td className="py-4 px-4 font-bold text-neutral-300 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" /> Chip Principal
                </td>
                {IPHONE_PRODUCTS.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-center font-bold text-white">
                    {p.chip}
                  </td>
                ))}
              </tr>

              {/* Camera */}
              <tr>
                <td className="py-4 px-4 font-bold text-neutral-300 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" /> Cámaras
                </td>
                {IPHONE_PRODUCTS.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-center text-[#86868B] text-xs">
                    {p.camera}
                  </td>
                ))}
              </tr>

              {/* Battery */}
              <tr>
                <td className="py-4 px-4 font-bold text-neutral-300 flex items-center gap-2">
                  <Battery className="w-4 h-4 text-emerald-400" /> Batería
                </td>
                {IPHONE_PRODUCTS.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-center text-emerald-400 font-bold">
                    {p.batteryLife}
                  </td>
                ))}
              </tr>

              {/* Material */}
              <tr>
                <td className="py-4 px-4 font-bold text-neutral-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-neutral-400" /> Chasis
                </td>
                {IPHONE_PRODUCTS.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-center text-neutral-300 font-medium">
                    {p.name.includes('Pro') ? (p.name.includes('18') ? 'Titanio Naranja Cósmico' : 'Titanio Grado 5') : 'Aluminio Aeroespacial'}
                  </td>
                ))}
              </tr>

              {/* Control de Cámara */}
              <tr>
                <td className="py-4 px-4 font-bold text-neutral-300">
                  Control 3D / Táctil
                </td>
                {IPHONE_PRODUCTS.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-center">
                    {p.name.includes('16') || p.name.includes('18') ? (
                      <Check className="w-5 h-5 text-emerald-400 mx-auto font-bold" />
                    ) : (
                      <X className="w-5 h-5 text-neutral-600 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
