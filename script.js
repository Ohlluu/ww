// Ebro in the Morning - White-ish Wednesday Game
// Interactive wheel game with bonuses and timer system

class WhiteishWednesdayGame {
    constructor() {
        this.players = {
            laura: { name: 'LAURA STYLEZ', score: 0, spinsLeft: 2, usedCallers: [] },
            rosenberg: { name: 'PETER ROSENBERG', score: 0, spinsLeft: 2, usedCallers: [] },
            shani: { name: 'SHANI KULTURE', score: 0, spinsLeft: 2, usedCallers: [] },
            ebro: { name: 'EBRO DARDEN', score: 0, spinsLeft: 2, usedCallers: [] }
        };
        
        this.currentPlayer = 'laura';
        this.isSpinning = false;
        this.timerInterval = null;
        this.timerActive = false;
        this.currentResult = null;
        this.wheelRotation = 0;
        
        this.callers = ['queen-p', 'aubrey', 'hot-rod-rick', 'nicki'];
        this.bonuses = {
            '': 'Regular caller help',
            'high-stakes': 'Correct = +2 points, Wrong = -1 point',
            'extended-time': 'Caller gets 10 seconds extra to hear the song',
            'rush-time': 'Caller has only 5 seconds to answer',
            'power-play': 'If wrong, automatically re-spin the wheel'
        };
        
        this.wheelSegments = [
            // 4 Regular
            { caller: 'queen-p', bonus: '' },
            { caller: 'aubrey', bonus: '' },
            { caller: 'hot-rod-rick', bonus: '' },
            { caller: 'nicki', bonus: '' },
            // 4 High Stakes  
            { caller: 'queen-p', bonus: 'high-stakes' },
            { caller: 'aubrey', bonus: 'high-stakes' },
            { caller: 'hot-rod-rick', bonus: 'high-stakes' },
            { caller: 'nicki', bonus: 'high-stakes' },
            // 4 Extended Time
            { caller: 'queen-p', bonus: 'extended-time' },
            { caller: 'aubrey', bonus: 'extended-time' },
            { caller: 'hot-rod-rick', bonus: 'extended-time' },
            { caller: 'nicki', bonus: 'extended-time' },
            // 4 Rush Time
            { caller: 'queen-p', bonus: 'rush-time' },
            { caller: 'aubrey', bonus: 'rush-time' },
            { caller: 'hot-rod-rick', bonus: 'rush-time' },
            { caller: 'nicki', bonus: 'rush-time' },
            // 4 Power Play
            { caller: 'queen-p', bonus: 'power-play' },
            { caller: 'aubrey', bonus: 'power-play' },
            { caller: 'hot-rod-rick', bonus: 'power-play' },
            { caller: 'nicki', bonus: 'power-play' }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.hideAllSections();
    }
    
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Player selection
        const playerBtns = document.querySelectorAll('.player-btn');
        console.log('Found player buttons:', playerBtns.length);
        playerBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('Player button clicked:', e.target.dataset.player);
                this.switchPlayer(e.target.dataset.player);
            });
        });
        
        // Action buttons
        const soloBtn = document.getElementById('soloButton');
        if (soloBtn) {
            soloBtn.addEventListener('click', () => {
                console.log('Solo button clicked');
                this.handleSoloAnswer();
            });
        } else {
            console.error('Solo button not found!');
        }
        
        const spinWheelBtn = document.getElementById('spinWheelButton');
        if (spinWheelBtn) {
            spinWheelBtn.addEventListener('click', () => {
                console.log('Spin wheel button clicked');
                this.spinWheel();
            });
        } else {
            console.error('Spin wheel button not found!');
        }
        
        // Center wheel spin button
        const spinBtn = document.getElementById('spinButton');
        if (spinBtn) {
            spinBtn.addEventListener('click', () => {
                console.log('Center spin button clicked');
                this.spinWheel();
            });
        } else {
            console.error('Center spin button not found!');
        }
        
        // Scoring buttons
        const correctBtn = document.getElementById('correctButton');
        if (correctBtn) {
            correctBtn.addEventListener('click', () => {
                console.log('Correct button clicked');
                this.handleAnswer(true);
            });
        }
        
        const wrongBtn = document.getElementById('wrongButton');
        if (wrongBtn) {
            wrongBtn.addEventListener('click', () => {
                console.log('Wrong button clicked');
                this.handleAnswer(false);
            });
        }
        
        // Timer buttons
        const rushTimerBtn = document.getElementById('rushTimerStartButton');
        if (rushTimerBtn) {
            rushTimerBtn.addEventListener('click', () => {
                console.log('Rush timer button clicked');
                this.startRushTimer();
            });
        }
        
        const extendedTimerBtn = document.getElementById('extendedTimerStartButton');
        if (extendedTimerBtn) {
            extendedTimerBtn.addEventListener('click', () => {
                console.log('Extended timer button clicked');
                this.startExtendedTimer();
            });
        }
        
        // New game button
        const newGameBtn = document.getElementById('newGameButton');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                console.log('New game button clicked');
                this.resetGame();
            });
        }
        
        console.log('✅ Event listeners setup complete');
    }
    
    switchPlayer(playerKey) {
        this.currentPlayer = playerKey;
        
        // Update UI
        document.querySelectorAll('.player-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-player="${playerKey}"]`).classList.add('active');
        
        document.querySelectorAll('.player-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`.player-card[data-player="${playerKey}"]`).classList.add('active');
        
        document.getElementById('currentPlayer').textContent = this.players[playerKey].name;
        
        // Update spin button availability
        this.updateSpinButtonState();
        this.hideAllSections();
    }
    
    updateSpinButtonState() {
        const player = this.players[this.currentPlayer];
        const spinWheelBtn = document.getElementById('spinWheelButton');
        
        if (player.spinsLeft <= 0) {
            spinWheelBtn.disabled = true;
            spinWheelBtn.style.opacity = '0.5';
            spinWheelBtn.querySelector('.btn-text').textContent = 'NO SPINS';
            spinWheelBtn.querySelector('.btn-subtext').textContent = 'LEFT';
        } else {
            spinWheelBtn.disabled = false;
            spinWheelBtn.style.opacity = '1';
            spinWheelBtn.querySelector('.btn-text').textContent = 'SPIN';
            spinWheelBtn.querySelector('.btn-subtext').textContent = 'WHEEL';
        }
    }
    
    handleSoloAnswer() {
        this.currentResult = {
            type: 'solo',
            player: this.currentPlayer,
            caller: null,
            bonus: null
        };
        
        this.showScoring();
    }
    
    spinWheel() {
        console.log('🎰 Spin wheel called');
        console.log('Is spinning:', this.isSpinning);
        console.log('Current player:', this.currentPlayer);
        console.log('Spins left:', this.players[this.currentPlayer].spinsLeft);
        
        if (this.isSpinning || this.players[this.currentPlayer].spinsLeft <= 0) {
            console.log('❌ Spin blocked - already spinning or no spins left');
            return;
        }
        
        this.isSpinning = true;
        this.hideAllSections();
        
        // Calculate random rotation (multiple full rotations + random segment)
        const segmentAngle = 360 / 20; // 18 degrees per segment
        const randomSegment = Math.floor(Math.random() * 20);
        const extraRotations = 5 + Math.floor(Math.random() * 5); // 5-9 full rotations
        const totalRotation = this.wheelRotation + (extraRotations * 360) + (randomSegment * segmentAngle);
        
        // Apply rotation
        const wheel = document.getElementById('gameWheel');
        wheel.style.transform = `rotate(${totalRotation}deg)`;
        this.wheelRotation = totalRotation;
        
        // Get the result after spin
        const resultSegment = this.wheelSegments[randomSegment];
        
        // Check if caller is already used
        const player = this.players[this.currentPlayer];
        if (player.usedCallers.includes(resultSegment.caller)) {
            // Auto re-spin if caller already used
            setTimeout(() => {
                this.isSpinning = false;
                this.showMessage('Caller already used! Re-spinning...', 'warning');
                setTimeout(() => this.spinWheel(), 1000);
            }, 4000);
            return;
        }
        
        // Process the result after wheel stops
        setTimeout(() => {
            this.isSpinning = false;
            this.processSpinResult(resultSegment);
        }, 4000);
        
        // Add sound effect and visual feedback
        this.addSpinEffects();
    }
    
    processSpinResult(result) {
        const player = this.players[this.currentPlayer];
        player.spinsLeft--;
        player.usedCallers.push(result.caller);
        
        this.currentResult = {
            type: 'spin',
            player: this.currentPlayer,
            caller: result.caller,
            bonus: result.bonus
        };
        
        this.showResult(result);
        this.updateDisplay();
    }
    
    showResult(result) {
        console.log('📋 Showing result:', result);
        const resultSection = document.getElementById('resultSection');
        const resultCaller = document.getElementById('resultCaller');
        const resultBonus = document.getElementById('resultBonus');
        const resultDescription = document.getElementById('resultDescription');
        
        if (!resultSection) {
            console.error('Result section not found!');
            return;
        }
        
        // Update result display
        if (resultCaller) {
            resultCaller.textContent = this.formatCallerName(result.caller);
        }
        
        if (result.bonus) {
            if (resultBonus) {
                resultBonus.textContent = this.formatBonusName(result.bonus);
                resultBonus.style.display = 'block';
            }
            if (resultDescription) {
                resultDescription.textContent = this.bonuses[result.bonus];
            }
        } else {
            if (resultBonus) {
                resultBonus.style.display = 'none';
            }
            if (resultDescription) {
                resultDescription.textContent = this.bonuses[''];
            }
        }
        
        resultSection.classList.add('show');
        console.log('✅ Result section updated and shown');
        
        // Show timer if Rush Time or Extended Time
        if (result.bonus === 'rush-time') {
            setTimeout(() => {
                this.showRushTimer();
            }, 2000);
        } else if (result.bonus === 'extended-time') {
            setTimeout(() => {
                this.showExtendedTimer();
            }, 2000);
        } else {
            setTimeout(() => {
                this.showScoring();
            }, 3000);
        }
    }
    
    showRushTimer() {
        console.log('⏰ Showing Rush Timer');
        const timerSection = document.getElementById('rushTimerSection');
        if (timerSection) {
            timerSection.classList.add('show');
            
            // Reset timer display
            const timerNumber = document.getElementById('rushTimerNumber');
            if (timerNumber) timerNumber.textContent = '5';
            
            const startBtn = document.getElementById('rushTimerStartButton');
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.style.opacity = '1';
            }
        } else {
            console.error('Rush timer section not found!');
        }
    }
    
    showExtendedTimer() {
        console.log('⏰ Showing Extended Timer');
        const timerSection = document.getElementById('extendedTimerSection');
        if (timerSection) {
            timerSection.classList.add('show');
            
            // Reset timer display
            const timerNumber = document.getElementById('extendedTimerNumber');
            if (timerNumber) timerNumber.textContent = '10';
            
            const startBtn = document.getElementById('extendedTimerStartButton');
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.style.opacity = '1';
            }
        } else {
            console.error('Extended timer section not found!');
        }
    }
    
    startRushTimer() {
        if (this.timerActive) return;
        
        this.timerActive = true;
        let timeLeft = 5;
        const timerNumber = document.getElementById('rushTimerNumber');
        const startBtn = document.getElementById('rushTimerStartButton');
        
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
        
        this.timerInterval = setInterval(() => {
            timeLeft--;
            timerNumber.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                this.stopTimer('rush');
                this.showScoring();
            }
        }, 1000);
        
        // Add urgency effects
        this.addTimerEffects();
    }
    
    startExtendedTimer() {
        if (this.timerActive) return;
        
        this.timerActive = true;
        let timeLeft = 10;
        const timerNumber = document.getElementById('extendedTimerNumber');
        const startBtn = document.getElementById('extendedTimerStartButton');
        
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
        
        this.timerInterval = setInterval(() => {
            timeLeft--;
            timerNumber.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                this.stopTimer('extended');
                this.showScoring();
            }
        }, 1000);
        
        // Add extended time effects
        this.addTimerEffects();
    }
    
    stopTimer(type = 'rush') {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.timerActive = false;
        
        const timerSectionId = type === 'extended' ? 'extendedTimerSection' : 'rushTimerSection';
        const timerSection = document.getElementById(timerSectionId);
        setTimeout(() => {
            timerSection.classList.remove('show');
        }, 1000);
    }
    
    showScoring() {
        const scoringSection = document.querySelector('.scoring-section.compact');
        if (scoringSection) {
            scoringSection.style.display = 'block';
        }
        
        // Update button text based on current result
        if (this.currentResult && this.currentResult.bonus === 'high-stakes') {
            document.getElementById('correctButton').querySelector('.score-text').textContent = 'CORRECT (+2)';
            document.getElementById('wrongButton').querySelector('.score-text').textContent = 'WRONG (-1)';
        } else {
            document.getElementById('correctButton').querySelector('.score-text').textContent = 'CORRECT (+1)';
            document.getElementById('wrongButton').querySelector('.score-text').textContent = 'WRONG (0)';
        }
    }
    
    handleAnswer(isCorrect) {
        if (!this.currentResult) return;
        
        const player = this.players[this.currentResult.player];
        let pointsAwarded = 0;
        
        if (isCorrect) {
            if (this.currentResult.bonus === 'high-stakes') {
                pointsAwarded = 2;
            } else {
                pointsAwarded = 1;
            }
            player.score += pointsAwarded;
        } else {
            if (this.currentResult.bonus === 'high-stakes') {
                pointsAwarded = -1;
                player.score = Math.max(0, player.score + pointsAwarded); // Don't go below 0
            }
            
            // Handle Power Play - auto re-spin if wrong
            if (this.currentResult.bonus === 'power-play' && this.currentResult.type === 'spin') {
                this.showMessage('POWER PLAY! Auto re-spinning...', 'info');
                setTimeout(() => {
                    this.hideAllSections();
                    this.spinWheel();
                }, 2000);
                return;
            }
        }
        
        this.updateDisplay();
        this.checkForWinner();
        this.hideAllSections();
        this.currentResult = null;
        
        // Show points awarded feedback
        this.showPointsFeedback(pointsAwarded, isCorrect);
    }
    
    checkForWinner() {
        const winner = Object.keys(this.players).find(key => this.players[key].score >= 5);
        
        if (winner) {
            this.showWinner(winner);
        }
    }
    
    showWinner(winnerKey) {
        const modal = document.getElementById('winnerModal');
        const winnerName = document.getElementById('winnerName');
        
        winnerName.textContent = this.players[winnerKey].name;
        modal.classList.add('show');
        
        // Add celebration effects
        this.addWinnerEffects();
    }
    
    resetGame() {
        // Reset all player data
        Object.keys(this.players).forEach(key => {
            this.players[key].score = 0;
            this.players[key].spinsLeft = 2;
            this.players[key].usedCallers = [];
        });
        
        this.currentPlayer = 'laura';
        this.currentResult = null;
        this.wheelRotation = 0;
        this.stopTimer();
        
        // Reset UI
        document.getElementById('winnerModal').classList.remove('show');
        document.getElementById('gameWheel').style.transform = 'rotate(0deg)';
        
        this.switchPlayer('laura');
        this.updateDisplay();
        this.hideAllSections();
    }
    
    updateDisplay() {
        // Update all player cards
        Object.keys(this.players).forEach(key => {
            const player = this.players[key];
            const card = document.querySelector(`.player-card[data-player="${key}"]`);
            
            card.querySelector('.score-number').textContent = player.score;
            card.querySelector('.spins-count').textContent = player.spinsLeft;
            
            // Update used callers
            const callerTags = card.querySelector('.caller-tags');
            callerTags.innerHTML = '';
            player.usedCallers.forEach(caller => {
                const tag = document.createElement('span');
                tag.className = 'caller-tag';
                tag.textContent = this.formatCallerName(caller);
                callerTags.appendChild(tag);
            });
        });
        
        this.updateSpinButtonState();
    }
    
    hideAllSections() {
        document.getElementById('resultSection').classList.remove('show');
        document.getElementById('rushTimerSection').classList.remove('show');
        document.getElementById('extendedTimerSection').classList.remove('show');
        const scoringSection = document.querySelector('.scoring-section.compact');
        if (scoringSection) {
            scoringSection.style.display = 'none';
        }
    }
    
    formatCallerName(caller) {
        const names = {
            'queen-p': 'QUEEN P',
            'aubrey': 'AUBREY', 
            'hot-rod-rick': 'HOT ROD RICK',
            'nicki': 'NICKI'
        };
        return names[caller] || caller.toUpperCase();
    }
    
    formatBonusName(bonus) {
        const names = {
            'high-stakes': 'HIGH STAKES',
            'extended-time': 'EXTENDED TIME',
            'rush-time': 'RUSH TIME',
            'power-play': 'POWER PLAY'
        };
        return names[bonus] || bonus.toUpperCase();
    }
    
    showMessage(message, type = 'info') {
        // Create temporary message overlay
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-overlay ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card-bg);
            color: var(--text-primary);
            padding: var(--space-lg);
            border-radius: var(--radius-lg);
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            font-size: 1.2rem;
            z-index: 999;
            border: 2px solid var(--electric-cyan);
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
    
    showPointsFeedback(points, isCorrect) {
        const feedback = document.createElement('div');
        feedback.className = 'points-feedback';
        
        let message = '';
        let color = '';
        
        if (points > 0) {
            message = `+${points} POINT${points > 1 ? 'S' : ''}!`;
            color = 'var(--neon-green)';
        } else if (points < 0) {
            message = `${points} POINT!`;
            color = 'var(--hot-pink)';
        } else {
            message = isCorrect ? '+1 POINT!' : 'NO POINTS';
            color = isCorrect ? 'var(--neon-green)' : 'var(--text-secondary)';
        }
        
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Orbitron', monospace;
            font-weight: 900;
            font-size: 2rem;
            color: ${color};
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 998;
            animation: pointsPop 1.5s ease-out forwards;
        `;
        
        // Add CSS animation
        if (!document.querySelector('#pointsAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'pointsAnimationStyle';
            style.textContent = `
                @keyframes pointsPop {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 1500);
    }
    
    addSpinEffects() {
        // Add spinning sound effect (visual feedback)
        const wheel = document.getElementById('gameWheel');
        wheel.style.boxShadow = '0 0 50px rgba(0, 212, 255, 0.8)';
        
        setTimeout(() => {
            wheel.style.boxShadow = '';
        }, 4000);
    }
    
    addTimerEffects() {
        const timerSection = document.getElementById('timerSection');
        timerSection.style.animation = 'pulse 1s infinite';
        
        // Add CSS if not exists
        if (!document.querySelector('#timerAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'timerAnimationStyle';
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    addWinnerEffects() {
        // Add confetti-like effect
        const colors = ['var(--neon-green)', 'var(--electric-cyan)', 'var(--accent-gold)', 'var(--hot-pink)'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    top: -10px;
                    left: ${Math.random() * 100}%;
                    border-radius: 50%;
                    z-index: 1001;
                    animation: confettiFall 3s linear forwards;
                `;
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 100);
        }
        
        // Add confetti animation CSS
        if (!document.querySelector('#confettiAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'confettiAnimationStyle';
            style.textContent = `
                @keyframes confettiFall {
                    to { 
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Ebro in the Morning - White-ish Wednesday Game Loading...');
    
    // Add a small delay to ensure all elements are rendered
    setTimeout(() => {
        console.log('🔧 Starting game initialization...');
        const game = new WhiteishWednesdayGame();
        
        // Store game instance globally for debugging
        window.gameInstance = game;
        
        console.log('🎮 Game initialized successfully!');
        console.log('🔍 Debug: You can access the game via window.gameInstance');
    }, 100);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        document.getElementById('spinWheelButton').click();
    }
    if (e.key === '1') {
        document.querySelector('[data-player="laura"]').click();
    }
    if (e.key === '2') {
        document.querySelector('[data-player="rosenberg"]').click();
    }
    if (e.key === '3') {
        document.querySelector('[data-player="shani"]').click();
    }
    if (e.key === '4') {
        document.querySelector('[data-player="ebro"]').click();
    }
});