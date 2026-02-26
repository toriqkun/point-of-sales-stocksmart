"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Zap,
  Printer,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  TrendingUp,
  Globe,
  Users
} from "lucide-react";
import { getLandingStats } from "@/app/actions/stats";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [stats, setStats] = useState({
    ownerCount: 0,
    recentAvatars: [] as string[]
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    getLandingStats().then(res => {
      if (res.success) {
        setStats({
          ownerCount: res.ownerCount,
          recentAvatars: res.recentAvatars
        });
      }
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Ornaments */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/40 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-100/40 blur-[120px] rounded-full animate-pulse opacity-70"></div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        scrolled ? "bg-white/30 backdrop-blur-xl border-slate-100 py-3" : "bg-transparent border-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-indigo-200 group-hover:rotate-6 transition-transform">S</div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">StockSmart<span className="text-indigo-600">.</span></span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="bg-indigo-500 text-white flex items-center space-x-2 px-6 py-3 rounded-2xl shadow-xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-100 transition-all font-bold active:scale-95"
            >
              <span>Login Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-25 lg:pt-35 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 space-y-8 text-center lg:text-left animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full border border-indigo-100 shadow-sm animate-bounce">
              <Zap className="w-4 h-4 fill-indigo-600" />
              <span className="text-xs font-black uppercase tracking-widest">The Smartest POS Ecosystem</span>
            </div>
            
            <h1 className="text-6xl lg:text-[84px] font-black text-slate-900 leading-[0.95] tracking-tighter">
              Solusi Cerdas <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600">Kelola Stok</span> <br />
              Bisnis Anda
            </h1>
            
            <p className="text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">
              Manajemen stok berbasis AI dengan algoritma K-Means. Lengkap dengan sistem cetak struk thermal profesional untuk segala jenis usaha retail Anda.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              <Link href="/register" className="bg-indigo-600 text-white text-xl px-10 py-4.5 rounded-3xl w-full sm:w-auto shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all font-black flex items-center justify-center space-x-3">
                <span>Daftar Gratis</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
              
              <div className="flex flex-col items-center lg:items-start space-y-2">
                <div className="flex -space-x-3 items-center">
                  {stats.recentAvatars.length > 0 ? (
                    stats.recentAvatars.map((url, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative shadow-sm">
                        <Image src={url} alt="User" fill className="object-cover" />
                      </div>
                    ))
                  ) : (
                    [1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative shadow-sm">
                        <Image src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User" fill />
                      </div>
                    ))
                  )}
                  {stats.ownerCount > 0 && (
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] text-white font-black shadow-sm">
                      +{stats.ownerCount}
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-500">
                  Bergabung dengan <span className="text-slate-900">{stats.ownerCount > 0 ? stats.ownerCount : "Ratusan"}</span> pengusaha lainnya
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="absolute -inset-4 bg-linear-to-tr from-indigo-500/20 to-violet-500/20 blur-3xl rounded-[3rem]"></div>
            <div className="relative group">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 delay-150"></div>
              
              <div className="relative card p-3 rotate-1 hover:rotate-0 transition-transform duration-500 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-white/50 bg-white/40 backdrop-blur-md">
                <div className="overflow-hidden rounded-3xl bg-slate-900 border border-white/20 relative aspect-video">
                  <Image 
                    src="/bg1.jpg" 
                    alt="StockSmart Dashboard Preview" 
                    fill
                    className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000"
                    priority
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-slate-900 to-transparent"></div>
                </div>
              </div>  
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">Kekuatan Penuh untuk <br /><span className="text-indigo-600">Skalabilitas Bisnis</span></h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">Dirancang dengan teknologi terbaru untuk memberikan pengalaman manajemen paling halus dan akurat.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8 text-indigo-600" />}
              title="Analisis K-Means"
              desc="Kelompokkan produk secara otomatis menjadi kategori prioritas tinggi, sedang, dan rendah berdasarkan performa."
              gradient="from-indigo-500/10 to-violet-500/10"
            />
            <FeatureCard 
              icon={<ShoppingCart className="w-8 h-8 text-emerald-600" />}
              title="POS Point of Sale"
              desc="Catat transaksi secepat kilat. Pengurangan stok otomatis secara realtime untuk menjaga akurasi data."
              gradient="from-emerald-500/10 to-teal-500/10"
            />
            <FeatureCard 
              icon={<Printer className="w-8 h-8 text-amber-600" />}
              title="Print Struk Thermal"
              desc="Suport printer 58mm & 80mm. Layout profesional, bersih, dan hemat kertas. Langsung cetak via browser."
              gradient="from-amber-500/10 to-orange-500/10"
              newBadge
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-blue-600" />}
              title="Multi-Tenancy"
              desc="Data antar tenant terisolasi sempurna. Aman dan privat untuk data bisnis skala kecil maupun besar."
              gradient="from-blue-500/10 to-cyan-500/10"
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8 text-rose-600" />}
              title="Laporan Mendalam"
              desc="Ekspor laporan harian dan bulanan ke Excel. Visualisasi data tren penjualan yang mudah dipahami."
              gradient="from-rose-500/10 to-pink-500/10"
            />
            <FeatureCard 
              icon={<Smartphone className="w-8 h-8 text-violet-600" />}
              title="Akses Dimana Saja"
              desc="Tampilan responsif untuk HP, Tablet, maupun PC. Kelola bisnis Anda dari genggaman tangan."
              gradient="from-violet-500/10 to-fuchsia-500/10"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[3rem] p-10 lg:p-20 relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-indigo-500/20 to-transparent"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
              <div className="space-y-6 max-w-2xl">
                <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">Siap Untuk Membuat Bisnis Anda <span className="text-indigo-400">Lebih Pintar?</span></h2>
                <p className="text-xl text-slate-400 font-medium">Daftar sekarang dan nikmati kecanggihan manajemen stok masa depan.</p>
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">Tanpa biaya bulanan</span>
                  </div>
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">Setup 2 menit</span>
                  </div>
                </div>
              </div>
              <Link href="/register" className="bg-white text-slate-900 hover:bg-slate-100 px-12 py-6 rounded-3xl text-2xl font-black shadow-2xl transition-all active:scale-95 shrink-0">
                Gunakan Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pb-5 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="pt-10 border-t border-slate-100 flex items-center justify-center gap-4 text-center">
            <p className="text-slate-500 text-sm font-medium">© 2026 StockSmart Cloud Application. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, gradient, newBadge }: any) {
  return (
    <div className="group relative p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
      <div className={cn("absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10", gradient)}></div>
      <div className="w-20 h-20 rounded-xl bg-slate-50 group-hover:bg-white group-hover:shadow-lg flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500">
        {icon}
      </div>
      <div className="flex items-center space-x-3 mb-4">
        <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
        {newBadge && <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">New</span>}
      </div>
      <p className="text-slate-500 font-medium leading-relaxed group-hover:text-slate-600 transition-colors">{desc}</p>
    </div>
  );
}
