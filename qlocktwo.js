// ========================================
// QLOCKTWO WORD CLOCK
// ========================================
let qlocktwo = {
    container: null,
    digitalTimeElement: null,
    updateInterval: null,
    grid: [
        'ITLISASTIME',
        'ACQUARTERDC',
        'TWENTYFIVEX',
        'HALFBTENFTO',
        'PASTERUNINE',
        'ONESIXTHREE',
        'TWOEIGHTFOU',
        'ELEVENFIVE',
        'TWELVEONESIXTEEN',
        'THREETWOFIVE'
    ],
    gridWidth: 11,
    gridHeight: 10,

    init() {
        this.container = document.getElementById('qlocktwoGrid');
        this.digitalTimeElement = document.getElementById('qlocktwoDigitalTime');
        this.createGrid();
        this.updateTime();
        this.updateInterval = setInterval(() => this.updateTime(), 1000);
    },

    createGrid() {
        this.container.innerHTML = '';

        for (let row = 0; row < this.gridHeight; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'qlocktwo-row';

            const letters = this.grid[row];
            for (let col = 0; col < letters.length; col++) {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'qlocktwo-cell';
                cellDiv.dataset.row = row;
                cellDiv.dataset.col = col;
                cellDiv.textContent = letters[col];
                rowDiv.appendChild(cellDiv);
            }

            this.container.appendChild(rowDiv);
        }
    },

    updateTime() {
        const now = new Date();
        let hours = now.getHours() % 12;
        if (hours === 0) hours = 12;
        const minutes = now.getMinutes();

        // Reset all cells
        const cells = this.container.querySelectorAll('.qlocktwo-cell');
        cells.forEach(cell => cell.classList.remove('active'));

        // Get positions to light up
        const positions = this.getTimePositions(hours, minutes);

        // Light up the positions
        positions.forEach(pos => {
            const cell = this.container.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
            if (cell) {
                cell.classList.add('active');
            }
        });

        // Update digital time
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        });
        this.digitalTimeElement.textContent = `Digital: ${timeString}`;
    },

    getTimePositions(hours, minutes) {
        const positions = [];

        // Always "IT IS"
        this.addWordPositions('IT IS', positions);

        // Determine if past or to
        let nextHour = hours;
        let isPast = true;
        if (minutes >= 35) {
            nextHour = hours % 12 + 1;
            if (nextHour === 13) nextHour = 1;
            isPast = false;
        }

        // Minutes
        if (minutes < 5) {
            // Exact hour
        } else if (minutes < 10) {
            this.addWordPositions('FIVE', positions);
            if (isPast) this.addWordPositions('PAST', positions);
            else this.addWordPositions('TO', positions);
        } else if (minutes < 15) {
            this.addWordPositions('TEN', positions);
            if (isPast) this.addWordPositions('PAST', positions);
            else this.addWordPositions('TO', positions);
        } else if (minutes < 20) {
            this.addWordPositions('QUARTER', positions);
            if (isPast) this.addWordPositions('PAST', positions);
            else this.addWordPositions('TO', positions);
        } else if (minutes < 25) {
            this.addWordPositions('TWENTY', positions);
            if (isPast) this.addWordPositions('PAST', positions);
            else this.addWordPositions('TO', positions);
        } else if (minutes < 30) {
            this.addWordPositions('TWENTY FIVE', positions);
            if (isPast) this.addWordPositions('PAST', positions);
            else this.addWordPositions('TO', positions);
        } else if (minutes < 35) {
            this.addWordPositions('HALF', positions);
            this.addWordPositions('PAST', positions);
        } else if (minutes < 40) {
            this.addWordPositions('TWENTY FIVE', positions);
            this.addWordPositions('TO', positions);
        } else if (minutes < 45) {
            this.addWordPositions('TWENTY', positions);
            this.addWordPositions('TO', positions);
        } else if (minutes < 50) {
            this.addWordPositions('QUARTER', positions);
            this.addWordPositions('TO', positions);
        } else if (minutes < 55) {
            this.addWordPositions('TEN', positions);
            this.addWordPositions('TO', positions);
        } else {
            this.addWordPositions('FIVE', positions);
            this.addWordPositions('TO', positions);
        }

        // Hour
        const hourWords = {
            1: 'ONE', 2: 'TWO', 3: 'THREE', 4: 'FOUR', 5: 'FIVE',
            6: 'SIX', 7: 'SEVEN', 8: 'EIGHT', 9: 'NINE', 10: 'TEN',
            11: 'ELEVEN', 12: 'TWELVE'
        };
        this.addWordPositions(hourWords[nextHour], positions);

        return positions;
    },

    addWordPositions(word, positions) {
        const words = word.split(' ');
        let row = 0;
        let col = 0;

        for (let w of words) {
            // Find the word in the grid
            for (let r = 0; r < this.gridHeight; r++) {
                const index = this.grid[r].indexOf(w);
                if (index !== -1) {
                    for (let i = 0; i < w.length; i++) {
                        positions.push({ row: r, col: index + i });
                    }
                    break;
                }
            }
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('qlocktwoGrid')) {
        qlocktwo.init();
    }
});