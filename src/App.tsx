import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroScroll } from './components/HeroScroll';
import { ProductCatalog } from './components/ProductCatalog';
import { SpecComparison } from './components/SpecComparison';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { AdminPage } from './pages/AdminPage';
import type { CartItem } from './types';

const checkIsAdminRoute = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash.startsWith('#admin');
};

export function App() {
  const [isAdminView, setIsAdminView] = useState<boolean>(() => checkIsAdminRoute());

  // Listen to browser Back/Forward navigation and Hash changes
  useEffect(() => {
    const handleNavChange = () => {
      setIsAdminView(checkIsAdminRoute());
    };

    window.addEventListener('popstate', handleNavChange);
    window.addEventListener('hashchange', handleNavChange);

    return () => {
      window.removeEventListener('popstate', handleNavChange);
      window.removeEventListener('hashchange', handleNavChange);
    };
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setIsAdminView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStore = () => {
    window.history.pushState(null, '', '/');
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  // Protected Admin View
  if (isAdminView) {
    return <AdminPage onBackToStore={navigateToStore} />;
  }

  // Public Retail Store View
  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation */}
      <Navbar
        onOpenCartDrawer={() => setCartOpen(true)}
        cartCount={totalCartCount}
      />

      {/* Direct High-Converting Hero with Flash Deals */}
      <HeroScroll
        onAddToCart={handleAddToCart}
      />

      {/* Main Product Catalog & Special Offers */}
      <ProductCatalog
        onAddToCart={handleAddToCart}
      />

      {/* Technical Spec Comparison (Anchor: #comparison) */}
      <SpecComparison />

      {/* Floating WhatsApp Quick Action */}
      <FloatingWhatsApp />

      {/* Footer with Trust Badges & Discrete Admin Access */}
      <Footer onNavigateAdmin={navigateToAdmin} />

      {/* Streamlined Shopping Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}

export default App;
