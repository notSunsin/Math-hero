const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// @route   POST /api/students/login
// @desc    Login atau register student
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nama minimal 2 karakter' 
      });
    }

    // Cari student atau buat baru
    let student = await Student.findOne({ name: name.trim() });
    
    if (!student) {
      student = await Student.create({ name: name.trim() });
    }

    res.json({
      success: true,
      message: student.createdAt === student.updatedAt ? 'Akun berhasil dibuat!' : 'Selamat datang kembali!',
      student: {
        id: student._id,
        name: student.name,
        totalPoints: student.totalPoints,
        easyCompleted: student.easyCompleted,
        mediumCompleted: student.mediumCompleted,
        challengeCompleted: student.challengeCompleted,
        achievements: student.achievements,
        totalGamesPlayed: student.totalGamesPlayed
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
});

// @route   POST /api/students/parent-login
// @desc    Login untuk parent
// @access  Public
router.post('/parent-login', async (req, res) => {
  try {
    const { name, pin } = req.body;

    if (!name || !pin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nama dan PIN wajib diisi' 
      });
    }

    const student = await Student.findOne({ name: name.trim() });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Data siswa tidak ditemukan' 
      });
    }

    // Verifikasi PIN (default: 1234)
    if (pin !== student.parentPin) {
      return res.status(401).json({ 
        success: false, 
        message: 'PIN salah!' 
      });
    }

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        totalPoints: student.totalPoints,
        easyCompleted: student.easyCompleted,
        mediumCompleted: student.mediumCompleted,
        challengeCompleted: student.challengeCompleted,
        achievements: student.achievements,
        gameHistory: student.gameHistory.sort((a, b) => b.playedAt - a.playedAt).slice(0, 10),
        totalGamesPlayed: student.totalGamesPlayed,
        lastPlayed: student.lastPlayed
      }
    });
  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Siswa tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        totalPoints: student.totalPoints,
        easyCompleted: student.easyCompleted,
        mediumCompleted: student.mediumCompleted,
        challengeCompleted: student.challengeCompleted,
        achievements: student.achievements,
        totalGamesPlayed: student.totalGamesPlayed
      }
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
});

// @route   POST /api/students/:id/game-complete
// @desc    Save game completion
// @access  Public
router.post('/:id/game-complete', async (req, res) => {
  try {
    const { mode, score, correctAnswers, totalQuestions } = req.body;

    if (!mode || score === undefined || !correctAnswers || !totalQuestions) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data game tidak lengkap' 
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Siswa tidak ditemukan' 
      });
    }

    // Add points
    await student.addPoints(score);

    // Add game history
    await student.addGameHistory({
      mode,
      score,
      correctAnswers,
      totalQuestions
    });

    // Check and unlock achievements
    const achievements = [
      { id: 'badge100', points: 100 },
      { id: 'badge250', points: 250 },
      { id: 'badge500', points: 500 },
      { id: 'badge1000', points: 1000 }
    ];

    const newAchievements = [];
    for (const ach of achievements) {
      if (student.totalPoints >= ach.points) {
        const exists = student.achievements.find(a => a.badgeId === ach.id);
        if (!exists) {
          await student.unlockAchievement(ach.id);
          newAchievements.push(ach.id);
        }
      }
    }

    res.json({
      success: true,
      message: 'Game berhasil disimpan!',
      student: {
        id: student._id,
        name: student.name,
        totalPoints: student.totalPoints,
        easyCompleted: student.easyCompleted,
        mediumCompleted: student.mediumCompleted,
        challengeCompleted: student.challengeCompleted,
        achievements: student.achievements
      },
      newAchievements
    });
  } catch (error) {
    console.error('Game complete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
});

// @route   GET /api/students/:id/statistics
// @desc    Get detailed statistics
// @access  Public
router.get('/:id/statistics', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Siswa tidak ditemukan' 
      });
    }

    // Calculate statistics
    const totalGames = student.gameHistory.length;
    const totalCorrect = student.gameHistory.reduce((sum, game) => sum + game.correctAnswers, 0);
    const totalQuestions = student.gameHistory.reduce((sum, game) => sum + game.totalQuestions, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Mode-specific stats
    const easyGames = student.gameHistory.filter(g => g.mode === 'easy');
    const mediumGames = student.gameHistory.filter(g => g.mode === 'medium');
    const challengeGames = student.gameHistory.filter(g => g.mode === 'challenge');

    const stats = {
      totalPoints: student.totalPoints,
      totalGames,
      accuracy,
      totalCorrect,
      totalQuestions,
      easyStats: {
        gamesPlayed: easyGames.length,
        averageScore: easyGames.length > 0 ? Math.round(easyGames.reduce((sum, g) => sum + g.score, 0) / easyGames.length) : 0
      },
      mediumStats: {
        gamesPlayed: mediumGames.length,
        averageScore: mediumGames.length > 0 ? Math.round(mediumGames.reduce((sum, g) => sum + g.score, 0) / mediumGames.length) : 0
      },
      challengeStats: {
        gamesPlayed: challengeGames.length,
        averageScore: challengeGames.length > 0 ? Math.round(challengeGames.reduce((sum, g) => sum + g.score, 0) / challengeGames.length) : 0
      },
      recentGames: student.gameHistory.sort((a, b) => b.playedAt - a.playedAt).slice(0, 5)
    };

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    });
  }
});

module.exports = router;