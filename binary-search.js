// ========================================
// BINARY SEARCH GAME
// ========================================
let binaryGame = {
    targetNumber: 0,
    currentMin: 1,
    currentMax: 100,
    attempts: 0,
    gameActive: false,

    init() {
        // Add keyboard support for Enter key
        const guessInput = document.getElementById('guessInput');
        if (guessInput) {
            guessInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.makeGuess();
                }
            });
        }

        this.startNewGame();
    },

    startNewGame() {
        this.targetNumber = Math.floor(Math.random() * 100) + 1;
        this.currentMin = 1;
        this.currentMax = 100;
        this.attempts = 0;
        this.gameActive = true;

        // Reset UI
        this.updateUI();
        this.updateVisualization();
        document.getElementById('guessInput').value = '';
        document.getElementById('feedback').textContent = 'Good luck! Make your first guess.';
    },

    makeGuess() {
        if (!this.gameActive) return;

        const guessInput = document.getElementById('guessInput');
        const guess = parseInt(guessInput.value);

        if (isNaN(guess) || guess < 1 || guess > 100) {
            document.getElementById('feedback').textContent = 'Please enter a valid number between 1 and 100.';
            return;
        }

        this.attempts++;

        if (guess === this.targetNumber) {
            // Correct guess!
            this.gameActive = false;
            document.getElementById('feedback').textContent = `🎉 Correct! You found the number in ${this.attempts} attempts!`;
            this.updateVisualization(guess, true);
        } else if (guess < this.targetNumber) {
            // Too low
            this.currentMin = Math.max(this.currentMin, guess + 1);
            document.getElementById('feedback').textContent = `📈 Too low! Try a higher number.`;
            this.updateVisualization(guess, false);
        } else {
            // Too high
            this.currentMax = Math.min(this.currentMax, guess - 1);
            document.getElementById('feedback').textContent = `📉 Too high! Try a lower number.`;
            this.updateVisualization(guess, false);
        }

        this.updateUI();
        guessInput.value = '';
        guessInput.focus();
    },

    updateUI() {
        document.getElementById('currentMin').textContent = this.currentMin;
        document.getElementById('currentMax').textContent = this.currentMax;
        document.getElementById('attempts').textContent = this.attempts;
    },

    updateVisualization(lastGuess = null, isCorrect = false) {
        const rangeFill = document.getElementById('rangeFill');
        const leftMarker = document.getElementById('leftMarker');
        const rightMarker = document.getElementById('rightMarker');
        const guessMarker = document.getElementById('guessMarker');

        // Calculate positions as percentages (1-100 range)
        const totalRange = 100;
        const fillWidth = ((this.currentMax - this.currentMin + 1) / totalRange) * 100;
        const fillLeft = ((this.currentMin - 1) / totalRange) * 100;

        // Update range fill
        rangeFill.style.width = fillWidth + '%';
        rangeFill.style.left = fillLeft + '%';

        // Position markers below the range bar at the edges of the filled area
        // Left marker at the start of the filled area
        leftMarker.style.left = fillLeft + '%';
        leftMarker.textContent = this.currentMin;

        // Right marker at the end of the filled area
        rightMarker.style.left = (fillLeft + fillWidth) + '%';
        rightMarker.textContent = this.currentMax;

        // Update guess marker if we have a last guess
        if (lastGuess !== null) {
            const guessPosition = ((lastGuess - 1) / totalRange) * 100;
            guessMarker.style.left = guessPosition + '%';
            guessMarker.textContent = lastGuess;

            if (isCorrect) {
                guessMarker.style.background = '#42b883';
                guessMarker.style.borderColor = '#42b883';
            } else if (lastGuess < this.targetNumber) {
                guessMarker.style.background = '#ffa726';
                guessMarker.style.borderColor = '#ffa726';
            } else {
                guessMarker.style.background = '#ef5350';
                guessMarker.style.borderColor = '#ef5350';
            }
        } else {
            // Reset guess marker for new game
            guessMarker.style.left = '50%';
            guessMarker.textContent = '50';
            guessMarker.style.background = '#ff6b6b';
            guessMarker.style.borderColor = '#ff6b6b';
        }
    }
};
