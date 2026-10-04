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
