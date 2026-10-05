import React, { useMemo, useState } from 'react';
import { X, PackagePlus, Check } from 'lucide-react';
import type { iPhoneProduct } from '../types';
import { IPHONE_CATALOG, colorsForModel, colorFromPalette } from '../data/iphoneCatalog';

interface Props {
  /** Productos que ya existen en Firestore (para sumar al stock existente). */
  existingProducts: iPhoneProduct[];
  onClose: () => void;
  onSave: (product: iPhoneProduct) => Promise<void>;
}

const CONDITIONS = ['Nuevo (Sellado)', 'Seminuevo / Excelente', 'Usado Grado A', 'Reacondicionado'];

/**
 * Agrega al inventario desde el catálogo de especificaciones: el admin solo
 * elige modelo, almacenamientos, colores, precios y cantidad. El stock se SUMA
 * al existente y el producto queda activo (visible en la tienda).
 */
export const CatalogStockModal: React.FC<Props> = ({ existingProducts, onClose, onSave }) => {
  const [modelId, setModelId] = useState(IPHONE_CATALOG[0].id);
  const template = useMemo(() => IPHONE_CATALOG.find((p) => p.id === modelId)!, [modelId]);
  const existing = existingProducts.find((p) => p.id === modelId);

  const [prices, setPrices] = useState<Record<string, string>>({});
  const [sizes, setSizes] = useState<string[]>([]);
  const [colorIds, setColorIds] = useState<string[]>([]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [cost, setCost] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);

  const changeModel = (id: string) => {
    setModelId(id);
    setSizes([]);
    setPrices({});
    setColorIds([]);
  };

  const toggle = (list: string[], v: string, set: (l: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const priceOf = (size: string) => {
    const typed = prices[size];
    if (typed !== undefined && typed !== '') return Number(typed);
    const ex = existing?.storageOptions.find((s) => s.size === size);
    return ex ? existing!.basePrice + ex.priceDelta : NaN;
  };

  const valid =
    sizes.length > 0 && colorIds.length > 0 && quantity > 0 && sizes.every((s) => priceOf(s) > 0);

  const handleSave = async () => {
    if (!valid) return;
    const sel = sizes.map((size) => ({ size, price: priceOf(size) }));
    const base = Math.min(...sel.map((s) => s.price));
    // Colores elegidos con su foto oficial; conserva los que ya tenía el producto
    const chosen = colorIds.map((id) => colorFromPalette(id, modelId));
    const colors = [
      ...(existing?.colors ?? []).filter((c) => !chosen.some((n) => n.id === c.id)),
      ...chosen,
    ];
    const mainImage = chosen[0]?.imageUrl ?? existing?.imageUrl ?? template.imageUrl;
    setSaving(true);
    try {
      await onSave({
        ...template,
        ...(existing ?? {}),
        basePrice: base,
        costPriceUsd: cost !== '' ? Number(cost) : existing?.costPriceUsd ?? Math.round(base * 0.75),
        condition,
        storageOptions: sel.map((s) => ({ size: s.size, priceDelta: s.price - base })),
        colors,
        image: mainImage ?? template.image,
        imageUrl: mainImage,
        stock: (existing?.stock ?? 0) + quantity,
        active: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#161617] border border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-xs text-white space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-blue-400" /> Agregar desde catálogo
          </h3>
          <button onClick={onClose} aria-label="Cerrar" className="p-1.5 rounded-full hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block space-y-1.5">
          <span className="text-[#86868B] font-bold uppercase tracking-wider">Modelo</span>
          <select value={modelId} onChange={(e) => changeModel(e.target.value)} className={input}>
            {IPHONE_CATALOG.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className="text-[#86868B]">
            {template.screenSize} · {template.chip} · {template.camera} · {template.batteryLife}
            {existing && <span className="text-emerald-400"> · En inventario: {existing.stock ?? 0} u.</span>}
          </p>
        </label>

        {/* Previsualizaciones de Imágenes del Modelo y Colores Seleccionados */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-[#86868B] font-bold uppercase tracking-wider text-[11px]">
            <span>Previsualización de Imagen</span>
            <span className="text-blue-400 font-normal">
              {colorIds.length > 0 ? `${colorIds.length} variante(s) de color elegida(s)` : 'Imagen por defecto del catálogo'}
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {/* Imagen Principal de Portada */}
            <div className="relative group shrink-0 w-24 h-24 rounded-xl bg-neutral-900 border border-blue-500/40 overflow-hidden flex items-center justify-center p-2">
              <img
                src={colorIds.length > 0 ? colorFromPalette(colorIds[0], modelId).imageUrl : (existing?.imageUrl ?? template.imageUrl)}
                alt={template.name}
                className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-1 left-1 right-1 bg-black/75 backdrop-blur-xs text-[9px] font-bold text-center text-white rounded py-0.5 truncate px-1">
                Imagen Principal
              </span>
            </div>

            {/* Galería de variantes de color elegidas */}
            {colorIds.map((cId) => {
              const cOpt = colorFromPalette(cId, modelId);
              return (
                <div key={cId} className="relative group shrink-0 w-20 h-20 rounded-xl bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center p-1.5">
                  <img
                    src={cOpt.imageUrl}
                    alt={cOpt.name}
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-[8px] text-center text-neutral-300 rounded truncate px-0.5 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ background: cOpt.hex }} />
                    <span className="truncate">{cOpt.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[#86868B] font-bold uppercase tracking-wider">Almacenamiento y precio (USD)</span>
          {template.storageOptions.map((s) => (
            <div key={s.size} className="flex items-center gap-3">
              <label className="flex items-center gap-2 w-28">
                <input type="checkbox" checked={sizes.includes(s.size)} onChange={() => toggle(sizes, s.size, setSizes)} />
                {s.size}
              </label>
              {sizes.includes(s.size) && (
                <input
                  type="number"
                  min={1}
                  placeholder="Precio venta"
                  value={prices[s.size] ?? (Number.isNaN(priceOf(s.size)) ? '' : String(priceOf(s.size)))}
                  onChange={(e) => setPrices({ ...prices, [s.size]: e.target.value })}
                  className={input}
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <span className="text-[#86868B] font-bold uppercase tracking-wider">Colores</span>
          <div className="flex flex-wrap gap-2">
            {colorsForModel(modelId).map((c) => {
              const on = colorIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(colorIds, c.id, setColorIds)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                    on ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: c.hex }} />
                  {c.name}
                  {on && <Check className="w-3 h-3 text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <label className="space-y-1.5">
            <span className="text-[#86868B] font-bold uppercase tracking-wider">Condición</span>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className={input}>
              {CONDITIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-[#86868B] font-bold uppercase tracking-wider">Costo (USD)</span>
            <input type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Opcional" className={input} />
          </label>
          <label className="space-y-1.5">
            <span className="text-[#86868B] font-bold uppercase tracking-wider">Cantidad</span>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className={input} />
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={!valid || saving}
          className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-40 transition-colors"
        >
          {saving ? 'Guardando...' : `Sumar ${quantity} u. al inventario y publicar`}
        </button>
      </div>
    </div>
  );
};
