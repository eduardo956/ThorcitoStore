import React, { useState, useEffect, useMemo } from 'react';
import type { User } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, FIRESTORE_RULES_GUIDANCE, isFirestorePermissionError, handleFirestoreError } from '../lib/firebase';
import { CatalogStockModal } from './CatalogStockModal';
import type { iPhoneProduct, ColorOption, StorageOption, ManualSale } from '../types';
import {
  Smartphone,
  LogOut,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  MessageCircle,
  RefreshCw,
  Eye,
  EyeOff,
  DollarSign,
  Boxes,
  X,
  Clock,
  Check,
  Loader2,
  Receipt,
  CreditCard,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onSignOut: () => Promise<void>;
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onSignOut,
  onBackToStore,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales'>('inventory');

  // Products from Firestore
  const [products, setProducts] = useState<iPhoneProduct[]>([]);

  // Manual Sales from Firestore
  const [manualSales, setManualSales] = useState<ManualSale[]>([]);
  const [loadingManualSales, setLoadingManualSales] = useState(true);
  const [manualSaleToDelete, setManualSaleToDelete] = useState<ManualSale | null>(null);

  // Manual Sale Form State
  const [saleProductId, setSaleProductId] = useState<string>('');
  const [saleProductName, setSaleProductName] = useState<string>('');
  const [saleColor, setSaleColor] = useState<string>('');
  const [saleStorage, setSaleStorage] = useState<string>('');
  const [saleCondition, setSaleCondition] = useState<string>('Nuevo (Sellado)');
  const [saleCostPriceUsd, setSaleCostPriceUsd] = useState<number | string>(750);
  const [salePriceUsd, setSalePriceUsd] = useState<number | string>(999);
  const [saleQuantity, setSaleQuantity] = useState<number>(1);
  const [saleCustomerName, setSaleCustomerName] = useState<string>('');
  const [saleCustomerPhone, setSaleCustomerPhone] = useState<string>('');
  const [salePaymentMethod, setSalePaymentMethod] = useState<string>('Efectivo');
  const [saleNotes, setSaleNotes] = useState<string>('');
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
  const [saleSubmitSuccess, setSaleSubmitSuccess] = useState<string | null>(null);

  // Rules Warning State
  const [rulesWarning, setRulesWarning] = useState<string | null>(null);

  // Search & Filters for Sales Ledger
  const [saleSearch, setSaleSearch] = useState('');
  const [saleFilterPayment, setSaleFilterPayment] = useState<string>('all');

  // Search & Filters
  const [productSearch, setProductSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'hidden'>('all');
  const [filterStock, setFilterStock] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<iPhoneProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<iPhoneProduct | null>(null);

  // Real-time listener for Products collection
  useEffect(() => {
    const colRef = collection(db, 'products');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          setProducts([]);
        } else {
          const list: iPhoneProduct[] = [];
          snapshot.forEach((d) => {
            list.push({ ...d.data(), id: d.id } as iPhoneProduct);
          });
          setProducts(list);
        }
      },
      (err) => {
        console.warn('[AdminDashboard] Products onSnapshot error:', err);
        if (isFirestorePermissionError(err)) {
          setRulesWarning(FIRESTORE_RULES_GUIDANCE);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time listener for Manual Sales collection
  useEffect(() => {
    const colRef = collection(db, 'manual_sales');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: ManualSale[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as ManualSale);
        });

        // Client-side sort descending by date
        list.sort((a, b) => {
          const dateA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : a.timestamp?.seconds
            ? a.timestamp.seconds * 1000
            : 0;
          const dateB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : b.timestamp?.seconds
            ? b.timestamp.seconds * 1000
            : 0;
          return dateB - dateA;
        });

        setManualSales(list);
        setLoadingManualSales(false);
      },
      (err) => {
        console.warn('[AdminDashboard] manual_sales onSnapshot error:', err);
        if (isFirestorePermissionError(err)) {
          setRulesWarning(FIRESTORE_RULES_GUIDANCE);
        }
        setLoadingManualSales(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // KPI Calculations (Gross Revenue, Total Cost, Net Profit)
  const stats = useMemo(() => {
    const totalModels = products.length;
    const activeModels = products.filter((p) => p.active !== false).length;
    const hiddenModels = totalModels - activeModels;
    const totalStock = products.reduce((acc, p) => acc + (p.stock ?? 0), 0);
    const totalManualRevenue = manualSales.reduce(
      (acc, s) => acc + (typeof s.totalUsd === 'number' ? s.totalUsd : (s.priceUsd || 0) * (s.quantity || 1)),
      0
    );
    const totalManualCost = manualSales.reduce(
      (acc, s) => acc + ((s.costPriceUsd || 0) * (s.quantity || 1)),
      0
    );
    const totalManualProfit = manualSales.reduce((acc, s) => {
      if (typeof s.profitUsd === 'number') return acc + s.profitUsd;
      const rev = typeof s.totalUsd === 'number' ? s.totalUsd : (s.priceUsd || 0) * (s.quantity || 1);
      const cost = (s.costPriceUsd || 0) * (s.quantity || 1);
      return acc + (rev - cost);
    }, 0);
    const totalManualSalesCount = manualSales.length;

    return {
      totalModels,
      activeModels,
      hiddenModels,
      totalStock,
      totalManualRevenue,
      totalManualCost,
      totalManualProfit,
      totalManualSalesCount,
    };
  }, [products, manualSales]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.chip?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.tagline?.toLowerCase().includes(productSearch.toLowerCase());

      const matchesActive =
        filterActive === 'all' ||
        (filterActive === 'active' && p.active !== false) ||
        (filterActive === 'hidden' && p.active === false);

      const matchesStock =
        filterStock === 'all' ||
        (filterStock === 'in_stock' && (p.stock === undefined || p.stock > 0)) ||
        (filterStock === 'out_of_stock' && p.stock !== undefined && p.stock <= 0);

      return matchesSearch && matchesActive && matchesStock;
    });
  }, [products, productSearch, filterActive, filterStock]);

  // Filtered Manual Sales
  const filteredManualSales = useMemo(() => {
    return manualSales.filter((item) => {
      const q = saleSearch.toLowerCase();
      const matchesSearch =
        (item.customerName || '').toLowerCase().includes(q) ||
        (item.customerPhone || '').toLowerCase().includes(q) ||
        (item.productName || '').toLowerCase().includes(q) ||
        (item.paymentMethod || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q);

      const matchesPayment =
        saleFilterPayment === 'all' || item.paymentMethod === saleFilterPayment;

      return matchesSearch && matchesPayment;
    });
  }, [manualSales, saleSearch, saleFilterPayment]);

  // Handlers for Manual Sales
  const handleSelectProductForSale = (prodId: string) => {
    setSaleProductId(prodId);
    if (!prodId || prodId === 'custom') {
      if (prodId === 'custom') {
        setSaleProductName('');
        setSaleColor('');
        setSaleStorage('');
        setSaleCondition('Nuevo (Sellado)');
        setSalePriceUsd(0);
        setSaleCostPriceUsd(0);
      }
      return;
    }

    const availableProds = products;
    const found = availableProds.find((p) => p.id === prodId);
    if (found) {
      setSaleProductName(found.name);
      setSalePriceUsd(found.basePrice);
      setSaleCostPriceUsd(found.costPriceUsd ?? Math.round(found.basePrice * 0.75));
      setSaleCondition(found.condition || 'Nuevo (Sellado)');
      setSaleColor(found.colors[0]?.name || 'Titanio');
      setSaleStorage(found.storageOptions[0]?.size || '128 GB');
    }
  };

  const handleSelectStorageForSale = (storageSize: string) => {
    setSaleStorage(storageSize);
    if (saleProductId && saleProductId !== 'custom') {
      const availableProds = products;
      const found = availableProds.find((p) => p.id === saleProductId);
      if (found) {
        const stOpt = found.storageOptions?.find((s) => s.size === storageSize);
        const delta = stOpt?.priceDelta || 0;
        setSalePriceUsd(found.basePrice + delta);
      }
    }
  };

  const handleRegisterManualSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleProductName.trim()) {
      alert('Por favor selecciona o ingresa el nombre del producto.');
      return;
    }
    if (!saleCustomerName.trim()) {
      alert('Por favor ingresa el nombre del cliente.');
      return;
    }
    const unitPrice = Number(salePriceUsd) || 0;
    const unitCost = Number(saleCostPriceUsd) || 0;
    const qty = Math.max(1, Number(saleQuantity) || 1);
    const total = unitPrice * qty;
    const profit = total - (unitCost * qty);

    try {
      setIsSubmittingSale(true);
      const payload: Omit<ManualSale, 'id'> = {
        productId: saleProductId || 'custom',
        productName: saleProductName.trim(),
        color: saleColor.trim() || 'Estándar',
        storage: saleStorage.trim() || 'Estándar',
        condition: saleCondition || 'Nuevo (Sellado)',
        costPriceUsd: unitCost,
        priceUsd: unitPrice,
        quantity: qty,
        totalUsd: total,
        profitUsd: profit,
        customerName: saleCustomerName.trim(),
        customerPhone: saleCustomerPhone.trim(),
        paymentMethod: salePaymentMethod || 'Efectivo',
        notes: saleNotes.trim(),
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'manual_sales'), payload);

      setSaleCustomerName('');
      setSaleCustomerPhone('');
      setSaleNotes('');
      setSaleQuantity(1);
      setSaleSubmitSuccess('¡Venta registrada con éxito en el libro contable!');
      setTimeout(() => setSaleSubmitSuccess(null), 4000);
    } catch (err: any) {
      console.error('[handleRegisterManualSale] Error:', err);
      if (isFirestorePermissionError(err)) {
        setRulesWarning(FIRESTORE_RULES_GUIDANCE);
        alert(FIRESTORE_RULES_GUIDANCE);
      } else {
        alert('Error al registrar la venta: ' + err.message);
      }
    } finally {
      setIsSubmittingSale(false);
    }
  };

  const handleDeleteManualSale = async () => {
    if (!manualSaleToDelete?.id) return;
    try {
      await deleteDoc(doc(db, 'manual_sales', manualSaleToDelete.id));
      setManualSaleToDelete(null);
    } catch (err: any) {
      console.error('[handleDeleteManualSale] Error:', err);
      if (isFirestorePermissionError(err)) {
        setRulesWarning(FIRESTORE_RULES_GUIDANCE);
        alert(FIRESTORE_RULES_GUIDANCE);
      } else {
        alert('Error al anular la venta: ' + err.message);
      }
    }
  };

  // Handlers for Inventory CRUD
  const handleToggleActive = async (product: iPhoneProduct) => {
    try {
      const currentActive = product.active !== false;
      const ref = doc(db, 'products', product.id);
      await updateDoc(ref, {
        active: !currentActive,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[handleToggleActive] Error:', err);
      if (isFirestorePermissionError(err)) {
        setRulesWarning(FIRESTORE_RULES_GUIDANCE);
        alert(FIRESTORE_RULES_GUIDANCE);
      } else {
        alert('Error al cambiar visibilidad: ' + (err?.message || 'Error de Firestore'));
      }
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await deleteDoc(doc(db, 'products', productToDelete.id));
      setProductToDelete(null);
    } catch (err: any) {
      console.error('[handleDeleteProduct] Error:', err);
      if (isFirestorePermissionError(err)) {
        setRulesWarning(FIRESTORE_RULES_GUIDANCE);
        alert(FIRESTORE_RULES_GUIDANCE);
      } else {
        alert('Error al eliminar producto: ' + (err?.message || 'Error de Firestore'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#161617]/90 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base sm:text-lg tracking-tight">
                  Jorgito <span className="text-blue-500">Store</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase tracking-wider font-mono">
                  Admin Hub
                </span>
              </div>
            </div>
          </div>

          {/* Sync Status & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Firestore Sincronizado</span>
            </div>

            <button
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-bold border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ir a la Tienda</span>
            </button>

            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/25 transition-colors"
              title={`Cerrar sesión (${user.email})`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Permission Denied Alert Banner (if error triggered) */}
        {rulesWarning && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{rulesWarning}</span>
            </div>
            <button
              onClick={() => setRulesWarning(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-rose-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Metrics Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <div className="p-4 sm:p-5 rounded-3xl bg-[#161617] border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#86868B]">Catálogo</span>
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalModels}</div>
            <div className="text-[11px] text-[#86868B] mt-1 flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">{stats.activeModels} activos</span>
              <span>•</span>
              <span className="text-neutral-400">{stats.hiddenModels} ocultos</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-[#161617] border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#86868B]">Stock Total</span>
              <Boxes className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalStock}</div>
            <div className="text-[11px] text-[#86868B] mt-1">Unidades disponibles</div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-[#161617] border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#86868B]">Ingresos Brutos</span>
              <Receipt className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              ${stats.totalManualRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#86868B] mt-1 flex items-center gap-1.5">
              <span className="text-neutral-300 font-semibold">{stats.totalManualSalesCount} ventas libro</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-[#161617] border border-white/10 shadow-xl">
            <div className="flex items-center justify-between text-rose-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#86868B]">Costo Total</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-300 font-mono">
              ${stats.totalManualCost.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#86868B] mt-1">Costo de inventario vendido</div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-[#161617] border border-emerald-500/30 bg-emerald-950/10 shadow-xl shadow-emerald-950/20">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Ganancia Neta</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              ${stats.totalManualProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400/80 mt-1 font-semibold">
              {stats.totalManualRevenue > 0
                ? `${Math.round((stats.totalManualProfit / stats.totalManualRevenue) * 100)}% margen neto`
                : 'Margen calculado'}
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-[#161617] text-[#86868B] hover:text-white border border-white/10'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Inventario & Catálogo</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-[#161617] text-[#86868B] hover:text-white border border-white/10'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Ventas Manuales & Libro Contable</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {manualSales.length}
            </span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: INVENTORY MANAGEMENT (CRUD)
           ======================================================== */}
        {activeTab === 'inventory' && (
          <div>
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Buscar por modelo, chip..."
                    className="w-full pl-10 pr-4 py-2 bg-[#161617] border border-white/10 rounded-2xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Filter Active */}
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value as any)}
                  className="bg-[#161617] border border-white/10 text-xs text-neutral-300 py-2 px-3 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="active">Solo Activos (Visibles)</option>
                  <option value="hidden">Solo Ocultos</option>
                </select>

                {/* Filter Stock */}
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value as any)}
                  className="bg-[#161617] border border-white/10 text-xs text-neutral-300 py-2 px-3 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="all">Todo el Inventario</option>
                  <option value="in_stock">En Stock (&gt;0)</option>
                  <option value="out_of_stock">Agotados (0)</option>
                </select>
              </div>

              {/* Add Button */}
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo iPhone</span>
              </button>

              <button
                onClick={() => setIsCatalogModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Boxes className="w-4 h-4" />
                <span>Agregar desde catálogo</span>
              </button>

            </div>

            {/* Mobile Product Cards (Visible on mobile/tablet < md) */}
            <div className="md:hidden space-y-3 mb-6">
              {filteredProducts.map((p) => {
                const isActive = p.active !== false;
                const inStock = p.stock === undefined || p.stock > 0;
                const displayImg = p.imageUrl || p.image || (p.colors && p.colors[0]?.imageUrl);

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-[#161617] border border-white/10 shadow-lg space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Image Thumbnail with Fallback Icon */}
                      <div className="w-14 h-16 rounded-xl bg-black border border-white/10 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        {displayImg ? (
                          <img
                            src={displayImg}
                            alt={p.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          style={{ display: displayImg ? 'none' : 'flex' }}
                          className="items-center justify-center text-neutral-500 w-full h-full"
                        >
                          <Smartphone className="w-5 h-5 text-neutral-400" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-white text-sm truncate">{p.name}</h4>
                          {p.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 shrink-0 font-medium">
                              {p.badge}
                            </span>
                          )}
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 font-medium">
                            {p.condition || 'Nuevo (Sellado)'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#86868B] font-mono mt-0.5">{p.chip} • {p.screenSize}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-extrabold text-white font-mono">${p.basePrice} USD</span>
                          {p.costPriceUsd !== undefined && (
                            <span className="text-[10px] text-neutral-400 font-mono">Costo: ${p.costPriceUsd} USD</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1 ${
                            inStock
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span>{p.stock ?? 15} u.</span>
                        </span>

                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors inline-flex items-center gap-1 ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-neutral-800 text-neutral-400 border-white/10'
                          }`}
                        >
                          {isActive ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                          <span>{isActive ? 'Activo' : 'Oculto'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-bold text-xs inline-flex items-center gap-1 transition-all"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Gestionar</span>
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Products Table */}
            <div className="hidden md:block bg-[#161617] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/40 text-[#86868B] uppercase font-mono tracking-wider text-[11px]">
                      <th className="py-4 px-4">Producto</th>
                      <th className="py-4 px-3">Estado / Condición</th>
                      <th className="py-4 px-3">Precio / Costo</th>
                      <th className="py-4 px-3">Stock</th>
                      <th className="py-4 px-3">Almacenamiento</th>
                      <th className="py-4 px-3">Colores</th>
                      <th className="py-4 px-3 text-center">Visibilidad</th>
                      <th className="py-4 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProducts.map((p) => {
                      const isActive = p.active !== false;
                      const inStock = p.stock === undefined || p.stock > 0;
                      const displayImg = p.imageUrl || p.image || (p.colors && p.colors[0]?.imageUrl);

                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Image Thumbnail & Title */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-14 rounded-xl bg-black/80 border border-white/10 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                {displayImg ? (
                                  <img
                                    src={displayImg}
                                    alt={p.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div
                                  style={{ display: displayImg ? 'none' : 'flex' }}
                                  className="items-center justify-center text-neutral-500 w-full h-full"
                                >
                                  <Smartphone className="w-5 h-5 text-neutral-400" />
                                </div>
                              </div>
                              <div>
                                <div className="font-extrabold text-white text-sm flex items-center gap-2">
                                  <span>{p.name}</span>
                                  {p.badge && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                      {p.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#86868B] font-mono mt-0.5">
                                  {p.chip} • {p.screenSize}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Condition Badge */}
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-neutral-200">
                              {p.condition || 'Nuevo (Sellado)'}
                            </span>
                          </td>

                          {/* Base Price & Cost Price */}
                          <td className="py-3 px-3">
                            <div>
                              <span className="font-mono font-bold text-white text-sm">
                                ${p.basePrice}
                              </span>
                              <span className="text-[10px] text-[#86868B] ml-1">USD</span>
                            </div>
                            {p.costPriceUsd !== undefined && (
                              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                Costo: ${p.costPriceUsd} USD
                              </div>
                            )}
                          </td>

                          {/* Stock */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold inline-flex items-center gap-1.5 ${
                                inStock
                                  ? (p.stock ?? 10) > 5
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  inStock ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              />
                              <span>{p.stock !== undefined ? p.stock : '15'} u.</span>
                            </span>
                          </td>

                          {/* Storage */}
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {p.storageOptions?.map((s) => (
                                <span
                                  key={s.size}
                                  className="px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-neutral-300 border border-white/5 font-mono"
                                >
                                  {s.size}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Colors */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              {p.colors?.slice(0, 4).map((c) => (
                                <span
                                  key={c.id}
                                  className="w-3.5 h-3.5 rounded-full border border-white/30"
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                />
                              ))}
                              {(p.colors?.length || 0) > 4 && (
                                <span className="text-[10px] text-[#86868B]">
                                  +{(p.colors?.length || 0) - 4}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Visibility Toggle */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleToggleActive(p)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                                isActive
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                  : 'bg-neutral-800 text-neutral-400 border-white/10 hover:bg-neutral-700'
                              }`}
                              title={isActive ? 'Visible en tienda (clic para ocultar)' : 'Oculto (clic para activar)'}
                            >
                              {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{isActive ? 'Activo' : 'Oculto'}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-bold text-[11px] inline-flex items-center gap-1 transition-all"
                                title="Gestionar modelo y stock"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Gestionar</span>
                              </button>
                              <button
                                onClick={() => setProductToDelete(p)}
                                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* ========================================================
            TAB: VENTAS MANUALES & LIBRO CONTABLE (SALES LEDGER)
           ======================================================== */}
        {activeTab === 'sales' && (
          <div className="space-y-8">
            {/* Top Section: Form to Register Manual Sale */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#161617] border border-white/10 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-black text-white">Registrar Venta Manual</h2>
                  </div>
                  <p className="text-xs text-[#86868B] mt-1">
                    Asienta ventas directas, en efectivo o por transferencia en el libro contable con cálculo automático de totales.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                    <span>Total Formulario:</span>
                    <span className="text-sm font-black text-white">
                      ${((Number(salePriceUsd) || 0) * (Number(saleQuantity) || 1)).toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </div>

              {saleSubmitSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{saleSubmitSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegisterManualSale} className="space-y-4 text-xs">
                {/* Row 1: Product Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Producto Vendido *
                    </label>
                    <select
                      value={saleProductId}
                      onChange={(e) => handleSelectProductForSale(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Seleccionar Producto del Catálogo --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Base: ${p.basePrice} USD)
                        </option>
                      ))}
                      <option value="custom">+ Producto Personalizado / Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Nombre del Producto {saleProductId === 'custom' && '(Manual)'} *
                    </label>
                    <input
                      type="text"
                      value={saleProductName}
                      onChange={(e) => setSaleProductName(e.target.value)}
                      placeholder="ej. iPhone 16 Pro Max 256GB, AirPods Pro 2..."
                      required
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Row 2: Color & Storage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Color / Acabado
                    </label>
                    {saleProductId && saleProductId !== 'custom' && products.find((p) => p.id === saleProductId)?.colors?.length ? (
                      <div className="flex gap-2">
                        <select
                          value={saleColor}
                          onChange={(e) => setSaleColor(e.target.value)}
                          className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        >
                          {products
                            .find((p) => p.id === saleProductId)
                            ?.colors.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          <option value="Otro">Otro color...</option>
                        </select>
                        {saleColor === 'Otro' && (
                          <input
                            type="text"
                            placeholder="Especificar color"
                            onChange={(e) => setSaleColor(e.target.value)}
                            className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white"
                          />
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={saleColor}
                        onChange={(e) => setSaleColor(e.target.value)}
                        placeholder="ej. Titanio Natural, Negro Espacial, Azul"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Almacenamiento
                    </label>
                    {saleProductId && saleProductId !== 'custom' && products.find((p) => p.id === saleProductId)?.storageOptions?.length ? (
                      <div className="flex gap-2">
                        <select
                          value={saleStorage}
                          onChange={(e) => handleSelectStorageForSale(e.target.value)}
                          className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                        >
                          {products
                            .find((p) => p.id === saleProductId)
                            ?.storageOptions.map((st) => (
                              <option key={st.size} value={st.size}>
                                {st.size} {st.priceDelta > 0 ? `(+$${st.priceDelta})` : ''}
                              </option>
                            ))}
                          <option value="Otro">Otro almacenamiento...</option>
                        </select>
                        {saleStorage === 'Otro' && (
                          <input
                            type="text"
                            placeholder="ej. 1 TB"
                            onChange={(e) => setSaleStorage(e.target.value)}
                            className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white font-mono"
                          />
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={saleStorage}
                        onChange={(e) => setSaleStorage(e.target.value)}
                        placeholder="ej. 128 GB, 256 GB, 512 GB, 1 TB"
                        className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    )}
                  </div>
                </div>

                {/* Row 3: Condition, Price, Cost Price, Quantity & Profit */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 items-center">
                  <div>
                    <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Condición *
                    </label>
                    <select
                      value={saleCondition}
                      onChange={(e) => setSaleCondition(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                    >
                      <option value="Nuevo (Sellado)">Nuevo (Sellado)</option>
                      <option value="Seminuevo / Excelente">Seminuevo / Excelente</option>
                      <option value="Usado Grado A">Usado Grado A</option>
                      <option value="Reacondicionado">Reacondicionado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Precio Venta ($ USD) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={salePriceUsd}
                      onChange={(e) => setSalePriceUsd(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Precio Costo ($ USD)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={saleCostPriceUsd}
                      onChange={(e) => setSaleCostPriceUsd(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-rose-300 font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={saleQuantity}
                      onChange={(e) => setSaleQuantity(Math.max(1, Number(e.target.value)))}
                      required
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Ganancia Neta
                    </span>
                    <span className="text-lg font-black text-emerald-300 font-mono">
                      +${((Number(salePriceUsd) - Number(saleCostPriceUsd)) * Number(saleQuantity)).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Total: ${((Number(salePriceUsd) || 0) * (Number(saleQuantity) || 1)).toLocaleString()} USD
                    </span>
                  </div>
                </div>

                {/* Row 4: Customer Details & Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Nombre del Cliente *
                    </label>
                    <input
                      type="text"
                      value={saleCustomerName}
                      onChange={(e) => setSaleCustomerName(e.target.value)}
                      placeholder="ej. Juan Pablo Pérez"
                      required
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={saleCustomerPhone}
                      onChange={(e) => setSaleCustomerPhone(e.target.value)}
                      placeholder="ej. +57 312 456 7890"
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Método de Pago *
                    </label>
                    <select
                      value={salePaymentMethod}
                      onChange={(e) => setSalePaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia (Nequi / Bancolombia / Daviplata)</option>
                      <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                      <option value="Otro">Otro Método</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: Notes */}
                <div>
                  <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Notas y Observaciones (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={saleNotes}
                    onChange={(e) => setSaleNotes(e.target.value)}
                    placeholder="Número de serie/IMEI, factura física, garantía de 1 año, detalles de entrega..."
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingSale}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmittingSale ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>Asentar Venta en Libro Contable</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Section: Sales Ledger Table */}
            <div>
              {/* Ledger Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-[#161617] border border-white/10">
                  <div className="text-[10px] uppercase font-bold text-[#86868B]">Recaudado Bruto</div>
                  <div className="text-xl font-black text-white font-mono mt-1">
                    ${stats.totalManualRevenue.toLocaleString()} <span className="text-xs text-neutral-400">USD</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#161617] border border-white/10">
                  <div className="text-[10px] uppercase font-bold text-[#86868B]">Costo Total</div>
                  <div className="text-xl font-black text-rose-300 font-mono mt-1">
                    ${stats.totalManualCost.toLocaleString()} <span className="text-xs text-neutral-400">USD</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#161617] border border-emerald-500/30 bg-emerald-950/10">
                  <div className="text-[10px] uppercase font-bold text-emerald-300">Ganancia Neta Total</div>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                    ${stats.totalManualProfit.toLocaleString()} <span className="text-xs text-emerald-400/70">USD</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#161617] border border-white/10">
                  <div className="text-[10px] uppercase font-bold text-[#86868B]">Ventas Asentadas</div>
                  <div className="text-xl font-black text-white mt-1">
                    {manualSales.length}
                  </div>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={saleSearch}
                      onChange={(e) => setSaleSearch(e.target.value)}
                      placeholder="Buscar por cliente, teléfono, producto, método de pago o notas..."
                      className="w-full pl-10 pr-4 py-2 bg-[#161617] border border-white/10 rounded-2xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={saleFilterPayment}
                    onChange={(e) => setSaleFilterPayment(e.target.value)}
                    className="bg-[#161617] border border-white/10 text-xs text-neutral-300 py-2 px-3 rounded-2xl focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="all">Todos los Métodos de Pago</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="bg-[#161617] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {loadingManualSales ? (
                  <div className="p-12 text-center text-[#86868B] flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mb-2" />
                    <p className="text-xs font-mono uppercase tracking-wider">Cargando libro contable...</p>
                  </div>
                ) : filteredManualSales.length === 0 ? (
                  <div className="p-12 text-center text-[#86868B]">
                    <Receipt className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-neutral-300">
                      {manualSales.length === 0
                        ? 'No hay ventas manuales asentadas en el libro'
                        : 'No se encontraron ventas con los filtros aplicados'}
                    </p>
                    <p className="text-xs mt-1">
                      {manualSales.length === 0
                        ? 'Utiliza el formulario superior para asentar la primera venta directa.'
                        : 'Intenta cambiar el término de búsqueda o método de pago.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-black/40 text-[#86868B] uppercase font-mono tracking-wider text-[11px]">
                          <th className="py-4 px-4">Fecha / Hora</th>
                          <th className="py-4 px-3">Producto & Variantes</th>
                          <th className="py-4 px-3">Condición</th>
                          <th className="py-4 px-3 text-center">Cant.</th>
                          <th className="py-4 px-3">Precio / Costo</th>
                          <th className="py-4 px-3">Total Bruto</th>
                          <th className="py-4 px-3">Ganancia Neta</th>
                          <th className="py-4 px-3">Cliente</th>
                          <th className="py-4 px-3">Método Pago</th>
                          <th className="py-4 px-3">Notas</th>
                          <th className="py-4 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredManualSales.map((sale) => {
                          const dateFormatted = sale.createdAt
                            ? new Date(sale.createdAt).toLocaleString('es-CO', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : sale.timestamp?.seconds
                            ? new Date(sale.timestamp.seconds * 1000).toLocaleString('es-CO', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : 'Reciente';

                          const cleanPhone = (sale.customerPhone || '').replace(/[^0-9]/g, '');
                          const grossTotal = sale.totalUsd || sale.priceUsd * sale.quantity;
                          const netProfit = sale.profitUsd !== undefined
                            ? sale.profitUsd
                            : (grossTotal - (sale.costPriceUsd || 0) * (sale.quantity || 1));

                          return (
                            <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors">
                              {/* Date */}
                              <td className="py-3 px-4 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-[#86868B]" />
                                  <span>{dateFormatted}</span>
                                </div>
                              </td>

                              {/* Product & Specs */}
                              <td className="py-3 px-3">
                                <div className="font-bold text-white text-sm">
                                  {sale.productName}
                                </div>
                                <div className="text-[11px] text-[#86868B] font-mono mt-0.5">
                                  {sale.color} {sale.storage && `• ${sale.storage}`}
                                </div>
                              </td>

                              {/* Condition */}
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-neutral-300 whitespace-nowrap">
                                  {sale.condition || 'Nuevo (Sellado)'}
                                </span>
                              </td>

                              {/* Quantity */}
                              <td className="py-3 px-3 text-center font-mono font-bold text-white">
                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs">
                                  {sale.quantity}
                                </span>
                              </td>

                              {/* Unit Price & Cost */}
                              <td className="py-3 px-3 font-mono">
                                <div className="text-neutral-200">${sale.priceUsd.toLocaleString()} USD</div>
                                {sale.costPriceUsd !== undefined && (
                                  <div className="text-[10px] text-neutral-400">Costo: ${sale.costPriceUsd} USD</div>
                                )}
                              </td>

                              {/* Total USD */}
                              <td className="py-3 px-3">
                                <span className="font-mono font-extrabold text-white text-sm">
                                  ${grossTotal.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-[#86868B] ml-1">USD</span>
                              </td>

                              {/* Net Profit */}
                              <td className="py-3 px-3">
                                <span className={`font-mono font-extrabold text-sm ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-neutral-400 ml-1">USD</span>
                              </td>

                              {/* Customer */}
                              <td className="py-3 px-3">
                                <div className="font-bold text-white">{sale.customerName}</div>
                                {sale.customerPhone && (
                                  <div className="text-[11px] text-[#86868B] font-mono mt-0.5 flex items-center gap-1.5">
                                    <span>{sale.customerPhone}</span>
                                    {cleanPhone && (
                                      <a
                                        href={`https://wa.me/${cleanPhone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-400 hover:text-emerald-300"
                                        title="Contactar por WhatsApp"
                                      >
                                        <MessageCircle className="w-3 h-3 fill-emerald-400" />
                                      </a>
                                    )}
                                  </div>
                                )}
                              </td>

                              {/* Payment Method */}
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                    sale.paymentMethod === 'Efectivo'
                                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                                      : sale.paymentMethod === 'Transferencia'
                                      ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25'
                                      : sale.paymentMethod === 'Tarjeta'
                                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25'
                                      : 'bg-neutral-800 text-neutral-300 border border-white/10'
                                  }`}
                                >
                                  {sale.paymentMethod === 'Tarjeta' && <CreditCard className="w-3 h-3" />}
                                  <span>{sale.paymentMethod}</span>
                                </span>
                              </td>

                              {/* Notes */}
                              <td className="py-3 px-3 text-neutral-400 text-[11px] max-w-[200px] truncate" title={sale.notes || ''}>
                                {sale.notes || <span className="text-neutral-600 italic">Sin notas</span>}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => setManualSaleToDelete(sale)}
                                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                                  title="Anular venta del libro contable"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================
          PRODUCT MODAL (CREATE / EDIT)
         ======================================================== */}
      {isProductModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={async (savedProduct) => {
            try {
              const ref = doc(db, 'products', savedProduct.id);
              await setDoc(ref, {
                ...savedProduct,
                updatedAt: new Date().toISOString(),
              }, { merge: true });
              setIsProductModalOpen(false);
              setEditingProduct(null);
            } catch (err: any) {
              alert('Error al guardar producto: ' + err.message);
            }
          }}
        />
      )}

      {isCatalogModalOpen && (
        <CatalogStockModal
          existingProducts={products}
          onClose={() => setIsCatalogModalOpen(false)}
          onSave={async (p) => {
            try {
              await setDoc(doc(db, 'products', p.id), { ...p, updatedAt: new Date().toISOString() }, { merge: true });
              setIsCatalogModalOpen(false);
            } catch (err: any) {
              alert('Error al guardar producto: ' + handleFirestoreError(err));
            }
          }}
        />
      )}


      {/* ========================================================
          DELETE CONFIRMATION MODAL
         ======================================================== */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#161617] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">¿Eliminar {productToDelete.name}?</h3>
            <p className="text-xs text-[#86868B] mt-2 mb-6">
              Esta acción eliminará el producto de la base de datos Firestore y dejará de mostrarse en la tienda pública.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL FOR MANUAL SALE
         ======================================================== */}
      {manualSaleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#161617] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">¿Anular Venta del Libro Contable?</h3>
            <p className="text-xs text-[#86868B] mt-2 mb-6">
              Esta acción eliminará el registro de venta de <span className="text-white font-semibold">{manualSaleToDelete.productName}</span> ({manualSaleToDelete.customerName}) por <span className="text-emerald-400 font-mono font-bold">${(manualSaleToDelete.totalUsd || manualSaleToDelete.priceUsd * manualSaleToDelete.quantity).toLocaleString()} USD</span> de Firestore.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setManualSaleToDelete(null)}
                className="flex-1 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteManualSale}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
              >
                Anular Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// SUBCOMPONENT: PRODUCT FORM MODAL (CREATE / EDIT)
// ========================================================
interface ProductFormModalProps {
  product: iPhoneProduct | null;
  onClose: () => void;
  onSave: (p: iPhoneProduct) => Promise<void>;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave }) => {
  const isEditing = !!product;

  const [id, setId] = useState(() => product?.id || `iphone-${Date.now()}`);
  const [name, setName] = useState(product?.name || '');
  const [tagline, setTagline] = useState(product?.tagline || '');
  const [badge, setBadge] = useState(product?.badge || '');
  const [basePrice, setBasePrice] = useState(product?.basePrice ?? 999);
  const [stock, setStock] = useState(product?.stock ?? 15);
  const [active, setActive] = useState(product?.active !== false);

  const [costPriceUsd, setCostPriceUsd] = useState(product?.costPriceUsd ?? Math.round((product?.basePrice ?? 999) * 0.8));
  const [condition, setCondition] = useState(product?.condition || 'Nuevo (Sellado)');

  const [screenSize] = useState(product?.screenSize || '6.3"');
  const [chip] = useState(product?.chip || 'A18 Pro');
  const [camera] = useState(product?.camera || '48 MP Fusión Principal');
  const [batteryLife, setBatteryLife] = useState(product?.batteryLife || 'Hasta 27 horas');
  const [weight] = useState(product?.weight || '199 g');
  const [description, setDescription] = useState(product?.description || '');
  const [image, setImage] = useState(
    product?.image ||
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg'
  );

  // Features list as string
  const [featuresStr, setFeaturesStr] = useState(
    (product?.features || ['Carcasa de Titanio Grado 5', 'Control de Cámara Táctil', '1 Año de Garantía']).join('\n')
  );

  // Colors
  const [colors, setColors] = useState<ColorOption[]>(
    product?.colors && product.colors.length > 0
      ? product.colors
      : [
          {
            id: 'natural',
            name: 'Titanio Natural',
            hex: '#9F9D98',
            bgGradient: 'from-neutral-700 to-black',
            imageUrl: image,
          },
        ]
  );

  // Storage
  const [storageOptions, setStorageOptions] = useState<StorageOption[]>(
    product?.storageOptions && product.storageOptions.length > 0
      ? product.storageOptions
      : [
          { size: '128 GB', priceDelta: 0 },
          { size: '256 GB', priceDelta: 100 },
          { size: '512 GB', priceDelta: 300 },
        ]
  );

  const [newStorageSize, setNewStorageSize] = useState('');
  const [newStorageDelta, setNewStorageDelta] = useState(0);

  const [isSaving, setIsSaving] = useState(false);

  const handleAddStorage = () => {
    if (!newStorageSize.trim()) return;
    setStorageOptions([...storageOptions, { size: newStorageSize.trim(), priceDelta: Number(newStorageDelta) }]);
    setNewStorageSize('');
    setNewStorageDelta(0);
  };

  const handleRemoveStorage = (size: string) => {
    setStorageOptions(storageOptions.filter((s) => s.size !== size));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingresa el nombre del modelo.');
      return;
    }

    try {
      setIsSaving(true);
      const splitFeatures = featuresStr
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const calculatedProfit = Number(basePrice) - Number(costPriceUsd);

      const payload: iPhoneProduct = {
        id: id.trim(),
        name: name.trim(),
        tagline: tagline.trim(),
        badge: badge.trim() || undefined,
        basePrice: Number(basePrice),
        costPriceUsd: Number(costPriceUsd),
        profitUsd: calculatedProfit,
        condition,
        rating: product?.rating || 4.9,
        reviewsCount: product?.reviewsCount || 48,
        screenSize,
        chip,
        camera,
        batteryLife,
        weight,
        description: description.trim() || `El ${name} combina rendimiento líder y máxima elegancia Apple.`,
        features: splitFeatures.length > 0 ? splitFeatures : ['1 Año de Garantía Oficial'],
        image: image.trim(),
        colors,
        storageOptions,
        stock: Number(stock),
        active,
      };

      await onSave(payload);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#161617] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-black text-white mb-1">
          {isEditing ? `Editar: ${product?.name}` : 'Añadir Nuevo iPhone'}
        </h2>
        <p className="text-xs text-[#86868B] mb-6">
          Configura especificaciones, precios y almacenamiento para sincronización directa en Firestore.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Identificador Slug (ID)
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={isEditing}
                required
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white font-mono disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Nombre del Modelo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. iPhone 17 Pro Max"
                required
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white"
              />
            </div>
          </div>

          {/* Tagline & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Lema o Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="ej. Titán en tus manos"
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Etiqueta / Badge (Opcional)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="ej. Lanzamiento Exclusivo"
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white"
              />
            </div>
          </div>

          {/* Essential Commercial & Financial Fields */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-4">
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>Precios, Costo & Ganancia Neta</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-neutral-300 mb-1">
                  Precio de Venta ($ USD)
                </label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  min={0}
                  required
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-xl text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1">
                  Precio de Costo ($ USD)
                </label>
                <input
                  type="number"
                  value={costPriceUsd}
                  onChange={(e) => setCostPriceUsd(Number(e.target.value))}
                  min={0}
                  required
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-xl text-amber-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-400 mb-1">
                  Ganancia Estimada
                </label>
                <div className="w-full px-3 py-2 bg-neutral-950 border border-emerald-500/30 rounded-xl text-emerald-400 font-mono font-bold flex items-center justify-between">
                  <span>${basePrice - Number(costPriceUsd)} USD</span>
                  <span className="text-[10px] text-emerald-500 font-normal">
                    {basePrice > 0 ? `+${Math.round(((basePrice - Number(costPriceUsd)) / basePrice) * 100)}%` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Inventory, Stock & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="block font-bold text-neutral-300 mb-1">
                  Estado / Condición
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-xl text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="Nuevo (Sellado)">Nuevo (Sellado)</option>
                  <option value="Seminuevo / Excelente">Seminuevo / Excelente</option>
                  <option value="Usado Grado A">Usado Grado A</option>
                  <option value="Reacondicionado">Reacondicionado</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1">
                  Salud Batería (%)
                </label>
                <input
                  type="text"
                  value={batteryLife}
                  onChange={(e) => setBatteryLife(e.target.value)}
                  placeholder="ej. 100% o 95%"
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1">
                  Stock Unidades
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  min={0}
                  required
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/15 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1">
                  Visibilidad
                </label>
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className={`w-full py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-neutral-800 text-neutral-400 border border-white/10'
                  }`}
                >
                  {active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{active ? 'Activo' : 'Oculto'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Descripción Corta
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del modelo para la tienda..."
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white"
            />
          </div>

          {/* Storage Options Manager */}
          <div>
            <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Opciones de Almacenamiento
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {storageOptions.map((st) => (
                <span
                  key={st.size}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/60 border border-white/10 text-white font-mono"
                >
                  <span>{st.size}</span>
                  {st.priceDelta > 0 && <span className="text-blue-400 text-[10px]">(+${st.priceDelta})</span>}
                  <button
                    type="button"
                    onClick={() => handleRemoveStorage(st.size)}
                    className="text-neutral-500 hover:text-rose-400 ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ej. 1 TB"
                value={newStorageSize}
                onChange={(e) => setNewStorageSize(e.target.value)}
                className="w-24 px-2.5 py-1.5 bg-black border border-white/10 rounded-xl text-white font-mono"
              />
              <input
                type="number"
                placeholder="+$ Delta"
                value={newStorageDelta}
                onChange={(e) => setNewStorageDelta(Number(e.target.value))}
                className="w-24 px-2.5 py-1.5 bg-black border border-white/10 rounded-xl text-white font-mono"
              />
              <button
                type="button"
                onClick={handleAddStorage}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold"
              >
                + Añadir
              </button>
            </div>
          </div>

          {/* Color Palettes View */}
          <div>
            <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Variantes de Color ({colors.length})
            </label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-white/10"
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                  <span className="text-[11px] text-neutral-300">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              URL Imagen Principal
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => {
                setImage(e.target.value);
                // Also sync with first color if applicable
                if (colors.length > 0) {
                  const updatedColors = [...colors];
                  updatedColors[0] = { ...updatedColors[0], imageUrl: e.target.value };
                  setColors(updatedColors);
                }
              }}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-[11px]"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Características Clave (Una por línea)
            </label>
            <textarea
              rows={3}
              value={featuresStr}
              onChange={(e) => setFeaturesStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

