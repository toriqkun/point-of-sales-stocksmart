"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  Minus, 
  Search, 
  ShoppingCart, 
  Loader2, 
  Package,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import Image from "next/image";
import toast from "react-hot-toast";
import { SuccessModal } from "@/components/SuccessModal";

interface Product {
  id: number;
  name: string;
  image: string | null;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function TransactionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{id: number, total: number} | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchProducts(parsedUser);
    }
  }, []);

  const fetchProducts = async (userData?: any) => {
    const activeUser = userData || user;
    if (!activeUser) return;

    try {
      const res = await fetch("/api/products", {
        headers: { "x-owner-id": activeUser.ownerId.toString() }
      });
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error("Gagal mengambil data produk");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSaving(true);
    const loadingToast = toast.loading("Sedang menyimpan transaksi...");

    if (!user) return;

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-owner-id": user.ownerId.toString()
        },
        body: JSON.stringify({
          items: cart,
          totalPrice: total,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const currentTotal = total; // Save total before clearing
        setCart([]);
        fetchProducts();
        setLastTransaction({ id: data.id, total: currentTotal });
        setShowSuccessModal(true);
        toast.success("Transaksi berhasil disimpan!", { id: loadingToast });
      } else {
        toast.error("Gagal menyimpan transaksi", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 text-premium">Pencatatan Transaksi</h2>
          <p className="text-slate-500">Pilih produk untuk ditambahkan ke keranjang {user?.businessName ? `di ${user.businessName}` : ""}</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            className="input-field pl-10 border border-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const inCart = cart.find(item => item.id === product.id);
              const remainingStock = product.stock - (inCart?.quantity || 0);

              return (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={cn(
                    "card p-3 cursor-pointer group hover:border-indigo-500 relative transition-all duration-300",
                    remainingStock === 0 && "opacity-50 grayscale pointer-events-none"
                  )}
                >
                  <div className="flex flex-col h-full">
                    <div className="relative w-full aspect-square rounded-2xl bg-slate-50 flex items-center justify-center mb-4 overflow-hidden border border-slate-100 group-hover:border-indigo-100 transition-colors">
                      {product.image ? (
                        <Image 
                          src={product.image} 
                          alt={product.name} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-slate-200 group-hover:scale-110 transition-transform duration-500" />
                      )}
                      
                      {inCart && (
                        <div className="absolute top-2 right-2 bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg animate-in zoom-in-50">
                          {inCart.quantity}
                        </div>
                      )}
                    </div>
                    
                    <div className="px-1">
                      <h4 className="font-bold text-slate-800 text-md truncate">{product.name}</h4>
                      <p className="text-indigo-600 font-extrabold text-lg mt-0.5">{formatCurrency(product.price)}</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <span className={cn(
                          "text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-wider",
                          remainingStock < 10 ? "bg-red-100 text-red-600 border border-red-200" : "bg-slate-200 text-slate-500 border border-slate-300"
                        )}>
                          Stock: {remainingStock}
                        </span>
                        <div className="bg-slate-50 p-1.5 rounded-lg text-slate-400 border border-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          <Plus className="w-4.5 h-4.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="card sticky top-8 flex flex-col h-[calc(100vh-8rem)] border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 text-indigo-600" />
              <span>Keranjang</span>
            </h3>
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              {cart.reduce((s, i) => s + i.quantity, 0)} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="font-medium">Keranjang masih kosong</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:border-slate-200">
                  <div className="flex-1 mr-4">
                    <h5 className="font-bold text-slate-800 text-sm truncate">{item.name}</h5>
                    <p className="text-xs text-indigo-600 font-extrabold">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}
                        className="p-1.5 hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}
                        className="p-1.5 hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-center text-slate-500 font-bold text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between items-center text-2xl font-black text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            
            <button
              disabled={cart.length === 0 || isSaving}
              onClick={handleCheckout}
              className="w-full btn-primary py-4 text-lg shadow-xl shadow-indigo-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:grayscale cursor-pointer"
            >
              {isSaving ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="font-bold">Proses Transaksi</span>
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        transactionId={lastTransaction?.id || null}
        total={lastTransaction?.total || 0}
      />
    </div>
  );
}
