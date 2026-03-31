# File & Video Compression Frontend (React)

Ini adalah *frontend* antarmuka (User Interface) untuk aplikasi web kompresi media. Proyek ini dibangun dengan *stack* modern **React 19**, **TypeScript**, dan **Tailwind CSS v4** di atas ekosistem **Vite**.

Antarmukanya menggunakan desain *glassmorphism*, dark-mode *native*, dan memiliki fitur unggulan pemantauan *real-time* progress kompresi yang terhubung via API ke Laravel backend.

## 🛠️ Prasyarat / Requirements
1. **Node.js** (versi 18.x atau 20.x ke atas / disarankan LTS).
2. **NPM** atau **Yarn** atau **Bun** (sebagai package manager).

---

## ⚙️ Cara Instalasi & Menjalankan

### 1. Klon & Install Dependensi
Buka terminal dan arahkan ke folder `compression-web-fe` (tempat file ini berada), lalu install dependensi `package.json` yang paling utama (React, Tailwind, Axios, React Router Dom, dll):

```bash
cd compression-web-fe
npm install
```

### 2. Konfigurasi Environment (`.env`)
Buat file `.env` di direktori teratas (sejajar dengan `.gitignore` dan `package.json` milik `compression-web-fe`). 
Ketikkan variabel berikut agar frontend tahu di mana alamat Backend API Laravel berjalan:
```env
VITE_API_URL=http://localhost:8000/api
```
*(Format `VITE_` sangat spesifik oleh Vite agar variabel bisa dipakai di dalam kode sumber).*

### 3. Menjalankan Development Server
Untuk menjalankan mode pengembangan (Local Development):
```bash
npm run dev
```

Vite akan menampilkan output di terminal seperti:
```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Panggil alamat `http://localhost:5173` ke dalam Google Chrome / browser lainnya, dan kamu akan disajikan halaman Login aplikasi.

---

## 🗂️ Struktur Aplikasi
Beberapa folder penting yang perlu kamu ketahui jika ingin mengembangkan kode ke depannya:
- **`src/api/`** — Kumpulan fungsi untuk terintegrasi dengan REST API milik Backend (Otentikasi, Upload, Kompresi, *Compare*). Menggunakan Axios dan sistem interceptor bearer token.
- **`src/components/`** — Elemen visual kecil yang *reusable* (Kartu file/kompresi, *Layout App*, *Auth Guard*).
- **`src/pages/`** — Halaman utama (Login, Dashboard, Upload File, Detail Kompresi, form Konfigurasi, dan fitur *Compare*).
- **`src/index.css`** — Pusat variabel *glassmorphism* dan *utility class* custom miliki Tailwind v4 (di mana *import* tailwind berada).
- **`src/types/index.ts`** — Berisi definisi Tipe TypeScript lengkap milik data *File* & *Compression* agar tidak ada error di VS Code.
