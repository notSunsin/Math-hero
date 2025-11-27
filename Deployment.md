# 🚀 Deployment Guide - MATH HERO

Panduan lengkap untuk deploy aplikasi ke Vercel dengan MongoDB Atlas.

## 📋 Prerequisites

1. Akun GitHub (gratis)
2. Akun MongoDB Atlas (gratis)
3. Akun Vercel (gratis)

---

## 1️⃣ Setup MongoDB Atlas

### Step 1: Buat Akun & Cluster

1. Kunjungi [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Daftar dengan email atau Google account
3. Klik **"Build a Database"**
4. Pilih **"M0 FREE"** (Shared cluster)
5. Pilih **Provider**: AWS atau Google Cloud
6. Pilih **Region**: Singapore (atau terdekat)
7. Beri nama cluster: `MathGameCluster`
8. Klik **"Create Cluster"**

### Step 2: Setup Database Access

1. Klik **"Database Access"** di sidebar kiri
2. Klik **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `mathgameuser` (atau sesuai keinginan)
5. Password: Generate secure password atau buat sendiri
6. **SIMPAN USERNAME & PASSWORD INI!**
7. Database User Privileges: **"Read and write to any database"**
8. Klik **"Add User"**

### Step 3: Whitelist IP Address

1. Klik **"Network Access"** di sidebar kiri
2. Klik **"Add IP Address"**
3. Klik **"Allow Access from Anywhere"**
4. IP Address akan otomatis: `0.0.0.0/0`
5. Klik **"Confirm"**

⚠️ **Note**: `0.0.0.0/0` memperbolehkan akses dari IP manapun. Untuk production yang lebih secure, tambahkan IP Vercel secara spesifik.

### Step 4: Get Connection String

1. Klik **"Database"** di sidebar
2. Klik **"Connect"** pada cluster Anda
3. Pilih **"Connect your application"**
4. Driver: **Node.js**
5. Version: **4.1 or later**
6. Copy connection string:
```
mongodb+srv://mathgameuser:<password>@mathgamecluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
7. Ganti `<password>` dengan password user yang tadi dibuat
8. Tambahkan nama database setelah `.net/`: 
```
mongodb+srv://mathgameuser:yourpassword@mathgamecluster.xxxxx.mongodb.net/mathgame?retryWrites=true&w=majority
```

---

## 2️⃣ Setup GitHub Repository

### Step 1: Create Repository

```bash
# Di folder project Anda
git init
git add .
git commit -m "Initial commit - Math Game App"
```

### Step 2: Push to GitHub

1. Buka [GitHub](https://github.com) dan login
2. Klik **"New Repository"**
3. Repository name: `math-game-app`
4. Description: `Aplikasi pembelajaran matematika untuk anak SD`
5. Visibility: **Public** atau **Private**
6. **JANGAN** centang "Initialize with README" (sudah ada)
7. Klik **"Create Repository"**

8. Push code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/math-game-app.git
git branch -M main
git push -u origin main
```

---

## 3️⃣ Deploy ke Vercel

### Step 1: Import Project

1. Kunjungi [Vercel](https://vercel.com)
2. Login dengan GitHub
3. Klik **"Add New..."** → **"Project"**
4. Import repository `math-game-app`
5. Klik **"Import"**

### Step 2: Configure Project

1. **Framework Preset**: Other (atau pilih lain, tidak masalah)
2. **Root Directory**: `./`
3. **Build Command**: `npm install` (atau kosongkan)
4. **Output Directory**: kosongkan
5. **Install Command**: `npm install`

### Step 3: Environment Variables

Klik **"Environment Variables"** dan tambahkan:

| Name | Value |
|------|-------|
| MONGODB_URI | `mongodb+srv://mathgameuser:yourpassword@...` |
| JWT_SECRET | `your-random-secret-key-min-32-characters` |
| DEFAULT_PARENT_PIN | `1234` |

**Generate JWT_SECRET** (random string):
```bash
# Di terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy!

1. Klik **"Deploy"**
2. Tunggu proses deployment (2-3 menit)
3. Setelah selesai, klik **"Visit"**
4. Aplikasi sudah live! 🎉

URL default: `https://math-game-app-xxxxx.vercel.app`

---

## 4️⃣ Setup Custom Domain (Opsional)

### Jika punya domain sendiri:

1. Di Vercel dashboard, pilih project
2. Klik **"Settings"** → **"Domains"**
3. Tambahkan domain Anda: `mathgame.com`
4. Ikuti instruksi untuk setup DNS
5. Tunggu verifikasi (bisa 24-48 jam)

---

## 5️⃣ Testing Deployment

### Test 1: Homepage
```
https://your-app.vercel.app
```
Harus tampil halaman login ✅

### Test 2: API Health Check
```
https://your-app.vercel.app/api/health
```
Harus return JSON:
```json
{
  "success": true,
  "message": "Server is running!",
  "timestamp": "..."
}
```

### Test 3: Login Student
1. Masukkan nama: `Test User`
2. Klik "Mulai Belajar"
3. Harus berhasil masuk ke menu ✅

### Test 4: Play Game
1. Pilih "Mode Belajar"
2. Jawab beberapa soal
3. Selesaikan game
4. Cek apakah poin tersimpan ✅

---

## 6️⃣ Seed Database (Opsional)

Untuk testing dengan data sample:

### Local Testing:
```bash
# Pastikan .env sudah diisi
npm run seed
```

### Production Database:
1. Copy `MONGODB_URI` dari Vercel
2. Paste ke file `.env` lokal
3. Run:
```bash
node scripts/seed.js
```

Data sample akan ditambahkan:
- Budi Santoso (350 poin)
- Siti Nurhaliza (580 poin)
- Ahmad Rizki (150 poin)

PIN Orang Tua: `1234`

---

## 7️⃣ Monitoring & Maintenance

### View Logs
1. Vercel Dashboard → Project
2. Klik **"Deployments"**
3. Klik deployment terakhir
4. Klik **"View Function Logs"**

### Check Database
1. MongoDB Atlas → Database
2. Klik **"Browse Collections"**
3. Lihat collection `students`

### Redeploy
Jika ada perubahan:
```bash
git add .
git commit -m "Update feature"
git push
```
Vercel akan auto-deploy! 🚀

---

## 8️⃣ Troubleshooting

### ❌ Error: "Cannot connect to database"

**Solusi:**
1. Cek `MONGODB_URI` di Vercel Environment Variables
2. Pastikan password tidak ada karakter special yang perlu di-encode
3. Cek IP whitelist di MongoDB Atlas (`0.0.0.0/0`)

### ❌ Error: "API endpoint not found"

**Solusi:**
1. Cek `vercel.json` ada dan benar
2. Pastikan file `server.js` ada di root folder
3. Redeploy project

### ❌ Error: "Function execution timeout"

**Solusi:**
1. Free tier Vercel timeout 10 detik
2. Optimize query database
3. Atau upgrade ke Pro plan

### ❌ Page not loading correctly

**Solusi:**
1. Clear browser cache
2. Cek Console untuk error
3. Cek Network tab di DevTools
4. Pastikan API URL benar di `app.js`

---

## 9️⃣ Production Checklist

Sebelum go-live production:

- [ ] MongoDB cluster running
- [ ] Environment variables set di Vercel
- [ ] Custom domain configured (opsional)
- [ ] HTTPS enabled (default di Vercel)
- [ ] Test semua fitur
- [ ] Parent PIN diganti (bukan 1234)
- [ ] Error handling berfungsi
- [ ] Loading states tampil
- [ ] Mobile responsive checked
- [ ] Browser testing (Chrome, Safari, Firefox)
- [ ] Performance check (Google Lighthouse)

---

## 🎯 Next Steps

Setelah deploy berhasil:

1. **Share Link**: Bagikan ke user untuk testing
2. **Gather Feedback**: Kumpulkan feedback user
3. **Monitor Usage**: Cek logs dan database
4. **Add Features**: Implementasi feature baru
5. **Scale**: Jika traffic tinggi, upgrade Vercel plan

---

## 📞 Support

Jika ada masalah:

1. Check Vercel Docs: https://vercel.com/docs
2. MongoDB Atlas Docs: https://docs.atlas.mongodb.com
3. GitHub Issues: Create issue di repository
4. Vercel Community: https://vercel.com/community

---

**Selamat! Aplikasi Anda sudah live! 🎉🚀**

Share URL-nya dan bantu anak-anak belajar matematika! 📚✨