"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardData {
  todaySales: number;
  monthSales: number;
  totalProducts: number;
  topProducts: { name: string; totalSold: number }[];
  clusterDist: Record<string, number>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchStats(parsedUser);
    }
  }, []);

  const fetchStats = async (userData?: any) => {
    const activeUser = userData || user;
    if (!activeUser) return;

    try {
      const res = await fetch("/api/dashboard", {
        headers: { "x-owner-id": activeUser.ownerId.toString() }
      });
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  const barData = {
    labels: data?.topProducts.map(p => p.name) || [],
    datasets: [
      {
        label: 'Total Terjual',
        data: data?.topProducts.map(p => p.totalSold) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const pieData = {
    labels: ['High Priority', 'Medium', 'Low Priority'],
    datasets: [
      {
        data: [
          data?.clusterDist.High || 0,
          data?.clusterDist.Medium || 0,
          data?.clusterDist.Low || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Ringkasan performa {user?.businessName || "Bisnis Anda"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<DollarSign className="w-6 h-6" />}
          label="Penjualan Hari Ini"
          value={formatCurrency(data?.todaySales || 0)}
          color="bg-emerald-50 text-emerald-600"
          trend={<span className="flex items-center text-xs font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded-full"><ArrowUpRight className="w-3 h-3 mr-1" /> 12%</span>}
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6" />}
          label="Penjualan Bulan Ini"
          value={formatCurrency(data?.monthSales || 0)}
          color="bg-indigo-50 text-indigo-600"
          trend={<span className="flex items-center text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded-full"><ArrowUpRight className="w-3 h-3 mr-1" /> 8%</span>}
        />
        <StatCard 
          icon={<Package className="w-6 h-6" />}
          label="Total Produk"
          value={data?.totalProducts || 0}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold text-slate-800 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            Rekomendasi Restock
          </h3>
          <RestockAlerts />
        </div>

        <div className="lg:col-span-2 card">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            Produk Terlaris
          </h3>
          <div className="h-[300px]">
            <Bar 
              data={barData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                  y: { beginAtZero: true, grid: { display: false } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center">
          <PieChartIcon className="w-5 h-5 mr-2 text-indigo-600" />
          Distribusi Segmentasi (K-Means)
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-around gap-8">
          <div className="w-[300px]">
            <Pie data={pieData} options={{ maintainAspectRatio: true }} />
          </div>
          <div className="flex-1 space-y-4 max-w-md">
            <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
              <h5 className="font-bold text-green-700 mb-1">High Priority (Best Seller)</h5>
              <p className="text-sm text-green-600">Pastikan stok selalu tersedia. Produk ini penyumbang profit terbesar Anda.</p>
            </div>
            <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-100">
              <h5 className="font-bold text-yellow-700 mb-1">Medium Priority</h5>
              <p className="text-sm text-yellow-600">Produk pendukung yang stabil. Lakukan promosi berkala untuk meningkatkan penjualan.</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
              <h5 className="font-bold text-red-700 mb-1">Low Priority</h5>
              <p className="text-sm text-red-600">Performa rendah. Evaluasi harga atau ganti dengan menu baru yang lebih menarik.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RestockAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);

    fetch("/api/restock", {
      headers: { "x-owner-id": user.ownerId.toString() }
    })
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4 text-center">Loading alerts...</div>;
  if (alerts.length === 0) return (
    <div className="card bg-green-50 border-green-100 p-4 text-center">
      <p className="text-green-700 font-bold">Stok Aman!</p>
      <p className="text-xs text-green-600">Semua barang memiliki stok yang cukup.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {alerts.map((alert: any) => (
        <div key={alert.id} className={cn(
          "p-4 rounded-2xl border flex items-start space-x-3 transition-all",
          alert.priority === "Urgent" ? "bg-red-50 border-red-100 shadow-sm" : "bg-white border-slate-100"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            alert.priority === "Urgent" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
          )}>
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-slate-800">{alert.name}</h4>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                alert.priority === "Urgent" ? "bg-red-600 text-white" : "bg-yellow-400 text-white"
              )}>
                {alert.priority}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{alert.message}</p>
            <div className="mt-2 flex items-center text-[10px] font-bold text-slate-400">
              SISA STOK: <span className="text-slate-900 ml-1">{alert.stock} PCS</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, color, trend }: any) {
  return (
    <div className="card flex items-center space-x-4">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", color)}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          {trend}
        </div>
        <h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
      </div>
    </div>
  );
}
