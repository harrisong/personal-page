// ========================================
// SUDOKU SOLVER
// ========================================
let sudokuGame = {
    canvas: null,
    ctx: null,
    grid: [],
    cellSize: 50,
    puzzleGenerated: false,
    isSolving: false,
    solved: false,

    init() {
        this.canvas = document.getElementById('sudokuCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.initializeGrid();
        this.generatePuzzle();
    },

    initializeGrid() {
        this.grid = [];
        for (let i = 0; i < 9; i++) {
            this.grid[i] = [];
            for (let j = 0; j < 9; j++) {
                this.grid[i][j] = {
                    value: 0,
                    fixed: false
                };
            }
        }
    },

    generatePuzzle() {
        this.initializeGrid();

        // Create a solved grid
        this.solveSudokuGrid();

        // Remove some numbers to create puzzle
        const cellsToRemove = 45;
        const positions = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                positions.push([i, j]);
            }
        }

        // Shuffle and remove
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        for (let i = 0; i < cellsToRemove; i++) {
            const [row, col] = positions[i];
            this.grid[row][col].value = 0;
            this.grid[row][col].fixed = false;
        }

        this.puzzleGenerated = true;
        this.solved = false;
        this.updateUI();
        this.drawGrid();
    },

    async solveSudoku() {
        if (!this.puzzleGenerated) return;

        this.isSolving = true;
        this.solved = false;
        this.updateUI();

        const solved = await this.solveSudokuStep(0, 0);
        this.isSolving = false;
        this.solved = solved;
        this.updateUI();
        this.drawGrid();
    },

    async solveSudokuStep(row, col) {
        if (col === 9) {
            row++;
            col = 0;
        }
        if (row === 9) {
            return true;
        }

        if (this.grid[row][col].value !== 0) {
            return this.solveSudokuStep(row, col + 1);
        }

        for (let num = 1; num <= 9; num++) {
            if (this.isValid(row, col, num)) {
                this.grid[row][col].value = num;

                // Visualize step
                this.drawGrid();
                await this.sleep(20);

                if (await this.solveSudokuStep(row, col + 1)) {
                    return true;
                }

                this.grid[row][col].value = 0;
            }
        }

        return false;
    },

    solveSudokuGrid() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col].value === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValid(row, col, num)) {
                            this.grid[row][col].value = num;
                            if (this.solveSudokuGrid()) {
                                return true;
                            }
                            this.grid[row][col].value = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    },

    isValid(row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (this.grid[row][x].value === num) {
                return false;
            }
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (this.grid[x][col].value === num) {
                return false;
            }
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.grid[boxRow + i][boxCol + j].value === num) {
                    return false;
                }
            }
        }

        return true;
    },

    resetSudoku() {
        this.puzzleGenerated = false;
        this.isSolving = false;
        this.solved = false;
        this.generatePuzzle();
    },

    updateUI() {
        const solveBtn = document.getElementById('solveSudokuBtn');
        const status = document.getElementById('sudokuStatus');

        solveBtn.disabled = !this.puzzleGenerated || this.isSolving;

        if (this.isSolving) {
            status.textContent = 'Solving...';
        } else if (this.solved) {
            status.textContent = 'Sudoku Solved!';
        } else {
            status.textContent = '';
        }
    },

    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;

        // Thick lines for 3x3 boxes
        for (let i = 0; i <= 9; i++) {
            const lineWidth = (i % 3 === 0) ? 4 : 1;
            this.ctx.lineWidth = lineWidth;

            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();

            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }

        // Draw numbers
        this.ctx.font = '24px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.grid[row][col];
                if (cell.value !== 0) {
                    this.ctx.fillStyle = cell.fixed ? '#000' : '#42b883';
                    this.ctx.fillText(
                        cell.value.toString(),
                        col * this.cellSize + this.cellSize / 2,
                        row * this.cellSize + this.cellSize / 2
                    );
                }
            }
        }
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
