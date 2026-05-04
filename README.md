#  StockSmart - Smart SaaS POS & Stock Management

**StockSmart** adalah aplikasi SaaS Point of Sales (POS) modern yang dirancang untuk membantu pemilik bisnis mengelola inventaris secara cerdas dan otomatis. Dengan integrasi algoritma Machine Learning lokal, StockSmart tidak hanya mencatat transaksi, tetapi juga memberikan wawasan mendalam tentang performa produk Anda.

---

##  Fitur Utama

-   ** Point of Sales (POS) Modern**: Antarmuka kasir yang cepat dengan pengurangan stok otomatis secara real-time.
-   ** Multi-Tenancy System**: Mendukung banyak pemilik bisnis (Owner). Data antar tenant terisolasi secara aman dan privat.
-   ** Manajemen Produk (CRUD)**: Kelola data produk, harga, kategori, dan gambar produk melalui integrasi Cloudinary.
-   ** Dashboard Analitik**: Visualisasi grafik penjualan harian/bulanan, tren produk terlaris, dan distribusi segmentasi produk.
-   ** K-Means Clustering (AI)**: Fitur unggulan yang mengelompokkan produk secara otomatis menjadi kategori **High**, **Medium**, dan **Low Priority** berdasarkan data historis penjualan.
-   ** Laporan Export Excel**: Unduh laporan penjualan periodik langsung ke format `.xlsx` yang rapi dan siap audit.
-   ** Filter Laporan Cerdas**: Pantau performa bisnis berdasarkan rentang tanggal yang fleksibel.
-   ** Thermal Receipt Printing**: Sistem cetak struk khusus printer thermal (58mm/80mm) dengan layout yang presisi, hemat kertas, dan profesional.
-   ** Smart Restock Alerts**: Peringatan otomatis untuk produk dengan stok menipis, diprioritaskan berdasarkan kategori hasil analisis AI.

---

## 🖥️ Overview Halaman

-   **Landing Page**: Halaman depan komersial yang modern, elegan, dan informatif.
-   **Auth (Login/Register)**: Sistem autentikasi aman untuk Owner dan Kasir.
-   **Dashboard**: Ringkasan performa bisnis, statistik penjualan, dan segmentasi K-Means.
-   **Produk**: Daftar inventaris lengkap dengan fitur tambah, edit, dan hapus.
-   **Transaksi (POS)**: Halaman operasional kasir untuk memproses pesanan.
-   **Laporan**: Riwayat transaksi lengkap dengan fitur filter, reprint struk, dan ekspor data.
-   **Print Page**: Halaman khusus layout struk thermal yang teraktivasi saat proses cetak.

---

## 🛠️ Tech Stack

### Frontend & Backend
-   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4
-   **Icons**: Lucide React
-   **Graphs**: Chart.js & React-Chartjs-2
-   **Notifications**: React Hot Toast

### Database & ORM
-   **Database**: PostgreSQL (Support Neon/Supabase/ElephantSQL)
-   **ORM**: [Prisma](https://www.prisma.io/)

### Library Lainnya
-   **File Export**: ExcelJS
-   **Image Hosting**: Cloudinary API
-   **Date Formatting**: Date-fns

---

##  Struktur Project

```text
StockSmart/
├── prisma/             # Skema database dan file migrasi
├── public/             # Asset statis (images, svgs, mockup)
├── src/
│   ├── app/            # Next.js App Router (Routes & API)
│   │   ├── admin/      # Halaman utama dashboard & manajemen
│   │   ├── api/        # Backend API Endpoints
│   │   ├── auth/       # Halaman Login & Register
│   │   └── print/      # Layout khusus struk thermal
│   ├── components/     # Reusable UI Components
│   ├── lib/            # Utilitas (Prisma, K-Means logic, Cloudinary)
│   └── actions/        # Server Actions untuk data fetching
├── .env                # Konfigurasi Environment Variables
└── next.config.ts      # Konfigurasi Next.js
```

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| **POST** | `/api/login` | Autentikasi user |
| **POST** | `/api/register` | Pendaftaran user baru (Owner) |
| **GET** | `/api/products` | Ambil semua produk tenant |
| **POST** | `/api/products` | Tambah produk baru |
| **GET** | `/api/transactions` | Riwayat transaksi |
| **POST** | `/api/transactions` | Simpan transaksi baru & potong stok |
| **GET** | `/api/print/[id]` | Ambil detail struk berdasarkan ID |
| **POST** | `/api/analysis` | Jalankan algoritma K-Means Clustering |
| **GET** | `/api/dashboard` | Ambil data statistik dashboard |

---

##  Cara Menjalankan Secara Lokal

1.  **Clone Repository**
    ```bash
    git clone https://github.com/username/StockSmart.git
    cd StockSmart
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Buat file `.env` di root direktori dan isi variabel berikut:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/stocksmart"
    CLOUDINARY_CLOUD_NAME="your_cloud_name"
    CLOUDINARY_API_KEY="your_api_key"
    CLOUDINARY_API_SECRET="your_api_secret"
    ```

4.  **Database Migration**
    ```bash
    npx prisma migrate dev --name init
    npx prisma generate
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

##  Future Improvements
- [ ] Integrasi Pembayaran Digital (QRIS/E-Wallet).
- [ ] Sistem manajemen Supplier.
- [ ] Role Management yang lebih granular.
- [ ] Notifikasi WhatsApp untuk laporan otomatis harian.

---
**StockSmart** - *Empowering small businesses with smart data insights.*
