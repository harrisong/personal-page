// ========================================
// CONNECT 4 GAME
// ========================================
let connect4Game = {
    board: [],
    currentPlayer: 1, // 1 = red, 2 = yellow
    gameActive: true,
    rows: 6,
    cols: 7,

    init() {
        this.resetGame();
    },

    resetGame() {
        // Initialize empty board
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = 0; // 0 = empty, 1 = red, 2 = yellow
            }
        }

        this.currentPlayer = 1;
        this.gameActive = true;
        this.createBoard();
        this.updateStatus();
    },

    createBoard() {
        const boardElement = document.getElementById('connect4Board');
        boardElement.innerHTML = '';

        // Create the board grid
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'connect4-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.onclick = () => this.dropPiece(col);
                boardElement.appendChild(cell);
            }
        }
    },

    dropPiece(col) {
        if (!this.gameActive) return;

        // Find the lowest available row in this column
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                this.board[row][col] = this.currentPlayer;

                // Update the visual board
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                cell.classList.add(this.currentPlayer === 1 ? 'red' : 'yellow');

                // Check for win
                if (this.checkWin(row, col)) {
                    this.gameActive = false;
                    this.updateStatus(`${this.currentPlayer === 1 ? 'Red' : 'Yellow'} wins!`);
                    return;
                }

                // Check for draw
                if (this.checkDraw()) {
                    this.gameActive = false;
                    this.updateStatus("It's a draw!");
                    return;
                }

                // Switch players
                this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                this.updateStatus();
                return;
            }
        }

        // Column is full
        this.updateStatus('Column is full! Choose another column.');
    },

    checkWin(row, col) {
        const player = this.currentPlayer;

        // Check horizontal
        let count = 0;
        for (let c = 0; c < this.cols; c++) {
            if (this.board[row][c] === player) {
                count++;
                if (count >= 4) return true;
            } else {
                count = 0;
            }
        }

        // Check vertical
        count = 0;
        for (let r = 0; r < this.rows; r++) {
            if (this.board[r][col] === player) {
                count++;
                if (count >= 4) return true;
            } else {
                count = 0;
            }
        }

        // Check diagonal (top-left to bottom-right)
        count = 0;
        let r = row - Math.min(row, col);
        let c = col - Math.min(row, col);
        while (r < this.rows && c < this.cols) {
            if (this.board[r][c] === player) {
                count++;
                if (count >= 4) return true;
            } else {
                count = 0;
            }
            r++;
            c++;
        }

        // Check diagonal (top-right to bottom-left)
        count = 0;
        r = row - Math.min(row, this.cols - 1 - col);
        c = col + Math.min(row, this.cols - 1 - col);
        while (r < this.rows && c >= 0) {
            if (this.board[r][c] === player) {
                count++;
                if (count >= 4) return true;
            } else {
                count = 0;
            }
            r++;
            c--;
        }

        return false;
    },

    checkDraw() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    },

    updateStatus(message) {
        const statusElement = document.getElementById('connect4Status');
        if (message) {
            statusElement.textContent = message;
        } else {
            statusElement.textContent = `Player ${this.currentPlayer}'s turn (${this.currentPlayer === 1 ? 'Red' : 'Yellow'})`;
        }
    }
};
