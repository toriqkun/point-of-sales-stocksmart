"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, Package, Image as ImageIcon, X } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import Image from "next/image";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/ConfirmModal";

interface Product {
  id: number;
  name: string;
  image: string | null;
  price: number;
  stock: number;
  cluster: string | null;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Delete confirm state
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; productId: number | null }>({
    open: false,
    productId: null
  });

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const loadingToast = toast.loading("Sedang mengunggah gambar...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setCurrentProduct(prev => ({ ...prev, image: data.secure_url }));
        toast.success("Gambar berhasil diunggah", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Gagal mengunggah gambar", { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const loadingToast = toast.loading(currentProduct?.id ? "Sedang memperbarui produk..." : "Sedang menyimpan produk...");
    const method = currentProduct?.id ? "PUT" : "POST";
    const url = currentProduct?.id ? `/api/products/${currentProduct.id}` : "/api/products";

    if (!user) return;

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "x-owner-id": user.ownerId.toString()
        },
        body: JSON.stringify(currentProduct),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
        toast.success(currentProduct?.id ? "Produk berhasil diperbarui" : "Produk berhasil disimpan", { id: loadingToast });
      } else {
        const errorData = await res.json();
        toast.error(`Gagal menyimpan produk: ${errorData.error || res.statusText}`, { id: loadingToast });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.productId) return;
    const loadingToast = toast.loading("Sedang menghapus produk...");

    if (!user) return;

    try {
      const res = await fetch(`/api/products/${confirmDelete.productId}`, { 
        method: "DELETE",
        headers: { "x-owner-id": user.ownerId.toString() }
      });
      if (res.ok) {
        fetchProducts();
        toast.success("Produk berhasil dihapus", { id: loadingToast });
      } else {
        toast.error("Gagal menghapus produk", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Gagal menghapus produk", { id: loadingToast });
    } finally {
      setConfirmDelete({ open: false, productId: null });
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 text-premium">Manajemen Produk</h2>
            <p className="text-slate-500">Kelola daftar produk, gambar, dan stok {user?.businessName || "Bisnis Anda"}</p>
          </div>
          <button
            onClick={() => {
              setCurrentProduct({ name: "", price: 0, stock: 0, image: "" });
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center space-x-2 cursor-pointer shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold">Tambah Produk</span>
          </button>
        </div>

        <div className="card space-y-4">
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

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-sm font-black uppercase tracking-wider">
                  <th className="pb-4 px-2">PRODUK</th>
                  <th className="pb-4">HARGA</th>
                  <th className="pb-4 text-center">STOK</th>
                  <th className="pb-4 text-center">CLUSTER</th>
                  <th className="pb-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 italic">
                      Tidak ada produk ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm border border-gray-400">
                            {product.image ? (
                              <Image 
                                src={product.image} 
                                alt={product.name} 
                                fill 
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <Package className="w-6 h-6 opacity-30" />
                            )}
                          </div>
                          <span className="font-bold text-slate-700">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 font-black text-indigo-600">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="py-4 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-black",
                          product.stock < 10 ? "bg-red-100 text-red-600 border border-red-200" : "bg-slate-200 text-slate-500 border border-slate-300"
                        )}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        {product.cluster ? (
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            product.cluster === "High" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                            product.cluster === "Medium" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                            "bg-rose-100 text-rose-700 border border-rose-200"
                          )}>
                            {product.cluster}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[10px] italic font-medium uppercase">Belum dianalisis</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setCurrentProduct(product);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ open: true, productId: product.id })}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">
                  {currentProduct?.id ? "Edit Produk" : "Tambah Produk Baru"}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-slate-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="flex flex-col items-center space-y-4 mb-4">
                  <div className="relative w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 overflow-hidden group hover:border-indigo-400 transition-colors">
                    {currentProduct?.image ? (
                      <div className="relative w-full h-full">
                        <Image src={currentProduct.image} alt="Preview" fill className="object-cover" sizes="128px" />
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Upload Foto</span>
                      </>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    Klik foto di atas untuk {currentProduct?.image ? 'ganti' : 'pilih'} gambar
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nama Produk</label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Burger Keju"
                    className="input-field"
                    value={currentProduct?.name || ""}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Harga (IDR)</label>
                    <input
                      required
                      type="number"
                      className="input-field"
                      value={currentProduct?.price || ""}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Stok Awal</label>
                    <input
                      required
                      type="number"
                      className="input-field"
                      value={currentProduct?.stock || ""}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    disabled={isSaving || isUploading}
                    type="submit"
                    className="flex-1 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    <span>Simpan Produk</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, productId: null })}
        onConfirm={handleDelete}
        title="Hapus Produk"
        message="Apa anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
      />
    </>
  );
}
