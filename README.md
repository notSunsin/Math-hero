# 🎓 MATH  HERO - Aplikasi Pembelajaran Interaktif

Aplikasi web pembelajaran matematika yang menyenangkan untuk anak SD kelas 1-3. Dilengkapi dengan sistem achievement, dashboard orang tua, dan database MongoDB untuk menyimpan progress siswa.

## ✨ Fitur Utama

### 👨‍🎓 Untuk Siswa
- **Mode Belajar (Mudah)**: Penjumlahan dengan visualisasi buah-buahan (10 soal)
- **Mode Sedang**: Pengurangan dengan konsep interaktif (10 soal)
- **Mode Tantangan**: Campuran penjumlahan & pengurangan dengan timer 20 detik (20 soal)
- **Sistem Achievement**: 4 badge yang dapat dikumpulkan (100, 250, 500, 1000 poin)
- **Tracking Progress**: Semua data tersimpan di database

### 👪 Untuk Orang Tua
- **Dashboard Monitoring**: Lihat statistik lengkap perkembangan anak
- **Riwayat Permainan**: Track berapa kali anak menyelesaikan setiap mode
- **Progress Achievement**: Lihat badge apa saja yang sudah didapat
- **Statistik Detail**: Akurasi jawaban dan performa per mode

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (dengan Mongoose ODM)
- **Deployment**: Vercel-ready

## 📁 Struktur Project

```
math-game-app/
├── config/
│   └── database.js          # Konfigurasi MongoDB
├── models/
│   └── Student.js           # Model data siswa
├── routes/
│   └── students.js          # API endpoints
├── public/
│   ├── css/
│   │   └── style.css        # Styling aplikasi
│   ├── js/
│   │   └── app.js           # Logic frontend
│   ├── images/              # Folder untuk gambar PNG (kosong)
│   └── index.html           # Halaman utama
├── .env.example             # Template environment variables
├── .gitignore              # Git ignore file
├── package.json            # Dependencies
├── server.js               # Main server file
├── vercel.json             # Konfigurasi Vercel
└── README.md               # Dokumentasi
```

## 🚀 Cara Install & Run Lokal

### Prerequisites
- Node.js (v14 atau lebih baru)
- MongoDB (lokal atau cloud)
- npm atau yarn

### Langkah-langkah

1. **Clone repository**
```bash
git clone https://github.com/username/math-game-app.git
cd math-game-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit file `.env` dan isi dengan data Anda:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mathgame
JWT_SECRET=your-secret-key-here
DEFAULT_PARENT_PIN=1234
PORT=3000
```

4. **Run server**
```bash
npm start
```

5. **Buka browser**
```
http://localhost:3000
```

## 🌐 Deploy ke Vercel

### Langkah Deploy

1. **Push ke GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/math-game-app.git
git push -u origin main
```

2. **Setup MongoDB Atlas**
- Buat akun di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Buat cluster baru (Free tier tersedia)
- Whitelist IP: `0.0.0.0/0` (untuk Vercel)
- Dapatkan connection string

3. **Deploy di Vercel**
- Login ke [Vercel](https://vercel.com)
- Import repository GitHub Anda
- Set Environment Variables:
  - `MONGODB_URI`: Connection string dari MongoDB Atlas
  - `JWT_SECRET`: Generate random string
  - `DEFAULT_PARENT_PIN`: 1234 (atau PIN pilihan Anda)

4. **Deploy!**
- Klik "Deploy"
- Tunggu hingga selesai
- Aplikasi siap diakses!

### Environment Variables di Vercel

Masuk ke **Project Settings** → **Environment Variables** dan tambahkan:

| Variable | Value | Description |
|----------|-------|-------------|
| MONGODB_URI | mongodb+srv://... | MongoDB connection string |
| JWT_SECRET | random-string-here | Secret key untuk JWT |
| DEFAULT_PARENT_PIN | 1234 | PIN default orang tua |

## 📊 API Documentation

### Student Endpoints

#### 1. Login/Register Student
```http
POST /api/students/login
Content-Type: application/json

{
  "name": "Budi"
}

Response:
{
  "success": true,
  "message": "Akun berhasil dibuat!",
  "student": {
    "id": "...",
    "name": "Budi",
    "totalPoints": 0,
    ...
  }
}
```

#### 2. Parent Login
```http
POST /api/students/parent-login
Content-Type: application/json

{
  "name": "Budi",
  "pin": "1234"
}
```

#### 3. Get Student Data
```http
GET /api/students/:id
```

#### 4. Save Game Result
```http
POST /api/students/:id/game-complete
Content-Type: application/json

{
  "mode": "easy",
  "score": 80,
  "correctAnswers": 8,
  "totalQuestions": 10
}
```

#### 5. Get Statistics
```http
GET /api/students/:id/statistics
```

## 🎨 Customisasi Gambar

### Mengganti Emoji dengan Gambar PNG

1. Siapkan gambar buah format PNG (ukuran 80x80px atau 100x100px)
2. Upload ke folder `public/images/`
3. Edit file `public/js/app.js`, cari baris:

```javascript
const fruits = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝'];
```

Ganti dengan:
```javascript
const fruits = [
    '<img src="/images/apple.png" style="width:80px; height:80px;">',
    '<img src="/images/orange.png" style="width:80px; height:80px;">',
    '<img src="/images/lemon.png" style="width:80px; height:80px;">',
    // ... tambahkan gambar lainnya
];
```

4. Ganti juga avatar dan icon di HTML sesuai kebutuhan

## 🔐 Keamanan

- PIN orang tua default: `1234`
- Untuk mengubah PIN, edit di database atau tambahkan fitur change PIN
- Untuk production, gunakan HTTPS
- Jangan commit file `.env` ke repository

## 🐛 Troubleshooting

### Database Connection Error
```
Error: MongoDB connection failed
```
**Solusi**: 
- Cek MongoDB URI di `.env`
- Pastikan IP sudah di-whitelist di MongoDB Atlas
- Cek koneksi internet

### Vercel Deployment Failed
**Solusi**:
- Cek logs di Vercel dashboard
- Pastikan semua environment variables sudah diset
- Cek `vercel.json` sudah benar

### CORS Error
**Solusi**:
- Sudah include CORS middleware di `server.js`
- Jika masih error, tambahkan origin specific:
```javascript
app.use(cors({
  origin: 'https://your-domain.vercel.app'
}));
```

## 📈 Roadmap & Future Features

- [ ] Tambah mode permainan: Perkalian & Pembagian
- [ ] Leaderboard antar siswa
- [ ] Export laporan PDF untuk orang tua
- [ ] Notifikasi email untuk orang tua
- [ ] Multiplayer challenge mode
- [ ] Voice-over untuk soal (text-to-speech)
- [ ] Animasi yang lebih rich
- [ ] Mobile app (React Native)

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:
1. Fork repository
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

MIT License - bebas digunakan untuk personal maupun komersial

## 👨‍💻 Author

Dibuat dengan ❤️ untuk membantu anak-anak belajar matematika dengan cara yang menyenangkan!

## 📞 Support

Jika ada pertanyaan atau masalah:
- Buka issue di GitHub
- Email: support@mathgame.com
- Documentation: https://docs.mathgame.com

---

**Happy Learning! 🎉📚✨**