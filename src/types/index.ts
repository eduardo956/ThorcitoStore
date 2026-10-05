export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  bgGradient: string;
  imageUrl: string;
}

export interface StorageOption {
  size: string;
  priceDelta: number; // additional price over base
}

export interface iPhoneProduct {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  basePrice: number;
  rating: number;
  reviewsCount: number;
  screenSize: string;
  chip: string;
  camera: string;
  batteryLife: string;
  weight: string;
  colors: ColorOption[];
  storageOptions: StorageOption[];
  description: string;
  features: string[];
  image: string;
  imageUrl?: string;
  condition?: 'Nuevo (Sellado)' | 'Seminuevo / Excelente' | 'Usado Grado A' | 'Reacondicionado' | string;
  costPriceUsd?: number;
  profitUsd?: number;
  stock?: number;
  active?: boolean;
  specs?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // unique cart item id
  productId: string;
  productName: string;
  color: ColorOption;
  storage: StorageOption;
  unitPrice: number;
  quantity: number;
}

export interface OrderFormState {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  selectedModel: string;
  selectedColor: string;
  selectedStorage: string;
  paymentMethod: 'Transferencia Bancaria' | 'Nequi / Daviplata' | 'Pago Contraentrega' | 'Tarjeta de Crédito';
  notes?: string;
}

export interface StoreInteraction {
  id?: string;
  type: 'whatsapp_order' | 'cart_checkout' | 'product_view' | 'whatsapp_inquiry' | string;
  productId?: string;
  productName?: string;
  color?: string;
  storage?: string;
  priceUsd?: number;
  customerName?: string;
  customerPhone?: string;
  customerCity?: string;
  customerAddress?: string;
  paymentMethod?: string;
  notes?: string;
  cartSummary?: string;
  status?: 'pending' | 'contacted' | 'completed' | 'cancelled';
  timestamp?: any;
  createdAt?: string;
  createdAtIso?: string;
  userAgent?: string;
}

export interface ManualSale {
  id?: string;
  productId: string;
  productName: string;
  color: string;
  storage: string;
  condition?: 'Nuevo (Sellado)' | 'Seminuevo / Excelente' | 'Usado Grado A' | 'Reacondicionado' | string;
  costPriceUsd?: number;
  priceUsd: number;
  quantity: number;
  totalUsd: number;
  profitUsd?: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Otro' | string;
  notes?: string;
  timestamp?: any;
  createdAt?: string;
}
