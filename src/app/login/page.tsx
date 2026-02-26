"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await loginAction(email, password);
      
      if (result.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(result.user));
        router.push("/admin/dashboard");
      } else {
        setError(result.message || "Login gagal");
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

      <div className="max-w-md w-full space-y-4 border-gray-300 shadow-lg rounded-2xl py-5">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 mb-6">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            StockSmart
          </h2>
          <p className="mt-2 text-slate-500 font-medium">
            Silakan login untuk mengelola Bisnis Anda
          </p>
        </div>

        <div className="px-5 pt-3">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  className="input-field pl-10 h-12 border-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Your Password"
                  className="input-field pl-10 h-12 border-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="font-bold">Login</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400">
          Belum punya akun? <a href="/register" className="text-indigo-600 font-bold hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
}
