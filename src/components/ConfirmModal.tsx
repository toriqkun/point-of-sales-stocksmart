"use client";

import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: "danger" | "primary";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Hapus",
  confirmVariant = "danger"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-150 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-[400px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className={cn(
            "w-21 h-22 rounded-2xl flex items-center justify-center mx-auto mb-4",
            confirmVariant === "danger" ? "bg-red-50 text-red-500" : "bg-indigo-50 text-indigo-500"
          )}>
            <AlertTriangle className="w-15 h-15" />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 mb-8">{message}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-slate-500 border border-gray-400 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                "flex-1 py-3 px-4 rounded-2xl font-bold text-white shadow-lg transition-all cursor-pointer",
                confirmVariant === "danger" ? "bg-red-500 hover:bg-red-600 shadow-red-100" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
