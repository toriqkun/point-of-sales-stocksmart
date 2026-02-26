"use client";

import { useEffect, useState } from "react";
import { 
  UserPlus, 
  Trash2, 
  User as UserIcon, 
  Mail, 
  Loader2,
  Search,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/ConfirmModal";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarImage: string | null;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "kasir"
  });

  // Delete Confirm Modal State
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; userId: number | null }>({
    open: false,
    userId: null
  });

  useEffect(() => {
    fetchUsers();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchUsers = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        headers: { "x-owner-id": user.ownerId.toString() }
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Gagal memuat daftar user");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingToast = toast.loading("Sedang membuat user...");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-owner-id": currentUser.ownerId.toString()
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", email: "", password: "", role: "kasir" });
        toast.success(`User ${data.name} berhasil dibuat`, { id: loadingToast });
        fetchUsers();
      } else {
        toast.error(data.error || "Gagal membuat user", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem", { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDelete.userId) return;
    
    const loadingToast = toast.loading("Sedang menghapus user...");
    try {
      const res = await fetch(`/api/users/${confirmDelete.userId}`, {
        method: "DELETE",
        headers: { "x-owner-id": currentUser.ownerId.toString() }
      });
      const data = await res.json();
      
      if (res.ok) {
        setUsers(users.filter(u => u.id !== confirmDelete.userId));
        toast.success("User berhasil dihapus", { id: loadingToast });
      } else {
        toast.error(data.error || "Gagal menghapus user", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Gagal menghapus user", { id: loadingToast });
    } finally {
      setConfirmDelete({ open: false, userId: null });
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 text-premium">Manajemen User</h2>
            <p className="text-slate-500">Atur akses pengguna dan peran (Owner/Kasir)</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center space-x-2 py-3 px-6 shadow-lg shadow-indigo-100 cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-bold">Tambah User Baru</span>
          </button>
        </div>

        <div className="card border border-gray-300">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau email..."
              className="input-field pl-12 border border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[13px] font-black uppercase tracking-wider">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600" />
                      Memuat data user...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 italic">
                      <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      Tidak ada user ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100">
                            <Image
                              src={user.avatarImage || "/avatar.png"}
                              alt={user.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <span className="font-bold text-slate-700">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {user.email}
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          user.role === "owner" 
                            ? "bg-amber-100 text-amber-600 border border-amber-200" 
                            : "bg-indigo-100 text-indigo-600 border border-indigo-200"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {user.role !== "owner" && user.id !== currentUser?.id ? (
                          <button
                            onClick={() => setConfirmDelete({ open: true, userId: user.id })}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Hapus User"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="w-9 h-9" />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-[500px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 items-center flex justify-center">
                <h3 className="text-2xl font-bold text-slate-900">Tambah User Baru</h3>
              </div>
              
              <form onSubmit={handleCreateUser} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-3 text-slate-600 bg-slate-50 border border-gray-400 rounded-2xl"
                      placeholder="Nama User"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-3 text-slate-600 bg-slate-50 border border-gray-400 rounded-2xl"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password"
                    required
                    className="w-full px-4 py-3 text-slate-600 bg-slate-50 border border-gray-400 rounded-2xl"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Role (Peran)</label>
                  <div className="flex gap-2">
                    {["kasir", "owner"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData({...formData, role})}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-2xl font-bold border transition-all uppercase text-xs tracking-widest cursor-pointer",
                          formData.role === role 
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                            : "bg-slate-50 text-slate-400 border-gray-400 hover:bg-slate-100"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-500 border border-gray-400 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tambah User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, userId: null })}
        onConfirm={handleDeleteUser}
        title="Hapus User"
        message="Apa anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan."
      />
    </>
  );
}
