// API Configuration
const API_URL = window.location.origin + '/api';

// Global State
let currentUser = null;
let currentMode = null;
let currentQuestionIndex = 0;
let gameScore = 0;
let gameQuestions = [];
let timerInterval = null;
let timeLeft = 20;
let correctAnswers = 0;

// Achievement Definitions
const achievements = [
    { id: 'badge100', name: 'Pemula Hebat', icon: '🥉', points: 100, description: 'Kumpulkan 100 poin' },
    { id: 'badge250', name: 'Juara Muda', icon: '🥈', points: 250, description: 'Kumpulkan 250 poin' },
    { id: 'badge500', name: 'Master Matematika', icon: '🥇', points: 500, description: 'Kumpulkan 500 poin' },
    { id: 'badge1000', name: 'Legenda Matematika', icon: '👑', points: 1000, description: 'Kumpulkan 1000 poin' }
];

// Fruit emojis (dapat diganti dengan gambar PNG)
const fruits = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝'];

// Utility Functions
function showLoading(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading"></div>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.remove();
}

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '10000';
    alert.style.animation = 'slideIn 0.5s';
    document.body.appendChild(alert);

    setTimeout(() => {
        alert.style.animation = 'slideIn 0.5s reverse';
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}

// API Calls
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        if (!result.success && response.status >= 400) {
            throw new Error(result.message || 'Terjadi kesalahan');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Login Functions
function switchLoginTab(tab) {
    const tabs = document.querySelectorAll('.login-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    document.getElementById('studentLogin').classList.toggle('hidden', tab !== 'student');
    document.getElementById('parentLogin').classList.toggle('hidden', tab !== 'parent');
}

async function loginStudent() {
    const name = document.getElementById('studentName').value.trim();
    
    if (!name) {
        showAlert('Silakan masukkan nama kamu!', 'error');
        return;
    }

    if (name.length < 2) {
        showAlert('Nama minimal 2 karakter!', 'error');
        return;
    }

    const button = event.target;
    button.disabled = true;
    showLoading('Memuat data...');

    try {
        const result = await apiCall('/students/login', 'POST', { name });
        
        if (result.success) {
            currentUser = result.student;
            showAlert(result.message, 'success');
            showMainMenu();
        } else {
            showAlert(result.message, 'error');
        }
    } catch (error) {
        showAlert(error.message || 'Gagal login. Silakan coba lagi.', 'error');
    } finally {
        hideLoading();
        button.disabled = false;
    }
}

async function loginParent() {
    const name = document.getElementById('parentStudentName').value.trim();
    const pin = document.getElementById('parentPin').value;

    if (!name) {
        showAlert('Silakan masukkan nama anak!', 'error');
        return;
    }

    if (!pin) {
        showAlert('Silakan masukkan PIN!', 'error');
        return;
    }

    const button = event.target;
    button.disabled = true;
    showLoading('Memverifikasi...');

    try {
        const result = await apiCall('/students/parent-login', 'POST', { name, pin });
        
        if (result.success) {
            currentUser = result.student;
            showAlert('Login berhasil!', 'success');
            showParentDashboard();
        } else {
            showAlert(result.message, 'error');
        }
    } catch (error) {
        showAlert(error.message || 'Gagal login. Periksa nama dan PIN.', 'error');
    } finally {
        hideLoading();
        button.disabled = false;
    }
}

function logout() {
    currentUser = null;
    
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('parentDashboard').classList.add('hidden');
    document.getElementById('studentName').value = '';
    document.getElementById('parentStudentName').value = '';
    document.getElementById('parentPin').value = '';
}

// Screen Navigation
function showMainMenu() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userPoints').textContent = currentUser.totalPoints;
}

async function showParentDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('parentDashboard').classList.remove('hidden');
    document.getElementById('parentChildName').textContent = currentUser.name;
    document.getElementById('totalPointsParent').textContent = currentUser.totalPoints;
    document.getElementById('easyCompleted').textContent = currentUser.easyCompleted;
    document.getElementById('mediumCompleted').textContent = currentUser.mediumCompleted;
    document.getElementById('challengeCompleted').textContent = currentUser.challengeCompleted;

    // Load detailed statistics
    try {
        showLoading('Memuat statistik...');
        const result = await apiCall(`/students/${currentUser.id}/statistics`);
        
        if (result.success) {
            displayStatistics(result.statistics);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    } finally {
        hideLoading();
    }

    renderParentAchievements();
}

function displayStatistics(stats) {
    // Update accuracy display
    const accuracyCard = document.createElement('div');
    accuracyCard.className = 'stat-card';
    accuracyCard.innerHTML = `
        <div class="stat-value">${stats.accuracy}%</div>
        <div class="stat-label">Akurasi</div>
    `;
    
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid.children.length === 4) {
        statsGrid.appendChild(accuracyCard);
    }
}

function renderParentAchievements() {
    const grid = document.getElementById('parentAchievementGrid');
    grid.innerHTML = '';

    achievements.forEach(ach => {
        const unlocked = currentUser.achievements.some(a => a.badgeId === ach.id);
        const progress = Math.min(100, (currentUser.totalPoints / ach.points) * 100);

        const card = document.createElement('div');
        card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <div class="badge-icon">${ach.icon}</div>
            <h3>${ach.name}</h3>
            <p>${ach.description}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%">
                    ${Math.floor(progress)}%
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function backToMenu() {
    document.getElementById('achievementScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
}

// Game Functions
function startGame(mode) {
    currentMode = mode;
    currentQuestionIndex = 0;
    gameScore = 0;
    correctAnswers = 0;
    
    const maxQuestions = mode === 'challenge' ? 20 : 10;
    gameQuestions = generateQuestions(mode, maxQuestions);

    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('totalQuestions').textContent = maxQuestions;
    document.getElementById('gamePoints').textContent = gameScore;

    if (mode === 'challenge') {
        document.getElementById('timerDisplay').style.display = 'flex';
    } else {
        document.getElementById('timerDisplay').style.display = 'none';
    }

    showQuestion();
}

function generateQuestions(mode, count) {
    const questions = [];
    for (let i = 0; i < count; i++) {
        let question;
        if (mode === 'easy') {
            question = generateAdditionQuestion();
        } else if (mode === 'medium') {
            question = generateSubtractionQuestion();
        } else {
            question = Math.random() > 0.5 ? generateAdditionQuestion() : generateSubtractionQuestion();
        }
        questions.push(question);
    }
    return questions;
}

function generateAdditionQuestion() {
    const num1 = Math.floor(Math.random() * 8) + 1;
    const num2 = Math.floor(Math.random() * 8) + 1;
    const correctAnswer = num1 + num2;
    
    const fruit1 = fruits[Math.floor(Math.random() * fruits.length)];
    const fruit2 = fruits[Math.floor(Math.random() * fruits.length)];

    return {
        type: 'addition',
        num1: num1,
        num2: num2,
        fruit1: fruit1,
        fruit2: fruit2,
        correctAnswer: correctAnswer,
        answers: generateAnswers(correctAnswer)
    };
}

function generateSubtractionQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 5;
    const num2 = Math.floor(Math.random() * Math.min(num1, 8)) + 1;
    const correctAnswer = num1 - num2;
    
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];

    return {
        type: 'subtraction',
        num1: num1,
        num2: num2,
        fruit: fruit,
        correctAnswer: correctAnswer,
        answers: generateAnswers(correctAnswer)
    };
}

function generateAnswers(correct) {
    const answers = [correct];
    while (answers.length < 4) {
        const wrong = correct + Math.floor(Math.random() * 7) - 3;
        if (wrong > 0 && wrong !== correct && !answers.includes(wrong)) {
            answers.push(wrong);
        }
    }
    return shuffleArray(answers);
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function showQuestion() {
    if (currentQuestionIndex >= gameQuestions.length) {
        endGame();
        return;
    }

    const question = gameQuestions[currentQuestionIndex];
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;

    const questionText = document.getElementById('questionText');
    const fruitsContainer = document.getElementById('fruitsContainer');
    fruitsContainer.innerHTML = '';

    if (question.type === 'addition') {
        questionText.textContent = 'Berapa jumlah buah di bawah ini?';
        
        for (let i = 0; i < question.num1; i++) {
            const fruit = document.createElement('div');
            fruit.className = 'fruit-item';
            fruit.textContent = question.fruit1;
            fruitsContainer.appendChild(fruit);
        }

        const plus = document.createElement('div');
        plus.className = 'fruit-item';
        plus.textContent = '➕';
        plus.style.fontSize = '3em';
        fruitsContainer.appendChild(plus);

        for (let i = 0; i < question.num2; i++) {
            const fruit = document.createElement('div');
            fruit.className = 'fruit-item';
            fruit.textContent = question.fruit2;
            fruitsContainer.appendChild(fruit);
        }
    } else {
        questionText.textContent = `Ada ${question.num1} buah, lalu ${question.num2} buah diambil. Berapa sisa buahnya?`;
        
        for (let i = 0; i < question.num1; i++) {
            const fruit = document.createElement('div');
            fruit.className = 'fruit-item';
            fruit.textContent = question.fruit;
            if (i >= question.correctAnswer) {
                fruit.style.opacity = '0.3';
            }
            fruitsContainer.appendChild(fruit);
        }
    }

    const answersGrid = document.getElementById('answersGrid');
    answersGrid.innerHTML = '';
    question.answers.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.onclick = () => checkAnswer(answer, question.correctAnswer, btn);
        answersGrid.appendChild(btn);
    });

    if (currentMode === 'challenge') {
        startTimer();
    }
}

function startTimer() {
    timeLeft = 20;
    document.getElementById('timer').textContent = timeLeft;
    document.getElementById('timer').classList.remove('warning');

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;

        if (timeLeft <= 5) {
            document.getElementById('timer').classList.add('warning');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            nextQuestion();
        }
    }, 1000);
}

function checkAnswer(selected, correct, button) {
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.style.pointerEvents = 'none');

    if (timerInterval) clearInterval(timerInterval);

    if (selected === correct) {
        button.classList.add('correct');
        gameScore += 10;
        correctAnswers++;
        document.getElementById('gamePoints').textContent = gameScore;
        createConfetti();
    } else {
        button.classList.add('wrong');
        buttons.forEach(btn => {
            if (parseInt(btn.textContent) === correct) {
                btn.classList.add('correct');
            }
        });
    }

    setTimeout(nextQuestion, 1500);
}

function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

function quitGame() {
    if (confirm('Apakah kamu yakin ingin keluar? Progress akan hilang.')) {
        if (timerInterval) clearInterval(timerInterval);
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
    }
}

async function endGame() {
    if (timerInterval) clearInterval(timerInterval);

    showLoading('Menyimpan hasil...');

    try {
        const result = await apiCall(`/students/${currentUser.id}/game-complete`, 'POST', {
            mode: currentMode,
            score: gameScore,
            correctAnswers: correctAnswers,
            totalQuestions: gameQuestions.length
        });

        if (result.success) {
            currentUser = result.student;
            
            // Show new achievements
            if (result.newAchievements && result.newAchievements.length > 0) {
                setTimeout(() => {
                    result.newAchievements.forEach(achId => {
                        const ach = achievements.find(a => a.id === achId);
                        if (ach) {
                            showAlert(`🎉 Selamat! Kamu mendapat badge: ${ach.name}!`, 'success');
                        }
                    });
                }, 1000);
            }
        }
    } catch (error) {
        console.error('Error saving game:', error);
        showAlert('Gagal menyimpan hasil, tapi kamu tetap hebat!', 'error');
    } finally {
        hideLoading();
    }

    // Show result modal
    const percentage = Math.round((correctAnswers / gameQuestions.length) * 100);
    document.getElementById('resultIcon').textContent = percentage >= 80 ? '🎉' : percentage >= 50 ? '😊' : '💪';
    document.getElementById('resultTitle').textContent = percentage >= 80 ? 'Luar Biasa!' : percentage >= 50 ? 'Bagus Sekali!' : 'Tetap Semangat!';
    document.getElementById('resultMessage').textContent = `Kamu menjawab ${correctAnswers} dari ${gameQuestions.length} soal dengan benar dan mendapat ${gameScore} poin!`;
    document.getElementById('resultModal').classList.remove('hidden');
}

function playAgain() {
    document.getElementById('resultModal').classList.add('hidden');
    startGame(currentMode);
}

function backToMenuFromResult() {
    document.getElementById('resultModal').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('userPoints').textContent = currentUser.totalPoints;
}

// Achievement Screen
function showAchievements() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('achievementScreen').classList.remove('hidden');
    renderAchievements();
}

function renderAchievements() {
    const grid = document.getElementById('achievementGrid');
    grid.innerHTML = '';

    achievements.forEach(ach => {
        const unlocked = currentUser.achievements.some(a => a.badgeId === ach.id);
        const progress = Math.min(100, (currentUser.totalPoints / ach.points) * 100);

        const card = document.createElement('div');
        card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <div class="badge-icon">${ach.icon}</div>
            <h3>${ach.name}</h3>
            <p>${ach.description}</p>
            ${unlocked ? '<p style="color: #2ecc71; font-weight: bold; margin-top: 10px;">✓ TERBUKA</p>' : 
            `<div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%">
                    ${Math.floor(progress)}%
                </div>
            </div>`}
        `;
        grid.appendChild(card);
    });
}

// Confetti Effect
function createConfetti() {
    const colors = ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎓 Math Game App Initialized');
    
    // Check API health
    apiCall('/health')
        .then(result => {
            console.log('✅ API Connected:', result.message);
        })
        .catch(error => {
            console.error('❌ API Connection Failed:', error);
            showAlert('Koneksi ke server bermasalah. Beberapa fitur mungkin tidak berfungsi.', 'error');
        });
});