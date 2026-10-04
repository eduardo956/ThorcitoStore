import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AppleSubnav } from './components/AppleSubnav';
import { HeroScroll } from './components/HeroScroll';
import { ProductCatalog } from './components/ProductCatalog';
import { WhatsAppModal } from './components/WhatsAppModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import type { CartItem } from './types';

export function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedStorage, setSelectedStorage] = useState<string | undefined>();
  const [calculatedPrice, setCalculatedPrice] = useState<number | undefined>();

  const handleOpenOrderModal = (
    modelName?: string,
    colorName?: string,
    storageSize?: string,
    price?: number
  ) => {
    setSelectedModel(modelName);
    setSelectedColor(colorName);
    setSelectedStorage(storageSize);
    setCalculatedPrice(price);
    setModalOpen(true);
  };

  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.color.id === newItem.color.id &&
          item.storage.size === newItem.storage.size
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [...prevItems, newItem];
    });

    setCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation */}
      <Navbar
        onOpenOrderModal={handleOpenOrderModal}
        onOpenCartDrawer={() => setCartOpen(true)}
        cartCount={totalCartCount}
      />

      {/* Apple Subnav Sticky Bar */}
      <AppleSubnav
        onOpenOrderModal={handleOpenOrderModal}
      />

      {/* Direct High-Converting Hero with Flash Deals */}
      <HeroScroll
        onOpenOrderModal={handleOpenOrderModal}
        onAddToCart={handleAddToCart}
      />

      {/* Main Product Catalog & Special Offers */}
      <ProductCatalog
        onOpenOrderModal={handleOpenOrderModal}
        onAddToCart={handleAddToCart}
      />

      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />

      {/* Footer with Trust Badges */}
      <Footer />

      {/* Streamlined Shopping Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Streamlined 3-Input WhatsApp Order Modal */}
      <WhatsAppModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialModelName={selectedModel}
        initialColorName={selectedColor}
        initialStorageSize={selectedStorage}
        initialCalculatedPrice={calculatedPrice}
      />
    </div>
  );
}

export default App;
