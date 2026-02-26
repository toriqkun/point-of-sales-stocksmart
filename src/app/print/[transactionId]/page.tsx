"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { alignText, separator, centerText, formatReceiptCurrency } from "@/lib/print-utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function PrintReceiptPage() {
  const { transactionId } = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setError("Unauthorized: No user found in session.");
      setLoading(false);
      return;
    }

    const user = JSON.parse(storedUser);
    const ownerId = user.ownerId;

    fetch(`/api/print/${transactionId}?ownerId=${ownerId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch transaction data");
        return res.json();
      })
      .then((data) => {
        setTransaction(data);
        setLoading(false);
        setTimeout(() => {
        }, 1000);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [transactionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-medium">Menyiapkan struk...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-4 max-w-md">
          <p className="font-bold">Error</p>
          <p>{error || "Transaksi tidak ditemukan"}</p>
        </div>
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-indigo-600 font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const receiptWidth = 26; // Dikurangi lagi dari 28 ke 26 agar padding kanan aman

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 print:bg-white print:p-0 print:m-0">
      {/* Transaction Control - Hidden during print */}
      <div className="max-w-md mx-auto mb-6 flex items-center justify-between print:hidden">
        <button 
          onClick={() => router.back()}
          className="btn-secondary py-2 px-4 flex items-center space-x-2 border border-gray-400 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <button 
          onClick={handlePrint}
          className="btn-primary py-2 px-6 flex items-center space-x-2 shadow-lg cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Struk</span>
        </button>
      </div>

      {/* Receipt Preview */}
      <div className="receipt-container">
        <div className="receipt-paper">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="receipt-title">{transaction.owner.businessName}</h1>
            <p className="text-xs mt-1">
              {format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm", { locale: id })}
            </p>
            <p className="text-xs">Inv: #{transaction.id.toString().padStart(6, '0')}</p>
          </div>

          <div className="receipt-divider">{separator("-", receiptWidth)}</div>

          {/* Items */}
          <div className="mb-4">
            {transaction.items.map((item: any, idx: number) => (
              <div key={idx} className="receipt-item-group">
                <div className="receipt-item-name">{item.product.name}</div>
                <div className="receipt-item-details">
                  {alignText(
                    `${item.quantity} x ${formatReceiptCurrency(item.product.price)}`,
                    formatReceiptCurrency(item.subtotal),
                    receiptWidth
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="receipt-divider">{separator("-", receiptWidth)}</div>

          {/* Total */}
          <div className="receipt-total font-bold">
            {alignText("TOTAL", `Rp ${formatReceiptCurrency(transaction.totalPrice)}`, receiptWidth)}
          </div>

          <div className="receipt-divider mt-4">{separator("-", receiptWidth)}</div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="receipt-footer-msg font-bold">Terima Kasih</p>
            <p className="text-[10px] mt-1 text-gray-500">StockSmart POS System</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .receipt-container {
          display: flex;
          justify-content: center;
          padding: 20px 0;
        }

        .receipt-paper {
          background: white;
          width: 58mm;
          padding: 8mm 4mm; /* Padding seimbang kiri & kanan */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          font-family: 'Courier New', Courier, monospace;
          color: black;
          font-size: 12px;
          line-height: 1.2;
          box-sizing: border-box; /* Memastikan padding tidak menambah lebar elemen */
          overflow: hidden; /* Mencegah teks meluber keluar */
        }

        .receipt-title {
          font-size: 16px;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0;
        }

        .receipt-divider {
          margin: 8px 0;
          white-space: pre;
        }

        .receipt-item-group {
          margin-bottom: 6px;
        }

        .receipt-item-name {
          text-transform: uppercase;
          word-wrap: break-word;
        }

        .receipt-item-details {
          white-space: pre;
        }

        .receipt-total {
          font-size: 12px; /* Disamakan dengan item lain agar lebarnya konsisten */
          white-space: pre;
          text-transform: uppercase;
        }

        .receipt-footer-msg {
          white-space: pre;
          font-weight: bold;
        }

        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          
          body {
            background: white;
            margin: 0;
          }

          .receipt-container {
            padding: 0;
            display: block;
          }

          .receipt-paper {
            width: 58mm;
            padding: 4mm 3mm; /* Padding yang lebih aman untuk print */
            box-sizing: border-box;
            background: white;
          }

          .receipt-divider, .receipt-item-details, .receipt-total {
            white-space: pre !important; /* Memastikan spasi alignment tidak hilang */
          }

          .print\\:hidden {
            display: none !important;
          }
        }

        /* 80mm support */
        @media print and (min-width: 70mm) {
          .receipt-paper {
            width: 80mm;
          }
        }
      `}</style>
    </div>
  );
}
