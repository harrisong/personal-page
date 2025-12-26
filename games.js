// ========================================
// PONG GAME
// ========================================
let pongGame = {
    canvas: null,
    ctx: null,
    ball: { x: 400, y: 200, dx: 4, dy: 4, radius: 10 },
    paddle1: { x: 10, y: 150, width: 10, height: 100 },
    paddle2: { x: 780, y: 150, width: 10, height: 100 },
    score1: 0,
    score2: 0,
    isPlaying: false,
    keys: {},

    init() {
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.addEventListeners();
        this.reset(); // Draw initial state with paddles visible
    },

    addEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    },

    start() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.gameLoop();
        }
    },

    reset() {
        this.isPlaying = false;
        this.score1 = 0;
        this.score2 = 0;
        this.resetBall();
        this.resetPaddles();
        this.updateScore();
        this.draw();
    },

    resetBall() {
        this.ball.x = 400;
        this.ball.y = 200;
        this.ball.dx = Math.random() > 0.5 ? 4 : -4;
        this.ball.dy = Math.random() > 0.5 ? 4 : -4;
    },

    resetPaddles() {
        this.paddle1.y = 150;
        this.paddle2.y = 150;
    },

    updateScore() {
        document.getElementById('pongScore').textContent = `Score: Player 1: ${this.score1} - Player 2: ${this.score2}`;
    },

    update() {
        // Update ball position
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball collision with top/bottom
        if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.canvas.height) {
            this.ball.dy = -this.ball.dy;
        }

        // Ball collision with paddles
        if (this.ball.x - this.ball.radius <= this.paddle1.x + this.paddle1.width &&
            this.ball.y >= this.paddle1.y && this.ball.y <= this.paddle1.y + this.paddle1.height &&
            this.ball.dx < 0) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.x + this.ball.radius >= this.paddle2.x &&
            this.ball.y >= this.paddle2.y && this.ball.y <= this.paddle2.y + this.paddle2.height &&
            this.ball.dx > 0) {
            this.ball.dx = -this.ball.dx;
        }

        // Scoring
        if (this.ball.x < 0) {
            this.score2++;
            this.resetBall();
            this.updateScore();
        }
        if (this.ball.x > this.canvas.width) {
            this.score1++;
            this.resetBall();
            this.updateScore();
        }

        // Update paddles
        if (this.keys['KeyW'] && this.paddle1.y > 0) this.paddle1.y -= 5;
        if (this.keys['KeyS'] && this.paddle1.y < this.canvas.height - this.paddle1.height) this.paddle1.y += 5;
        if (this.keys['ArrowUp'] && this.paddle2.y > 0) this.paddle2.y -= 5;
        if (this.keys['ArrowDown'] && this.paddle2.y < this.canvas.height - this.paddle2.height) this.paddle2.y += 5;
    },

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw center line
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.strokeStyle = '#CD853F';
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw paddles
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height);
        this.ctx.fillRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height);

        // Draw ball
        this.ctx.fillStyle = '#CD853F';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    },

    gameLoop() {
        if (this.isPlaying) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
};

// ========================================
// MAZE SOLVER
// ========================================
let mazeGame = {
    canvas: null,
    ctx: null,
    maze: [],
    width: 20,
    height: 20,
    cellSize: 20,
    start: { x: 1, y: 1 },
    end: { x: 18, y: 18 },
    mazeGenerated: false,
    isSolving: false,
    solved: false,

    init() {
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.generateMaze();
    },

    generateMaze() {
        this.maze = [];
        for (let y = 0; y < this.height; y++) {
            this.maze[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x] = {
                    walls: [true, true, true, true], // top, right, bottom, left
                    visited: false,
                    isPath: false
                };
            }
        }

        // Generate maze using Prim's algorithm for guaranteed connectivity
        this.generateMazePrims();

        this.mazeGenerated = true;
        this.solved = false;
        this.updateUI();
        this.drawMaze();
    },

    generateMazePrims() {
        // Prim's algorithm for maze generation - guarantees connectivity
        const walls = [];

        // Start with the starting cell
        this.maze[this.start.y][this.start.x].visited = true;

        // Add walls of the starting cell to the wall list
        this.addWallsToList(this.start.x, this.start.y, walls);

        while (walls.length > 0) {
            // Pick a random wall
            const wallIndex = Math.floor(Math.random() * walls.length);
            const wall = walls[wallIndex];
            walls.splice(wallIndex, 1);

            const x = wall.x;
            const y = wall.y;
            const direction = wall.direction;

            // Find the cell on the other side of the wall
            const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left
            const [dx, dy] = directions[direction];
            const nx = x + dx;
            const ny = y + dy;

            // If the cell on the other side hasn't been visited
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && !this.maze[ny][nx].visited) {
                // Remove the wall
                this.maze[y][x].walls[direction] = false;
                this.maze[ny][nx].walls[(direction + 2) % 4] = false;

                // Mark the new cell as visited
                this.maze[ny][nx].visited = true;

                // Add the walls of the new cell to the wall list
                this.addWallsToList(nx, ny, walls);
            }
        }
    },

    addWallsToList(x, y, walls) {
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left

        for (let i = 0; i < 4; i++) {
            const [dx, dy] = directions[i];
            const nx = x + dx;
            const ny = y + dy;

            // Only add walls that lead to valid, unvisited cells
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                walls.push({ x: x, y: y, direction: i });
            }
        }
    },

    ensureConnectivity() {
        // Use BFS to find a path from start to end through existing passages
        const visited = new Set();
        const queue = [{ x: this.start.x, y: this.start.y, path: [] }];
        const parentMap = new Map();

        visited.add(`${this.start.x},${this.start.y}`);

        while (queue.length > 0) {
            const current = queue.shift();
            const { x, y, path } = current;

            if (x === this.end.x && y === this.end.y) {
                // Found a path, now carve it
                this.carvePathAlongExistingStructure(path);
                return;
            }

            const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left

            for (let i = 0; i < directions.length; i++) {
                if (!this.maze[y][x].walls[i]) {
                    const [dx, dy] = directions[i];
                    const nx = x + dx;
                    const ny = y + dy;
                    const key = `${nx},${ny}`;

                    if (!visited.has(key) && nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                        visited.add(key);
                        queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
                    }
                }
            }
        }

        // If no path found through existing passages, create a more natural path
        this.createNaturalPath();
    },

    carvePathAlongExistingStructure(path) {
        // The path is already valid since it follows existing passages
        // Mark these cells as part of the solution path for visualization
        path.forEach(pos => {
            this.maze[pos.y][pos.x].isPath = true;
        });
    },

    createNaturalPath() {
        // Create a path that weaves through the maze more naturally
        // Use a simple random walk with bias toward the end goal
        let currentX = this.start.x;
        let currentY = this.start.y;
        const visited = new Set();
        visited.add(`${currentX},${currentY}`);

        const maxSteps = 1000; // Prevent infinite loops
        let steps = 0;

        while ((currentX !== this.end.x || currentY !== this.end.y) && steps < maxSteps) {
            const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left
            const validMoves = [];

            // Find valid moves (through walls or to unvisited cells)
            for (let i = 0; i < directions.length; i++) {
                const [dx, dy] = directions[i];
                const nx = currentX + dx;
                const ny = currentY + dy;

                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height &&
                    !visited.has(`${nx},${ny}`)) {
                    validMoves.push({ x: nx, y: ny, dir: i });
                }
            }

            if (validMoves.length === 0) {
                // Backtrack if stuck
                visited.clear();
                visited.add(`${this.start.x},${this.start.y}`);
                currentX = this.start.x;
                currentY = this.start.y;
                continue;
            }

            // Choose move with bias toward end goal
            validMoves.sort((a, b) => {
                const distA = Math.abs(a.x - this.end.x) + Math.abs(a.y - this.end.y);
                const distB = Math.abs(b.x - this.end.x) + Math.abs(b.y - this.end.y);
                return distA - distB;
            });

            // Prefer closer moves but add some randomness
            const chosenMove = validMoves[Math.floor(Math.random() * Math.min(3, validMoves.length))];

            // Carve passage if wall exists
            const [dx, dy] = directions[chosenMove.dir];
            if (this.maze[currentY][currentX].walls[chosenMove.dir]) {
                this.maze[currentY][currentX].walls[chosenMove.dir] = false;
                const opposites = [2, 3, 0, 1];
                this.maze[chosenMove.y][chosenMove.x].walls[opposites[chosenMove.dir]] = false;
            }

            currentX = chosenMove.x;
            currentY = chosenMove.y;
            visited.add(`${currentX},${currentY}`);
            steps++;
        }
    },

    carveMaze(x, y) {
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left
        const opposites = [2, 3, 0, 1];

        this.maze[y][x].visited = true;

        const shuffledDirections = directions.sort(() => Math.random() - 0.5);

        for (let i = 0; i < shuffledDirections.length; i++) {
            const [dx, dy] = shuffledDirections[i];
            const nx = x + dx * 2;
            const ny = y + dy * 2;

            if (nx > 0 && nx < this.width - 1 && ny > 0 && ny < this.height - 1 && !this.maze[ny][nx].visited) {
                this.maze[y][x].walls[i] = false;
                this.maze[y + dy][x + dx].walls[opposites[i]] = false;
                this.carveMaze(nx, ny);
            }
        }
    },

    async solveMaze() {
        if (!this.mazeGenerated) return;

        const algorithmSelect = document.getElementById('algorithmSelect');
        const selectedAlgorithm = algorithmSelect.value;

        this.isSolving = true;
        this.solved = false;
        this.updateUI();

        // Clear any previous path markings
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x].isPath = false;
                this.maze[y][x].isVisited = false;
                this.maze[y][x].isExploring = false;
            }
        }

        // Choose algorithm based on selection
        switch (selectedAlgorithm) {
            case 'bfs':
                await this.solveMazeBFS();
                break;
            case 'dfs':
                await this.solveMazeDFS();
                break;
            case 'dijkstra':
                await this.solveMazeDijkstra();
                break;
            case 'astar':
                await this.solveMazeAStar();
                break;
            default:
                await this.solveMazeBFS(); // Default to BFS
        }
    },

    async solveMazeBFS() {
        // BFS to find path with animation
        const queue = [{ x: this.start.x, y: this.start.y, path: [] }];
        const visited = new Set();
        visited.add(`${this.start.x},${this.start.y}`);
        this.maze[this.start.y][this.start.x].isVisited = true;

        while (queue.length > 0) {
            const current = queue.shift();
            const { x, y, path } = current;

            // Mark current cell as being explored
            this.maze[y][x].isExploring = true;
            this.drawMaze();
            await this.sleep(30);

            if (x === this.end.x && y === this.end.y) {
                // Found the end - animate the final path
                this.maze[y][x].isExploring = false;
                for (let pos of path) {
                    this.maze[pos.y][pos.x].isPath = true;
                    this.drawMaze();
                    await this.sleep(50);
                }
                // Mark the end as part of the path
                this.maze[y][x].isPath = true;
                this.drawMaze();

                this.isSolving = false;
                this.solved = true;
                this.updateUI();
                return;
            }

            // Stop marking current cell as exploring, mark as visited
            this.maze[y][x].isExploring = false;
            this.maze[y][x].isVisited = true;

            const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left

            for (let i = 0; i < directions.length; i++) {
                if (!this.maze[y][x].walls[i]) {
                    const [dx, dy] = directions[i];
                    const nx = x + dx;
                    const ny = y + dy;

                    if (!visited.has(`${nx},${ny}`)) {
                        visited.add(`${nx},${ny}`);
                        queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
                        // Mark new cells as visited immediately when added to queue
                        this.maze[ny][nx].isVisited = true;
                    }
                }
            }

            this.drawMaze();
            await this.sleep(50);
        }

        this.isSolving = false;
        this.updateUI();
    },

    async solveMazeDFS() {
        // DFS to find path with animation
        const stack = [{ x: this.start.x, y: this.start.y, path: [] }];
        const visited = new Set();
        visited.add(`${this.start.x},${this.start.y}`);
        this.maze[this.start.y][this.start.x].isVisited = true;

        while (stack.length > 0) {
            const current = stack.pop();
            const { x, y, path } = current;

            // Mark current cell as being explored
            this.maze[y][x].isExploring = true;
            this.drawMaze();
            await this.sleep(30);

            if (x === this.end.x && y === this.end.y) {
                // Found the end - animate the final path
                this.maze[y][x].isExploring = false;
                for (let pos of path) {
                    this.maze[pos.y][pos.x].isPath = true;
                    this.drawMaze();
                    await this.sleep(50);
                }
                // Mark the end as part of the path
                this.maze[y][x].isPath = true;
                this.drawMaze();

                this.isSolving = false;
                this.solved = true;
                this.updateUI();
                return;
            }

            // Stop marking current cell as exploring, mark as visited
            this.maze[y][x].isExploring = false;
            this.maze[y][x].isVisited = true;

            const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left

            for (let i = 0; i < directions.length; i++) {
                if (!this.maze[y][x].walls[i]) {
                    const [dx, dy] = directions[i];
                    const nx = x + dx;
                    const ny = y + dy;

                    if (!visited.has(`${nx},${ny}`)) {
                        visited.add(`${nx},${ny}`);
                        stack.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
                        // Mark new cells as visited immediately when added to queue
                        this.maze[ny][nx].isVisited = true;
                    }
                }
            }

            this.drawMaze();
            await this.sleep(50);
        }

        this.isSolving = false;
        this.updateUI();
    },

    async solveMazeDijkstra() {
        // Dijkstra's algorithm (same as BFS for unweighted grid)
        await this.solveMazeBFS();
    },

    async solveMazeAStar() {
        // A* algorithm with Manhattan distance heuristic
        const openSet = [{ x: this.start.x, y: this.start.y, path: [], g: 0, h: 0, f: 0 }];
        const closedSet = new Set();
        const cameFrom = new Map();

        // Calculate heuristic (Manhattan distance)
        const heuristic = (x, y) => Math.abs(x - this.end.x) + Math.abs(y - this.end.y);

        while (openSet.length > 0) {
            // Find node with lowest f score
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const { x, y, path } = current;

            if (closedSet.has(`${x},${y}`)) continue;

            // Mark current cell as being explored
            this.maze[y][x].isExploring = true;
            this.drawMaze();
            await this.sleep(30);

            if (x === this.end.x && y === this.end.y) {
                // Found the end - reconstruct and animate the final path
                this.maze[y][x].isExploring = false;

                // Reconstruct path
                let currentPos = { x, y };
                const finalPath = [];
                while (cameFrom.has(`${currentPos.x},${currentPos.y}`)) {
                    finalPath.unshift(currentPos);
                    currentPos = cameFrom.get(`${currentPos.x},${currentPos.y}`);
                }

                for (let pos of finalPath) {
                    this.maze[pos.y][pos.x].isPath = true;
                    this.drawMaze();
                    await this.sleep(50);
                }
                // Mark the end as part of the path
                this.maze[y][x].isPath = true;
                this.drawMaze();

                this.isSolving = false;
                this.solved = true;
                this.updateUI();
                return;
            }

            // Stop marking current cell as exploring, mark as visited
            this.maze[y][x].isExploring = false;
            this.maze[y][x].isVisited = true;
            closedSet.add(`${x},${y}`);

            const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left

            for (let i = 0; i < directions.length; i++) {
                if (!this.maze[y][x].walls[i]) {
                    const [dx, dy] = directions[i];
                    const nx = x + dx;
                    const ny = y + dy;

                    if (!closedSet.has(`${nx},${ny}`)) {
                        const g = current.g + 1; // Cost is 1 for each step
                        const h = heuristic(nx, ny);
                        const f = g + h;

                        // Check if this path to neighbor is better
                        const existingIndex = openSet.findIndex(node => node.x === nx && node.y === ny);
                        if (existingIndex === -1 || g < openSet[existingIndex].g) {
                            if (existingIndex !== -1) {
                                openSet.splice(existingIndex, 1);
                            }

                            openSet.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }], g, h, f });
                            cameFrom.set(`${nx},${ny}`, { x, y });
                            this.maze[ny][nx].isVisited = true;
                        }
                    }
                }
            }

            this.drawMaze();
            await this.sleep(50);
        }

        this.isSolving = false;
        this.updateUI();
    },



    resetMaze() {
        this.mazeGenerated = false;
        this.isSolving = false;
        this.solved = false;
        this.generateMaze();
    },

    updateUI() {
        const solveBtn = document.getElementById('solveBtn');
        const status = document.getElementById('mazeStatus');

        solveBtn.disabled = !this.mazeGenerated || this.isSolving;

        if (this.isSolving) {
            status.textContent = 'Solving...';
        } else if (this.solved) {
            status.textContent = 'Maze Solved!';
        } else {
            status.textContent = '';
        }
    },

    drawMaze() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.maze[y][x];

                // Draw walls
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 2;

                if (cell.walls[0]) { // top
                    this.ctx.beginPath();
                    this.ctx.moveTo(x * this.cellSize, y * this.cellSize);
                    this.ctx.lineTo((x + 1) * this.cellSize, y * this.cellSize);
                    this.ctx.stroke();
                }
                if (cell.walls[1]) { // right
                    this.ctx.beginPath();
                    this.ctx.moveTo((x + 1) * this.cellSize, y * this.cellSize);
                    this.ctx.lineTo((x + 1) * this.cellSize, (y + 1) * this.cellSize);
                    this.ctx.stroke();
                }
                if (cell.walls[2]) { // bottom
                    this.ctx.beginPath();
                    this.ctx.moveTo(x * this.cellSize, (y + 1) * this.cellSize);
                    this.ctx.lineTo((x + 1) * this.cellSize, (y + 1) * this.cellSize);
                    this.ctx.stroke();
                }
                if (cell.walls[3]) { // left
                    this.ctx.beginPath();
                    this.ctx.moveTo(x * this.cellSize, y * this.cellSize);
                    this.ctx.lineTo(x * this.cellSize, (y + 1) * this.cellSize);
                    this.ctx.stroke();
                }

                // Draw exploration states
                if (cell.isExploring) {
                    // Current cell being explored - bright blue
                    this.ctx.fillStyle = '#0088ff';
                    this.ctx.fillRect(x * this.cellSize + 2, y * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4);
                } else if (cell.isVisited) {
                    // Visited cells - light blue
                    this.ctx.fillStyle = '#add8e6';
                    this.ctx.fillRect(x * this.cellSize + 2, y * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4);
                } else if (cell.isPath) {
                    // Final solution path - green
                    this.ctx.fillStyle = '#42b883';
                    this.ctx.fillRect(x * this.cellSize + 2, y * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4);
                }
            }
        }

        // Draw start and end
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.start.x * this.cellSize + 5, this.start.y * this.cellSize + 5, this.cellSize - 10, this.cellSize - 10);

        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.end.x * this.cellSize + 5, this.end.y * this.cellSize + 5, this.cellSize - 10, this.cellSize - 10);
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

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

// ========================================
// TRIE SEARCH
// ========================================
let trieGame = {
    canvas: null,
    ctx: null,
    trie: { children: {}, isEndOfWord: false },
    searchTerm: '',
    newWord: '',
    searchResults: [],
    words: ['apple', 'application', 'app', 'applet', 'bat', 'battle', 'cat', 'catalog', 'catch'],

    init() {
        this.canvas = document.getElementById('trieCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.initializeTrie();
        this.drawTrie();
    },

    initializeTrie() {
        this.words.forEach(word => this.insert(word));
    },

    insert(word) {
        let node = this.trie;
        for (let char of word) {
            if (!node.children[char]) {
                node.children[char] = { children: {}, isEndOfWord: false };
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
    },

    search() {
        if (this.searchTerm === '') {
            this.searchResults = [];
            this.updateResults();
            this.drawTrie();
            return;
        }

        this.searchResults = this.findWordsWithPrefix(this.searchTerm);
        this.updateResults();
        this.drawTrie(this.searchTerm);
    },

    findWordsWithPrefix(prefix) {
        let node = this.trie;
        for (let char of prefix) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }

        const results = [];
        this.collectWords(node, prefix, results);
        return results;
    },

    collectWords(node, currentWord, results) {
        if (node.isEndOfWord) {
            results.push(currentWord);
        }

        for (let char in node.children) {
            this.collectWords(node.children[char], currentWord + char, results);
        }
    },

    addWord() {
        const newWordInput = document.getElementById('newWordInput');
        const word = newWordInput.value.trim();

        if (word && !this.words.includes(word)) {
            this.words.push(word);
            this.insert(word);
            newWordInput.value = '';
            this.drawTrie(this.searchTerm);
        }
    },

    updateResults() {
        const resultsElement = document.getElementById('searchResults');
        if (this.searchResults.length > 0) {
            resultsElement.textContent = 'Results: ' + this.searchResults.join(', ');
        } else if (this.searchTerm) {
            resultsElement.textContent = 'No results found';
        } else {
            resultsElement.textContent = '';
        }
    },

    drawTrie(highlightPrefix = '') {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const startX = 400;
        const startY = 50;
        const levelHeight = 80;
        const nodeRadius = 20;

        this.drawNode(this.trie, startX, startY, levelHeight, nodeRadius, '', highlightPrefix, 0);
    },

    drawNode(node, x, y, levelHeight, nodeRadius, currentPrefix, highlightPrefix, depth) {
        // Draw node
        const isHighlighted = highlightPrefix.startsWith(currentPrefix) && currentPrefix.length <= highlightPrefix.length;
        this.ctx.fillStyle = isHighlighted ? '#42b883' : '#fff';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw character
        this.ctx.fillStyle = '#000';
        this.ctx.font = '16px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const char = currentPrefix[currentPrefix.length - 1] || 'root';
        this.ctx.fillText(char === 'root' ? '∅' : char, x, y);

        // Draw end of word marker
        if (node.isEndOfWord) {
            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.arc(x + nodeRadius - 5, y - nodeRadius + 5, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw children
        const children = Object.keys(node.children);
        const childSpacing = 150 / Math.max(1, children.length - 1) || 150;

        children.forEach((char, index) => {
            const childX = x - (children.length - 1) * childSpacing / 2 + index * childSpacing;
            const childY = y + levelHeight;

            // Draw line to child
            this.ctx.strokeStyle = isHighlighted && highlightPrefix.startsWith(currentPrefix + char) ? '#42b883' : '#000';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + nodeRadius);
            this.ctx.lineTo(childX, childY - nodeRadius);
            this.ctx.stroke();

            this.drawNode(node.children[char], childX, childY, levelHeight, nodeRadius, currentPrefix + char, highlightPrefix, depth + 1);
        });
    }
};

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
