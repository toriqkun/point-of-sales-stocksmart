"use client";

import { useEffect, useState } from "react";
import { 
  Play, 
  Loader2, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface ProductAnalysis {
  id: number;
  name: string;
  price: number;
  stock: number;
  cluster: string | null;
}

export default function AnalysisPage() {
  const [products, setProducts] = useState<ProductAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

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
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    setSuccess(false);

    if (!user) return;

    try {
      const res = await fetch("/api/analysis", { 
        method: "POST",
        headers: { "x-owner-id": user.ownerId.toString() }
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        fetchProducts();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem saat menjalankan analisis.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Analisis Segmentasi K-Means</h2>
          <p className="text-slate-500 text-md sm:text-xl">Kelompokkan produk {user?.businessName ? `di ${user.businessName}` : ""} berdasarkan performa penjualan</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="btn-primary flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 shadow-xl shadow-indigo-500/30 cursor-pointer"
        >
          {analyzing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          <span className="font-bold">{analyzing ? "Menganalisis..." : "Analisa K-Means"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
              Hasil Pengelompokkan Produk
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    <th className="pb-4 px-2 min-w-[150px] sm:min-w-0">PRODUK</th>
                    <th className="pb-4 text-center min-w-[100px] sm:min-w-0">CLUSTER</th>
                    <th className="pb-4 min-w-[220px] sm:min-w-0">TINDAKAN REKOMENDASI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={3} className="py-10 text-center text-slate-400">Loading...</td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan={3} className="py-10 text-center text-slate-400">Belum ada data produk.</td></tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-2 font-bold text-slate-700 text-xs sm:text-sm">{p.name}</td>
                        <td className="py-4 text-center">
                          {p.cluster ? (
                            <span className={cn(
                              "px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest",
                              p.cluster === "High" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                              p.cluster === "Medium" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                              "bg-rose-100 text-rose-700 border border-rose-200"
                            )}>
                              {p.cluster}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[10px] sm:text-xs italic font-medium uppercase">Belum dianalisis</span>
                          )}
                        </td>
                        <td className="py-4">
                          {p.cluster === "High" && (
                            <span className="text-emerald-600 text-[10px] sm:text-xs font-black flex items-center">
                              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" /> 
                              <span>Jaga stok tetap tersedia (Prioritas Utama)</span>
                            </span>
                          )}
                          {p.cluster === "Medium" && (
                            <span className="text-amber-600 text-[10px] sm:text-xs font-black flex items-center">
                              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" /> 
                              <span>Re-stock sesuai kebutuhan normal</span>
                            </span>
                          )}
                          {p.cluster === "Low" && (
                            <span className="text-rose-500 text-[10px] sm:text-xs font-black flex items-center">
                              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" /> 
                              <span>Evaluasi harga atau promosi</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-indigo-600 text-white">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Tentang K-Means
            </h3>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Algoritma K-Means mengelompokkan produk Anda menjadi 3 kategori berdasarkan:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-indigo-50 font-medium">
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Volume Penjualan (Qty)</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Total Pendapatan (Revenue)</li>
              <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Frekuensi Transaksi</li>
            </ul>
          </div>

          {error && (
            <div className="card bg-red-50 border-red-200 text-red-700 flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold">Gagal Menganalisis</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="card bg-green-50 border-green-200 text-green-700 flex items-start space-x-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold">Analisis Selesai</p>
                <p className="text-sm">Produk telah berhasil dikelompokkan berdasarkan data terbaru.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
