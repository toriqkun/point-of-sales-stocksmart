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
          <h2 className="text-3xl font-bold text-slate-900">Analisis Segmentasi K-Means</h2>
          <p className="text-slate-500">Kelompokkan produk {user?.businessName ? `di ${user.businessName}` : ""} berdasarkan performa penjualan</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="btn-primary flex items-center space-x-2 px-8 py-4 shadow-xl shadow-indigo-500/30 cursor-pointer"
        >
          {analyzing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          <span className="font-bold">{analyzing ? "Menganalisis..." : "Jalankan Clustering"}</span>
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
                  <tr className="border-b border-slate-100 text-slate-400 text-sm font-medium">
                    <th className="pb-4 font-semibold px-2">PRODUK</th>
                    <th className="pb-4 font-semibold text-center">CLUSTER</th>
                    <th className="pb-4 font-semibold">TINDAKAN REKOMENDASI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={3} className="py-10 text-center text-slate-400">Loading...</td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan={3} className="py-10 text-center text-slate-400">Belum ada data produk.</td></tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id}>
                        <td className="py-4 px-2 font-semibold text-slate-700">{p.name}</td>
                        <td className="py-4 text-center">
                          {p.cluster ? (
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold uppercase",
                              p.cluster === "High" ? "bg-green-100 text-green-700" :
                              p.cluster === "Medium" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            )}>
                              {p.cluster}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs italic">Belum dianalisis</span>
                          )}
                        </td>
                        <td className="py-4">
                          {p.cluster === "High" && (
                            <span className="text-emerald-600 text-sm font-medium flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Jaga stok tetap tersedia (Prioritas Utama)
                            </span>
                          )}
                          {p.cluster === "Medium" && (
                            <span className="text-yellow-600 text-sm font-medium flex items-center">
                              <Info className="w-4 h-4 mr-1" /> Re-stock sesuai kebutuhan normal
                            </span>
                          )}
                          {p.cluster === "Low" && (
                            <span className="text-red-500 text-sm font-medium flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" /> Evaluasi harga atau promosi
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
