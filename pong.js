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
