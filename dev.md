# 👨‍💻 Developer Documentation

Dokumentasi untuk developer yang ingin mengembangkan atau memodifikasi aplikasi.

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Reference](#api-reference)
4. [Frontend Structure](#frontend-structure)
5. [Adding New Features](#adding-new-features)
6. [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│                   HTML + CSS + JS                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │
┌────────────────────▼────────────────────────────────────┐
│                 Express Server                           │
│              (Node.js + Express)                         │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   Routes    │  │  Controllers │  │    Models     │ │
│  │ (API Layer) │→ │   (Logic)    │→ │  (Mongoose)   │ │
│  └─────────────┘  └──────────────┘  └───────┬───────┘ │
└──────────────────────────────────────────────┼─────────┘
                                                │
                                                │
                                    ┌───────────▼──────────┐
                                    │   MongoDB Atlas      │
                                    │  (Cloud Database)    │
                                    └──────────────────────┘
```

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), CSS3, HTML5
- **Backend**: Node.js 14+, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Vercel (Serverless)
- **Environment**: dotenv for config

---

## 🗄️ Database Schema

### Student Model

```javascript
{
  _id: ObjectId,                    // Auto-generated
  name: String,                     // Required, 2-50 chars
  totalPoints: Number,              // Default: 0
  easyCompleted: Number,            // Default: 0
  mediumCompleted: Number,          // Default: 0
  challengeCompleted: Number,       // Default: 0
  achievements: [
    {
      badgeId: String,              // e.g., "badge100"
      unlockedAt: Date              // Default: now
    }
  ],
  gameHistory: [
    {
      mode: String,                 // "easy", "medium", "challenge"
      score: Number,                // Points earned
      correctAnswers: Number,       // Number of correct answers
      totalQuestions: Number,       // Total questions in game
      playedAt: Date                // Default: now
    }
  ],
  parentPin: String,                // Default: "1234"
  createdAt: Date,                  // Auto-generated
  lastPlayed: Date,                 // Default: now
  updatedAt: Date                   // Auto-generated
}
```

### Indexes

```javascript
// For faster lookups
studentSchema.index({ name: 1 });
```

### Virtuals

```javascript
// Computed field (not stored in DB)
totalGamesPlayed: easyCompleted + mediumCompleted + challengeCompleted
```

---

## 🔌 API Reference

### Base URL
```
Local: http://localhost:3000/api
Production: https://your-app.vercel.app/api
```

### Endpoints

#### 1. Health Check
```http
GET /api/health

Response 200:
{
  "success": true,
  "message": "Server is running!",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

#### 2. Student Login/Register
```http
POST /api/students/login
Content-Type: application/json

Body:
{
  "name": "Budi Santoso"
}

Response 200:
{
  "success": true,
  "message": "Akun berhasil dibuat!" | "Selamat datang kembali!",
  "student": {
    "id": "65abc...",
    "name": "Budi Santoso",
    "totalPoints": 0,
    "easyCompleted": 0,
    "mediumCompleted": 0,
    "challengeCompleted": 0,
    "achievements": [],
    "totalGamesPlayed": 0
  }
}

Error 400:
{
  "success": false,
  "message": "Nama minimal 2 karakter"
}
```

#### 3. Parent Login
```http
POST /api/students/parent-login
Content-Type: application/json

Body:
{
  "name": "Budi Santoso",
  "pin": "1234"
}

Response 200:
{
  "success": true,
  "student": {
    "id": "65abc...",
    "name": "Budi Santoso",
    "totalPoints": 350,
    "easyCompleted": 5,
    "mediumCompleted": 3,
    "challengeCompleted": 2,
    "achievements": [...],
    "gameHistory": [...],
    "totalGamesPlayed": 10,
    "lastPlayed": "2024-01-20T10:00:00.000Z"
  }
}

Error 401:
{
  "success": false,
  "message": "PIN salah!"
}

Error 404:
{
  "success": false,
  "message": "Data siswa tidak ditemukan"
}
```

#### 4. Get Student by ID
```http
GET /api/students/:id

Response 200:
{
  "success": true,
  "student": { ... }
}

Error 404:
{
  "success": false,
  "message": "Siswa tidak ditemukan"
}
```

#### 5. Complete Game
```http
POST /api/students/:id/game-complete
Content-Type: application/json

Body:
{
  "mode": "easy" | "medium" | "challenge",
  "score": 80,
  "correctAnswers": 8,
  "totalQuestions": 10
}

Response 200:
{
  "success": true,
  "message": "Game berhasil disimpan!",
  "student": { ... },
  "newAchievements": ["badge100", "badge250"]  // If any unlocked
}

Error 400:
{
  "success": false,
  "message": "Data game tidak lengkap"
}
```

#### 6. Get Statistics
```http
GET /api/students/:id/statistics

Response 200:
{
  "success": true,
  "statistics": {
    "totalPoints": 350,
    "totalGames": 10,
    "accuracy": 85,  // Percentage
    "totalCorrect": 85,
    "totalQuestions": 100,
    "easyStats": {
      "gamesPlayed": 5,
      "averageScore": 82
    },
    "mediumStats": {
      "gamesPlayed": 3,
      "averageScore": 75
    },
    "challengeStats": {
      "gamesPlayed": 2,
      "averageScore": 140
    },
    "recentGames": [...]  // Last 5 games
  }
}
```

---

## 🎨 Frontend Structure

### File Organization

```
public/
├── css/
│   └── style.css          # All styles
├── js/
│   └── app.js             # Main application logic
├── images/                # Put PNG images here
└── index.html             # Main HTML file
```

### Key JavaScript Functions

#### State Management
```javascript
let currentUser = null;        // Current logged in user
let currentMode = null;        // Current game mode
let gameQuestions = [];        // Array of question objects
let gameScore = 0;             // Current game score
let correctAnswers = 0;        // Number of correct answers
```

#### Core Functions
```javascript
// API Communication
apiCall(endpoint, method, data)

// Authentication
loginStudent()
loginParent()
logout()

// Screen Navigation
showMainMenu()
showParentDashboard()
showAchievements()

// Game Logic
startGame(mode)
generateQuestions(mode, count)
showQuestion()
checkAnswer(selected, correct, button)
endGame()

// UI Effects
showLoading(message)
hideLoading()
showAlert(message, type)
createConfetti()
```

---

## ➕ Adding New Features

### Example 1: Add New Game Mode (Multiplication)

#### Step 1: Update Model
```javascript
// models/Student.js
// Add new field
multiplicationCompleted: {
  type: Number,
  default: 0
}
```

#### Step 2: Update Frontend
```javascript
// public/js/app.js

// Add generation function
function generateMultiplicationQuestion() {
  const num1 = Math.floor(Math.random() * 5) + 1;  // 1-5
  const num2 = Math.floor(Math.random() * 5) + 1;  // 1-5
  const correctAnswer = num1 * num2;
  
  return {
    type: 'multiplication',
    num1: num1,
    num2: num2,
    correctAnswer: correctAnswer,
    answers: generateAnswers(correctAnswer)
  };
}

// Update question display
if (question.type === 'multiplication') {
  questionText.textContent = `${question.num1} × ${question.num2} = ?`;
  // Display visual representation
}
```

#### Step 3: Add Menu Card
```html
<!-- public/index.html -->
<div class="menu-card" onclick="startGame('multiplication')">
  <div class="menu-icon">✖️</div>
  <h3>Mode Perkalian</h3>
  <p>Belajar perkalian dasar!</p>
  <span class="difficulty-badge badge-hard">Sulit</span>
</div>
```

#### Step 4: Update API
```javascript
// routes/students.js
// Mode counter update already handled by dynamic field update
// Just make sure frontend sends correct mode name
```

### Example 2: Add Leaderboard

#### Step 1: Create New Route
```javascript
// routes/students.js

router.get('/leaderboard', async (req, res) => {
  try {
    const topStudents = await Student.find()
      .sort({ totalPoints: -1 })
      .limit(10)
      .select('name totalPoints achievements');
    
    res.json({
      success: true,
      leaderboard: topStudents
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching leaderboard' 
    });
  }
});
```

#### Step 2: Create Frontend UI
```javascript
// public/js/app.js

async function showLeaderboard() {
  showLoading('Memuat leaderboard...');
  
  try {
    const result = await apiCall('/students/leaderboard');
    
    if (result.success) {
      // Display leaderboard
      const leaderboardHTML = result.leaderboard.map((student, index) => `
        <div class="leaderboard-item">
          <span class="rank">${index + 1}</span>
          <span class="name">${student.name}</span>
          <span class="points">${student.totalPoints}</span>
        </div>
      `).join('');
      
      // Show in modal or new screen
    }
  } catch (error) {
    showAlert('Gagal memuat leaderboard', 'error');
  } finally {
    hideLoading();
  }
}
```

### Example 3: Add Email Notifications

#### Step 1: Install Nodemailer
```bash
npm install nodemailer
```

#### Step 2: Create Email Service
```javascript
// services/emailService.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendAchievementEmail(parentEmail, studentName, achievement) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: parentEmail,
    subject: `${studentName} mendapat achievement baru!`,
    html: `
      <h1>Selamat!</h1>
      <p>${studentName} baru saja mendapat badge: ${achievement.name}!</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
}

module.exports = { sendAchievementEmail };
```

#### Step 3: Update Student Model
```javascript
// models/Student.js

parentEmail: {
  type: String,
  lowercase: true,
  trim: true,
  validate: {
    validator: function(v) {
      return /^\S+@\S+\.\S+$/.test(v);
    },
    message: 'Email tidak valid'
  }
}
```

---

## ✅ Best Practices

### Code Style

1. **Use consistent naming**
   ```javascript
   // Good
   const studentData = await fetchStudent();
   
   // Bad
   const sd = await fetchStudent();
   ```

2. **Add comments for complex logic**
   ```javascript
   // Calculate accuracy percentage with rounding
   const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
   ```

3. **Error handling everywhere**
   ```javascript
   try {
     const result = await apiCall('/endpoint');
     // Handle success
   } catch (error) {
     console.error('Error:', error);
     showAlert('Terjadi kesalahan', 'error');
   }
   ```

### Database

1. **Always validate input**
   ```javascript
   if (!name || name.trim().length < 2) {
     return res.status(400).json({ message: 'Nama minimal 2 karakter' });
   }
   ```

2. **Use indexes for frequently queried fields**
   ```javascript
   studentSchema.index({ name: 1 });
   ```

3. **Limit query results**
   ```javascript
   const recentGames = student.gameHistory
     .sort((a, b) => b.playedAt - a.playedAt)
     .slice(0, 10);
   ```

### Security

1. **Never expose sensitive data**
   ```javascript
   // Good - select specific fields
   const student = await Student.findById(id).select('name totalPoints');
   
   // Bad - exposes everything including pins
   const student = await Student.findById(id);
   ```

2. **Validate all inputs**
   ```javascript
   const { name, pin } = req.body;
   if (!name || !pin) {
     return res.status(400).json({ message: 'Data tidak lengkap' });
   }
   ```

3. **Use environment variables**
   ```javascript
   // Good
   const pin = process.env.DEFAULT_PARENT_PIN;
   
   // Bad
   const pin = "1234"; // Hardcoded
   ```

### Performance

1. **Minimize database calls**
   ```javascript
   // Good - one call
   const student = await Student.findById(id);
   
   // Bad - multiple calls in loop
   for (let id of ids) {
     const student = await Student.findById(id);
   }
   ```

2. **Use loading states**
   ```javascript
   showLoading('Memproses...');
   try {
     await slowOperation();
   } finally {
     hideLoading();  // Always hide, even on error
   }
   ```

3. **Cache when possible**
   ```javascript
   // Store in variable instead of querying repeatedly
   const achievements = getAchievements();
   ```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Student can login
- [ ] Student can play all game modes
- [ ] Points are saved correctly
- [ ] Achievements unlock properly
- [ ] Parent can login with correct PIN
- [ ] Parent can see statistics
- [ ] Timer works in challenge mode
- [ ] Confetti shows on correct answer
- [ ] Responsive on mobile
- [ ] Works on different browsers

### API Testing with cURL

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Student login
curl -X POST https://your-app.vercel.app/api/students/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User"}'

# Complete game
curl -X POST https://your-app.vercel.app/api/students/STUDENT_ID/game-complete \
  -H "Content-Type: application/json" \
  -d '{"mode":"easy","score":80,"correctAnswers":8,"totalQuestions":10}'
```

---

## 📖 Further Reading

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)
- [Vercel Documentation](https://vercel.com/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Happy Coding! 💻✨**