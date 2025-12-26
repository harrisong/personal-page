// ========================================
// CHARACTER POSTER WORD CLOCK
// ========================================
let wordClock = {
    container: null,
    digitalTimeElement: null,
    updateInterval: null,
    gridWidth: 12,
    gridHeight: 4,

    // Available characters for random padding
    randomChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',

    init() {
        this.container = document.getElementById('wordClock');
        this.digitalTimeElement = document.getElementById('digitalTime');
        this.createGrid();
        this.updateTime();
        // Update every second for smooth display
        this.updateInterval = setInterval(() => this.updateTime(), 1000);
    },

    createGrid() {
        this.container.innerHTML = '';

        // Create grid rows
        for (let row = 0; row < this.gridHeight; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'clock-row';

            // Create grid cells
            for (let col = 0; col < this.gridWidth; col++) {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'clock-cell';
                cellDiv.dataset.row = row;
                cellDiv.dataset.col = col;
                cellDiv.textContent = this.getRandomChar();
                rowDiv.appendChild(cellDiv);
            }

            this.container.appendChild(rowDiv);
        }
    },

    updateTime() {
        const now = new Date();
        const hours = now.getHours() % 12 || 12; // Convert to 12-hour format
        const minutes = now.getMinutes();

        // Reset all cells to random grey characters
        const cells = this.container.querySelectorAll('.clock-cell');
        cells.forEach(cell => {
            cell.textContent = this.getRandomChar();
            cell.classList.remove('active');
        });

        // Get the words to display
        const timeWords = this.getTimeWords(hours, minutes);

        // Position the words in the grid
        this.placeWordsInGrid(timeWords);

        // Update digital time display
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit'
        });
        this.digitalTimeElement.textContent = `Digital: ${timeString}`;
    },

    placeWordsInGrid(words) {
        // Position words in a nice layout
        const positions = [
            { row: 0, col: 0 }, // IT'S
            { row: 1, col: 0 }, // HOUR
            { row: 2, col: 0 }  // MINUTES
        ];

        words.forEach((word, index) => {
            if (index < positions.length) {
                const pos = positions[index];
                this.placeWord(word, pos.row, pos.col);
            }
        });
    },

    placeWord(word, startRow, startCol) {
        const letters = word.replace(/\s+/g, '').split(''); // Remove spaces and split

        for (let i = 0; i < letters.length; i++) {
            const col = startCol + i;
            if (col < this.gridWidth) {
                const cell = this.container.querySelector(`[data-row="${startRow}"][data-col="${col}"]`);
                if (cell) {
                    cell.textContent = letters[i];
                    cell.classList.add('active');
                }
            }
        }
    },

    getTimeWords(hours, minutes) {
        const words = [];

        // Always start with "IT'S" or "IT IS"
        words.push("IT'S");

        // Add hour word
        const hourWords = {
            1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE',
            6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE', 10: 'TEN',
            11: 'ELEVEN', 12: 'TWELVE'
        };
        words.push(hourWords[hours] || 'TWELVE');

        // Add minutes
        if (minutes === 0) {
            words.push('OCLOCK');
        } else {
            // Convert minutes to words
            const minuteWords = this.minutesToWords(minutes);
            words.push(minuteWords);
        }

        return words;
    },

    minutesToWords(minutes) {
        if (minutes < 10) {
            return 'OH ' + this.numberToWord(minutes);
        } else if (minutes < 20) {
            const teens = {
                10: 'TEN', 11: 'ELEVEN', 12: 'TWELVE', 13: 'THIRTEEN',
                14: 'FOURTEEN', 15: 'FIFTEEN', 16: 'SIXTEEN', 17: 'SEVENTEEN',
                18: 'EIGHTEEN', 19: 'NINETEEN'
            };
            return teens[minutes];
        } else {
            const tens = {
                20: 'TWENTY', 30: 'THIRTY', 40: 'FORTY', 50: 'FIFTY'
            };
            const ten = Math.floor(minutes / 10) * 10;
            const one = minutes % 10;

            let result = tens[ten];
            if (one > 0) {
                result += ' ' + this.numberToWord(one);
            }
            return result;
        }
    },

    getRandomChar() {
        return this.randomChars[Math.floor(Math.random() * this.randomChars.length)];
    },

    numberToWord(num) {
        const words = {
            1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE',
            6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE'
        };
        return words[num] || '';
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the clock page
    if (document.getElementById('wordClock')) {
        wordClock.init();
    }
});
