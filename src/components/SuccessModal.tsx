"use client";

import { CheckCircle2, Printer, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: number | null;
  total: number;
}

export function SuccessModal({
  isOpen,
  onClose,
  transactionId,
  total,
}: SuccessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-100 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-[450px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="relative p-8 text-center">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-24 h-24 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100/50">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <h3 className="text-3xl font-black text-slate-900 mb-2">Transaksi Sukses!</h3>
          <p className="text-slate-500 mb-8 font-medium">Transaksi telah berhasil disimpan ke sistem.</p>
          
          <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
            <div className="flex justify-between text-sm text-slate-500 mb-1 font-bold">
              <span>Invoice</span>
              <span className="text-slate-900 text-premium">#{transactionId?.toString().padStart(6, '0')}</span>
            </div>
            <div className="flex justify-between text-lg font-black pt-3 border-t border-slate-200">
              <span className="text-slate-900">Total</span>
              <span className="text-indigo-600">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => {
                router.push(`/print/${transactionId}`);
                onClose();
              }}
              className="w-full py-4 px-6 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center space-x-2 cursor-pointer group"
            >
              <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Print Struk</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Lanjutkan Transaksi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
