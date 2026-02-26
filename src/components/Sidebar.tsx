"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart2, 
  FileText, 
  LogOut,
  ChevronRight,
  User as UserIcon,
  AlertCircle,
  Briefcase
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { updateProfileAction } from "@/app/actions/auth";
import Image from "next/image";
import toast from "react-hot-toast";
import { Camera, Loader2 } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBusinessName, setNewBusinessName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState("");

  const allMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Package, label: "Produk", href: "/admin/products" },
    { icon: ShoppingCart, label: "Transaksi", href: "/admin/transactions" },
    { icon: BarChart2, label: "K-Means", href: "/admin/analysis", ownerOnly: true },
    { icon: UserIcon, label: "Users", href: "/admin/users", ownerOnly: true },
    { icon: FileText, label: "Laporan", href: "/admin/reports", ownerOnly: true },
  ];

  // Filter menu based on role
  const menuItems = allMenuItems.filter(item => {
    if (user?.role === "kasir" && item.ownerOnly) return false;
    return true;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setNewName(parsedUser.name);
      setNewBusinessName(parsedUser.businessName || "");
      setAvatarPreview(parsedUser.avatarImage || "");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setAvatarPreview(data.secure_url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError("ID User tidak ditemukan. Silakan logout dan login kembali.");
      return;
    }

    setIsUpdating(true);
    setError("");
    try {
      const result = await updateProfileAction(user.id, {
        name: newName,
        avatarImage: avatarPreview,
        businessName: user.role === "owner" ? newBusinessName : undefined
      });

      if (result.success) {
        const updatedUser = { ...user, ...result.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsModalOpen(false);
        toast.success("Profil berhasil diperbarui!");
      } else {
        setError(result.message || "Gagal memperbarui profil");
      }
    } catch (err) {
      console.error("Update failed:", err);
      setError("Terjadi kesalahan sistem");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <span className="font-bold text-slate-900">StockSmart</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/admin/dashboard" className="group flex items-center space-x-2" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">S</div>
            <div>
              <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                StockSmart
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold truncate max-w-[120px]">
                {user?.businessName || "Your Business"}
              </p>
            </div>
          </Link>
          
          {/* Close Button Inside Sidebar */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100 shadow-sm"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:scale-110 transition-transform")} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center space-x-3 p-3 mb-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left group cursor-pointer"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-indigo-100 flex items-center justify-center text-indigo-600">
              {user?.avatarImage ? (
                <Image 
                  src={user.avatarImage} 
                  alt={user.name} 
                  fill 
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <Image 
                  src="/avatar.png" 
                  alt="Default Avatar" 
                  fill 
                  sizes="40px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                {user?.name || "Loading..."}
              </p>
              <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-wider">
                {user?.role || "Administrator"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-semibold group cursor-pointer"
          >
            <LogOut className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            <span className="ms-2">Keluar</span>
          </button>
        </div>
      </div>

      {/* Profile Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-100 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl w-full max-w-[500px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 items-center bg-white sticky top-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Pengaturan Profil</h3>
                <p className="text-xs text-slate-500">Sesuaikan informasi identitas Anda</p>
              </div>
            </div>
            
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-8">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-28 h-28 relative">
                    <Image 
                      src={avatarPreview?.trim() ? avatarPreview : "/avatar.png"}
                      alt="Preview" 
                      fill 
                      sizes="112px"
                      className="object-cover border-4 border-gray-300 rounded-full"
                    />
                    {uploadLoading && (
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white cursor-pointer hover:bg-indigo-700 transition-all hover:scale-110">
                    <Camera className="w-5 h-5" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Klik ikon kamera untuk ganti foto</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative opacity-60">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400">@</div>
                    <input 
                      type="email"
                      readOnly
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border border-gray-400 rounded-2xl focus:outline-none text-slate-600 cursor-not-allowed"
                      value={user?.email || ""}
                    />
                  </div>
                </div>

                {user?.role === "owner" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Bisnis</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        type="text"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600"
                        value={newBusinessName}
                        onChange={(e) => setNewBusinessName(e.target.value)}
                        placeholder="Masukkan nama bisnis Anda"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all border border-gray-400 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isUpdating || uploadLoading}
                  className="flex-1 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                >
                  {isUpdating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
