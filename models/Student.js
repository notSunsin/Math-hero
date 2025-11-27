const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
});

const gameHistorySchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ['easy', 'medium', 'challenge'],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama siswa wajib diisi'],
    trim: true,
    minlength: [2, 'Nama minimal 2 karakter'],
    maxlength: [50, 'Nama maksimal 50 karakter']
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  easyCompleted: {
    type: Number,
    default: 0
  },
  mediumCompleted: {
    type: Number,
    default: 0
  },
  challengeCompleted: {
    type: Number,
    default: 0
  },
  achievements: [achievementSchema],
  gameHistory: [gameHistorySchema],
  parentPin: {
    type: String,
    default: '1234'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastPlayed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index untuk pencarian lebih cepat
studentSchema.index({ name: 1 });

// Method untuk menambah poin
studentSchema.methods.addPoints = function(points) {
  this.totalPoints += points;
  return this.save();
};

// Method untuk menambah game history
studentSchema.methods.addGameHistory = function(gameData) {
  this.gameHistory.push(gameData);
  
  // Update counter berdasarkan mode
  if (gameData.mode === 'easy') this.easyCompleted++;
  else if (gameData.mode === 'medium') this.mediumCompleted++;
  else if (gameData.mode === 'challenge') this.challengeCompleted++;
  
  this.lastPlayed = Date.now();
  return this.save();
};

// Method untuk unlock achievement
studentSchema.methods.unlockAchievement = function(badgeId) {
  const exists = this.achievements.find(a => a.badgeId === badgeId);
  if (!exists) {
    this.achievements.push({ badgeId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Virtual untuk total games played
studentSchema.virtual('totalGamesPlayed').get(function() {
  return this.easyCompleted + this.mediumCompleted + this.challengeCompleted;
});

// Ensure virtuals are included in JSON
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
