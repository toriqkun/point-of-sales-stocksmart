# Blueprint: StockSmart - Smart SaaS POS & Analytics

## 1. Overview

**StockSmart** adalah platform SaaS *Point of Sales* (POS) dan manajemen inventaris yang mengintegrasikan algoritma Machine Learning (K-Means Clustering) untuk memberikan wawasan berbasis data kepada pemilik bisnis. Aplikasi ini dirancang untuk menyelesaikan masalah pencatatan manual, stok yang tidak terkontrol, serta ketidaktahuan pemilik bisnis mengenai produk mana yang paling memberikan kontribusi laba.

### Masalah yang Diselesaikan
- **Inakurasi Data**: Pencatatan manual rawan kesalahan hitung dan hilangnya nota fisik.
- **Blind Inventory**: Pemilik tidak tahu pasti stok mana yang harus segera ditambah atau dikurangi (*overstock*).
- **Decision Gap**: Tidak ada dasar objektif dalam menentukan prioritas pengadaan barang.
- **Data Isolation**: Sulitnya memantau performa bisnis secara periodik (harian/bulanan).

### Target User
- **Owner Bisnis (Tenant)**: Pengelola utama yang memantau performa keseluruhan.
- **Kasir (Employee)**: Operator lapangan yang memproses transaksi harian.

---

## 2. Fitur Utama & Spesifikasi Teknis

### 2.1 Manajemen Produk & Cloudinary Integration
**Status: Implementasi Selesai**

- **CRUD Operasi**: Tambah, Edit, dan Hapus produk dengan validasi stok.
- **Image Hosting**: Integrasi dengan Cloudinary untuk penyimpanan gambar produk yang ringan dan cepat.
- **Dynamic Search**: Pencarian produk instan berdasarkan nama.
- **Visual Status**: Indikator stok (Sisa Stok) dan label kategori hasil analisis AI.

### 2.2 Point of Sales (POS) & Real-time Stock
**Status: Implementasi Selesai**

- **Shopping Cart**: Antarmuka keranjang belanja yang intuitif.
- **Atomic Transactions**: Menggunakan Prisma `$transaction` untuk memastikan simpan data transaksi dan pengurangan stok terjadi secara bersamaan (mencegah *race condition*).
- **Stock Validation**: Sistem otomatis menolak penambahan produk ke keranjang jika stok fisik tidak mencukupi (0 atau kurang).

### 2.3 Thermal Receipt Printing (Thermal 58mm/80mm)
**Status: Implementasi Selesai (Fitur Unggulan)**

- **Format Khusus**: Layout khusus berbasis monospace (Courier New) untuk printer termal.
- **Auto-alignment**: Helper khusus untuk merapikan kolom Produk, Qty, dan Subtotal agar sejajar sempurna.
- **Multi-size Support**: Adaptif untuk lebar kertas 58mm (default) dan 80mm.
- **Reprint Function**: Kemampuan untuk mencetak ulang struk dari riwayat transaksi kapan saja.
- **Technical**: Menggunakan CSS `@media print` untuk menghilangkan elemen UI (tombol/navigasi) saat proses cetak berjalan.

### 2.4 Segmentasi AI (K-Means Clustering)
**Status: Implementasi Selesai (Core Feature)**

- **Data Driven**: Algoritma menganalisis data Quantity, Revenue, dan Frequency penjualan.
- **Autonomous Labeling**: Pengelompokan otomatis tanpa API pihak ketiga (Lokal & Gratis):
    - **High Priority**: Produk *Best Seller* dengan kontribusi besar.
    - **Medium Priority**: Produk stabil penopang bisnis.
    - **Low Priority**: Produk dengan performa rendah yang perlu dievaluasi.
- **Recalculation**: Owner dapat menjalankan ulang analisis kapan saja untuk mendapatkan data paling mutakhir.

### 2.5 Laporan Penjualan & Export Excel
**Status: Implementasi Selesai**

- **Date Range Filter**: Memungkinkan filtering transaksi berdasarkan periode tertentu.
- **ExcelJS Integration**: Ekspor data laporan lengkap ke file `.xlsx` dengan format mata uang Rupiah dan total otomatis.
- **Aggregated Stats**: Menampilkan total omzet akumulatif di akhir laporan.

### 2.6 Multi-Tenancy Architecture
- **Isolation by OwnerId**: Setiap data (Produk, Transaksi, Kasir) terikat pada `ownerId`.
- **Security Check**: API divalidasi dengan header `x-owner-id` dan verifikasi database untuk memastikan data tidak bocor antar tenant.

---

## 3. Arsitektur Teknis

### Stack Utama
- **Frontend**: Next.js 15+ (App Router), Tailwind CSS v4, Lucide Icons.
- **Backend**: Next.js Server Actions & API Routes.
- **Database**: PostgreSQL dengan Prisma ORM.
- **Client Processing**: K-Means clustering dilakukan di sisi server untuk performa dan keamanan.

### Struktur Data (Database Schema)
- **User**: Menyimpan data akun, role, dan nama bisnis.
- **Product**: Data inventaris, harga, stok, dan tag cluster hasil AI.
- **Transaction**: Header transaksi (total harga, tanggal).
- **TransactionItem**: Detail produk per transaksi (qty, subtotal).

---

## 4. Alur Penggunaan (User Flow)

1.  **Onboarding**: Owner mendaftar dan mengisi nama bisnis mereka.
2.  **Katalog**: Owner mengunggah produk dan mengatur stok awal.
3.  **Transaksi**: Kasir memproses pembelian, mencetak struk thermal, dan memberikan ke pelanggan.
4.  **Monitoring**: Owner memantau penjualan real-time di Dashboard.
5.  **Optimasi**: Owner menjalankan "Analisis K-Means" sebulan sekali untuk melihat produk mana yang harus dipasok lebih banyak.
6.  **Administrasi**: Owner mengunduh laporan bulanan dalam format Excel untuk keperluan pembukuan.

---

## 5. Roadmap

**v1.0 (Current)**
- [x] Multi-tenant Authentication.
- [x] POS & Stock Sync.
- [x] K-Means Clustering Core.
- [x] Thermal Print 58mm/80mm.
- [x] Excel Reporting.

**v1.5 (Planned)**
- [ ] QRIS & E-Wallet Integration.
- [ ] WhatsApp Notif for Daily Report.
- [ ] Supplier & Purchase Order Management.

---

**StockSmart** - *Empowering small businesses with smart data insights.*