"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  Download, 
  Search, 
  Calendar as CalendarIcon,
  Loader2,
  ArrowRight,
  Printer
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import ExcelJS from "exceljs";

interface ReportItem {
  id: number;
  date: string;
  totalPrice: number;
  itemsCount: number;
  itemDetails: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-01"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchReports(parsedUser);
    }
  }, []);

  const fetchReports = async (userData?: any) => {
    const activeUser = userData || user;
    if (!activeUser) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/reports?start=${startDate}&end=${endDate}`, {
        headers: { "x-owner-id": activeUser.ownerId.toString() }
      });
      const data = await res.json();
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    if (reports.length === 0) return;
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Penjualan");

    // Menyiapkan data untuk tabel
    const rows = reports.map(r => [
      r.id,
      format(new Date(r.date), "dd/MM/yyyy HH:mm"),
      r.itemDetails,
      r.totalPrice
    ]);

    // Menambahkan tabel ke worksheet
    worksheet.addTable({
      name: 'LaporanPenjualan',
      ref: 'A1',
      headerRow: true,
      totalsRow: true,
      style: {
        theme: 'TableStyleMedium9',
        showRowStripes: true,
      },
      columns: [
        { name: 'ID Transaksi', filterButton: true },
        { name: 'Tanggal', filterButton: true },
        { name: 'Rincian Produk', filterButton: true },
        { name: 'Total Harga', filterButton: true, totalsRowFunction: 'sum' },
      ],
      rows: rows,
    });

    // Mengatur format mata uang untuk kolom Total Harga
    worksheet.getColumn(4).numFmt = '"Rp "#,##0';
    
    // Mengatur lebar kolom agar pas
    worksheet.columns.forEach((column, i) => {
      if (i === 2) {
        column.width = 40; // Rincian produk lebih lebar
      } else {
        column.width = 20;
      }
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Penjualan_${startDate}_to_${endDate}.xlsx`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 text-premium">Laporan Penjualan</h2>
          <p className="text-slate-500">Pantau performa penjualan {user?.businessName || "Bisnis Anda"} berdasarkan periode</p>
        </div>
        <button
          onClick={exportExcel}
          disabled={reports.length === 0}
          className="btn-secondary flex items-center space-x-2 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span className="font-bold">Export Excel</span>
        </button>
      </div>

      <div className="card grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Mulai</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              className="input-field pl-10"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 ml-1">Tanggal Selesai</label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              className="input-field pl-10"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={fetchReports}
          className="btn-primary flex items-center justify-center space-x-2 py-3 cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span>Filter Laporan</span>
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Daftar Transaksi</h3>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            {reports.length} Transaksi Ditemukan
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th className="py-4 px-6 text-center">ID</th>
                <th className="py-4 px-6">WAKTU & TANGGAL</th>
                <th className="py-4 px-6"> RINCIAN PRODUK</th>
                <th className="py-4 px-6 text-right">TOTAL HARGA</th>
                <th className="py-4 px-6 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2 text-indigo-600" />
                    Memproses data...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 italic">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    Tidak ada transaksi pada periode ini.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="py-4 px-6 text-center text-slate-400 font-mono text-sm group-hover:text-indigo-600">
                      #{report.id}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">
                          {format(new Date(report.date), "dd MMM yyyy")}
                        </span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(report.date), "HH:mm")} WIB
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="max-w-xs truncate text-slate-600 font-medium" title={report.itemDetails}>
                        {report.itemDetails}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-black text-slate-900 text-lg">
                        {formatCurrency(report.totalPrice)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => router.push(`/print/${report.id}`)}
                        className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100 cursor-pointer"
                        title="Cetak Struk"
                      >
                        <Printer className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {reports.length > 0 && (
          <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                <FileText className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Total Akumulasi</p>
                <p className="text-sm font-medium">Periode {format(new Date(startDate), "dd/MM")} - {format(new Date(endDate), "dd/MM")}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-white">
                {formatCurrency(reports.reduce((sum, r) => sum + r.totalPrice, 0))}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Selesai Diverifikasi</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
