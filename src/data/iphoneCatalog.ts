import type { ColorOption, iPhoneProduct, StorageOption } from '../types';
import rawSpecs from './iphoneSpecs.json';
import rawImages from './iphoneImages.json';

/**
 * Catálogo de plantillas generado desde especificaciones_t_cnicas_iphone_11.md
 * (se regenera con `node scripts/convertSpecs.mjs`).
 * Cada plantilla trae TODA la info técnica; en el panel solo se eligen
 * almacenamiento, colores, precio y cantidad.
 */

interface RawDevice {
  series: string;
  model_name: string;
  processor?: { chip?: string };
  memory?: { ram?: string };
  storage_options?: string[];
  display?: { type?: string; size_inches?: number; resolution?: string; refresh_rate_hz?: number; features?: string[] };
  cameras?: { rear?: { type: string; megapixels?: number }[]; front?: { megapixels?: number } };
  battery?: { capacity_mah?: number; charging?: string };
  connectivity?: { cellular?: string; wifi?: string; connector?: string };
}

export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80';

/** Colores oficiales de Apple (clave = nombre del asset en el CDN). */
export const COLOR_PALETTE: Omit<ColorOption, 'imageUrl'>[] = [
  { id: 'black', name: 'Negro', hex: '#1C1C1E', bgGradient: 'from-[#3A3A3C] to-[#1C1C1E]' },
  { id: 'white', name: 'Blanco', hex: '#F5F5F7', bgGradient: 'from-[#FFFFFF] to-[#D5D4D0]' },
  { id: 'red', name: 'Rojo', hex: '#BF0A30', bgGradient: 'from-[#E0344F] to-[#8F0A24]' },
  { id: 'blue', name: 'Azul', hex: '#3B5998', bgGradient: 'from-[#4F70B5] to-[#2B4275]' },
  { id: 'green', name: 'Verde', hex: '#4A7C7D', bgGradient: 'from-[#5D9495] to-[#365D5E]' },
  { id: 'purple', name: 'Morado', hex: '#B8AFE6', bgGradient: 'from-[#CFC8F0] to-[#9A90CC]' },
  { id: 'pink', name: 'Rosa', hex: '#E89DA2', bgGradient: 'from-[#F5B5BA] to-[#C97B81]' },
  { id: 'yellow', name: 'Amarillo', hex: '#F4D35E', bgGradient: 'from-[#F8E08A] to-[#D1B03F]' },
  { id: 'gold', name: 'Dorado', hex: '#E6D3B0', bgGradient: 'from-[#F2E4C8] to-[#C5AF86]' },
  { id: 'silver', name: 'Plata', hex: '#E3E4E6', bgGradient: 'from-[#F1F2F3] to-[#C2C3C5]' },
  { id: 'graphite', name: 'Grafito', hex: '#54524F', bgGradient: 'from-[#6B6965] to-[#3A3836]' },
  { id: 'midnight', name: 'Medianoche', hex: '#232A31', bgGradient: 'from-[#3A424A] to-[#161B20]' },
  { id: 'starlight', name: 'Blanco estelar', hex: '#F0E4D3', bgGradient: 'from-[#F8F0E3] to-[#D3C4AC]' },
  { id: 'sierrablue', name: 'Azul Sierra', hex: '#9BB5CE', bgGradient: 'from-[#B3C9DD] to-[#7C98B3]' },
  { id: 'alpinegreen', name: 'Verde Alpino', hex: '#505F4E', bgGradient: 'from-[#677966] to-[#3A463A]' },
  { id: 'deeppurple', name: 'Morado Oscuro', hex: '#594F63', bgGradient: 'from-[#74677F] to-[#413A49]' },
  { id: 'spaceblack', name: 'Negro Espacial', hex: '#2F2F2F', bgGradient: 'from-[#454545] to-[#1B1B1B]' },
  { id: 'ultramarine', name: 'Ultramar', hex: '#9AADF6', bgGradient: 'from-[#B5C3F9] to-[#7C90DE]' },
  { id: 'teal', name: 'Verde Azulado', hex: '#B0D4D2', bgGradient: 'from-[#C6E2E0] to-[#8DB8B5]' },
  { id: 'naturaltitanium', name: 'Titanio Natural', hex: '#BEB8AF', bgGradient: 'from-[#D2CDC5] to-[#9C968D]' },
  { id: 'bluetitanium', name: 'Titanio Azul', hex: '#3F4A5A', bgGradient: 'from-[#566274] to-[#2C3541]' },
  { id: 'whitetitanium', name: 'Titanio Blanco', hex: '#E5E3DF', bgGradient: 'from-[#F2F0EC] to-[#C4C1BB]' },
  { id: 'blacktitanium', name: 'Titanio Negro', hex: '#3C3C3D', bgGradient: 'from-[#525253] to-[#272728]' },
  { id: 'deserttitanium', name: 'Titanio Desierto', hex: '#C2A792', bgGradient: 'from-[#D8BC9E] to-[#9E8168]' },
];

const IMAGE_CDN = 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/';
const imageMap = rawImages as Record<string, Record<string, string>>;

/** URL de imagen verificada (CDN de Apple) para un modelo y color, si existe. */
export function imageFor(modelId: string, colorId: string): string | undefined {
  const asset = imageMap[modelId]?.[colorId];
  return asset ? `${IMAGE_CDN}${asset}?wid=1000&hei=1000&fmt=jpeg&qlt=90` : undefined;
}

/** Colores con foto disponible para un modelo; si no hay fotos, toda la paleta. */
export function colorsForModel(modelId: string): Omit<ColorOption, 'imageUrl'>[] {
  const ids = Object.keys(imageMap[modelId] ?? {});
  const list = COLOR_PALETTE.filter((c) => ids.includes(c.id));
  return list.length > 0 ? list : COLOR_PALETTE;
}

export function colorFromPalette(id: string, modelId?: string): ColorOption {
  const c = COLOR_PALETTE.find((p) => p.id === id) ?? COLOR_PALETTE[0];
  return { ...c, imageUrl: (modelId && imageFor(modelId, c.id)) || PLACEHOLDER_IMAGE };
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildTemplate(d: RawDevice): iPhoneProduct {
  const rear = d.cameras?.rear?.filter((c) => c.megapixels) ?? [];
  const mainMp = rear[0]?.megapixels;
  const camera = mainMp ? `${mainMp} MP principal · ${rear.length} cámara${rear.length > 1 ? 's' : ''} trasera${rear.length > 1 ? 's' : ''}` : '—';
  const storageOptions: StorageOption[] = (d.storage_options ?? []).map((size) => ({ size, priceDelta: 0 }));

  const features = [
    d.display?.type && `Pantalla ${d.display.type}${d.display.refresh_rate_hz ? ` ${d.display.refresh_rate_hz}Hz` : ''}`,
    d.processor?.chip && `Chip ${d.processor.chip}`,
    d.memory?.ram && `${d.memory.ram} de RAM`,
    d.battery?.charging && `Carga: ${d.battery.charging}`,
    d.connectivity?.cellular && `Red: ${d.connectivity.cellular}`,
    d.connectivity?.connector && `Conector ${d.connectivity.connector}`,
    ...(d.display?.features ?? []),
  ].filter(Boolean) as string[];

  const modelId = slugify(d.model_name);
  const firstColor = Object.keys(imageMap[modelId] ?? {})[0];
  const mainImage = (firstColor && imageFor(modelId, firstColor)) || PLACEHOLDER_IMAGE;

  return {
    id: modelId,
    name: d.model_name,
    tagline: `${d.series} · ${d.processor?.chip ?? ''}`.trim(),
    basePrice: 0,
    rating: 5,
    reviewsCount: 0,
    screenSize: d.display?.size_inches ? `${d.display.size_inches}"` : '—',
    chip: d.processor?.chip ?? '—',
    camera,
    batteryLife: d.battery?.capacity_mah ? `${d.battery.capacity_mah} mAh` : '—',
    weight: '—',
    colors: [],
    storageOptions,
    description: `${d.model_name}: pantalla ${d.display?.size_inches ?? ''}" ${d.display?.resolution ?? ''}, chip ${d.processor?.chip ?? ''}, ${d.memory?.ram ?? ''} RAM.`,
    features,
    image: mainImage,
    imageUrl: mainImage,
    condition: 'Nuevo (Sellado)',
    stock: 0,
    active: false,
    specs: d as unknown as Record<string, unknown>,
  };
}

export const IPHONE_CATALOG: iPhoneProduct[] = (rawSpecs as unknown as RawDevice[]).map(buildTemplate);
