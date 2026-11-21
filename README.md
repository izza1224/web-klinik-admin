# 🏥 Homecareku - Admin Panel & Content Management System (CMS)

Dashboard administratif berbasis web untuk mengelola seluruh konten, layanan medis, profil tenaga medis, sertifikasi legalitas, testimoni pasien, serta pengaturan operasional website **Homecareku** secara dinamis menggunakan **Firebase Cloud Firestore**.

---

## 🌟 Fitur Utama

- **🩺 Manajemen Layanan Medis**
  - Mengubah gambar, judul layanan, deskripsi tindakan medis, dan badge kategori.
  - Menambah layanan medis baru dengan pratinjau instan.
- **👩‍⚕️ Profil Perawat & Tentang Kami**
  - Mengubah foto profil perawat penanggung jawab (dengan preview langsung).
  - Mengatur tahun pengalaman medis (`8+ Tahun`).
  - Mengubah nama lengkap dan gelar perawat.
  - Mengubah jabatan dan teks legalitas resmi (STR & SIPP aktif).
  - Mengedit judul narasi (*"Sentuhan Medis Humanis..."*), bio/deskripsi, 4 poin kualifikasi klinis, dan kutipan filosofi pelayanan.
- **📜 Sertifikasi & Legalitas Medis**
  - Menambah kartu sertifikasi baru, memperbarui nomor registrasi Kemenkes/Dinkes, masa berlaku, dan deskripsi dokumen.
  - Fitur hapus sertifikat jika sudah tidak berlaku.
- **⭐ Manajemen Testimoni Pasien (WhatsApp)**
  - Menginput testimoni pasien yang diperoleh dari percakapan WhatsApp.
  - Menentukan nama pasien, status/keluarga, rating bintang (1–5), jenis layanan, dan kutipan ulasan untuk otomatis tampil di running text website.
- **📍 Kontak, Lokasi & Jam Pelayanan**
  - Memperbarui alamat klinik dan tautan Google Maps.
  - Mengatur nomor WhatsApp klinik (otomatis mengupdate semua tombol WhatsApp di website pengunjung).
  - Mengatur jam operasional klinik (Hari Kerja & Akhir Pekan) serta siaga Home Care 24 Jam.
  - Mengatur link media sosial (Instagram & Facebook). *Jika link Facebook dikosongkan, tombol di web pengunjung otomatis dinonaktifkan (disabled).*
- **🔥 Integrasi & Bantuan Firebase (Anti-Kadaluwarsa)**
  - Pengaturan Firebase Client Config langsung dari antarmuka web admin.
  - Tombol 1-Klik **"Upload Data Default ke DB"** untuk menginisialisasi database dari nol dalam 1 detik.
  - Panduan aturan keamanan Firestore permanen (*never expires*).

---

## 🛠️ Teknologi yang Digunakan

- **Framework:** [Next.js](https://nextjs.org/) (App Router & Turbopack)
- **UI Library:** [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Panduan Menjalankan di Komputer Lokal

1. **Masuk ke folder `web-admin`:**
   ```bash
   cd web-admin
   ```

2. **Instal seluruh dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan server pengembangan (Development):**
   ```bash
   npm run dev
   ```
   Admin panel akan berjalan di:
   👉 **`http://localhost:3001`** *(port 3001 agar tidak bentrok dengan web pengunjung di port 3000)*

---

## 🔐 Aturan Keamanan Firebase Firestore (Anti-Expired Selamanya)

Secara default, Firebase Test Mode akan kadaluwarsa setelah 7 atau 30 hari. Agar database aktif selamanya:

1. Buka [Firebase Console](https://console.firebase.google.com/) -> Masuk ke proyek Anda.
2. Buka **Firestore Database** -> Tab **Rules**.
3. Masukkan aturan permanen berikut, lalu klik **Publish**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 📂 Struktur Direktori

```text
web-admin/
├── public/
│   └── logo.png              # Logo brand Homecareku
├── src/
│   ├── app/
│   │   ├── globals.css       # Tailwind v4 tema dark admin
│   │   ├── layout.tsx        # Root layout admin panel
│   │   └── page.tsx          # Dashboard admin lengkap (tabbed CMS)
│   └── lib/
│       ├── cms-service.ts    # Service query & simpan ke Firestore
│       ├── default-data.ts   # Skema tipe data & data awal fallback
│       └── firebase.ts       # Inisialisasi Firebase App & Firestore
├── next.config.ts            # Konfigurasi Turbopack & Tailwind
├── package.json              # Dependensi & script port 3001
├── tsconfig.json             # Konfigurasi TypeScript Next.js
└── README.md                 # Dokumentasi proyek admin
```

---

## 👤 Pengembang & Kepemilikan

- **Repository:** `https://github.com/izza1224/web-klinik-admin`
- **Owner:** [izza1224](https://github.com/izza1224)
- **Proyek:** Homecareku Medical Clinic & Home Care
