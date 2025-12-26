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
    start: { x: 0, y: 0 },   // Top-left corner
    end: { x: 19, y: 19 },   // Bottom-right corner
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
        // Standard Prim's algorithm for guaranteed connectivity
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

    addSingleWallToList(x, y, walls) {
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left
        const validWalls = [];

        for (let i = 0; i < 4; i++) {
            const [dx, dy] = directions[i];
            const nx = x + dx;
            const ny = y + dy;

            // Only add walls that lead to valid, unvisited cells
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && !this.maze[ny][nx].visited) {
                validWalls.push({ x: x, y: y, direction: i });
            }
        }

        // Only add one random wall instead of all walls
        if (validWalls.length > 0) {
            const randomIndex = Math.floor(Math.random() * validWalls.length);
            walls.push(validWalls[randomIndex]);
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
            case 'bfs-parallel':
                await this.solveMazeBFSParallel();
                break;
            case 'dfs':
                await this.solveMazeDFS();
                break;
            case 'dfs-parallel':
                await this.solveMazeDFSParallel();
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

    async solveMazeBFSParallel() {
        // Parallelized BFS - explore all nodes at current level simultaneously
        const visited = new Set();
        let currentLevel = [{ x: this.start.x, y: this.start.y, path: [] }];
        visited.add(`${this.start.x},${this.start.y}`);
        this.maze[this.start.y][this.start.x].isVisited = true;

        // Store the path to each cell for final path reconstruction
        const cameFrom = new Map();
        cameFrom.set(`${this.start.x},${this.start.y}`, null);

        while (currentLevel.length > 0) {
            // Mark all cells in current level as exploring simultaneously
            for (let cell of currentLevel) {
                this.maze[cell.y][cell.x].isExploring = true;
            }
            this.drawMaze();
            await this.sleep(100); // Longer pause to show parallel exploration

            // Check if we found the end in this level
            for (let cell of currentLevel) {
                if (cell.x === this.end.x && cell.y === this.end.y) {
                    // Found the end - reconstruct and animate the final path
                    for (let c of currentLevel) {
                        this.maze[c.y][c.x].isExploring = false;
                    }

                    // Reconstruct path
                    const finalPath = [];
                    let current = cell;
                    while (current) {
                        finalPath.unshift(current);
                        const key = `${current.x},${current.y}`;
                        current = cameFrom.get(key);
                    }

                    for (let i = 1; i < finalPath.length; i++) {
                        const pos = finalPath[i];
                        this.maze[pos.y][pos.x].isPath = true;
                        this.drawMaze();
                        await this.sleep(50);
                    }

                    this.isSolving = false;
                    this.solved = true;
                    this.updateUI();
                    return;
                }
            }

            // Generate next level by exploring all neighbors of current level simultaneously
            const nextLevel = [];
            for (let cell of currentLevel) {
                // Stop marking current cell as exploring, mark as visited
                this.maze[cell.y][cell.x].isExploring = false;
                this.maze[cell.y][cell.x].isVisited = true;

                const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left

                for (let i = 0; i < directions.length; i++) {
                    if (!this.maze[cell.y][cell.x].walls[i]) {
                        const [dx, dy] = directions[i];
                        const nx = cell.x + dx;
                        const ny = cell.y + dy;
                        const key = `${nx},${ny}`;

                        if (!visited.has(key)) {
                            visited.add(key);
                            const newCell = {
                                x: nx,
                                y: ny,
                                path: [...cell.path, { x: nx, y: ny }]
                            };
                            nextLevel.push(newCell);
                            cameFrom.set(key, cell);
                            // Mark as visited immediately
                            this.maze[ny][nx].isVisited = true;
                        }
                    }
                }
            }

            currentLevel = nextLevel;
            this.drawMaze();
            await this.sleep(150); // Pause between levels to show parallel nature
        }

        this.isSolving = false;
        this.updateUI();
    },

    async solveMazeDFSParallel() {
        // Parallelized DFS - explore multiple branches simultaneously
        const visited = new Set();
        let activePaths = [{ x: this.start.x, y: this.start.y, path: [] }];
        visited.add(`${this.start.x},${this.start.y}`);
        this.maze[this.start.y][this.start.x].isVisited = true;

        // Store the path to each cell for final path reconstruction
        const cameFrom = new Map();
        cameFrom.set(`${this.start.x},${this.start.y}`, null);

        while (activePaths.length > 0) {
            // Mark all current path ends as exploring simultaneously
            for (let path of activePaths) {
                this.maze[path.y][path.x].isExploring = true;
            }
            this.drawMaze();
            await this.sleep(80); // Medium pause to show parallel exploration

            // Check if any active path found the end
            for (let path of activePaths) {
                if (path.x === this.end.x && path.y === this.end.y) {
                    // Found the end - reconstruct and animate the final path
                    for (let p of activePaths) {
                        this.maze[p.y][p.x].isExploring = false;
                    }

                    // Reconstruct path
                    const finalPath = [];
                    let current = path;
                    while (current) {
                        finalPath.unshift(current);
                        const key = `${current.x},${current.y}`;
                        current = cameFrom.get(key);
                    }

                    for (let i = 1; i < finalPath.length; i++) {
                        const pos = finalPath[i];
                        this.maze[pos.y][pos.x].isPath = true;
                        this.drawMaze();
                        await this.sleep(50);
                    }

                    this.isSolving = false;
                    this.solved = true;
                    this.updateUI();
                    return;
                }
            }

            // Generate next set of active paths by exploring all unvisited neighbors simultaneously
            const nextActivePaths = [];

            for (let path of activePaths) {
                // Stop marking current cell as exploring, mark as visited
                this.maze[path.y][path.x].isExploring = false;
                this.maze[path.y][path.x].isVisited = true;

                const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left
                const unvisitedNeighbors = [];

                // Find all unvisited neighbors
                for (let i = 0; i < directions.length; i++) {
                    if (!this.maze[path.y][path.x].walls[i]) {
                        const [dx, dy] = directions[i];
                        const nx = path.x + dx;
                        const ny = path.y + dy;
                        const key = `${nx},${ny}`;

                        if (!visited.has(key)) {
                            unvisitedNeighbors.push({ x: nx, y: ny });
                        }
                    }
                }

                // Add all unvisited neighbors to next active paths (parallel exploration)
                for (let neighbor of unvisitedNeighbors) {
                    visited.add(`${neighbor.x},${neighbor.y}`);
                    const newPath = {
                        x: neighbor.x,
                        y: neighbor.y,
                        path: [...path.path, { x: neighbor.x, y: neighbor.y }]
                    };
                    nextActivePaths.push(newPath);
                    cameFrom.set(`${neighbor.x},${neighbor.y}`, path);
                    // Mark as visited immediately
                    this.maze[neighbor.y][neighbor.x].isVisited = true;
                }
            }

            activePaths = nextActivePaths;
            this.drawMaze();
            await this.sleep(120); // Pause between parallel steps
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
