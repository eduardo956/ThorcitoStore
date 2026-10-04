import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Camera, Shield, Battery, Sliders, Sparkles, Smartphone } from 'lucide-react';

export const BentoGrid: React.FC = () => {
  return (
    <section id="bento" className="py-28 bg-black text-[#F5F5F7] relative overflow-hidden">
      {/* Background Lighting Orbs */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Apple Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-mono uppercase tracking-widest text-blue-400 mb-3 font-semibold"
          >
            Ingeniería de vanguardia Apple
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-7xl font-extrabold tracking-tight"
          >
            <span className="apple-titanium-gradient">Tecnología de nivel Pro.</span>
          </motion.h2>
          <p className="mt-4 text-[#86868B] text-lg">
            Descubre las 5 innovaciones clave que hacen del iPhone el smartphone más potente del mundo.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {/* Card 1: A18 Pro Chip (Large 2 cols with Video Loop) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 apple-card apple-card-hover p-8 relative overflow-hidden flex flex-col justify-between group min-h-[360px]"
          >
            {/* Background Chip Video Loop */}
            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-35 transition-opacity">
              <video
                src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-code-42864-large.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161617] via-[#161617]/80 to-transparent" />
            </div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-white/15 flex items-center justify-center mb-6 shadow-lg">
                <Cpu className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">3 nanómetros de 2ª Generación</span>
              <h3 className="text-3xl font-extrabold mt-1 text-white">Chip A18 Pro</h3>
              <p className="mt-3 text-[#86868B] text-sm max-w-md leading-relaxed">
                Un motor monstruoso con GPU de 6 núcleos y trazado de rayos acelerado por hardware 2 veces más rápido. Capacidad de ejecutar Apple Intelligence localmente sin consumir batería.
              </p>
            </div>

            <div className="relative z-10 mt-8 flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-300">
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">+20% Ancho de banda</span>
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">16 Núcleos Neural Engine</span>
            </div>
          </motion.div>

          {/* Card 2: Control de Cámara (1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="apple-card apple-card-hover p-8 flex flex-col justify-between group min-h-[360px]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-white/15 flex items-center justify-center mb-6 shadow-lg">
                <Sliders className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">Nuevo Botón Táctil</span>
              <h3 className="text-2xl font-bold mt-1 text-white">Control de Cámara</h3>
              <p className="mt-3 text-[#86868B] text-sm leading-relaxed">
                Desliza para ajustar el zoom, la exposición y la profundidad de campo en tiempo real con respuesta háptica de cristal zafiro.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-300 font-medium">
              <span>Sensor Háptico de Cristal</span>
              <Camera className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Card 3: Titanio Grado 5 (1 col with Metal Video Loop) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="apple-card apple-card-hover p-8 relative overflow-hidden flex flex-col justify-between group min-h-[360px]"
          >
            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-35 transition-opacity">
              <video
                src="https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-41584-large.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161617] via-[#161617]/80 to-transparent" />
            </div>

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-white/15 flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-purple-400 uppercase">Resistencia Aeroespacial</span>
              <h3 className="text-2xl font-bold mt-1 text-white">Titanio Grado 5</h3>
              <p className="mt-3 text-[#86868B] text-sm leading-relaxed">
                La mayor relación resistencia-peso de cualquier metal. Acabado micro-pulido con maridaje térmico.
              </p>
            </div>
            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-purple-300 font-medium">
              <span>Ceramic Shield 50% más duro</span>
              <Smartphone className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Card 4: Autonomía (1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="apple-card apple-card-hover p-8 flex flex-col justify-between group min-h-[320px]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-white/15 flex items-center justify-center mb-6 shadow-lg">
                <Battery className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">Autonomía Rrecord</span>
              <h3 className="text-2xl font-bold mt-1 text-white">Hasta 33 horas</h3>
              <p className="mt-3 text-[#86868B] text-sm leading-relaxed">
                Mayor espacio interno para batería y arquitectura energética ultrapotente.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-emerald-300 font-medium">
              Carga MagSafe de hasta 25W
            </div>
          </motion.div>

          {/* Card 5: Cámara Fusion 48 MP (2 cols + Camera Video Spotlight) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 lg:col-span-3 apple-card apple-card-hover p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-30 transition-opacity">
              <video
                src="https://assets.mixkit.co/videos/preview/mixkit-macro-lens-of-a-camera-focusing-41617-large.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#161617] via-[#161617]/85 to-transparent" />
            </div>

            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Video 4K Dolby Vision a 120 fps</span>
              </div>
              <h3 className="text-3xl font-extrabold text-white">Cámara Fusion 48 MP & Teleobjetivo 5x</h3>
              <p className="mt-3 text-[#86868B] text-sm leading-relaxed">
                Sensor Quad Pixel de 2ª generación sin retraso de obturador. Captura detalles astronómicos a 120mm con el tetraprisma exclusivo del iPhone 16 Pro Max.
              </p>
            </div>

            <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="p-4 rounded-2xl bg-black/70 border border-white/10 text-center">
                <div className="text-2xl font-black text-white">48 MP</div>
                <div className="text-[11px] text-[#86868B]">Sensor Fusion</div>
              </div>
              <div className="p-4 rounded-2xl bg-black/70 border border-white/10 text-center">
                <div className="text-2xl font-black text-white">5x</div>
                <div className="text-[11px] text-[#86868B]">Zoom Óptico</div>
              </div>
              <div className="p-4 rounded-2xl bg-black/70 border border-white/10 text-center">
                <div className="text-2xl font-black text-white">120 fps</div>
                <div className="text-[11px] text-[#86868B]">Cámara Lenta 4K</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
