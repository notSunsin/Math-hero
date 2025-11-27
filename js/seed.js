require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');

const sampleStudents = [
  {
    name: 'Budi Santoso',
    totalPoints: 350,
    easyCompleted: 5,
    mediumCompleted: 3,
    challengeCompleted: 2,
    achievements: [
      { badgeId: 'badge100' },
      { badgeId: 'badge250' }
    ],
    gameHistory: [
      {
        mode: 'easy',
        score: 80,
        correctAnswers: 8,
        totalQuestions: 10,
        playedAt: new Date('2024-01-15')
      },
      {
        mode: 'medium',
        score: 70,
        correctAnswers: 7,
        totalQuestions: 10,
        playedAt: new Date('2024-01-16')
      },
      {
        mode: 'challenge',
        score: 120,
        correctAnswers: 12,
        totalQuestions: 20,
        playedAt: new Date('2024-01-17')
      }
    ],
    parentPin: '1234'
  },
  {
    name: 'Siti Nurhaliza',
    totalPoints: 580,
    easyCompleted: 8,
    mediumCompleted: 6,
    challengeCompleted: 3,
    achievements: [
      { badgeId: 'badge100' },
      { badgeId: 'badge250' },
      { badgeId: 'badge500' }
    ],
    gameHistory: [
      {
        mode: 'easy',
        score: 100,
        correctAnswers: 10,
        totalQuestions: 10,
        playedAt: new Date('2024-01-10')
      },
      {
        mode: 'medium',
        score: 90,
        correctAnswers: 9,
        totalQuestions: 10,
        playedAt: new Date('2024-01-12')
      },
      {
        mode: 'challenge',
        score: 180,
        correctAnswers: 18,
        totalQuestions: 20,
        playedAt: new Date('2024-01-14')
      }
    ],
    parentPin: '1234'
  },
  {
    name: 'Ahmad Rizki',
    totalPoints: 150,
    easyCompleted: 3,
    mediumCompleted: 2,
    challengeCompleted: 1,
    achievements: [
      { badgeId: 'badge100' }
    ],
    gameHistory: [
      {
        mode: 'easy',
        score: 60,
        correctAnswers: 6,
        totalQuestions: 10,
        playedAt: new Date('2024-01-18')
      }
    ],
    parentPin: '1234'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mathgame', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({});
    console.log('🗑️  Cleared existing students');

    // Insert sample data
    await Student.insertMany(sampleStudents);
    console.log('✅ Sample students inserted successfully!');
    
    console.log('\n📊 Sample Data:');
    sampleStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name}`);
      console.log(`   Points: ${student.totalPoints}`);
      console.log(`   Achievements: ${student.achievements.length}`);
      console.log(`   Games Played: ${student.gameHistory.length}`);
      console.log('');
    });

    console.log('🎉 Database seeding completed!');
    console.log('👨‍💻 You can now test the app with these users:');
    console.log('   - Budi Santoso');
    console.log('   - Siti Nurhaliza');
    console.log('   - Ahmad Rizki');
    console.log('   Parent PIN for all: 1234\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();