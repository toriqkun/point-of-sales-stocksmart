"use client";

import { useEffect, useState } from "react";
import { Star, X, Send, Loader2 } from "lucide-react";
import { submitReviewAction, getUserReviewAction } from "@/app/actions/reviews";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export function ReviewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const checkReviewEligibility = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const loginAt = user.loginAt;
      if (!loginAt) return;

      const now = Date.now();
      const twoHours = 1 * 60 * 60 * 1000;
      
      const hasShowedInSession = sessionStorage.getItem("hasAskedForReview");
      
      if (now - loginAt >= twoHours && !hasShowedInSession) {
        const result = await getUserReviewAction();
        if (result.success && !result.review) {
          setIsOpen(true);
        }
        sessionStorage.setItem("hasAskedForReview", "true");
      }
    };

    // Cari setiap 5 menit untuk efisiensi
    const interval = setInterval(checkReviewEligibility, 300000);
    checkReviewEligibility(); // Cek langsung saat load

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Silakan berikan rating bintang");
      return;
    }
    if (!comment.trim()) {
      toast.error("Pesan ulasan tidak boleh kosong");
      return;
    }

    setLoading(true);
    try {
      const result = await submitReviewAction(rating, comment);
      if (result.success) {
        toast.success("Terima kasih atas ulasan Anda!");
        setIsOpen(false);
      } else {
        toast.error(result.message || "Gagal mengirim ulasan");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="relative p-8 text-center bg-linear-to-br from-indigo-600 to-violet-700 text-white">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md mb-4">
             <Star className="w-10 h-10 text-yellow-300 fill-yellow-300" />
          </div>
          <h2 className="text-2xl font-bold">Beri Ulasan Kami</h2>
          <p className="mt-2 text-indigo-100/80">Kami ingin mendengar pengalaman Anda menggunakan StockSmart.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4 text-center">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Rating Anda</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="transition-all hover:scale-125 focus:outline-none"
                >
                  <Star 
                    className={cn(
                      "w-10 h-10 cursor-pointer",
                      (hoverRating || rating) >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    )} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Pesan Ulasan</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda..."
              className="w-full h-32 p-4 bg-slate-50 border border-gray-400 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-slate-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 border border-gray-400 transition-all cursor-pointer"
            >
              Nanti Saja
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kirim
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
