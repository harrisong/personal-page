// ========================================
// MINESWEEPER GAME
// ========================================
let minesweeperGame = {
    canvas: null,
    ctx: null,
    board: [],
    rows: 9,
    cols: 9,
    mines: 10,
    cellSize: 32,
    gameStarted: false,
    gameOver: false,
    gameWon: false,
    flaggedCount: 0,
    revealedCount: 0,

    // Game states
    CELL_HIDDEN: 0,
    CELL_REVEALED: 1,
    CELL_FLAGGED: 2,
    CELL_MINE: 3,
    CELL_EXPLODED: 4,

    init() {
        this.canvas = document.getElementById('minesweeperCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.addEventListeners();
        this.newGame();
    },

    setupCanvas() {
        // Set canvas size based on difficulty
        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;
    },

    addEventListeners() {
        // Prevent context menu on right-click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });

        // Handle left click
        this.canvas.addEventListener('click', (e) => {
            this.handleLeftClick(e);
        });
    },

    newGame() {
        this.gameStarted = false;
        this.gameOver = false;
        this.gameWon = false;
        this.flaggedCount = 0;
        this.revealedCount = 0;

        // Initialize board
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0,
                    state: this.CELL_HIDDEN
                };
            }
        }

        this.updateDisplay();
        this.drawBoard();
    },

    placeMines(firstClickRow, firstClickCol) {
        let minesPlaced = 0;
        
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Don't place mine on first click or already placed mine
            if ((row === firstClickRow && col === firstClickCol) || 
                this.board[row][col].isMine) {
                continue;
            }
            
            this.board[row][col].isMine = true;
            minesPlaced++;
        }
        
        this.calculateAdjacentMines();
    },

    calculateAdjacentMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    let count = 0;
                    
                    // Check all 8 surrounding cells
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            
                            const newRow = row + dr;
                            const newCol = col + dc;
                            
                            if (newRow >= 0 && newRow < this.rows && 
                                newCol >= 0 && newCol < this.cols &&
                                this.board[newRow][newCol].isMine) {
                                count++;
                            }
                        }
                    }
                    
                    this.board[row][col].adjacentMines = count;
                }
            }
        }
    },

    handleLeftClick(e) {
        if (this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.revealCell(row, col);
        }
    },

    handleRightClick(e) {
        if (this.gameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.toggleFlag(row, col);
        }
    },

    revealCell(row, col) {
        const cell = this.board[row][col];
        
        if (cell.isRevealed || cell.isFlagged) return;
        
        // Start game on first click
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.placeMines(row, col);
            document.getElementById('gameStatus').textContent = 'Game in progress...';
        }
        
        cell.isRevealed = true;
        cell.state = this.CELL_REVEALED;
        this.revealedCount++;
        
        if (cell.isMine) {
            cell.state = this.CELL_EXPLODED;
            this.gameOver = true;
            this.gameWon = false;
            document.getElementById('gameStatus').textContent = 'Game Over! You hit a mine!';
            this.revealAllMines();
        } else {
            // Auto-reveal adjacent empty cells
            if (cell.adjacentMines === 0) {
                this.autoReveal(row, col);
            }
            
            this.checkWinCondition();
        }
        
        this.updateDisplay();
        this.drawBoard();
    },

    toggleFlag(row, col) {
        const cell = this.board[row][col];
        
        if (cell.isRevealed) return;
        
        if (cell.isFlagged) {
            cell.isFlagged = false;
            cell.state = this.CELL_HIDDEN;
            this.flaggedCount--;
        } else {
            cell.isFlagged = true;
            cell.state = this.CELL_FLAGGED;
            this.flaggedCount++;
        }
        
        this.updateDisplay();
        this.drawBoard();
    },

    autoReveal(row, col) {
        // Use flood fill to reveal connected empty cells
        const queue = [[row, col]];
        const visited = new Set();
        
        while (queue.length > 0) {
            const [currentRow, currentCol] = queue.shift();
            const key = `${currentRow},${currentCol}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            const cell = this.board[currentRow][currentCol];
            if (cell.isRevealed || cell.isFlagged) continue;
            
            cell.isRevealed = true;
            cell.state = this.CELL_REVEALED;
            this.revealedCount++;
            
            // If cell has no adjacent mines, reveal neighbors
            if (cell.adjacentMines === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        
                        const newRow = currentRow + dr;
                        const newCol = currentCol + dc;
                        
                        if (newRow >= 0 && newRow < this.rows && 
                            newCol >= 0 && newCol < this.cols) {
                            queue.push([newRow, newCol]);
                        }
                    }
                }
            }
        }
    },

    checkWinCondition() {
        const totalCells = this.rows * this.cols;
        const safeCells = totalCells - this.mines;
        
        if (this.revealedCount === safeCells) {
            this.gameOver = true;
            this.gameWon = true;
            document.getElementById('gameStatus').textContent = 'Congratulations! You won!';
        }
    },

    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.board[row][col];
                if (cell.isMine) {
                    cell.state = this.CELL_MINE;
                }
            }
        }
    },

    updateDisplay() {
        const minesLeft = this.mines - this.flaggedCount;
        document.getElementById('minesLeft').textContent = minesLeft;
    },

    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.drawCell(row, col);
            }
        }
    },

    drawCell(row, col) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        const cell = this.board[row][col];
        
        // Draw cell background
        this.ctx.fillStyle = this.getCellColor(cell);
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        // Draw cell border
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
        
        // Draw cell content
        this.drawCellContent(row, col);
    },

    getCellColor(cell) {
        switch (cell.state) {
            case this.CELL_HIDDEN:
                return '#f0f0f0';
            case this.CELL_REVEALED:
                return cell.adjacentMines === 0 ? '#e0e0e0' : '#f5f5f5';
            case this.CELL_FLAGGED:
                return '#ffcccc';
            case this.CELL_MINE:
                return this.gameOver ? '#ff4444' : '#ffcccc';
            case this.CELL_EXPLODED:
                return '#ff0000';
            default:
                return '#f0f0f0';
        }
    },

    drawCellContent(row, col) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        const cell = this.board[row][col];
        
        if (cell.state === this.CELL_FLAGGED) {
            // Draw flag
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🚩', x + this.cellSize/2, y + this.cellSize/2);
        } else if (cell.state === this.CELL_MINE) {
            // Draw mine
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('💣', x + this.cellSize/2, y + this.cellSize/2);
        } else if (cell.state === this.CELL_EXPLODED) {
            // Draw exploded mine
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('💥', x + this.cellSize/2, y + this.cellSize/2);
        } else if (cell.state === this.CELL_REVEALED && cell.adjacentMines > 0) {
            // Draw number
            this.ctx.fillStyle = this.getNumberColor(cell.adjacentMines);
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(cell.adjacentMines, x + this.cellSize/2, y + this.cellSize/2);
        }
    },

    getNumberColor(number) {
        const colors = [
            '#000000', // 1 - Black
            '#0000FF', // 2 - Blue
            '#008000', // 3 - Green
            '#800000', // 4 - Maroon
            '#808080', // 5 - Gray
            '#800080', // 6 - Purple
            '#008080', // 7 - Teal
            '#000000'  // 8 - Black
        ];
        return colors[number - 1] || '#000000';
    }
};

// Global functions
function newMinesweeperGame() {
    minesweeperGame.newGame();
}

function changeDifficulty() {
    const select = document.getElementById('difficultySelect');
    const value = select.value;
    
    switch (value) {
        case 'beginner':
            minesweeperGame.rows = 9;
            minesweeperGame.cols = 9;
            minesweeperGame.mines = 10;
            minesweeperGame.canvas.width = 288;
            minesweeperGame.canvas.height = 288;
            break;
        case 'intermediate':
            minesweeperGame.rows = 16;
            minesweeperGame.cols = 16;
            minesweeperGame.mines = 40;
            minesweeperGame.canvas.width = 512;
            minesweeperGame.canvas.height = 512;
            break;
        case 'expert':
            minesweeperGame.rows = 16;
            minesweeperGame.cols = 30;
            minesweeperGame.mines = 99;
            minesweeperGame.canvas.width = 960;
            minesweeperGame.canvas.height = 512;
            break;
    }
    
    minesweeperGame.setupCanvas();
    minesweeperGame.newGame();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the minesweeper page
    if (document.getElementById('minesweeperCanvas')) {
        minesweeperGame.init();
    }
});
