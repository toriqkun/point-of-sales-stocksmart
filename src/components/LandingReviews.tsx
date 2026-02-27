"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, Send, Loader2 } from "lucide-react";
import { submitReviewAction, getReviewsAction } from "@/app/actions/reviews";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LandingReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Form states
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetchReviews();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const result = await getReviewsAction();
    if (result.success) {
      setReviews(result.reviews || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (rating === 0) {
      toast.error("Silakan pilih rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Pesan tidak boleh kosong");
      return;
    }

    setSubmitting(true);
    const result = await submitReviewAction(rating, comment);
    if (result.success) {
      toast.success("Ulasan berhasil dikirim!");
      setComment("");
      setRating(0);
      fetchReviews();
    } else {
      toast.error(result.message || "Gagal mengirim ulasan");
    }
    setSubmitting(false);
  };

  return (
    <section className="py-32 px-6 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Left: Review List */}
          <div className="flex-1 space-y-12">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">Apa Kata <span className="text-indigo-600">User Kami?</span></h2>
              <p className="text-xl text-slate-500 font-medium">Testimoni nyata dari para pengusaha yang telah bertransformasi bersama StockSmart.</p>
            </div>

            {loading ? (
              <div className="flex justify-center p-20">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 italic text-slate-400">
                Belum ada ulasan. Jadilah yang pertama memberikan ulasan!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden relative border-2 border-white shadow-sm font-bold text-indigo-600">
                        {review.user?.avatarImage ? (
                          <Image src={review.user.avatarImage} alt={review.user.name} fill className="object-cover" />
                        ) : (
                          review.user?.name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{review.user?.name}</p>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={cn(
                                "w-3 h-3",
                                review.rating >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 italic leading-relaxed">"{review.comment}"</p>
                    <p className="mt-4 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                      {new Date(review.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Review Form */}
          <div className="lg:w-96 shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-100 sticky top-32">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Beri Ulasan</h3>
              </div>

              {!user ? (
                <div className="text-center space-y-6 py-6 font-bold cursor-pointer">
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Silakan login terlebih dahulu untuk memberikan ulasan Anda.
                  </p>
                  <Link href="/login" className="block w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                    Login Sekarang
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Rating Bintang</label>
                    <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(s)}
                          className="transition-all hover:scale-110 focus:outline-none cursor-pointer"
                        >
                          <Star 
                            className={cn(
                              "w-8 h-8",
                              (hoverRating || rating) >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
                            )} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Pesan Anda</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Apa yang membuat Anda menyukai StockSmart?"
                      className="w-full h-40 p-5 bg-slate-50 border border-gray-400 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 text-sm font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-indigo-500 text-white rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5" /> Kirim Ulasan</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
