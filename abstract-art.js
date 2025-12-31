// Optimized Dotted Background Particles
class DottedBackground {
    constructor() {
        this.canvas = document.getElementById('abstract-bg');
        this.ctx = this.canvas.getContext('2d', { alpha: true, desynchronized: true });
        this.dots = [];
        this.traversingLines = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.traversingLineCounter = 0;
        this.lastTime = 0;
        this.frameRate = 60;
        this.frameInterval = 1000 / this.frameRate;
        this.resize();
        this.generateDots();
        this.addMouseListeners();
        this.animate(); // Start animation loop
        window.addEventListener('resize', () => {
            this.resize();
            this.generateDots();
            this.traversingLines = []; // Clear traversing lines on resize
        });
    }

    addMouseListeners() {
        // Use passive event listeners for better performance
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateDotsParallax();
        }, { passive: true });

        // For touch devices
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
                this.updateDotsParallax();
            }
        }, { passive: true });
    }

    updateDotsParallax() {
        // Optimize parallax calculation by reducing complexity
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const mouseOffsetX = (this.mouseX - centerX) / centerX; // -1 to 1
        const mouseOffsetY = (this.mouseY - centerY) / centerY; // -1 to 1

        // Batch update dots to reduce individual calculations
        for (let i = 0; i < this.dots.length; i++) {
            const dot = this.dots[i];
            const layer = (i % 8) + 1;
            const parallaxFactor = layer * 0.15; // Reduced for smoother performance

            const moveX = mouseOffsetX * parallaxFactor * 20; // Slightly reduced movement
            const moveY = mouseOffsetY * parallaxFactor * 20;

            dot.targetX = dot.originalX + moveX;
            dot.targetY = dot.originalY + moveY;
        }
    }

    animate(currentTime = 0) {
        // Frame rate limiting for better performance
        if (currentTime - this.lastTime < this.frameInterval) {
            requestAnimationFrame((time) => this.animate(time));
            return;
        }
        this.lastTime = currentTime;

        // Update physics with optimized calculations
        this.updatePhysics();

        // Update traversing lines less frequently for performance
        if (this.traversingLineCounter % 2 === 0) { // Update every other frame
            this.updateTraversingLines();
        }

        // Periodically create new traversing lines (reduced frequency)
        this.traversingLineCounter++;
        if (this.traversingLineCounter >= 240) { // Every 4 seconds at 60fps
            this.createTraversingLine();
            this.traversingLineCounter = 0;
        }

        // Redraw canvas
        this.redrawCanvas();

        // Continue animation loop
        requestAnimationFrame((time) => this.animate(time));
    }

    updatePhysics() {
        // Optimized physics update with reduced calculations
        const damping = 0.90; // Increased damping for smoother movement
        const acceleration = 0.015; // Reduced acceleration for smoother movement

        for (let i = 0; i < this.dots.length; i++) {
            const dot = this.dots[i];
            
            // Simplified physics calculation
            const dx = dot.targetX - dot.x;
            const dy = dot.targetY - dot.y;

            // Skip if very close to target (optimization)
            if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
                dot.x = dot.targetX;
                dot.y = dot.targetY;
                dot.vx = 0;
                dot.vy = 0;
                continue;
            }

            // Apply simplified physics
            dot.vx = dot.vx * damping + dx * acceleration;
            dot.vy = dot.vy * damping + dy * acceleration;
            dot.x += dot.vx;
            dot.y += dot.vy;

            // Boundary check with early exit
            if (dot.x < -15 || dot.x > this.canvas.width + 15 || 
                dot.y < -15 || dot.y > this.canvas.height + 15) {
                dot.x = Math.max(-15, Math.min(this.canvas.width + 15, dot.x));
                dot.y = Math.max(-15, Math.min(this.canvas.height + 15, dot.y));
            }
        }
    }

    updateTraversingLines() {
        // Optimized traversing lines update
        for (let i = this.traversingLines.length - 1; i >= 0; i--) {
            const line = this.traversingLines[i];
            if (!line.hasCompletedCycle) {
                if (line.isDrawing) {
                    line.progress += line.drawSpeed;
                    if (line.progress >= 1) {
                        line.progress = 1;
                        line.isDrawing = false;
                        line.isErasing = true;
                        line.progress = 0;
                    }
                } else if (line.isErasing) {
                    line.progress += line.drawSpeed * 1.2; // Faster erasing
                    if (line.progress >= 1) {
                        this.continueLineToNewDot(line);
                    }
                }
            } else {
                this.traversingLines.splice(i, 1); // Remove completed lines
            }
        }
    }

    continueLineToNewDot(line) {
        if (this.dots.length < 2) return;

        const currentDot = line.dot2;
        let nextDot;

        // Optimized dot selection with early exit
        const maxAttempts = 5; // Reduced attempts
        for (let i = 0; i < maxAttempts; i++) {
            nextDot = this.dots[Math.floor(Math.random() * this.dots.length)];
            if (nextDot === currentDot) continue;

            const dx = currentDot.x - nextDot.x;
            const dy = currentDot.y - nextDot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 30 && distance < 150) { // Slightly reduced range
                break;
            }
        }

        if (nextDot && nextDot !== currentDot) {
            line.dot1 = currentDot;
            line.dot2 = nextDot;
            line.progress = 0;
            line.isDrawing = true;
            line.isErasing = false;
            line.hasCompletedCycle = false;
        } else {
            line.hasCompletedCycle = true; // Mark as completed if no suitable dot found
        }
    }

    createTraversingLine() {
        if (this.dots.length < 2) return;

        const dot1 = this.dots[Math.floor(Math.random() * this.dots.length)];
        let dot2;

        // Optimized dot selection
        const maxAttempts = 5;
        for (let i = 0; i < maxAttempts; i++) {
            dot2 = this.dots[Math.floor(Math.random() * this.dots.length)];
            if (dot2 === dot1) continue;

            const dx = dot1.x - dot2.x;
            const dy = dot1.y - dot2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 30 && distance < 150) {
                break;
            }
        }

        if (dot2 && dot2 !== dot1) {
            // Limit number of traversing lines for performance
            if (this.traversingLines.length < 8) {
                const line = {
                    dot1: dot1,
                    dot2: dot2,
                    progress: 0,
                    drawSpeed: 0.015 + Math.random() * 0.010, // Faster for better visual
                    opacity: 0.06 + Math.random() * 0.04, // Lower opacity
                    isDrawing: true,
                    isErasing: false,
                    hasCompletedCycle: false,
                    pauseCounter: 0
                };
                this.traversingLines.push(line);
            }
        }
    }

    drawTraversingLine(line) {
        if (line.progress <= 0) return;

        this.ctx.save();
        this.ctx.globalAlpha = line.opacity;
        this.ctx.strokeStyle = '#A0522D';
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = 'round';

        if (line.isDrawing) {
            const currentX = line.dot1.x + (line.dot2.x - line.dot1.x) * line.progress;
            const currentY = line.dot1.y + (line.dot2.y - line.dot1.y) * line.progress;

            this.ctx.beginPath();
            this.ctx.moveTo(line.dot1.x, line.dot1.y);
            this.ctx.lineTo(currentX, currentY);
            this.ctx.stroke();
        } else if (line.isErasing) {
            const currentX = line.dot1.x + (line.dot2.x - line.dot1.x) * line.progress;
            const currentY = line.dot1.y + (line.dot2.y - line.dot1.y) * line.progress;

            this.ctx.beginPath();
            this.ctx.moveTo(currentX, currentY);
            this.ctx.lineTo(line.dot2.x, line.dot2.y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    redrawCanvas() {
        // Use optimized clearing method
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Only draw cursor lines if mouse has moved recently
        if (this.mouseX !== 0 || this.mouseY !== 0) {
            this.drawCursorLines();
        }

        // Draw traversing lines
        for (let i = 0; i < this.traversingLines.length; i++) {
            this.drawTraversingLine(this.traversingLines[i]);
        }

        // Draw dots with batched rendering
        this.drawDotsBatched();
    }

    drawDotsBatched() {
        // Group dots by color for batched rendering
        const colorGroups = new Map();
        
        for (let i = 0; i < this.dots.length; i++) {
            const dot = this.dots[i];
            if (!colorGroups.has(dot.color)) {
                colorGroups.set(dot.color, []);
            }
            colorGroups.get(dot.color).push(dot);
        }

        // Render each color group separately
        colorGroups.forEach((dots, color) => {
            this.ctx.save();
            this.ctx.fillStyle = color;
            
            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];
                this.ctx.globalAlpha = dot.opacity;
                
                if (dot.blur > 0) {
                    this.ctx.shadowColor = dot.color;
                    this.ctx.shadowBlur = dot.blur;
                } else {
                    this.ctx.shadowBlur = 0;
                }

                this.ctx.beginPath();
                this.ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        });
    }

    drawCursorLines() {
        // Optimized cursor lines with spatial partitioning
        if (this.mouseX === 0 && this.mouseY === 0) return;

        const maxDistance = 120; // Reduced range for better performance
        const maxDots = 8; // Reduced from 12 for better performance
        
        // Find nearby dots with early exit optimization
        const nearbyDots = [];
        for (let i = 0; i < this.dots.length; i++) {
            const dot = this.dots[i];
            const dx = dot.x - this.mouseX;
            const dy = dot.y - this.mouseY;
            
            // Quick distance check before expensive sqrt
            if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance) {
                continue;
            }
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < maxDistance) {
                nearbyDots.push({ dot, distance });
            }
        }

        // Sort only if we have dots nearby
        if (nearbyDots.length > 0) {
            nearbyDots.sort((a, b) => a.distance - b.distance);
            const closestDots = nearbyDots.slice(0, Math.min(maxDots, nearbyDots.length));
            
            // Draw connections between nearby dots
            this.ctx.save();
            this.ctx.strokeStyle = '#8B7355';
            this.ctx.lineWidth = 1;
            this.ctx.lineCap = 'round';

            for (let i = 0; i < closestDots.length; i++) {
                for (let j = i + 1; j < closestDots.length; j++) {
                    const dot1 = closestDots[i].dot;
                    const dot2 = closestDots[j].dot;

                    const dx = dot1.x - dot2.x;
                    const dy = dot1.y - dot2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 60) { // Reduced connection distance
                        const avgX = (dot1.x + dot2.x) / 2;
                        const avgY = (dot1.y + dot2.y) / 2;
                        const cursorDx = avgX - this.mouseX;
                        const cursorDy = avgY - this.mouseY;
                        const cursorDistance = Math.sqrt(cursorDx * cursorDx + cursorDy * cursorDy);

                        const lineOpacity = Math.max(0.03, 0.12 - (cursorDistance / maxDistance) * 0.09);
                        this.ctx.globalAlpha = lineOpacity;

                        this.ctx.beginPath();
                        this.ctx.moveTo(dot1.x, dot1.y);
                        this.ctx.lineTo(dot2.x, dot2.y);
                        this.ctx.stroke();
                    }
                }
            }

            this.ctx.restore();
        }
    }

    resize() {
        // Optimize canvas resizing
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    generateDots() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.dots = [];

        // Vintage color palette (cached)
        if (!this.vintageColors) {
            this.vintageColors = [
                '#8B7355', '#A0522D', '#CD853F', '#DEB887', 
                '#D2B48C', '#BC8F8F', '#F4A460', '#D2691E',
                '#B8860B', '#696969', '#708090', '#2F4F4F'
            ];
        }

        // Optimized dot generation with better density calculation
        const area = this.canvas.width * this.canvas.height;
        const screenArea = 1920 * 1080; // Reference resolution
        const baseDots = 300; // Reduced base number for better performance
        const densityFactor = Math.min(area / screenArea, 2); // Cap density increase
        const numDots = Math.floor(baseDots * densityFactor);

        for (let i = 0; i < numDots; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const depth = Math.random();

            const dot = {
                x: x,
                y: y,
                originalX: x,
                originalY: y,
                targetX: x,
                targetY: y,
                vx: 0,
                vy: 0,
                size: (Math.random() * 2 + 1) * (1 - depth * 0.5),
                opacity: (Math.random() * 0.4 + 0.1) * (1 - depth * 0.6), // Slightly reduced opacity
                color: this.vintageColors[i % this.vintageColors.length], // Use round-robin for better distribution
                depth: depth,
                blur: depth * 1.5 // Reduced blur for better performance
            };
            this.dots.push(dot);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DottedBackground();
});
