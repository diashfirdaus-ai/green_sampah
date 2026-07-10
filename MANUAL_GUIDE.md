# PANDUAN DEPLOY KE VERCEL
## Ekosistem Aplikasi Daur Ulang Mandiri "GreenSampah"

Dokumen ini berisi panduan lengkap langkah demi langkah untuk mendeploy aplikasi **GreenSampah** (Backend Express.js & Frontend Statis) ke platform cloud **Vercel**.

---

## 1. Persiapan Sebelum Deploy

Pastikan Anda memiliki hal-hal berikut:
1. Akun [Vercel](https://vercel.com/) (gratis untuk tier Hobby).
2. [Node.js](https://nodejs.org/) terinstal di komputer lokal Anda.
3. Git terinstal (jika ingin menggunakan integrasi GitHub/GitLab).

---

## 2. Struktur Konfigurasi Vercel

Aplikasi ini menggunakan struktur gabungan antara Express.js sebagai API dan folder `public` sebagai aset frontend statis. File konfigurasi utama untuk deploy adalah `vercel.json`.

Berikut adalah isi dari `vercel.json` yang sudah terkonfigurasi di proyek Anda:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server.js"
    }
  ]
}
```

### Penjelasan Konfigurasi:
* **Zero-Config Deployment**: Kita menghapus bagian `builds` legacy agar Vercel secara otomatis mendeteksi folder `public` di root proyek dan menyajikan semua aset statis (HTML, CSS, JS, Gambar) menggunakan CDN Vercel dengan performa maksimal.
* **`rewrites`**: Mengarahkan semua request API (yang diawali dengan `/api/`) ke serverless function `server.js` di root, sehingga backend Node.js + Express Anda tetap dapat menghandle API request secara dinamis.


---

## 3. Cara Deploy ke Vercel

Ada dua metode utama yang bisa Anda gunakan untuk mendeploy proyek ini ke Vercel:

### Metode A: Menggunakan Vercel CLI (Paling Cepat untuk Uji Coba)

Jika Anda ingin mendeploy langsung dari komputer lokal Anda tanpa melalui GitHub, ikuti langkah-langkah berikut:

1. **Instal Vercel CLI** secara global melalui terminal/command prompt:
   ```bash
   npm install -g vercel
   ```

2. **Masuk (Login) ke Akun Vercel**:
   ```bash
   vercel login
   ```
   *Ikuti instruksi di layar untuk login via browser (menggunakan email, GitHub, atau Google).*

3. **Inisialisasi & Deploy Proyek**:
   Jalankan perintah berikut di direktori utama proyek (`green_Sampah`):
   ```bash
   vercel
   ```
   * Vercel CLI akan menanyakan beberapa hal:
     * *Set up and deploy?* `yes`
     * *Which scope?* Pilih akun/tim Anda.
     * *Link to existing project?* `no` (jika ini pertama kali).
     * *What's your project's name?* Tekan Enter untuk menggunakan nama default (`green-sampah`) atau ketik nama baru.
     * *In which directory is your code located?* `./` (Tekan Enter).
     * *Want to modify these settings?* `no` (Vercel akan otomatis mendeteksi konfigurasi berdasarkan `vercel.json`).

4. **Deploy ke Production**:
   Setelah deploy pertama selesai dan berhasil (biasanya statusnya *Preview*), Anda dapat meluncurkannya ke URL produksi menggunakan perintah:
   ```bash
   vercel --prod
   ```

---

### Metode B: Integrasi Git/GitHub (Sangat Direkomendasikan untuk CI/CD)

Metode ini paling ideal karena setiap kali Anda melakukan `git push` ke repositori Anda, Vercel akan otomatis melakukan build dan deploy ulang.

1. **Buat Repositori Baru** di GitHub/GitLab/Bitbucket dan push kode Anda ke sana:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   git branch -M main
   git remote add origin <URL-REPOSI-ANDA>
   git push -u origin main
   ```

2. **Hubungkan ke Vercel**:
   * Buka [Vercel Dashboard](https://vercel.com/dashboard).
   * Klik tombol **"Add New..."** lalu pilih **"Project"**.
   * Cari repositori GitHub Anda dan klik **"Import"**.

3. **Konfigurasi Project**:
   * **Framework Preset**: Biarkan **Other** (karena kita mendefinisikan build custom di `vercel.json`).
   * **Root Directory**: `./` (default).
   * **Environment Variables**: Jika Anda memiliki konfigurasi khusus (misalnya API key), tambahkan di sini.
   * Klik **"Deploy"**.

4. **Selesai!** Vercel akan memproses dan memberikan domain gratis berakhiran `.vercel.app`.

---

## 4. PENTING: Keterbatasan Database Lokal di Vercel (Serverless)

> [!WARNING]
> **Penyimpanan File Lokal (`database.json`) Bersifat Sementara (Ephemeral)**
> 
> Saat ini, backend Anda (`server.js`) membaca dan menulis data ke file lokal `database.json` menggunakan modul `fs`. 
> 
> Di lingkungan serverless seperti Vercel:
> 1. **Read-Only File System**: Menulis data secara dinamis ke disk lokal (`fs.writeFileSync`) pada runtime sering kali gagal atau dibatasi.
> 2. **Stateless Container**: Serverless functions akan mati secara otomatis setelah beberapa menit tidak ada aktivitas. Ketika fungsi aktif kembali (cold start), data di `database.json` akan kembali ke nilai awal (reset) dan semua data yang baru ditulis akan hilang.

### Solusi untuk Produksi:
Untuk memastikan data statistik GreenSampah (stok maggot, BioCNG, pendapatan, dll.) tersimpan secara permanen dan tidak terhapus:
* **Gunakan Database Eksternal**: Ubah `server.js` agar membaca dan menulis ke cloud database seperti **MongoDB Atlas**, **Supabase (PostgreSQL)**, atau **Vercel KV (Redis)**.
* **Gunakan ORM/Driver**: Ganti fungsi `readDB()` dan `writeDB()` dengan query database sesungguhnya (menggunakan Mongoose, Prisma, atau `@vercel/kv`).
