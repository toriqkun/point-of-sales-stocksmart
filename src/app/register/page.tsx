"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Loader2, AlertCircle, Briefcase } from "lucide-react";
import { registerAction } from "@/app/actions/auth";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await registerAction(formData);
      
      if (result.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(result.user));
        router.push("/admin/dashboard");
      } else {
        setError(result.message || "Pendaftaran gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

      <div className="max-w-md w-full space-y-4 border-gray-300 shadow-lg rounded-2xl pt-6 pb-4 bg-white/80 backdrop-blur-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-17 h-17 rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 mb-3 group hover:rotate-6 transition-transform">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Register Owner
          </h2>
          <p className="mt-2 text-slate-500 text-sm font-medium px-4">
            Daftarkan bisnis Anda untuk mulai kelola stok secara cerdas
          </p>
        </div>

        <div className="px-8 pt-3">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <form className="space-y-3" onSubmit={handleRegister}>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider text-[10px]">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Nama Owner"
                  className="w-full pl-12 pr-4 h-12 text-slate-600 bg-slate-50 border border-gray-400 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider text-[10px]">Email Bisnis</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@business.com"
                  className="w-full pl-12 pr-4 h-12 text-slate-600 bg-slate-50 border border-gray-400 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider text-[10px]">Nama Bisnis</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Toko Berkah"
                  className="w-full pl-12 pr-4 h-12 text-slate-600 bg-slate-50 border border-gray-400 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider text-[10px]">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 h-12 text-slate-600 bg-slate-50 border border-gray-400 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="font-bold">Register</span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400">
          Sudah punya akun? <a href="/login" className="text-indigo-600 font-black hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}
